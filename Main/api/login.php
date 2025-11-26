<?php
session_start();
require_once __DIR__ . '/config.php';

if ($conexao->connect_error) {
    die('Erro na conexão com o banco: ' . $conexao->connect_error);
}

$conexao->set_charset('utf8mb4');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../views/index.html');
    exit;
}

$email = trim($_POST['email_login'] ?? '');
$senha = $_POST['senha_login'] ?? '';

if ($email === '' || $senha === '') {
    header('Location: ../views/index.html?erro=1');
    exit;
}

$stmt = $conexao->prepare(
    "SELECT id, nome_cadastro, email_cadastro, senha_cadastro
     FROM cadastro
     WHERE email_cadastro = ?
     LIMIT 1"
);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if (password_verify($senha, $row['senha_cadastro'])) {
        $_SESSION['usuario_id']    = (int)$row['id'];
        $_SESSION['usuario_nome']  = $row['nome_cadastro'];
        $_SESSION['usuario_email'] = $row['email_cadastro'];

        header('Location: ../views/profile.html');
        exit;
    }
}

$stmt->close();
$conexao->close();

header('Location: ../views/index.html?erro=1');
exit;
