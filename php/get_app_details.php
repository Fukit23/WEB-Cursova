<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');
$id = $_GET['id'] ?? 0;
$uid = $_SESSION['user_id'] ?? 0;

$appQuery = "SELECT a.*, u.username as publisher_name, (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE app_id = a.id) as avg_rating FROM apps a LEFT JOIN users u ON a.publisher_id = u.id WHERE a.id = ?";
$stmt1 = $conn->prepare($appQuery);
$stmt1->bind_param("i", $id);
$stmt1->execute();
$app = $stmt1->get_result()->fetch_assoc();

$versionsQuery = "SELECT * FROM versions WHERE app_id = ? ORDER BY id DESC";
$stmt2 = $conn->prepare($versionsQuery);
$stmt2->bind_param("i", $id);
$stmt2->execute();
$versions = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

$reviewsQuery = "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.app_id = ? ORDER BY r.created_at DESC";
$stmt3 = $conn->prepare($reviewsQuery);
$stmt3->bind_param("i", $id);
$stmt3->execute();
$reviews = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

$has_purchased = false;
if ($uid > 0) {
    $stmt4 = $conn->prepare("SELECT id FROM purchases WHERE user_id = ? AND app_id = ?");
    $stmt4->bind_param("ii", $uid, $id);
    $stmt4->execute();
    if ($stmt4->get_result()->num_rows > 0) {
        $has_purchased = true;
    }
}

echo json_encode(['app' => $app, 'versions' => $versions, 'reviews' => $reviews, 'logged_in' => $uid > 0, 'has_purchased' => $has_purchased]);
$conn->close();
?>