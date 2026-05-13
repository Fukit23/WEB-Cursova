<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'publisher') {
    echo json_encode(['status' => 'error', 'message' => 'Немає доступу']);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');

$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? 'Games';
$age_category = $_POST['age_category'] ?? '0+';
$price = $_POST['price'] ?? 0;

$pub_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $_SESSION['username']);
$safe_name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $name);
$dir_name = $pub_name . '_' . $safe_name;

$icon_dir = '../uploads/icons/' . $dir_name . '/';
$file_dir = '../uploads/files/' . $dir_name . '/';

if (!file_exists($icon_dir)) mkdir($icon_dir, 0777, true);
if (!file_exists($file_dir)) mkdir($file_dir, 0777, true);

$icon_path = '';
if (isset($_FILES['icon'])) {
    if ($_FILES['icon']['error'] === 0) {
        $i_name = time() . '_' . $_FILES['icon']['name'];
        move_uploaded_file($_FILES['icon']['tmp_name'], $icon_dir . $i_name);
        $icon_path = 'uploads/icons/' . $dir_name . '/' . $i_name;
    } elseif ($_FILES['icon']['error'] === 1) {
        echo json_encode(['status' => 'error', 'message' => 'Іконка занадто велика (ліміт сервера).']);
        exit;
    }
}

$app_path = '';
if (isset($_FILES['app_file']) && $_FILES['app_file']['error'] === 0) {
    $a_name = time() . '_' . $_FILES['app_file']['name'];
    move_uploaded_file($_FILES['app_file']['tmp_name'], $file_dir . $a_name);
    $app_path = 'uploads/files/' . $dir_name . '/' . $a_name;
}

$stmt1 = $conn->prepare("INSERT INTO apps (name, description, icon_path, category, age_category) VALUES (?, ?, ?, ?, ?)");
$stmt1->bind_param("sssss", $name, $description, $icon_path, $category, $age_category);
$stmt1->execute();
$app_id = $stmt1->insert_id;
$stmt1->close();

$type = 'official';
$stmt2 = $conn->prepare("INSERT INTO versions (app_id, type, price, download_link) VALUES (?, ?, ?, ?)");
$stmt2->bind_param("isds", $app_id, $type, $price, $app_path);
$stmt2->execute();
$stmt2->close();

$conn->close();

echo json_encode(['status' => 'success']);
?>