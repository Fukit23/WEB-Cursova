<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'publisher') exit;

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$id = $_POST['id'] ?? 0;
$uid = $_SESSION['user_id'];
$name = $_POST['name'] ?? '';
$desc = $_POST['description'] ?? '';
$price = $_POST['price'] ?? 0;
$age = $_POST['age_category'] ?? '0+';
$cat = $_POST['category'] ?? 'Games';

$stmt1 = $conn->prepare("UPDATE apps SET name=?, description=?, age_category=?, category=? WHERE id=? AND publisher_id=?");
$stmt1->bind_param("ssssii", $name, $desc, $age, $cat, $id, $uid);
$stmt1->execute();

$stmt2 = $conn->prepare("UPDATE versions SET price=? WHERE app_id=?");
$stmt2->bind_param("di", $price, $id);
$stmt2->execute();

$conn->close();
?>