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
