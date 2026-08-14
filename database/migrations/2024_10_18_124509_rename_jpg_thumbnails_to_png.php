<?php

use App\Models\FileEntry;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        FileEntry::where('created_at', '<=', '2024-08-05 00:00:00')
            ->where('thumbnail', 'true')
            ->where('extension', 'png')
            ->chunk(100, function ($entries) {
                foreach ($entries as $entry) {
                    $oldPath = str_replace(
                        'thumbnail.png',
                        'thumbnail.jpg',
                        $entry->getStoragePath(true),
                    );
                    $disk = $entry->getDisk();
                    if ($disk->exists($oldPath)) {
                        $disk->move($oldPath, $entry->getStoragePath(true));
                    }
                }
            });
    }
};
