<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'publisher') exit;

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$id = $_POST['id'] ?? 0;
$uid = $_SESSION['user_id'];

$conn->query("DELETE FROM downloads WHERE app_id = $id");
$conn->query("DELETE FROM versions WHERE app_id = $id");
$conn->query("DELETE FROM apps WHERE id = $id AND publisher_id = $uid");

$conn->close();
?>