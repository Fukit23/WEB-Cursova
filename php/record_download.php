<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$uid = $_SESSION['user_id'];
$aid = $_POST['app_id'] ?? 0;

$stmt = $conn->prepare("INSERT INTO downloads (user_id, app_id) VALUES (?, ?)");
$stmt->bind_param("ii", $uid, $aid);
$stmt->execute();

$conn->close();
?>