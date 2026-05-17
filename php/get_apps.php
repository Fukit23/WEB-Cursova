<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', 'mishkaumka2006', 'app_store_db');

if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed']);
    exit;
}

$sql = "
    SELECT 
        a.id, a.name, a.description, a.icon_id, a.icon_path, a.category, a.age_category,
        v_latest.type, v_latest.price, v_latest.download_link,
        u.username AS publisher_name,
        COALESCE(r_agg.avg_rating, 0) AS avg_rating
    FROM apps a
    LEFT JOIN (
        SELECT v1.app_id, v1.type, v1.price, v1.download_link
        FROM versions v1
        INNER JOIN (
            SELECT app_id, MAX(id) AS max_id
            FROM versions
            GROUP BY app_id
        ) v2 ON v1.app_id = v2.app_id AND v1.id = v2.max_id
    ) v_latest ON a.id = v_latest.app_id
    LEFT JOIN users u ON a.publisher_id = u.id
    LEFT JOIN (
        SELECT app_id, AVG(rating) as avg_rating
        FROM reviews
        GROUP BY app_id
    ) r_agg ON a.id = r_agg.app_id
";

$res = $conn->query($sql);

if (!$res) {
    echo json_encode(['error' => $conn->error]);
    exit;
}

$apps = [];
while ($row = $res->fetch_assoc()) {
    $apps[] = $row;
}

echo json_encode($apps);
$conn->close();
?>