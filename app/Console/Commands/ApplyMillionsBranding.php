<?php

namespace App\Console\Commands;

use Common\Admin\Appearance\Themes\CssTheme;
use Common\Settings\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class ApplyMillionsBranding extends Command
{
    protected $signature = 'millions:branding {--dry-run : Show what would change without writing}';
    protected $description = 'Force MillionsCloud branding (logos, landing page copy, theme colors) onto the already installed site';

    public function handle(): int
    {
        $this->applyLogos();
        $this->applyLandingPageCopy();
        $this->applyThemeColors();

        if (!$this->option('dry-run')) {
            Artisan::call('cache:clear');
            $this->info('Cache cleared.');
        }

        return Command::SUCCESS;
    }

    private function applyLogos(): void
    {
        $logos = [
            'branding.logo_dark' => 'images/logo-dark.png',
            'branding.logo_light' => 'images/logo-light.png',
            'branding.logo_dark_mobile' => 'images/mobile-logo-dark.png',
            'branding.logo_light_mobile' => 'images/mobile-logo-light.png',
            'branding.favicon' => 'images/favicon-original.png',
            'branding.site_name' => 'MillionsCloud',
        ];

        foreach ($logos as $name => $value) {
            $this->setSetting($name, $value);
        }

        // keep whatever description is there, just drop the old product name
        $description = Setting::where('name', 'branding.site_description')->first();
        if ($description) {
            $raw = $description->getRawOriginal('value');
            $replaced = str_ireplace('bedrive', 'MillionsCloud', $raw);
            if ($replaced !== $raw) {
                $this->setSetting('branding.site_description', $replaced);
            }
        }
    }

    private function applyLandingPageCopy(): void
    {
        $setting = Setting::where('name', 'homepage.appearance')->first();

        // nothing stored yet, config default (already rebranded) will be used
        if (!$setting) {
            $this->line('homepage.appearance: not set in db, using config default.');
            return;
        }

        $json = $setting->getRawOriginal('value');
        $replaced = str_ireplace('bedrive', 'MillionsCloud', $json);

        if ($replaced === $json) {
            $this->line('homepage.appearance: no BeDrive references found.');
            return;
        }

        $this->setSetting('homepage.appearance', $replaced);
    }

    private function applyThemeColors(): void
    {
        foreach (['light', 'dark'] as $mode) {
            $colors = config("common.themes.$mode");
            $theme = CssTheme::where('type', 'site')
                ->where("default_$mode", true)
                ->first();

            if (!$theme) {
                $this->warn("No default $mode theme found, skipping.");
                continue;
            }

            // only overwrite the brand colors, keep any other customizations
            $values = array_merge($theme->values, [
                '--be-primary-light' => $colors['--be-primary-light'],
                '--be-primary' => $colors['--be-primary'],
                '--be-primary-dark' => $colors['--be-primary-dark'],
                '--be-on-primary' => $colors['--be-on-primary'],
            ]);

            $this->line("theme [$mode]: primary -> {$colors['--be-primary']}");

            if (!$this->option('dry-run')) {
                $theme->values = $values;
                $theme->save();
            }
        }
    }

    private function setSetting(string $name, string $value): void
    {
        $this->line("setting [$name] -> $value");

        if (!$this->option('dry-run')) {
            Setting::updateOrCreate(['name' => $name], ['value' => $value]);
        }
    }
}
