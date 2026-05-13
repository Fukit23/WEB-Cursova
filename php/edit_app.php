<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'publisher') {
    echo json_encode(['status' => 'error', 'message' => 'Немає доступу']);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Помилка БД']);
    exit;
}

$id = $_POST['id'] ?? 0;
$uid = $_SESSION['user_id'];
$name = $_POST['name'] ?? '';
$desc = $_POST['description'] ?? '';
$price = $_POST['price'] ?? 0;
$age = $_POST['age_category'] ?? '0+';
$cat = $_POST['category'] ?? 'Games';

$stmt1 = $conn->prepare("UPDATE apps SET name=?, description=?, age_category=?, category=? WHERE id=? AND publisher_id=?");
if (!$stmt1) {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
    exit;
}
$stmt1->bind_param("ssssii", $name, $desc, $age, $cat, $id, $uid);
$stmt1->execute();
$stmt1->close();

$stmt2 = $conn->prepare("UPDATE versions SET price=? WHERE app_id=?");
if (!$stmt2) {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
    exit;
}
$stmt2->bind_param("di", $price, $id);
$stmt2->execute();
$stmt2->close();

echo json_encode(['status' => 'success']);
$conn->close();
?>