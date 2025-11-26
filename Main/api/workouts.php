<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

if ($conexao->connect_error) {
    echo json_encode([
        'ok'    => false,
        'error' => 'Erro na conexão com o banco: ' . $conexao->connect_error
    ]);
    exit;
}

$conexao->set_charset('utf8mb4');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'ok'    => false,
        'error' => 'Usuário não autenticado.'
    ]);
    exit;
}

$usuarioId = (int) $_SESSION['usuario_id'];
$method    = $_SERVER['REQUEST_METHOD'];
$action    = $_GET['action'] ?? $_POST['action'] ?? '';

if ($method === 'GET' && $action === 'list') {
    listWorkouts($conexao, $usuarioId);
} elseif ($method === 'POST' && $action === 'create_workout') {
    createWorkout($conexao, $usuarioId);
} elseif ($method === 'POST' && $action === 'create_exercice') {
    createExercice($conexao, $usuarioId);
} elseif ($method === 'POST' && $action === 'delete_workout') {
    deleteWorkout($conexao, $usuarioId);
} else {
    echo json_encode([
        'ok'    => false,
        'error' => 'Ação inválida.'
    ]);
    exit;
}

function listWorkouts(mysqli $conexao, int $usuarioId): void
{
    $sql = "
        SELECT
            t.id              AS treino_id,
            t.nome_treino     AS treino_nome,
            t.created_at      AS treino_created_at,
            e.id              AS exercicio_id,
            e.nome_exercicio,
            e.tipo_exercicio,
            e.series,
            e.repeticoes,
            e.duracao_minutos
        FROM treinos t
        LEFT JOIN exercicios_treino e
          ON e.treino_id = t.id
        WHERE t.usuario_id = ?
        ORDER BY t.created_at ASC, e.id ASC
    ";

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('i', $usuarioId);
    $stmt->execute();
    $result = $stmt->get_result();

    $treinos = [];

    while ($row = $result->fetch_assoc()) {
        $tid = (int) $row['treino_id'];

        if (!isset($treinos[$tid])) {
            $treinos[$tid] = [
                'id'         => $tid,
                'nome'       => $row['treino_nome'],
                'created_at' => $row['treino_created_at'],
                'exercicios' => []
            ];
        }

        if (!empty($row['exercicio_id'])) {
            $treinos[$tid]['exercicios'][] = [
                'id'              => (int) $row['exercicio_id'],
                'nome_exercicio'  => $row['nome_exercicio'],
                'tipo_exercicio'  => $row['tipo_exercicio'],
                'series'          => $row['series'],
                'repeticoes'      => $row['repeticoes'],
                'duracao_minutos' => $row['duracao_minutos']
            ];
        }
    }

    $stmt->close();

    echo json_encode([
        'ok'      => true,
        'treinos' => array_values($treinos)
    ]);
    exit;
}

function createWorkout(mysqli $conexao, int $usuarioId): void
{
    $nome = trim($_POST['name_workout'] ?? '');

    if ($nome === '') {
        echo json_encode([
            'ok'    => false,
            'error' => 'Nome do treino é obrigatório.'
        ]);
        exit;
    }

    $sql = "INSERT INTO treinos (usuario_id, nome_treino) VALUES (?, ?)";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('is', $usuarioId, $nome);
    $stmt->execute();

    $id = (int) $conexao->insert_id;
    $stmt->close();

    echo json_encode([
        'ok'     => true,
        'treino' => [
            'id'         => $id,
            'nome'       => $nome,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    exit;
}

function createExercice(mysqli $conexao, int $usuarioId): void
{
    $treinoId   = (int) ($_POST['treino_id'] ?? 0);
    $nome       = trim($_POST['name_exercice'] ?? '');
    $tipo       = $_POST['tipe_exercice'] ?? '';
    $series     = $_POST['series'] ?? null;
    $repeticoes = $_POST['reps'] ?? null;
    $duracao    = $_POST['duration'] ?? null;

    if ($treinoId <= 0 || $nome === '' || !in_array($tipo, ['cardiovascular', 'musculacao'], true)) {
        echo json_encode([
            'ok'    => false,
            'error' => 'Dados obrigatórios do exercício inválidos.'
        ]);
        exit;
    }

    $sqlCheck = "SELECT id FROM treinos WHERE id = ? AND usuario_id = ? LIMIT 1";
    $stmtCheck = $conexao->prepare($sqlCheck);
    $stmtCheck->bind_param('ii', $treinoId, $usuarioId);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if (!$resultCheck->fetch_assoc()) {
        $stmtCheck->close();
        echo json_encode([
            'ok'    => false,
            'error' => 'Treino não encontrado para este usuário.'
        ]);
        exit;
    }
    $stmtCheck->close();

    $series     = ($series === '' ? null : (int) $series);
    $repeticoes = ($repeticoes === '' ? null : (int) $repeticoes);
    $duracao    = ($duracao === '' ? null : (int) $duracao);

    $sql = "
        INSERT INTO exercicios_treino
        (treino_id, nome_exercicio, tipo_exercicio, series, repeticoes, duracao_minutos)
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param(
        'issiii',
        $treinoId,
        $nome,
        $tipo,
        $series,
        $repeticoes,
        $duracao
    );
    $stmt->execute();

    $id = (int) $conexao->insert_id;
    $stmt->close();

    echo json_encode([
        'ok'        => true,
        'exercicio' => [
            'id'              => $id,
            'treino_id'       => $treinoId,
            'nome_exercicio'  => $nome,
            'tipo_exercicio'  => $tipo,
            'series'          => $series,
            'repeticoes'      => $repeticoes,
            'duracao_minutos' => $duracao
        ]
    ]);
    exit;
}

function deleteWorkout(mysqli $conexao, int $usuarioId): void
{
    $treinoId = (int) ($_POST['treino_id'] ?? 0);

    if ($treinoId <= 0) {
        echo json_encode([
            'ok'    => false,
            'error' => 'Treino inválido.'
        ]);
        exit;
    }

    $sql = "DELETE FROM treinos WHERE id = ? AND usuario_id = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('ii', $treinoId, $usuarioId);
    $stmt->execute();
    $linhas = $stmt->affected_rows;
    $stmt->close();

    if ($linhas === 0) {
        echo json_encode([
            'ok'    => false,
            'error' => 'Treino não encontrado para este usuário.'
        ]);
        exit;
    }

    echo json_encode([
        'ok' => true
    ]);
    exit;
}
