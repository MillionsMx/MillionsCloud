<?php

namespace App\Listeners;

use App\Services\Shares\DetachUsersFromEntries;
use App\Services\Shares\Traits\AttachesFileEntriesToUsers;
use App\Services\Shares\Traits\GeneratesSharePermissions;
use Common\Files\Events\FileEntryCreated;
use Common\Files\FileEntry;
use Common\Files\FileEntryUser;
use Common\Files\Traits\ChunksChildEntries;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class AttachUsersToNewlyUploadedFile
{
    use AttachesFileEntriesToUsers,
        GeneratesSharePermissions,
        ChunksChildEntries;

    /**
     * Attach all users that have access to entries parent folder to entry.
     */
    public function handle(FileEntryCreated $event): void
    {
        $entry = $event->fileEntry;

        if ($entry->parent && $entry->parent->users->count() > 1) {
            $users = $entry->parent->users
                ->filter(function (FileEntryUser $user) use ($entry) {
                    $entryUser = $entry->users->find($user->id);
                    // if user already owns this entry, skip them
                    return !$entryUser || !$entryUser->owns_entry;
                })
                ->map(function (FileEntryUser $user) {
                    return [
                        'id' => $user->id,
                        'permissions' => $user->owns_entry
                            ? $this->getFullPermissions()
                            : $user->entry_permissions,
                    ];
                });

            $this->updateEntryUsers($users, $entry);
        }
    }

    /**
     * Update users and their permissions for specified entries.
     */
    protected function updateEntryUsers(
        Collection $users,
        FileEntry $entry,
    ): void {
        $users = $users->map(function ($user) {
            $user['permissions'] = $this->generateSharePermissions(
                $user['permissions'],
            );
            return $user;
        });

        $this->chunkChildEntries([$entry], function ($chunk) use ($users) {
            // detach users (except owner) from entries
            (new DetachUsersFromEntries())->execute(
                $chunk,
                $users->pluck('id'),
            );

            // filter out removed users, so they are not re-attached
            $users = $users->filter(fn($user) => !Arr::get($user, 'removed'));

            $this->attachFileEntriesToUsers($users, $chunk);
        });
    }

    protected function getFullPermissions(): array
    {
        return ['edit' => true, 'view' => true, 'download' => true];
    }
}
