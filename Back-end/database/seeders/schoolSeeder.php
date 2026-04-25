<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;
use App\Models\Formation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        // Désactiver les événements pour accélérer l'insertion
        School::unguard();
        Formation::unguard();

        // Nettoyer les tables avant d'insérer
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Formation::truncate();
        School::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Lire le fichier JSON
        $jsonPath = database_path('seeders/data/ecoles.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("Fichier ecoles.json introuvable : $jsonPath");
            return;
        }

        $jsonContent = File::get($jsonPath);
        $ecoles = json_decode($jsonContent, true);

        if (empty($ecoles)) {
            $this->command->error("Aucune donnée trouvée dans ecoles.json");
            return;
        }

        $this->command->info("Importation de " . count($ecoles) . " écoles...");

        foreach ($ecoles as $ecoleData) {
            // Créer l'école
            $school = School::create([
                'nom'          => $ecoleData['nom'] ?? 'Sans nom',
                'ville'        => $ecoleData['ville'] ?? 'Non spécifiée',
                'type'         => $ecoleData['type'] ?? 'Non spécifié',
                'description'  => $ecoleData['description'] ?? null,
                'presentation' => $ecoleData['presentation'] ?? null,
                'dureeEtudes'  => $ecoleData['dureeEtudes'] ?? null,
                'diplome'      => $ecoleData['diplome'] ?? null,
                'admission'    => $ecoleData['admission'] ?? null,
                'siteWeb'      => $ecoleData['siteWeb'] ?? null,
                'contact'      => $ecoleData['contact'] ?? null,
                'telephone'    => $ecoleData['telephone'] ?? null,
                'adresse'      => $ecoleData['adresse'] ?? null,
                'logo'         => $ecoleData['logo'] ?? null,
                'images'       => $ecoleData['images'] ?? null,
                'note'         => $ecoleData['note'] ?? 0,
            ]);

            $this->command->line("  → École importée : {$school->nom} (ID: {$school->id})");

            // Récupérer toutes les formations depuis les différents champs du JSON
            $formationsList = [];

            if (!empty($ecoleData['specialites']) && is_array($ecoleData['specialites'])) {
                foreach ($ecoleData['specialites'] as $spec) {
                    $formationsList[] = ['nom' => $spec, 'type' => 'Spécialité'];
                }
            }

            if (!empty($ecoleData['filiereGestion']) && is_array($ecoleData['filiereGestion'])) {
                foreach ($ecoleData['filiereGestion'] as $filiere) {
                    $formationsList[] = ['nom' => $filiere, 'type' => 'Filière Gestion'];
                }
            }

            if (!empty($ecoleData['filiereCommerce']) && is_array($ecoleData['filiereCommerce'])) {
                foreach ($ecoleData['filiereCommerce'] as $filiere) {
                    $formationsList[] = ['nom' => $filiere, 'type' => 'Filière Commerce'];
                }
            }

            if (!empty($ecoleData['licencesProfessionnelles']) && is_array($ecoleData['licencesProfessionnelles'])) {
                foreach ($ecoleData['licencesProfessionnelles'] as $licence) {
                    $formationsList[] = ['nom' => $licence, 'type' => 'Licence Professionnelle'];
                }
            }

            if (!empty($ecoleData['mastersSpecialisesInitiale']) && is_array($ecoleData['mastersSpecialisesInitiale'])) {
                foreach ($ecoleData['mastersSpecialisesInitiale'] as $master) {
                    $formationsList[] = ['nom' => $master, 'type' => 'Master Spécialisé'];
                }
            }

            if (!empty($ecoleData['mastersSpecialisesUniversite']) && is_array($ecoleData['mastersSpecialisesUniversite'])) {
                foreach ($ecoleData['mastersSpecialisesUniversite'] as $master) {
                    $formationsList[] = ['nom' => $master, 'type' => 'Master Universitaire'];
                }
            }

            // Insérer les formations
            foreach ($formationsList as $formationData) {
                Formation::create([
                    'school_id'      => $school->id,
                    'nom'            => $formationData['nom'],
                    'type'           => $formationData['type'],
                    'description'    => null,
                    'duree_mois'     => null,
                    'niveau_acces'   => null,
                ]);
            }

            $this->command->line("      → " . count($formationsList) . " formations ajoutées.");
        }

        $this->command->info("✅ Importation terminée avec succès !");
    }
}