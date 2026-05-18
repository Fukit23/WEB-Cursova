<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$uid = $_SESSION['user_id'];
$aid = $_POST['app_id'] ?? 0;
$ver = $_POST['version'] ?? '';

$stmt = $conn->prepare("SELECT name FROM apps WHERE id = ? AND publisher_id = ?");
$stmt->bind_param("ii", $aid, $uid);
$stmt->execute();
$app = $stmt->get_result()->fetch_assoc();

if (!$app) {
    echo json_encode(['status' => 'error', 'message' => 'Програму не знайдено']);
    exit;
}

$stmt_check = $conn->prepare("SELECT id FROM versions WHERE app_id = ? AND type = ?");
$stmt_check->bind_param("is", $aid, $ver);
$stmt_check->execute();
if ($stmt_check->get_result()->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Версія з таким номером вже існує!']);
    exit;
}

$stmt_price = $conn->prepare("SELECT price FROM versions WHERE app_id = ? ORDER BY id DESC LIMIT 1");
$stmt_price->bind_param("i", $aid);
$stmt_price->execute();
$price_row = $stmt_price->get_result()->fetch_assoc();
$pr = $price_row ? floatval($price_row['price']) : 0;

$folder = "../uploads/files/app_" . $aid . "/";

if (!file_exists($folder)) {
    mkdir($folder, 0777, true);
}

$file_name = time() . "_" . basename($_FILES['app_file']['name']);
$target = $folder . $file_name;
$db_link = "uploads/files/app_" . $aid . "/" . $file_name;

if (move_uploaded_file($_FILES['app_file']['tmp_name'], $target)) {
    $stmt2 = $conn->prepare("INSERT INTO versions (app_id, type, price, download_link) VALUES (?, ?, ?, ?)");
    $stmt2->bind_param("isds", $aid, $ver, $pr, $db_link);
    $stmt2->execute();
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Помилка завантаження файлу']);
}

$conn->close();
?>