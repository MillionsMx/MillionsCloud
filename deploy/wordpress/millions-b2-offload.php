<?php
/**
 * Plugin Name: Millions B2 Offload
 * Description: Sube a Backblaze B2 todo lo que no sea imagen web y sirve sus URLs desde files.millions.mx. jpg, png, webp y demas imagenes se quedan locales.
 * Version: 1.0
 * Author: Millions
 */

if (!defined('ABSPATH')) {
    exit();
}

/*
 * Configuracion: define estas constantes en wp-config.php, NO aqui.
 *
 *   define('MMX_B2_KEY_ID',      '...');
 *   define('MMX_B2_APP_KEY',     '...');
 *   define('MMX_B2_BUCKET_ID',   '...');   // el Bucket ID, no el nombre
 *   define('MMX_B2_BUCKET_NAME', 'millions-media');
 *   define('MMX_B2_CDN',         'https://files.millions.mx');
 *
 * Opcional:
 *   define('MMX_B2_DELETE_LOCAL', true);   // borra el original del disco tras subir
 */

// Imagenes web: se quedan SIEMPRE en local (wordpress les genera miniaturas).
// Todo lo demas -- pdf, video, audio, zip, docs, lo que sea -- se va a B2.
function mmx_b2_local_extensions(): array
{
    return apply_filters('mmx_b2_local_extensions', [
        'jpg',
        'jpeg',
        'png',
        'webp',
        'gif',
        'svg',
        'avif',
        'ico',
        'bmp',
    ]);
}

function mmx_b2_configured(): bool
{
    foreach (
        ['MMX_B2_KEY_ID', 'MMX_B2_APP_KEY', 'MMX_B2_BUCKET_ID', 'MMX_B2_CDN']
        as $constant
    ) {
        if (!defined($constant) || !constant($constant)) {
            return false;
        }
    }
    return true;
}

/**
 * Autoriza contra B2 y cachea el token (valido 24h, guardamos 23h).
 */
function mmx_b2_authorize(): array|WP_Error
{
    $cached = get_transient('mmx_b2_auth');
    if ($cached) {
        return $cached;
    }

    $response = wp_remote_get(
        'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
        [
            'timeout' => 20,
            'headers' => [
                'Authorization' =>
                    'Basic ' .
                    base64_encode(MMX_B2_KEY_ID . ':' . MMX_B2_APP_KEY),
            ],
        ],
    );

    if (is_wp_error($response)) {
        return $response;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($body['authorizationToken'])) {
        return new WP_Error(
            'mmx_b2_auth',
            'B2 authorize fallo: ' . wp_remote_retrieve_body($response),
        );
    }

    $auth = [
        'token' => $body['authorizationToken'],
        'apiUrl' => $body['apiInfo']['storageApi']['apiUrl'] ?? ($body['apiUrl'] ?? ''),
    ];

    set_transient('mmx_b2_auth', $auth, 23 * HOUR_IN_SECONDS);

    return $auth;
}

/**
 * Sube un archivo local a B2. Devuelve ['fileId' => ..., 'key' => ...].
 */
function mmx_b2_upload(
    string $path,
    string $key,
    string $content_type = '',
): array|WP_Error {
    $auth = mmx_b2_authorize();
    if (is_wp_error($auth)) {
        return $auth;
    }

    // pedir una url de subida (es de un solo uso)
    $response = wp_remote_post($auth['apiUrl'] . '/b2api/v3/b2_get_upload_url', [
        'timeout' => 20,
        'headers' => [
            'Authorization' => $auth['token'],
            'Content-Type' => 'application/json',
        ],
        'body' => wp_json_encode(['bucketId' => MMX_B2_BUCKET_ID]),
    ]);

    if (is_wp_error($response)) {
        return $response;
    }

    $upload = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($upload['uploadUrl'])) {
        delete_transient('mmx_b2_auth'); // token pudo expirar, forzar re-auth
        return new WP_Error(
            'mmx_b2_upload_url',
            'B2 get_upload_url fallo: ' . wp_remote_retrieve_body($response),
        );
    }

    $contents = file_get_contents($path);
    if ($contents === false) {
        return new WP_Error('mmx_b2_read', "No se pudo leer $path");
    }

    $response = wp_remote_post($upload['uploadUrl'], [
        'timeout' => 300,
        'headers' => [
            'Authorization' => $upload['authorizationToken'],
            'X-Bz-File-Name' => implode('/', array_map('rawurlencode', explode('/', $key))),
            // el tipo lo da wordpress: mime_content_type() devuelve text/plain
            // para pdf en este servidor
            'Content-Type' => $content_type ?: 'b2/x-auto',
            'Content-Length' => (string) strlen($contents),
            'X-Bz-Content-Sha1' => sha1($contents),
        ],
        'body' => $contents,
    ]);

    if (is_wp_error($response)) {
        return $response;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($body['fileId'])) {
        return new WP_Error(
            'mmx_b2_upload',
            'B2 upload fallo: ' . wp_remote_retrieve_body($response),
        );
    }

    return ['fileId' => $body['fileId'], 'key' => $key];
}

/**
 * Tras subir un adjunto: si su extension esta en la lista, va a B2.
 */
add_action(
    'add_attachment',
    function ($attachment_id) {
        if (!mmx_b2_configured()) {
            return;
        }

        $path = get_attached_file($attachment_id);
        if (!$path || !file_exists($path)) {
            return;
        }

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($extension, mmx_b2_local_extensions(), true)) {
            return; // imagenes web: se quedan locales
        }

        // conservar la ruta year/month de wordpress para evitar colisiones
        $uploads = wp_get_upload_dir();
        $key = ltrim(str_replace($uploads['basedir'], '', $path), '/');

        $type =
            get_post_mime_type($attachment_id) ?:
            (wp_check_filetype($path)['type'] ?: '');

        $result = mmx_b2_upload($path, $key, $type);

        if (is_wp_error($result)) {
            error_log('[mmx-b2] ' . $result->get_error_message());
            return; // el archivo sigue local y usable, solo no se offloadeo
        }

        update_post_meta($attachment_id, '_mmx_b2_key', $result['key']);
        update_post_meta($attachment_id, '_mmx_b2_file_id', $result['fileId']);

        if (defined('MMX_B2_DELETE_LOCAL') && MMX_B2_DELETE_LOCAL) {
            @unlink($path);
        }
    },
    10,
    1,
);

/**
 * Servir la URL desde el CDN para los adjuntos que estan en B2.
 */
add_filter(
    'wp_get_attachment_url',
    function ($url, $attachment_id) {
        $key = get_post_meta($attachment_id, '_mmx_b2_key', true);
        return $key ? rtrim(MMX_B2_CDN, '/') . '/' . $key : $url;
    },
    10,
    2,
);

/**
 * Al borrar el adjunto en wordpress, borrarlo tambien en B2.
 */
add_action('delete_attachment', function ($attachment_id) {
    if (!mmx_b2_configured()) {
        return;
    }

    $key = get_post_meta($attachment_id, '_mmx_b2_key', true);
    $file_id = get_post_meta($attachment_id, '_mmx_b2_file_id', true);
    if (!$key || !$file_id) {
        return;
    }

    $auth = mmx_b2_authorize();
    if (is_wp_error($auth)) {
        return;
    }

    wp_remote_post($auth['apiUrl'] . '/b2api/v3/b2_delete_file_version', [
        'timeout' => 20,
        'headers' => [
            'Authorization' => $auth['token'],
            'Content-Type' => 'application/json',
        ],
        'body' => wp_json_encode(['fileName' => $key, 'fileId' => $file_id]),
    ]);
});
