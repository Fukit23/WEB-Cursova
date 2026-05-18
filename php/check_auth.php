<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    $conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
    $stmt = $conn->prepare("SELECT balance FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    
    echo json_encode([
        'logged_in' => true,
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role'],
        'balance' => $row['balance']
    ]);
    $conn->close();
} else {
    echo json_encode(['logged_in' => false]);
}
?>