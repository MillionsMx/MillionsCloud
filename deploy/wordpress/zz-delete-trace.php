<?php
/**
 * Plugin Name: ZZ Delete Trace (temporal)
 * Description: Registra quien borra adjuntos y cualquier DELETE sobre la tabla de posts. Borrar cuando se resuelva.
 */

if (!defined('ABSPATH')) {
    exit();
}

define('ZZ_TRACE_LOG', '/tmp/zz-delete-trace.log');

function zz_trace(string $title, array $data = []): void
{
    $out = "\n[$title] " . gmdate('c') . "\n";
    foreach ($data as $key => $value) {
        $out .= "  $key = $value\n";
    }
    $out .=
        '  backtrace: ' .
        wp_debug_backtrace_summary(null, 0, false) .
        "\n";
    file_put_contents(ZZ_TRACE_LOG, $out, FILE_APPEND);
}

// quien corta la peticion de subida y por que
add_action(
    'init',
    function () {
        if (!str_contains($_SERVER['SCRIPT_NAME'] ?? '', 'async-upload.php')) {
            return;
        }

        $user = wp_get_current_user();
        $nonce = $_REQUEST['_wpnonce'] ?? ($_REQUEST['_ajax_nonce'] ?? null);

        zz_trace('UPLOAD REQUEST', [
            'user' => $user->ID . ' / ' . ($user->user_login ?: 'anonimo'),
            'can_upload' => current_user_can('upload_files') ? 'yes' : 'NO',
            'nonce_valid' => $nonce
                ? var_export(wp_verify_nonce($nonce, 'media-form'), true)
                : 'SIN NONCE',
            'files_error' => $_FILES['async-upload']['error'] ?? '(sin archivo)',
            'files_name' => $_FILES['async-upload']['name'] ?? '(sin archivo)',
            'post_action' => $_REQUEST['action'] ?? '(none)',
        ]);

        // capturar el cuerpo de la respuesta (el json de error)
        ob_start(function ($buffer) {
            file_put_contents(
                ZZ_TRACE_LOG,
                "\n[RESPUESTA] " . substr($buffer, 0, 600) . "\n",
                FILE_APPEND,
            );
            return $buffer;
        });

        // errores concretos al mover/procesar el archivo
        add_filter('wp_handle_upload_prefilter', function ($file) {
            zz_trace('PREFILTER', [
                'name' => $file['name'] ?? '?',
                'type' => $file['type'] ?? '?',
                'error' => $file['error'] ?: '(sin error)',
            ]);
            return $file;
        });

        // capturar el wp_die que devuelve el 403
        $capture = function ($handler) {
            return function ($message, $title = '', $args = []) use ($handler) {
                zz_trace('WP_DIE', [
                    'message' => is_scalar($message)
                        ? substr((string) $message, 0, 300)
                        : gettype($message),
                    'response' => is_array($args)
                        ? $args['response'] ?? '(sin codigo)'
                        : '(sin args)',
                ]);
                return $handler($message, $title, $args);
            };
        };

        add_filter('wp_die_ajax_handler', $capture, 99);
        add_filter('wp_die_handler', $capture, 99);
    },
    0,
);

// cualquier consulta DELETE que toque posts o postmeta
add_filter('query', function ($query) {
    if (
        stripos($query, 'delete') === 0 &&
        (stripos($query, 'posts') !== false ||
            stripos($query, 'postmeta') !== false)
    ) {
        zz_trace('DELETE', ['sql' => substr($query, 0, 300)]);
    }
    return $query;
});

// los hooks normales de borrado
foreach (['delete_post', 'before_delete_post', 'trashed_post', 'delete_attachment'] as $hook) {
    add_action(
        $hook,
        function ($post_id) use ($hook) {
            zz_trace("HOOK $hook", ['post_id' => $post_id]);
        },
        1,
        1,
    );
}

// se creo el adjunto?
add_action(
    'add_attachment',
    function ($attachment_id) {
        zz_trace('ADD_ATTACHMENT', ['id' => $attachment_id]);

        // al final de la peticion, seguia existiendo?
        add_action('shutdown', function () use ($attachment_id) {
            global $wpdb;
            $exists = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM {$wpdb->posts} WHERE ID = %d",
                    $attachment_id,
                ),
            );
            zz_trace('SHUTDOWN', [
                'id' => $attachment_id,
                'sigue_en_db' => $exists,
                'last_error' => $wpdb->last_error ?: '(ninguno)',
            ]);
        });
    },
    1,
    1,
);
