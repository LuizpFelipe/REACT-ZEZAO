import { fetchApi } from "@shared/utils/http";
import { criarProfessorFromApi } from "../models/Professor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarProfessores() {
  const response = await fetchApi(`${API_URL}/Professores`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os professores.");
  }
  const dados = await response.json();
  return dados.map((item) => criarProfessorFromApi(item.data ?? item));
}

export async function criarProfessor({ nome, telefone, email, nomeUsuario, senha }) {
  const response = await fetchApi(`${API_URL}/Professores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, telefone, email, nomeUsuario, senha }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível cadastrar o professor.");
  }
  return criarProfessorFromApi(corpo.data);
}

export async function atualizarProfessor(id, { nome, telefone, email }) {
  const response = await fetchApi(`${API_URL}/Professores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, telefone, email }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível atualizar o professor.");
  }
  return criarProfessorFromApi(corpo.data);
}

export async function removerProfessor(id) {
  const response = await fetchApi(`${API_URL}/Professores/${id}`, { method: "DELETE" });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível remover o professor.");
  }
}
