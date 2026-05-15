<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Events\UserLoggedIn;
use App\Events\UserLoggedOut;
use App\Events\UserProfileUpdated;
use App\Events\UserDeleted;
use App\Models\UserActivity;
use Illuminate\Support\Facades\Request;

class LogUserActivity
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $action = match (get_class($event)) {
            UserRegistered::class => 'register',
            UserLoggedIn::class => 'login',
            UserLoggedOut::class => 'logout',
            UserProfileUpdated::class => 'update_profile',
            UserDeleted::class => 'delete',
            default => null,
        };

        if ($action) {
            UserActivity::create([
                'user_id' => $event->user->id ?? null,
                'action' => $action,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        }
    }
}
