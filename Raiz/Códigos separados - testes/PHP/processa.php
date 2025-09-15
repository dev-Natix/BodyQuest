<?php
  include_once('config.php');
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $nascimento = $_POST['nascimento'];
    $senha = $_POST['senha'];

    $result = mysqli_query($conexao, "INSERT INTO cadastro(nome,email,nascimento,senha)
     VALUES('$nome','$email','$nascimento','$senha')");
     echo '<div class="ok">cadastro realizado com sucesso</div>';
?>