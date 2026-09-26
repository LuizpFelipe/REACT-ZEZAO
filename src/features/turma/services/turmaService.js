import { fetchApi } from "@shared/utils/http";
import { criarTurmaFromApi } from "../models/Turma";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * Lista todas as turmas.
 * Endpoint: GET /api/Turmas
 *
 * Formato de resposta deste endpoint específico: um array onde CADA item
 * já vem no formato { status, message, data }, em vez de um envelope só
 * por fora do array inteiro (diferente de Categoria e de Aluno).
 */
export async function listarTurmas() {
  const response = await fetchApi(`${API_URL}/Turmas`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as turmas.");
  }
  const dados = await response.json();
  return dados.map((item) => criarTurmaFromApi(item.data ?? item));
}

/**
 * Cria uma nova turma.
 * Endpoint: POST /api/Turmas
 */
export async function criarTurma({ nome, diasSemana, horario, categoriaId, professorId }) {
  const response = await fetchApi(`${API_URL}/Turmas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, diasSemana, horario, categoriaId, professorId }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível criar a turma.");
  }
  return criarTurmaFromApi(corpo.data);
}

/**
 * Atualiza uma turma existente.
 * Endpoint: PUT /api/Turmas/{id}
 */
export async function atualizarTurma(id, { nome, diasSemana, horario, categoriaId, professorId }) {
  const response = await fetchApi(`${API_URL}/Turmas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, diasSemana, horario, categoriaId, professorId }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível atualizar a turma.");
  }
  return criarTurmaFromApi(corpo.data);
}

/**
 * Remove uma turma.
 * Endpoint: DELETE /api/Turmas/{id}
 */
export async function removerTurma(id) {
  const response = await fetchApi(`${API_URL}/Turmas/${id}`, { method: "DELETE" });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível remover a turma.");
  }
}
