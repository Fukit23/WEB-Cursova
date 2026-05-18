<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['downloads' => [], 'uploads' => []]);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$uid = $_SESSION['user_id'];

$d_res = $conn->query("SELECT a.name, d.download_date FROM downloads d JOIN apps a ON d.app_id = a.id WHERE d.user_id = $uid ORDER BY d.id DESC");
$downloads = $d_res->fetch_all(MYSQLI_ASSOC);

$uploads = [];
if ($_SESSION['role'] === 'publisher') {
    $u_res = $conn->query("SELECT id, name, description, age_category, category FROM apps WHERE publisher_id = $uid ORDER BY id DESC");
    while ($app = $u_res->fetch_assoc()) {
        $aid = $app['id'];
        $v_res = $conn->query("SELECT id, type, price, created_at FROM versions WHERE app_id = $aid ORDER BY id DESC");
        $app['versions'] = $v_res->fetch_all(MYSQLI_ASSOC);
        $uploads[] = $app;
    }
}

echo json_encode(['downloads' => $downloads, 'uploads' => $uploads]);
$conn->close();
?>