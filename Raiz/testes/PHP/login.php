<?php
    include_once('config.php');
    $usuario = $_POST['email_login'];
    $senha = $_POST['senha_login'];

    $usuario = $conexao->real_escape_string($usuario);

$result = mysqli_query($conexao,"SELECT senha_cadastro FROM cadastro WHERE email_cadastro = '$usuario'");

if ($result->num_rows == 1) {
  $row = $result->fetch_assoc();

  if (password_verify($senha, $row['senha_cadastro'])) {
    $_SESSION['usuario'] = $usuario;
    echo "Login realizado com sucesso!";
  } else {
    echo "Senha incorreta!";
  }
} else {
  echo "Usuário não encontrado!";
}

$conexao->close();
?>