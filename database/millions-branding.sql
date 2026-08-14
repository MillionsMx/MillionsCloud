-- MillionsCloud branding — fallback for when artisan is not available.
-- Preferred method: php artisan millions:branding
-- Run against the app database, then clear the cache (php artisan cache:clear
-- or delete storage/framework/cache/data).

-- 1. Logos / site name -------------------------------------------------------
INSERT INTO settings (name, value, created_at, updated_at) VALUES
    ('branding.site_name',        'MillionsCloud',                   NOW(), NOW()),
    ('branding.logo_dark',        'images/logo-dark.png',            NOW(), NOW()),
    ('branding.logo_light',       'images/logo-light.png',           NOW(), NOW()),
    ('branding.logo_dark_mobile', 'images/mobile-logo-dark.png',     NOW(), NOW()),
    ('branding.logo_light_mobile','images/mobile-logo-light.png',    NOW(), NOW()),
    ('branding.favicon',          'images/favicon-original.png',     NOW(), NOW())
ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW();

-- 2. Landing page copy + site description ------------------------------------
UPDATE settings
SET value = REPLACE(REPLACE(value, 'BeDrive', 'MillionsCloud'), 'bedrive', 'MillionsCloud'),
    updated_at = NOW()
WHERE name IN ('homepage.appearance', 'branding.site_description')
  AND value LIKE '%edrive%';

-- 3. Theme colors: blue -> emerald -------------------------------------------
-- light theme
UPDATE css_themes
SET `values` = JSON_SET(
        `values`,
        '$."--be-primary-light"', '167 243 208',
        '$."--be-primary"',       '16 185 129',
        '$."--be-primary-dark"',  '5 150 105',
        '$."--be-on-primary"',    '255 255 255'
    ),
    updated_at = NOW()
WHERE type = 'site' AND default_light = 1;

-- dark theme
UPDATE css_themes
SET `values` = JSON_SET(
        `values`,
        '$."--be-primary-light"', '236 253 245',
        '$."--be-primary"',       '110 231 183',
        '$."--be-primary-dark"',  '52 211 153',
        '$."--be-on-primary"',    '6 46 35'
    ),
    updated_at = NOW()
WHERE type = 'site' AND default_dark = 1;
