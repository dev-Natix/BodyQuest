<?php
session_start();
include_once('config.php');

$usuario_id = null;

if (isset($_SESSION['usuario_id'])) {
    $usuario_id = (int) $_SESSION['usuario_id'];
} elseif (isset($_SESSION['usuario'])) {
    $email_sessao = $_SESSION['usuario'];

    $stmtUser = $conexao->prepare("SELECT id FROM cadastro WHERE email_cadastro = ? LIMIT 1");
    if ($stmtUser) {
        $stmtUser->bind_param('s', $email_sessao);
        $stmtUser->execute();
        $resultUser = $stmtUser->get_result();

        if ($resultUser && $resultUser->num_rows === 1) {
            $rowUser = $resultUser->fetch_assoc();
            $usuario_id = (int) $rowUser['id'];
        }

        $stmtUser->close();
    }
}

if (!$usuario_id) {
    header('Location: ../views/index.html?show=login');
    exit();
}

$peso   = $_POST['peso']   ?? '';
$altura = $_POST['altura'] ?? '';

$peso   = str_replace(',', '.', $peso);
$altura = str_replace(',', '.', $altura);

$genero       = $_POST['genero']       ?? null;
$objetivoPeso = $_POST['objetivoPeso'] ?? null;
$objetivoTreinoArray = $_POST['objetivoTreino'] ?? [];
$objetivoTreino = null;

if (!empty($objetivoTreinoArray) && is_array($objetivoTreinoArray)) {
    $objetivoTreino = implode(',', $objetivoTreinoArray);
}

$sql = "INSERT INTO perfil_usuario (usuario_id, peso, altura, genero, objetivo_treino, objetivo_peso)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            peso = VALUES(peso),
            altura = VALUES(altura),
            genero = VALUES(genero),
            objetivo_treino = VALUES(objetivo_treino),
            objetivo_peso = VALUES(objetivo_peso)";

$stmt = $conexao->prepare($sql);

if (!$stmt) {
    header('Location: ../views/profile.html?erro=stmt');
    exit();
}

$pesoFloat   = $peso   !== '' ? (float) $peso   : 0;
$alturaFloat = $altura !== '' ? (float) $altura : 0;

$stmt->bind_param(
    'iddsss',
    $usuario_id,
    $pesoFloat,
    $alturaFloat,
    $genero,
    $objetivoTreino,
    $objetivoPeso
);

$stmt->execute();
$stmt->close();
$conexao->close();

header('Location: ../views/mainpg.html');
exit();
