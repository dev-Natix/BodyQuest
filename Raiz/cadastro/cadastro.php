<?php
  include_once('config.php');
    $nome = $_POST['nome_cadastro'];
    $email = $_POST['email_cadastro'];
    $nascimento = $_POST['nascimento_cadastro'];
    $senha = password_hash($_POST['senha_cadastro'], PASSWORD_DEFAULT);

    $result = mysqli_query($conexao, "INSERT INTO cadastro(nome_cadastro,email_cadastro,nascimento_cadastro,senha_cadastro)
     VALUES('$nome','$email','$nascimento','$senha')");
     echo '<div class="ok">cadastro realizado com sucesso</div>'; 
  
?>