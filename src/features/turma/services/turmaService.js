import { fetchApi } from "@shared/utils/http";
import { criarTurmaFromApi } from "../models/Turma";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarTurmas() {
  const response = await fetchApi(`${API_URL}/Turmas`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as turmas.");
  }
  const dados = await response.json();
  return dados.map((item) => criarTurmaFromApi(item.data ?? item));
}

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

export async function removerTurma(id) {
  const response = await fetchApi(`${API_URL}/Turmas/${id}`, { method: "DELETE" });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível remover a turma.");
  }
}
