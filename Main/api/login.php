<?php
session_start();
include_once('config.php');

$usuario = $_POST['email_login'];
$senha = $_POST['senha_login'];

$usuario = $conexao->real_escape_string($usuario);

$sql = "SELECT senha_cadastro FROM cadastro WHERE email_cadastro = '$usuario'";
$result = mysqli_query($conexao, $sql);

if ($result && $result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if (password_verify($senha, $row['senha_cadastro'])) {
        $_SESSION['usuario'] = $usuario;
        header("Location: ../views/profile.html");
        exit();
    }
}

$conexao->close();
?>