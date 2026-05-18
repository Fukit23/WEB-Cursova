<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error']);
    exit;
}

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$amount = floatval($_POST['amount'] ?? 0);

if ($amount > 0) {
    $stmt = $conn->prepare("UPDATE users SET balance = balance + ? WHERE id = ?");
    $stmt->bind_param("di", $amount, $_SESSION['user_id']);
    $stmt->execute();
    $stmt->close();
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error']);
}

$conn->close();
?>