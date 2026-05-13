<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');

$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'user';

if (mb_strlen($username) < 4) {
    echo json_encode(['status' => 'error', 'message' => 'Ім\'я користувача має містити мінімум 4 символи']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Невірний формат пошти']);
    exit;
}

$parts = explode('@', $email);
if (count($parts) === 2) {
    $domain = $parts[1];
    $allowed_domains = ['gmail.com', 'ukr.net'];
    
    if (!in_array($domain, $allowed_domains)) {
        echo json_encode(['status' => 'error', 'message' => 'Реєстрація дозволена лише з gmail.com та ukr.net']);
        exit;
    }
}

if (mb_strlen($password) < 5) {
    echo json_encode(['status' => 'error', 'message' => 'Пароль має містити мінімум 5 символів']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Ця пошта вже зареєстрована']);
    $stmt->close();
    exit;
}
$stmt->close();

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $email, $hashed_password, $role);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Реєстрація успішна']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Помилка реєстрації']);
}

$stmt->close();
$conn->close();
?>