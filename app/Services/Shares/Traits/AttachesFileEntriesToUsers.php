<?php

namespace App\Services\Shares\Traits;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

trait AttachesFileEntriesToUsers
{
    protected function attachFileEntriesToUsers(
        Collection $users,
        Collection $entries,
    ): void {
        $records = $users
            ->map(
                fn($user) => $entries->map(
                    fn($entry) => [
                        'model_id' => $user['id'],
                        'model_type' => User::MODEL_TYPE,
                        'file_entry_id' => is_numeric($entry)
                            ? $entry
                            : $entry->id,
                        'permissions' => json_encode($user['permissions']),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ),
            )
            ->collapse();

        // remove duplicates. Shared folder might contain files that have
        // different owners which will cause duplicate issues otherwise
        $existing = DB::table('file_entry_models')
            ->whereIn('model_id', $users->pluck('id'))
            ->where('model_type', User::MODEL_TYPE)
            ->whereIn('file_entry_id', $records->pluck('file_entry_id'))
            ->get();

        $records = $records->filter(
            fn($a) => !$existing->first(
                fn($b) => (int) $b->file_entry_id === (int) $a['file_entry_id'],
            ),
        );

        DB::table('file_entry_models')->insert($records->toArray());
    }
}
