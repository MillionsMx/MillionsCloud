<?php

namespace App\Services\Shares;

use App\Models\User;
use App\Services\Shares\Traits\AttachesFileEntriesToUsers;
use App\Services\Shares\Traits\GeneratesSharePermissions;
use Common\Files\Traits\ChunksChildEntries;
use Illuminate\Database\Eloquent\Collection;

class AttachUsersToEntry
{
    use AttachesFileEntriesToUsers,
        GeneratesSharePermissions,
        ChunksChildEntries;

    public function execute(
        array $emails,
        array $entries,
        array $permissions,
    ): Collection {
        $users = User::whereIn('email', $emails)->get();

        // permissions on each user are expected
        $transformedUsers = $users->map(
            fn(User $user) => [
                'id' => $user->id,
                'permissions' => $this->generateSharePermissions($permissions),
            ],
        );

        $transformedUsers->chunk(200)->each(function ($users) use ($entries) {
            $this->chunkChildEntries($entries, function ($chunk) use ($users) {
                $this->attachFileEntriesToUsers($users, $chunk);
            });
        });

        return $users;
    }
}
