<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

if ($conexao->connect_error) {
    echo json_encode([
        'ok'    => false,
        'error' => 'Erro na conexão com o banco: ' . $conexao->connect_error,
        'perfil'=> null
    ]);
    exit;
}

$conexao->set_charset('utf8mb4');

// mesmo padrão das outras APIs: pegar sempre o id do usuário logado
$usuarioId = $_SESSION['usuario_id']
    ?? $_SESSION['user_id']
    ?? $_SESSION['id']
    ?? null;

if (!$usuarioId) {
    echo json_encode([
        'ok'    => false,
        'error' => 'Usuário não autenticado.',
        'perfil'=> null
    ]);
    exit;
}

$usuarioId = (int) $usuarioId;

$sql = "SELECT peso, altura, genero, objetivo_treino, objetivo_peso
        FROM perfil_usuario
        WHERE usuario_id = ?
        LIMIT 1";

$stmt = $conexao->prepare($sql);
$stmt->bind_param('i', $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        'ok'     => true,
        'perfil' => $row
    ]);
} else {
    echo json_encode([
        'ok'     => false,
        'perfil' => null
    ]);
}

$stmt->close();
$conexao->close();
