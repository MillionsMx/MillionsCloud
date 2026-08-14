<?php

namespace App\Services\Shares;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DetachUsersFromEntries
{
    /**
     * Detach (non owner) users from specified entries.
     */
    public function execute(
        array|Collection $entries,
        array|Collection $userIds,
    ): void {
        DB::table('file_entry_models')
            ->whereIn('file_entry_id', collect($entries)->pluck('id'))
            ->whereIn('model_id', $userIds)
            ->where('model_type', User::MODEL_TYPE)
            ->where('owner', false)
            ->delete();
    }
}
