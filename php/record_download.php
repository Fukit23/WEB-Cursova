<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error']);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$user_id = $_SESSION['user_id'];
$app_id = $_POST['app_id'] ?? 0;

$stmt = $conn->prepare("INSERT INTO downloads (user_id, app_id) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $app_id);
$stmt->execute();

echo json_encode(['status' => 'success']);
$conn->close();
?>