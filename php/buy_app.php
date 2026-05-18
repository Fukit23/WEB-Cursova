<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'msg' => 'auth']);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$uid = $_SESSION['user_id'];
$aid = $_POST['app_id'] ?? 0;

$stmt = $conn->prepare("SELECT price FROM versions WHERE app_id = ? ORDER BY id DESC LIMIT 1");
$stmt->bind_param("i", $aid);
$stmt->execute();
$v = $stmt->get_result()->fetch_assoc();
$p = floatval($v['price'] ?? 0);

$stmt2 = $conn->prepare("SELECT balance FROM users WHERE id = ?");
$stmt2->bind_param("i", $uid);
$stmt2->execute();
$u = $stmt2->get_result()->fetch_assoc();
$b = floatval($u['balance'] ?? 0);

if ($b >= $p) {
    $conn->begin_transaction();
    
    $stmt3 = $conn->prepare("UPDATE users SET balance = balance - ? WHERE id = ?");
    $stmt3->bind_param("di", $p, $uid);
    $stmt3->execute();

    $stmt4 = $conn->prepare("INSERT INTO purchases (user_id, app_id) VALUES (?, ?)");
    $stmt4->bind_param("ii", $uid, $aid);
    $stmt4->execute();

    $conn->commit();
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'msg' => 'no_money']);
}

$conn->close();
?>