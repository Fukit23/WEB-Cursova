<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit;

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$user_id = $_SESSION['user_id'];

$d_sql = "SELECT a.name, a.icon_path, d.download_date FROM downloads d JOIN apps a ON d.app_id = a.id WHERE d.user_id = ? ORDER BY d.download_date DESC";
$stmt = $conn->prepare($d_sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$downloads = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$uploads = [];
if ($_SESSION['role'] === 'publisher') {
    $u_sql = "SELECT name, icon_path, id FROM apps WHERE publisher_id = ?";
    $stmt2 = $conn->prepare($u_sql);
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $uploads = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
}

echo json_encode(['downloads' => $downloads, 'uploads' => $uploads]);
$conn->close();
?>