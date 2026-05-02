<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\RecommendationController;
use App\Models\School;

echo "Testing Groq API...\n";

$request = new Request([
    'note' => 15.5,
    'bac_type' => 'Sciences Mathematiques A',
    'ville' => 'Rabat',
    'budget' => '30000_60000',
    'interest_domain' => 'Informatique & Intelligence Artificielle'
]);

$schools = School::with('formations')->get();
$controller = new RecommendationController();

try {
    $result = $controller->getRecommendations($request);
    echo "Success!\n";
    $data = $result->getData();
    echo "Source: " . ($data->source ?? 'unknown') . "\n";
    echo "Schools returned: " . count($data->data ?? []) . "\n";
    if (isset($data->data) && count($data->data) > 0) {
        echo "First school: " . $data->data[0]->nom . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString();
}