<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\UserRegistered;
use App\Events\UserLoggedIn;
use App\Events\UserLoggedOut;
use App\Events\UserProfileUpdated;
use App\Events\UserDeleted;
use App\Listeners\SendWelcomeEmail;
use App\Listeners\LogUserActivity;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            UserRegistered::class,
            [SendWelcomeEmail::class, 'handle']
        );

        Event::listen(
            UserRegistered::class,
            [LogUserActivity::class, 'handle']
        );

        Event::listen(
            UserLoggedIn::class,
            [LogUserActivity::class, 'handle']
        );

        Event::listen(
            UserLoggedOut::class,
            [LogUserActivity::class, 'handle']
        );

        Event::listen(
            UserProfileUpdated::class,
            [LogUserActivity::class, 'handle']
        );

        Event::listen(
            UserDeleted::class,
            [LogUserActivity::class, 'handle']
        );
    }
}
