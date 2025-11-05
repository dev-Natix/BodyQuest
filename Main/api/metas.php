<?php
// BodyQuest/Main/api/metas.php

// garante que só chama session_start se ainda não tiver sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

include_once 'config.php';

$usuarioId = $_SESSION['id'] 
    ?? $_SESSION['user_id'] 
    ?? $_SESSION['usuario_id'] 
    ?? null;

if (!$usuarioId) {
    $usuarioId = 1;
}

$usuarioId = (int)$usuarioId;
$method = $_SERVER['REQUEST_METHOD'];



$usuarioId = (int)$usuarioId;
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Regra de meta cumprida (mesma lógica do JS)
 */
function metasCumpridasPHP(string $treino, float $agua, string $sono): bool {
    $treinoOk = strtolower($treino) !== 'nenhum';
    $aguaOk   = $agua > 3;
    $sonoOk   = ($sono === 'mais de 8h' || $sono === '6h à 8h');
    return $treinoOk && $aguaOk && $sonoOk;
}

if ($method === 'GET') {
    // ---------- LISTAR METAS ----------
    $sql = "SELECT 
              id,
              DATE_FORMAT(dia, '%d/%m/%Y') AS dia_formatado,
              treino,
              agua_litros,
              sono,
              concluido
            FROM metas_diarias
            WHERE usuario_id = ?
            ORDER BY dia DESC";

    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('i', $usuarioId);
    $stmt->execute();
    $result = $stmt->get_result();

    $metas = [];
    while ($row = $result->fetch_assoc()) {
        $metas[] = [
            'id'        => (int)$row['id'],
            'dia'       => $row['dia_formatado'],
            'treino'    => $row['treino'],
            'agua'      => (float)$row['agua_litros'],
            'sono'      => $row['sono'],
            'concluido' => (bool)$row['concluido'],
        ];
    }

    echo json_encode($metas);
    exit;
}

if ($method === 'POST') {
    // ---------- CRIAR OU ATUALIZAR META ----------
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $idMeta = isset($input['id']) ? (int)$input['id'] : 0;
    $treino = trim($input['treino'] ?? '');
    $agua   = str_replace(',', '.', trim($input['agua'] ?? '0'));
    $sono   = trim($input['sono'] ?? '');

    $aguaFloat = (float)$agua;

    if ($treino === '' || $sono === '') {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Dados inválidos']);
        exit;
    }

    $concluido = metasCumpridasPHP($treino, $aguaFloat, $sono) ? 1 : 0;

    if ($idMeta <= 0) {
        // ===== NOVA META DE HOJE =====
        $diaHoje = date('Y-m-d');

        // já existe meta de hoje?
        $check = $conexao->prepare(
            "SELECT id FROM metas_diarias WHERE usuario_id = ? AND dia = ?"
        );
        $check->bind_param('is', $usuarioId, $diaHoje);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['sucesso' => false, 'mensagem' => 'Meta de hoje já existe']);
            exit;
        }

        $stmt = $conexao->prepare(
            "INSERT INTO metas_diarias (usuario_id, dia, treino, agua_litros, sono, concluido)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param('issdsi', $usuarioId, $diaHoje, $treino, $aguaFloat, $sono, $concluido);

        if ($stmt->execute()) {
            echo json_encode(['sucesso' => true]);
        } else {
            http_response_code(500);
            echo json_encode([
                'sucesso'  => false,
                'mensagem' => 'Erro ao salvar meta',
                'erro'     => $conexao->error
            ]);
        }
        exit;
    } else {
        // ===== ATUALIZAR META EXISTENTE =====
        $stmt = $conexao->prepare(
            "UPDATE metas_diarias
             SET treino = ?, agua_litros = ?, sono = ?, concluido = ?
             WHERE id = ? AND usuario_id = ?"
        );
        $stmt->bind_param('sdsiii', $treino, $aguaFloat, $sono, $concluido, $idMeta, $usuarioId);

        if ($stmt->execute() && $stmt->affected_rows > 0) {
            echo json_encode(['sucesso' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['sucesso' => false, 'mensagem' => 'Meta não encontrada']);
        }
        exit;
    }
}

// se cair aqui, método não suportado
http_response_code(405);
echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
