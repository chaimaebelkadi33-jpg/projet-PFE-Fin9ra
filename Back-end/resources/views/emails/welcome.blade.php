<!DOCTYPE html>
<html>
<head>
    <title>Bienvenue sur FinN9ra</title>
</head>
<body>
    <p>Bonjour {{ $user->name }} !</p>

    <p>Bienvenue sur <strong>FinN9ra</strong>, votre plateforme dédiée à l'orientation scolaire au Maroc.</p>

    <p>Nous sommes ravis de vous compter parmi nos utilisateurs. Grâce à notre application, vous pourrez :</p>
    <ul>
        <li>Découvrir plus de 40 établissements d'enseignement supérieur</li>
        <li>Comparer les formations et les coûts</li>
        <li>Obtenir des recommandations personnalisées par intelligence artificielle</li>
        <li>Lire et partager des avis sur les écoles</li>
    </ul>

    <p>Pour commencer, rendez-vous sur notre plateforme et explorez les fonctionnalités : <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}">{{ config('app.frontend_url', 'http://localhost:3000') }}</a></p>

    <p>Découvrez nos recommandations IA : <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/recommendations">{{ config('app.frontend_url', 'http://localhost:3000') }}/recommendations</a></p>

    <p><em>"L'orientation est la clé de la réussite. FinN9ra est là pour vous guider."</em></p>

    <p>À très vite sur FinN9ra !</p>

    <p>L'équipe FinN9ra</p>
</body>
</html>
