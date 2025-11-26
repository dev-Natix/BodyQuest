<?php
  include_once('config.php');
    $nome = $_POST['nome_cadastro'];
    $email = $_POST['email_cadastro'];
    $nascimento = $_POST['nascimento_cadastro'];
    $senha = password_hash($_POST['senha_cadastro'], PASSWORD_DEFAULT);

    $result = mysqli_query($conexao, "INSERT INTO cadastro(nome_cadastro,email_cadastro,nascimento_cadastro,senha_cadastro)
     VALUES('$nome','$email','$nascimento','$senha')");
    if($result){
      
      header("Location: ../views/index.html?show=login");
      exit();
  }
?><?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../views/index.html');
    exit;
}

$nome       = trim($_POST['nome_cadastro'] ?? '');
$email      = trim($_POST['email_cadastro'] ?? '');
$nascimento = $_POST['nascimento_cadastro'] ?? '';
$senhaRaw   = $_POST['senha_cadastro'] ?? '';

if ($nome === '' || $email === '' || $nascimento === '' || $senhaRaw === '') {
    header('Location: ../views/index.html?erro=cadastro_campos');
    exit;
}

$senhaHash = password_hash($senhaRaw, PASSWORD_DEFAULT);

$stmt = $conexao->prepare(
    "INSERT INTO cadastro (nome_cadastro, email_cadastro, nascimento_cadastro, senha_cadastro)
     VALUES (?, ?, ?, ?)"
);
$stmt->bind_param('ssss', $nome, $email, $nascimento, $senhaHash);

if ($stmt->execute()) {
    header("Location: ../views/index.html?show=login");
    exit;
}

$stmt->close();
$conexao->close();

header('Location: ../views/index.html?erro=cadastro_erro');
exit;
