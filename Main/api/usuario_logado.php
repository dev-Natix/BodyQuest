<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

if ($conexao->connect_error) {
    echo json_encode([
        'ok'   => false,
        'nome' => null,
        'aniversario_hoje' => false,
        'error' => 'Erro na conexão com o banco: ' . $conexao->connect_error
    ]);
    exit;
}

$conexao->set_charset('utf8mb4');

$usuarioId = $_SESSION['usuario_id'] ?? null;

if (!$usuarioId) {
    echo json_encode([
        'ok'   => false,
        'nome' => null,
        'aniversario_hoje' => false
    ]);
    exit;
}

$usuarioId = (int) $usuarioId;

$sql = "SELECT nome_cadastro, nascimento_cadastro
        FROM cadastro
        WHERE id = ?
        LIMIT 1";

$stmt = $conexao->prepare($sql);
$stmt->bind_param('i', $usuarioId);
$stmt->execute();
$result = $stmt->get_result();

if (!$row = $result->fetch_assoc()) {
    echo json_encode([
        'ok'   => false,
        'nome' => null,
        'aniversario_hoje' => false
    ]);
    $stmt->close();
    $conexao->close();
    exit;
}

$nome = $row['nome_cadastro'];
$nasc = $row['nascimento_cadastro'];

$aniversarioHoje = false;

if ($nasc) {
    $tsNasc = strtotime($nasc);
    if ($tsNasc !== false) {
        $mesDiaNasc = date('m-d', $tsNasc);
        $mesDiaHoje = date('m-d');
        $aniversarioHoje = ($mesDiaNasc === $mesDiaHoje);
    }
}

$stmt->close();
$conexao->close();

echo json_encode([
    'ok'               => true,
    'nome'             => $nome,
    'aniversario_hoje' => $aniversarioHoje
]);
