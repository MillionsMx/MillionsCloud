<?php
/**
 * Plugin Name: ZZ Upload Debug (temporal)
 * Description: Registra por que falla async-upload.php. Borrar cuando se resuelva.
 */

if (!defined('ABSPATH')) {
    exit();
}

add_action(
    'init',
    function () {
        $script = $_SERVER['SCRIPT_NAME'] ?? '';
        if (!str_contains($script, 'async-upload.php')) {
            return;
        }

        $user = wp_get_current_user();
        $nonce = $_REQUEST['_wpnonce'] ?? ($_REQUEST['_ajax_nonce'] ?? null);

        $lines = [
            'time' => gmdate('c'),
            'user_id' => $user->ID,
            'user_login' => $user->user_login ?: '(no logueado)',
            'roles' => implode(',', (array) $user->roles),
            'can_upload_files' => current_user_can('upload_files') ? 'yes' : 'NO',
            'nonce_present' => $nonce ? 'yes' : 'NO',
            'nonce_valid_media_form' => $nonce
                ? var_export(wp_verify_nonce($nonce, 'media-form'), true)
                : 'n/a',
            'action' => $_REQUEST['action'] ?? '(none)',
            'files_error' => isset($_FILES['async-upload']['error'])
                ? $_FILES['async-upload']['error']
                : '(sin archivo)',
            'files_name' => $_FILES['async-upload']['name'] ?? '(sin archivo)',
            'files_size' => $_FILES['async-upload']['size'] ?? '(sin archivo)',
            'cookies' => implode(',', array_keys($_COOKIE)),
        ];

        $out = "[zz-upload-debug]\n";
        foreach ($lines as $key => $value) {
            $out .= "  $key = $value\n";
        }

        file_put_contents('/tmp/zz-upload-debug.log', $out, FILE_APPEND);
    },
    1,
);
