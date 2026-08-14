<?php

namespace Common\Files\Providers;

use Illuminate\Filesystem\FilesystemManager;
use Illuminate\Support\ServiceProvider;
use Storage;

class BackblazeServiceProvider extends ServiceProvider
{
    /**
     * Perform post-registration booting of services.
     *
     * @return void
     */
    public function boot()
    {
        Storage::extend('backblaze_s3', function ($app, $config) {
            $config[
                'endpoint'
            ] = "https://s3.{$config['region']}.backblazeb2.com";

            // backblaze rejects the crc32 integrity headers newer versions of
            // the aws sdk send on every request with
            // "400 InvalidArgument: Unsupported header"
            $config['request_checksum_calculation'] = 'when_required';
            $config['response_checksum_validation'] = 'when_required';

            return app(FilesystemManager::class)->createS3Driver($config);
        });
    }

    /**
     * Register bindings in the container.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
