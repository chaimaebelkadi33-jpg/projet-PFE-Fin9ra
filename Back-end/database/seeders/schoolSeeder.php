<?php

namespace Database\Seeders;

use App\Models\Formation;
use App\Models\School;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        School::unguard();
        Formation::unguard();

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Formation::truncate();
        School::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $jsonPath = database_path('seeders/data/ecoles.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("Fichier ecoles.json introuvable : $jsonPath");
            return;
        }

        $ecoles = json_decode(File::get($jsonPath), true);
        if (empty($ecoles)) {
            $this->command->error('Aucune donnee trouvee dans ecoles.json');
            return;
        }

        $this->command->info('Importation de ' . count($ecoles) . ' ecoles...');

        foreach ($ecoles as $ecoleData) {
            $classification = is_array($ecoleData['classification_ia'] ?? null) ? $ecoleData['classification_ia'] : [];
            $admissionData = is_array($ecoleData['admission'] ?? null) ? $ecoleData['admission'] : [];
            $formationMeta = is_array($ecoleData['formation'] ?? null) ? $ecoleData['formation'] : [];
            $vieEtudiante = is_array($ecoleData['vie_etudiante'] ?? null) ? $ecoleData['vie_etudiante'] : [];
            $coordonnees = is_array($ecoleData['coordonnees'] ?? null) ? $ecoleData['coordonnees'] : [];
            $reputation = is_array($ecoleData['reputation'] ?? null) ? $ecoleData['reputation'] : [];

            $cout = $this->extractCost($ecoleData);
            $bacMinNote = $admissionData['bac_min_note'] ?? $ecoleData['bac_min_note'] ?? null;

            $school = School::create([
                'nom' => $ecoleData['nom'] ?? 'Sans nom',
                'short_name' => $ecoleData['short_name'] ?? null,
                'ville' => $ecoleData['ville'] ?? 'Non specifiee',
                'type' => $ecoleData['type'] ?? 'Non specifie',
                'domaine_principal' => $classification['domaine_principal'] ?? $ecoleData['domaine_principal'] ?? null,
                'categorie_ecole' => $classification['categorie_ecole'] ?? $ecoleData['categorie_ecole'] ?? null,
                'mots_cles_recherche' => $this->normalizeToArray($classification['mots_cles_recherche'] ?? $ecoleData['mots_cles_recherche'] ?? []),
                'description' => $ecoleData['description'] ?? null,
                'presentation' => $ecoleData['presentation'] ?? null,
                'dureeEtudes' => $formationMeta['dureeEtudes'] ?? $ecoleData['dureeEtudes'] ?? null,
                'diplome' => $formationMeta['diplome'] ?? $ecoleData['diplome'] ?? null,
                'admission' => is_string($ecoleData['admission'] ?? null) ? $ecoleData['admission'] : ($admissionData['concours_nom'] ?? null),
                'siteWeb' => $coordonnees['siteWeb'] ?? $ecoleData['siteWeb'] ?? null,
                'contact' => $coordonnees['contact'] ?? $ecoleData['contact'] ?? null,
                'telephone' => $coordonnees['telephone'] ?? $ecoleData['telephone'] ?? null,
                'adresse' => $coordonnees['adresse'] ?? $ecoleData['adresse'] ?? null,
                'logo' => $ecoleData['logo'] ?? null,
                'a_internat' => $vieEtudiante['a_internat'] ?? $ecoleData['a_internat'] ?? null,
                'images' => $ecoleData['images'] ?? null,
                'note' => $reputation['note'] ?? $ecoleData['note'] ?? 0,
                'cout' => $cout,
                'bac_min_note' => $bacMinNote,
                'prerequis_bac_type' => $this->normalizeToArray($admissionData['prerequis_bac_type'] ?? $ecoleData['prerequis_bac_type'] ?? []),
                'prerequis_bac_mention' => $admissionData['prerequis_bac_mention'] ?? $ecoleData['prerequis_bac_mention'] ?? null,
                'debouches' => $this->normalizeToArray($ecoleData['debouches'] ?? []),
            ]);

            $this->command->line("  -> Ecole importee : {$school->nom} (ID: {$school->id})");

            $formations = $this->extractFormations($ecoleData);

            foreach ($formations as $formationData) {
                Formation::create([
                    'school_id' => $school->id,
                    'nom' => $formationData['nom'],
                    'specialites' => $formationData['specialites'] ?? null,
                    'type' => $formationData['type'],
                    'description' => $formationData['description'] ?? null,
                    'duree_mois' => $formationData['duree_mois'] ?? null,
                    'niveau_acces' => $formationData['niveau_acces'] ?? null,
                ]);
            }

            $this->command->line('      -> ' . count($formations) . ' formations ajoutees.');
        }

        $this->command->info('Importation terminee avec succes !');
    }

    private function extractCost(array $ecoleData): int
    {
        $rawCost = $ecoleData['frais']['cout'] ?? $ecoleData['cout'] ?? 0;

        if (is_numeric($rawCost)) {
            return (int) $rawCost;
        }

        preg_match('/\d+/', str_replace(' ', '', (string) $rawCost), $matches);

        return isset($matches[0]) ? (int) $matches[0] : 0;
    }

    private function normalizeToArray(array|string|null $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter($value, fn ($item) => $item !== null && $item !== ''));
        }

        if (is_string($value) && trim($value) !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $value))));
        }

        return [];
    }

    private function extractFormations(array $ecoleData): array
    {
        $formationsList = [];

        if (!empty($ecoleData['formations']) && is_array($ecoleData['formations'])) {
            foreach ($ecoleData['formations'] as $formation) {
                $formationsList[] = [
                    'nom' => $formation['nom'] ?? 'Sans nom',
                    'type' => $formation['type'] ?? 'Formation',
                    'description' => $formation['description'] ?? null,
                    'duree_mois' => $formation['duree_mois'] ?? null,
                    'niveau_acces' => $formation['niveau_acces'] ?? null,
                    'specialites' => $formation['specialites'] ?? null,
                ];
            }
        }

        $legacyMapping = [
            'specialites' => 'Specialite',
            'filiereGestion' => 'Filiere Gestion',
            'filiereCommerce' => 'Filiere Commerce',
            'licencesProfessionnelles' => 'Licence Professionnelle',
            'mastersSpecialisesInitiale' => 'Master Specialise',
            'mastersSpecialisesUniversite' => 'Master Universitaire',
        ];

        foreach ($legacyMapping as $field => $type) {
            if (empty($ecoleData[$field]) || !is_array($ecoleData[$field])) {
                continue;
            }

            foreach ($ecoleData[$field] as $nom) {
                $formationsList[] = [
                    'nom' => $nom,
                    'type' => $type,
                ];
            }
        }

        return $formationsList;
    }
}
