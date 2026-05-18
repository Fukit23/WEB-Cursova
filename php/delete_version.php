<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit;

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$vid = $_POST['id'] ?? 0;

$stmt = $conn->prepare("DELETE FROM versions WHERE id = ?");
$stmt->bind_param("i", $vid);
$stmt->execute();

echo json_encode(['status' => 'success']);
$conn->close();
?>