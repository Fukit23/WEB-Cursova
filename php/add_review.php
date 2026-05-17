<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit;

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$user_id = $_SESSION['user_id'];
$app_id = $_POST['app_id'] ?? 0;
$rating = $_POST['rating'] ?? 5;
$comment = $_POST['comment'] ?? '';

$stmt = $conn->prepare("INSERT INTO reviews (user_id, app_id, rating, comment) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiis", $user_id, $app_id, $rating, $comment);
$stmt->execute();

echo json_encode(['status' => 'success']);
$conn->close();
?>