<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');

$sql = "
    SELECT 
        a.id, a.name, a.description, a.icon_id, a.icon_path, a.category, a.age_category,
        v.type, v.price, v.download_link,
        u.username AS publisher_name
    FROM apps a
    LEFT JOIN versions v ON a.id = v.app_id
    LEFT JOIN users u ON a.publisher_id = u.id
";

$res = $conn->query($sql);
$apps = [];

while ($row = $res->fetch_assoc()) {
    $apps[] = $row;
}

echo json_encode($apps);
$conn->close();
?>