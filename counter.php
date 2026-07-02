<?php
/**
 * counter.php
 * -----------
 * Tracks how many times the cover page PDF has been downloaded.
 *
 * POST  -> increments the counter by 1 and returns the new total
 * GET   -> returns the current total without incrementing (useful for
 *          an admin/status check, e.g. counter.php?view=1)
 *
 * Count is stored in counter_data.json (created automatically on first run).
 */

header('Content-Type: application/json');

$dataFile = __DIR__ . '/counter_data.json';

function read_count($file) {
    if (!file_exists($file)) {
        return 0;
    }
    $raw = @file_get_contents($file);
    $decoded = json_decode($raw, true);
    if (is_array($decoded) && isset($decoded['count'])) {
        return (int) $decoded['count'];
    }
    return 0;
}

function write_count($file, $count) {
    $payload = json_encode(['count' => $count, 'updated_at' => date('c')]);
    file_put_contents($file, $payload, LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];

// Open (or create) the file and lock it for the whole read-modify-write
// cycle so concurrent downloads don't clobber each other's count.
$handle = fopen($dataFile, file_exists($dataFile) ? 'r+' : 'w+');
if ($handle === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to access counter storage']);
    exit;
}

flock($handle, LOCK_EX);

$raw = stream_get_contents($handle);
$decoded = json_decode($raw, true);
$count = (is_array($decoded) && isset($decoded['count'])) ? (int) $decoded['count'] : 0;

if ($method === 'POST') {
    $count += 1;
    $payload = json_encode(['count' => $count, 'updated_at' => date('c')]);
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, $payload);
    fflush($handle);
}

flock($handle, LOCK_UN);
fclose($handle);

echo json_encode(['count' => $count]);
