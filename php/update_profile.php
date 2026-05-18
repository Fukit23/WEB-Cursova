<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit;

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$uid = $_SESSION['user_id'];
$un = $_POST['username'] ?? '';
$em = $_POST['email'] ?? '';
$pw = $_POST['password'] ?? '';

if ($pw !== '') {
    $h = password_hash($pw, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET username=?, email=?, password=? WHERE id=?");
    $stmt->bind_param("sssi", $un, $em, $h, $uid);
} else {
    $stmt = $conn->prepare("UPDATE users SET username=?, email=? WHERE id=?");
    $stmt->bind_param("ssi", $un, $em, $uid);
}

$stmt->execute();
$_SESSION['username'] = $un;

echo json_encode(['status' => 'success']);
$conn->close();
?>