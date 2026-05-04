<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RecommendationController extends Controller
{
    /**
     * Get filters for the recommendation form.
     */
    public function getFilters()
    {
        $villes = School::select('ville')
            ->whereNotNull('ville')
            ->distinct()
            ->orderBy('ville')
            ->pluck('ville');

        $types = School::select('type')
            ->whereNotNull('type')
            ->distinct()
            ->orderBy('type')
            ->pluck('type');

        $budgets = [
            ['id' => 'under_10000', 'label' => 'Moins de 10 000 MAD', 'max' => 10000],
            ['id' => '10000_30000', 'label' => '10 000 - 30 000 MAD', 'max' => 30000],
            ['id' => '30000_60000', 'label' => '30 000 - 60 000 MAD', 'max' => 60000],
            ['id' => '60000_100000', 'label' => '60 000 - 100 000 MAD', 'max' => 100000],
            ['id' => 'over_100000', 'label' => 'Plus de 100 000 MAD', 'max' => 1000000],
        ];

        return response()->json([
            'success' => true,
            'cities' => $villes,
            'school_types' => $types,
            'budgets' => $budgets,
            'bac_types' => [
                'Sciences Mathematiques A',
                'Sciences Mathematiques B',
                'Sciences de la Vie et de la Terre (SVT)',
                'Sciences Physiques et Chimiques (SPC)',
                'Sciences de l\'Ingenieur (SI)',
                'Sciences Economiques (SES)',
                'Lettres Modernes / Langues',
                'Arts Appliques / Plastiques',
                'Autre',
            ],
            'study_levels' => [
                'Bac',
                'Bac+2 (DEUG, DUT, DEUST)',
                'Bac+3 (Licence, Bachelor)',
                'Bac+5 (Master, Ingenieur)',
                'Bac+8 (Doctorat)',
            ],
            'interest_domains' => [
                'Informatique & Intelligence Artificielle',
                'Commerce & Marketing',
                'Sante & Biologie',
                'Ingenierie & Mecanique',
                'Architecture & Design',
                'Droit & Sciences politiques',
                'Economie & Finance',
                'Agriculture & Environnement',
                'Arts & Communication',
            ],
        ]);
    }

    /**
     * Get recommended schools based on user criteria.
     */
    public function getRecommendations(Request $request)
    {
        $request->validate([
            'note' => 'required|numeric|min:10|max:20',
            'bac_type' => 'required|string',
            'ville' => 'required|string',
            'budget' => 'required|string',
            'school_type' => 'nullable|string',
            'study_level' => 'nullable|string',
            'interest_domain' => 'nullable|string',
        ]);

        $schools = School::with(['formations'])->get();

        if ($schools->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        // Use Groq first, then fall back to local ranking if the model response is unusable.
        $result = $this->callGroqAPI($request, $schools);
        if ($result['success']) {
            return $result['response'];
        }

        return $this->localRecommendationResponse($request, $schools, $result['reason'] ?? 'unknown_error');
    }

    private function hasGroqKey(): bool
    {
        return !empty(config('services.groq.api_key'));
    }

    private function callGroqAPI(Request $request, $schools): array
    {
        $apiKey = config('services.groq.api_key');
        $model = $this->normalizeGroqModel(config('services.groq.model', 'llama3-70b-8192'));
        
        // Send the full eligible catalog to Groq after applying only hard constraints.
        $filteredSchools = $this->preFilterSchools($schools, $request);
        if ($filteredSchools->isEmpty()) {
            return ['success' => false, 'reason' => 'groq_no_candidates'];
        }

        $schoolPayload = $this->formatSchoolsForAI($filteredSchools, $request);
        $prompt = $this->buildAIPrompt($request, $schoolPayload);

        try {
            $response = Http::timeout(30)
                ->retry(1, 500)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'Tu es un conseiller d\'orientation expert au Maroc. Analyse le profil étudiant et recommande 3 écoles les plus adaptées. Réponds UNIQUEMENT en JSON valide.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.1, // Lower temperature for more consistent recommendations
                    'top_p' => 0.9,
                    'max_tokens' => 500, // Reduced token limit
                ]);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'reason' => 'groq_http_' . $response->status(),
                    'details' => $response->body(),
                ];
            }

            $content = $response->json('choices.0.message.content');

            // Debug: Log the raw response
            \Log::info('Groq API Response Debug', [
                'content' => $content,
                'length' => strlen($content ?? ''),
                'timestamp' => now()->toISOString()
            ]);

            $ids = $this->extractRecommendedIds((string) $content, $filteredSchools->pluck('id')->all());

            if (empty($ids)) {
                return ['success' => false, 'reason' => 'groq_invalid_ids'];
            }

            $recommendations = School::with(['formations'])
                ->whereIn('id', $ids)
                ->get()
                ->sortBy(fn ($school) => array_search($school->id, $ids, true))
                ->values();

            return [
                'success' => true,
                'response' => response()->json([
                    'success' => true,
                    'data' => $recommendations,
                    'source' => 'groq',
                ]),
            ];

        } catch (ConnectionException $e) {
            return ['success' => false, 'reason' => 'groq_unreachable'];
        } catch (\Exception $e) {
            return ['success' => false, 'reason' => 'groq_exception'];
        }
    }

    private function normalizeGroqModel(string $model): string
    {
        $aliases = [
            'llama3-70b-8192' => 'llama-3.3-70b-versatile',
            'llama-3-70b-8192' => 'llama-3.3-70b-versatile',
            'llama3-70b' => 'llama-3.3-70b-versatile',
        ];

        return $aliases[$model] ?? $model;
    }

    private function preFilterSchools($schools, Request $request): \Illuminate\Support\Collection
    {
        $ville = $this->normalizeText((string) $request->ville);
        $schoolTypePreference = $this->normalizeText((string) ($request->school_type ?? ''));
        $maxBudget = $this->budgetMax($request->budget);
        $note = (float) $request->note;
        $interestDomain = $this->normalizeText((string) ($request->interest_domain ?? ''));

        return $schools->filter(function (School $school) use ($ville, $schoolTypePreference, $maxBudget, $note) {
            $schoolCity = $this->normalizeText((string) $school->ville);
            $schoolType = $this->normalizeText((string) $school->type);
            
            // NEW COST LOGIC
            $coutPublic = (float)($school->cout_public ?? 0);
            $coutPrive = (float)($school->cout_prive ?? 0);
            $concoursMin = (float)($school->admission_concours_note_min ?? 0);
            
            $realCost = ($note >= $concoursMin && $coutPublic > 0) ? $coutPublic : $coutPrive;
            if ($realCost === 0 && $coutPublic > 0) $realCost = $coutPublic; // Fallback

            if ($ville && $schoolCity !== $ville) {
                return false;
            }

            if ($realCost > 0 && $realCost > $maxBudget) {
                return false;
            }

            if ($school->bac_min_note > 0 && $note < $school->bac_min_note) {
                return false;
            }

            return !$schoolTypePreference || $schoolType === $schoolTypePreference || $this->normalizeText((string)$school->categorie_ecole) === $schoolTypePreference;
        })
        ->map(function (School $school) use ($request, $ville, $interestDomain) {
            $school->recommendation_score = $this->calculateRecommendationScore($school, $request);
            $school->recommendation_reasons = $this->buildRecommendationReasons($school, $request, $ville, $interestDomain);
            $school->hard_match_flags = $this->buildHardMatchFlags($school, $request);

            return $school;
        })
        ->pipe(function ($eligibleSchools) use ($request) {
            return $this->narrowSchoolsByProfile($eligibleSchools, $request);
        })
        ->sortByDesc('recommendation_score')
        ->values();
    }

    private function callGeminiAPI(Request $request, $schools): array
    {
        $apiKey = config('services.gemini.api_key');
        $model = config('services.gemini.model', 'gemini-2.0-flash');
        
        $schoolPayload = $this->formatSchoolsForAI($schools);
        $prompt = $this->buildAIPrompt($request, $schoolPayload, 'Gemini');

        try {
            $response = Http::timeout(30)
                ->retry(1, 500)
                ->post('https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . rawurlencode($apiKey), [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.3,
                        'topP' => 0.9,
                        'maxOutputTokens' => 1000,
                    ],
                    'safetySettings' => [
                        ['category' => 'HARM_CATEGORY_UNSPECIFIED', 'threshold' => 'BLOCK_NONE'],
                    ],
                ]);

            if (!$response->successful()) {
                $status = $response->status();
                if ($status === 429) {
                    return ['success' => false, 'reason' => 'gemini_quota_exceeded'];
                }
                return ['success' => false, 'reason' => 'gemini_http_' . $status];
            }

            $text = $response->json('candidates.0.content.parts.0.text');
            $ids = $this->extractRecommendedIds((string) $text, $schools->pluck('id')->all());

            if (empty($ids)) {
                return ['success' => false, 'reason' => 'gemini_invalid_ids'];
            }

            $recommendations = School::with(['formations'])
                ->whereIn('id', $ids)
                ->get()
                ->sortBy(fn ($school) => array_search($school->id, $ids, true))
                ->values();

            return [
                'success' => true,
                'response' => response()->json([
                    'success' => true,
                    'data' => $recommendations,
                    'source' => 'gemini',
                ]),
            ];

        } catch (ConnectionException $e) {
            return ['success' => false, 'reason' => 'gemini_unreachable'];
        } catch (\Exception $e) {
            return ['success' => false, 'reason' => 'gemini_exception'];
        }
    }

    private function formatSchoolsForAI($schools, ?Request $request = null): array
    {
        return $schools->map(function (School $school) use ($request) {
            $schoolType = $this->normalizeText((string) $school->type);
            $schoolText = $this->buildSchoolSearchText($school);
            $interestDomain = $request ? $this->normalizeText((string) ($request->interest_domain ?? '')) : '';
            $bacType = $request ? $this->normalizeText((string) ($request->bac_type ?? '')) : '';
            $studyLevel = $request ? $this->normalizeText((string) ($request->study_level ?? '')) : '';
            $budgetMax = $request ? $this->budgetMax((string) $request->budget) : null;
            $studentNote = $request ? (float) $request->note : null;

            $formations = $school->formations->map(function ($formation) use ($interestDomain, $studyLevel) {
                $specialites = is_array($formation->specialites)
                    ? $formation->specialites
                    : array_filter([(string) ($formation->specialites ?? '')]);

                $formationText = $this->normalizeText(implode(' ', array_filter([
                    $formation->nom,
                    $formation->type,
                    $formation->niveau_acces,
                    implode(' ', $specialites),
                ])));

                return [
                    'nom' => $formation->nom,
                    'type' => $formation->type,
                    'niveau_acces' => $formation->niveau_acces,
                    'specialites' => $specialites,
                    'match_domaine' => $interestDomain ? $this->matchesInterestDomain($interestDomain, $formationText, '') : null,
                    'match_niveau' => $studyLevel ? $this->matchesStudyLevel($studyLevel, $formationText) : null,
                ];
            })->values();

            $relevantFormations = $formations
                ->filter(fn ($formation) => $formation['match_domaine'] || $formation['match_niveau'])
                ->take(5)
                ->values();

            return [
                'id' => $school->id,
                'nom' => $school->nom,
                'ville' => $school->ville,
                'type' => $school->type,
                'description' => $school->description,
                'diplome' => $school->diplome,
                'admission' => $school->admission,
                'dureeEtudes' => $school->dureeEtudes,
                'cout' => $school->cout,
                'bac_min_note' => $school->bac_min_note,
                'note' => $school->note,
                'compatibilite' => [
                    'match_domaine' => $interestDomain ? $this->matchesInterestDomain($interestDomain, $schoolText, $schoolType) : null,
                    'match_bac' => $bacType ? $this->matchesAcademicTrack($bacType, $schoolText, $schoolType) : null,
                    'match_niveau' => $studyLevel ? $this->matchesStudyLevel($studyLevel, $schoolText) : null,
                    'budget_ok' => $budgetMax ? (((float) ($school->cout ?? 0) <= 0) || ((float) ($school->cout ?? 0) <= $budgetMax)) : null,
                    'bac_eligible' => $studentNote !== null ? (($school->bac_min_note ?? 0) <= 0 || $studentNote >= (float) $school->bac_min_note) : null,
                ],
                'formations_pertinentes' => $relevantFormations,
                'formations' => $formations->take(8)->values(),
            ];
        })->values()->toArray();
    }

    private function buildAIPrompt(Request $request, array $schools, string $provider = 'Groq'): string
    {
        $budgetRanges = [
            'under_10000' => '< 10,000 MAD',
            '10000_30000' => '10,000 - 30,000 MAD',
            '30000_60000' => '30,000 - 60,000 MAD',
            '60000_100000' => '60,000 - 100,000 MAD',
            'over_100000' => '> 100,000 MAD',
        ];

        $studentBudget = $request->input('budget', 'over_100000');
        $budgetLabel = $budgetRanges[$studentBudget] ?? '> 100,000 MAD';

        $studentProfile = [
            'note_bac' => (float) $request->input('note'),
            'bac_type' => $request->input('bac_type'),
            'ville_preferee' => $request->input('ville'),
            'budget_annuel' => $budgetLabel,
            'type_etablissement' => $request->input('school_type') ?: 'Indifferent',
            'niveau_vise' => $request->input('study_level') ?: 'Indifferent',
            'domaine_interet' => $request->input('interest_domain') ?: 'Indifferent',
        ];

        $note = (float) $request->input('note');
        $schoolsList = collect($schools)->map(function ($school) use ($note) {
            $coutPublic = (float)($school['cout_public'] ?? 0);
            $coutPrive = (float)($school['cout_prive'] ?? 0);
            $concoursMin = (float)($school['admission_concours_note_min'] ?? 0);
            
            // Calcul du coût réel basé sur la note du candidat
            $realCost = ($note >= $concoursMin && $coutPublic > 0) ? $coutPublic : $coutPrive;
            if ($realCost === 0 && $coutPublic > 0) $realCost = $coutPublic;

            return [
                'id' => $school['id'],
                'nom' => $school['nom'],
                'ville' => $school['ville'],
                'type' => $school['type'],
                'categorie' => $school['categorie_ecole'] ?? $school['type'] ?? null,
                'domaine' => $school['domaine_principal'] ?? null,
                'cout_estime' => $realCost > 0 ? number_format($realCost, 0, '.', '') . ' MAD' : 'Gratuit/Public',
                'a_internat' => (bool)($school['a_internat'] ?? false),
                'match_domaine' => $school['hard_match_flags']['match_domaine'] ?? false,
                'match_bac' => $school['hard_match_flags']['match_bac'] ?? false,
                'match_niveau' => $school['hard_match_flags']['match_niveau'] ?? false,
                'formations' => collect($school['formations'])->map(function ($f) {
                    return [
                        'nom' => $f['nom'],
                        'niveau' => $f['niveau_acces'],
                        'debouches' => $f['debouches'] ?? [],
                        'est_alternance' => (bool)($f['est_alternance'] ?? false),
                    ];
                })->toArray(),
                'points_forts' => $school['recommendation_reasons'] ?? [],
                'score_local' => $school['recommendation_score'] ?? null
            ];
        })->values()->toArray();

        $prompt = "ÉTUDIANT MAROCAIN:\n" .
        "- Note Bac: {$studentProfile['note_bac']}/20\n" .
        "- Type Bac: {$studentProfile['bac_type']}\n" .
        "- Ville préférée: {$studentProfile['ville_preferee']}\n" .
        "- Budget: {$studentProfile['budget_annuel']}\n" .
        "- Domaine d'intérêt: {$studentProfile['domaine_interet']}\n\n" .

        "ÉCOLES CANDIDATES (catalogue complet après contraintes dures seulement):\n" .
        json_encode($schoolsList, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n" .

        "INSTRUCTIONS:\n" .
        "1. Analyse le profil étudiant et recommande les 3 écoles LES PLUS ADAPTÉES.\n" .
        "2. Priorité CRITIQUE: \n" .
        "   - Le domaine d'intérêt doit correspondre au champ 'domaine' de l'école ou aux formations proposées.\n" .
        "   - La compatibilité avec le type de bac (match_bac) est éliminatoire.\n" .
        "3. Coût: Le champ 'cout_estime' est déjà calculé pour cet étudiant (Public vs Privé selon sa note). Respecte le budget s'il est spécifié.\n" .
        "4. Analyse multicritère: Privilégie les écoles avec match_domaine=true. Si plusieurs écoles matchent, utilise la ville préférée comme critère de départage.\n" .
        "5. N'invente pas d'informations. Utilise uniquement les données fournies.\n" .
        "6. Réponds UNIQUEMENT en JSON: {\"school_ids\": [id1, id2, id3]}\n\n" .

        "RÈGLES MÉTIER MAROC:\n" .
        "- Écoles d'Ingénieurs (ENSA, ENAM, etc.): Bac Math/SVT/PC uniquement.\n" .
        "- Facultés/Universités: Plus flexibles mais vérifier le domaine.\n" .
        "- Écoles de Commerce (ENCG, ISCAE, etc.): Priorité Bac Eco, mais ouvert aux autres si bon score.\n" .
        "- Internat: Si l'étudiant change de ville, privilégie les écoles avec a_internat=true.";

        return $prompt;
    }

    private function localRecommendationResponse(Request $request, $schools, string $reason)
    {
        return response()->json([
            'success' => true,
            'data' => $this->rankSchoolsLocally($schools, $request)->values(),
            'source' => 'local_fallback',
            'fallback_reason' => $reason,
        ]);
    }

    private function rankSchoolsLocally($schools, Request $request)
    {
        return $schools
            ->map(function (School $school) use ($request) {
                $school->recommendation_score = $this->calculateRecommendationScore($school, $request);
                return $school;
            })
            ->sortByDesc('recommendation_score')
            ->take(3);
    }

    private function calculateRecommendationScore(School $school, Request $request): float
    {
        $note = (float) $request->note;
        $ville = $this->normalizeText((string) $request->ville);
        $bacType = $this->normalizeText((string) $request->bac_type);
        $schoolTypePreference = $this->normalizeText((string) ($request->school_type ?? ''));
        $studyLevel = $this->normalizeText((string) ($request->study_level ?? ''));
        $interestDomain = $this->normalizeText((string) ($request->interest_domain ?? ''));
        $maxBudget = $this->budgetMax((string) $request->budget);

        $schoolType = $this->normalizeText((string) $school->type);
        $schoolCity = $this->normalizeText((string) $school->ville);
        $schoolText = $this->buildSchoolSearchText($school);
        $score = 0;

        if ($schoolCity && $ville) {
            $score += $schoolCity === $ville ? 25 : 5;
        }

        if ($schoolTypePreference && ($schoolType === $schoolTypePreference || $this->normalizeText((string)$school->categorie_ecole) === $schoolTypePreference)) {
            $score += 12; // Increased weight for specific type/category match
        }

        if ($school->bac_min_note > 0) {
            if ($note >= $school->bac_min_note) {
                $score += 20 + min(10, ($note - $school->bac_min_note) * 2);
            } else {
                $score -= 40;
            }
        } else {
            $score += 10;
        }

        $coutPublic = (float)($school->cout_public ?? 0);
        $coutPrive = (float)($school->cout_prive ?? 0);
        $concoursMin = (float)($school->admission_concours_note_min ?? 0);
        $realCost = ($note >= $concoursMin && $coutPublic > 0) ? $coutPublic : $coutPrive;
        if ($realCost === 0 && $coutPublic > 0) $realCost = $coutPublic;

        if ($realCost <= 0) {
            $score += 10;
        } elseif ($realCost <= $maxBudget) {
            $budgetGap = max(1, $maxBudget - $realCost);
            $score += 8 + min(12, ($budgetGap / max(1, $maxBudget)) * 12);
        } else {
            $score -= 30;
        }

        if ($this->matchesAcademicTrack($bacType, $schoolText, $schoolType)) {
            $score += 18;
        }

        $schoolDomaine = $this->normalizeText((string)$school->domaine_principal);
        if ($interestDomain) {
            if ($schoolDomaine && str_contains($schoolDomaine, $interestDomain)) {
                $score += 30; // Very high weight for direct domain match
            } elseif ($this->matchesInterestDomain($interestDomain, $schoolText, $schoolType)) {
                $score += 20;
            }
        }

        if ($studyLevel && $this->matchesStudyLevel($studyLevel, $schoolText)) {
            $score += 12;
        }

        $score += ((float) $school->note * 2);

        return round($score, 2);
    }

    private function buildRecommendationReasons(School $school, Request $request, string $ville, string $interestDomain): array
    {
        $schoolText = $this->buildSchoolSearchText($school);
        $schoolCity = $this->normalizeText((string) $school->ville);
        $reasons = [];

        if ($ville && $schoolCity === $ville) {
            $reasons[] = 'same_city';
        }

        if ($interestDomain && $this->matchesInterestDomain($interestDomain, $schoolText, $this->normalizeText((string) $school->type))) {
            $reasons[] = 'matches_interest_domain';
        }

        if ($this->matchesAcademicTrack($this->normalizeText((string) $request->bac_type), $schoolText, $this->normalizeText((string) $school->type))) {
            $reasons[] = 'fits_bac_profile';
        }

        if ($this->matchesStudyLevel($this->normalizeText((string) ($request->study_level ?? '')), $schoolText)) {
            $reasons[] = 'matches_study_level';
        }

        if (($school->cout ?? 0) <= $this->budgetMax((string) $request->budget) || (float) ($school->cout ?? 0) <= 0) {
            $reasons[] = 'within_budget';
        }

        return $reasons;
    }

    private function buildHardMatchFlags(School $school, Request $request): array
    {
        $schoolText = $this->buildSchoolSearchText($school);
        $schoolType = $this->normalizeText((string) $school->type);
        $interestDomain = $this->normalizeText((string) ($request->interest_domain ?? ''));
        $bacType = $this->normalizeText((string) $request->bac_type);
        $studyLevel = $this->normalizeText((string) ($request->study_level ?? ''));

        $matchingFormations = $school->formations->filter(function ($formation) use ($interestDomain, $studyLevel) {
            $specialites = is_array($formation->specialites)
                ? implode(' ', $formation->specialites)
                : (string) ($formation->specialites ?? '');

            $formationText = $this->normalizeText(implode(' ', array_filter([
                $formation->nom,
                $formation->type,
                $formation->niveau_acces,
                $specialites,
            ])));

            $domainMatch = $interestDomain ? $this->matchesInterestDomain($interestDomain, $formationText, '') : false;
            $levelMatch = $studyLevel ? $this->matchesStudyLevel($studyLevel, $formationText) : false;

            return $domainMatch || $levelMatch;
        });

        return [
            'match_domaine' => $interestDomain ? $this->matchesInterestDomain($interestDomain, $schoolText, $schoolType) : false,
            'match_bac' => $this->matchesAcademicTrack($bacType, $schoolText, $schoolType),
            'match_niveau' => $studyLevel ? $this->matchesStudyLevel($studyLevel, $schoolText) : false,
            'matching_formations_count' => $matchingFormations->count(),
        ];
    }

    private function narrowSchoolsByProfile(\Illuminate\Support\Collection $schools, Request $request): \Illuminate\Support\Collection
    {
        $interestDomain = $this->normalizeText((string) ($request->interest_domain ?? ''));
        $studyLevel = $this->normalizeText((string) ($request->study_level ?? ''));

        $domainMatched = $schools->filter(function (School $school) {
            return ($school->hard_match_flags['match_domaine'] ?? false)
                || (($school->hard_match_flags['matching_formations_count'] ?? 0) > 0);
        });

        if ($interestDomain && $domainMatched->isNotEmpty()) {
            $schools = $domainMatched;
        }

        $bacAndDomainMatched = $schools->filter(function (School $school) use ($interestDomain) {
            if (!$interestDomain) {
                return false;
            }

            return ($school->hard_match_flags['match_domaine'] ?? false)
                && ($school->hard_match_flags['match_bac'] ?? false);
        });

        if ($interestDomain && $bacAndDomainMatched->isNotEmpty()) {
            $schools = $bacAndDomainMatched;
        }

        $levelMatched = $schools->filter(function (School $school) use ($studyLevel) {
            if (!$studyLevel) {
                return false;
            }

            return ($school->hard_match_flags['match_niveau'] ?? false)
                || (($school->hard_match_flags['matching_formations_count'] ?? 0) > 0);
        });

        if ($studyLevel && $levelMatched->isNotEmpty()) {
            $schools = $levelMatched;
        }

        return $schools->values();
    }

    private function buildSchoolSearchText(School $school): string
    {
        $formationSpecialities = $school->formations
            ->map(function ($formation) {
                $specialites = is_array($formation->specialites)
                    ? implode(' ', $formation->specialites)
                    : (string) ($formation->specialites ?? '');

                return implode(' ', array_filter([
                    $formation->nom,
                    $formation->type,
                    $formation->niveau_acces,
                    $specialites,
                ]));
            })
            ->join(' ');

        return $this->normalizeText(implode(' ', array_filter([
            $school->nom,
            $school->short_name,
            $school->type,
            $school->categorie_ecole,
            $school->domaine_principal,
            $school->description,
            $school->presentation,
            $school->diplome,
            $school->admission,
            $school->dureeEtudes,
            $formationSpecialities,
        ])));
    }

    private function matchesStudyLevel(string $studyLevel, string $schoolText): bool
    {
        if (!$studyLevel) {
            return false;
        }

        $levelKeywords = [
            'bac+2' => ['bac+2', 'deug', 'dut', 'deust', 'technicien specialise', 'ts'],
            'bac+3' => ['bac+3', 'licence', 'bachelor'],
            'bac+5' => ['bac+5', 'master', 'ingenieur'],
            'bac+8' => ['bac+8', 'doctorat', 'doctorale', 'phd'],
            'bac' => ['bac', 'post-bac', '1ere annee'],
        ];

        foreach ($levelKeywords as $levelKey => $keywords) {
            if (!str_contains($studyLevel, $levelKey)) {
                continue;
            }

            foreach ($keywords as $keyword) {
                if (str_contains($schoolText, $keyword)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function normalizeText(string $value): string
    {
        $value = mb_strtolower($value, 'UTF-8');
        $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);

        return trim($transliterated !== false ? $transliterated : $value);
    }

    private function budgetMax(string $budget): int
    {
        return [
            'under_10000' => 10000,
            '10000_30000' => 30000,
            '30000_60000' => 60000,
            '60000_100000' => 100000,
            'over_100000' => 1000000,
        ][$budget] ?? 1000000;
    }

    private function matchesAcademicTrack(string $bacType, string $schoolText, string $schoolType): bool
    {
        if (str_contains($bacType, 'math') || str_contains($bacType, 'physique') || str_contains($bacType, 'ingenieur')) {
            return str_contains($schoolText, 'ingenieur') || str_contains($schoolType, 'technique') || str_contains($schoolText, 'sciences');
        }

        if (str_contains($bacType, 'vie') || str_contains($bacType, 'svt')) {
            return str_contains($schoolText, 'medecine') || str_contains($schoolText, 'sante') || str_contains($schoolText, 'agronom');
        }

        if (str_contains($bacType, 'eco')) {
            return str_contains($schoolText, 'commerce') || str_contains($schoolText, 'gestion') || str_contains($schoolText, 'finance');
        }

        return false;
    }

    private function matchesInterestDomain(string $domain, string $schoolText, string $schoolType): bool
    {
        $domainKeywords = [
            'informatique' => ['informatique', 'intelligence', 'ingenieur', 'data', 'sciences'],
            'commerce' => ['commerce', 'marketing', 'gestion', 'management'],
            'sante' => ['sante', 'medecine', 'biologie', 'pharmacie'],
            'ingenierie' => ['ingenieur', 'mecanique', 'technique', 'industrie'],
            'architecture' => ['architecture', 'design'],
            'droit' => ['droit', 'politique', 'juridique'],
            'economie' => ['economie', 'finance', 'gestion'],
            'agriculture' => ['agriculture', 'agronomie', 'environnement', 'forestier'],
            'arts' => ['arts', 'communication', 'media'],
        ];

        foreach ($domainKeywords as $domainKey => $keywords) {
            if (!str_contains($domain, $domainKey)) {
                continue;
            }

            foreach ($keywords as $keyword) {
                if (str_contains($schoolText, $keyword) || str_contains($schoolType, $keyword)) {
                    return true;
                }
            }
        }

        return false;
    }

   private function extractRecommendedIds(string $text, array $validIds): array
{
    // Log the raw response for debugging
    \Log::info('Extracting IDs Debug', [
        'raw_text' => $text,
        'valid_ids_count' => count($validIds),
        'timestamp' => now()->toISOString()
    ]);

    // Clean up the text - remove markdown code blocks if present
    $text = str_replace(['```json', '```', '`'], '', $text);
    $text = trim($text);

    // Try direct JSON decode first
    $json = json_decode($text, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
        \Log::info('Direct JSON decode successful', ['json' => $json]);
    }

    // If that fails, try to find JSON object in the text
    if (!is_array($json)) {
        preg_match('/\{[^{}]*"school_ids"[^{}]*\}/s', $text, $matches);
        if (isset($matches[0])) {
            $json = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                \Log::info('Regex JSON extraction successful', ['json' => $json]);
            }
        }
    }

    // Try alternative patterns for school_ids
    if (!is_array($json)) {
        // Look for "school_ids": [1,2,3] pattern
        preg_match('/"school_ids"\s*:\s*\[([^\]]+)\]/s', $text, $matches);
        if (isset($matches[1])) {
            $idsString = $matches[1];
            preg_match_all('/\d+/', $idsString, $idMatches);
            if (!empty($idMatches[0])) {
                $ids = array_map('intval', $idMatches[0]);
                \Log::info('Alternative pattern extraction successful', ['ids' => $ids]);
                $json = ['school_ids' => $ids];
            }
        }
    }

    // Try to find any array of numbers
    if (!is_array($json)) {
        preg_match('/\[[\s\d,]+\]/', $text, $matches);
        if (isset($matches[0])) {
            $ids = json_decode($matches[0], true);
            if (is_array($ids)) {
                \Log::info('Array pattern extraction successful', ['ids' => $ids]);
                $json = ['school_ids' => $ids];
            }
        }
    }

    // Extract school_ids from parsed JSON
    $ids = [];
    if (is_array($json)) {
        $ids = $json['school_ids'] ?? $json['ids'] ?? [];
        if (!is_array($ids) && is_string($ids)) {
            // Try to parse string as JSON array
            $ids = json_decode($ids, true) ?? [];
        }
    }

    if (empty($ids)) {
        \Log::error('No valid IDs extracted from Groq response', [
            'text' => $text,
            'json' => $json,
            'timestamp' => now()->toISOString()
        ]);
        return [];
    }

    $validIds = array_map('intval', $validIds);

    $filteredIds = collect($ids)
        ->map(fn ($id) => (int) $id)
        ->filter(fn ($id) => in_array($id, $validIds, true))
        ->unique()
        ->take(3)
        ->values()
        ->all();

    \Log::info('Final extracted IDs', [
        'original_ids' => $ids,
        'filtered_ids' => $filteredIds,
        'valid_ids_count' => count($validIds),
        'timestamp' => now()->toISOString()
    ]);

    return $filteredIds;
}
}
