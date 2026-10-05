import { fetchApi } from "@shared/utils/http";
import { criarProfessorFromApi } from "../models/Professor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * Lista todos os professores.
 * Endpoint: GET /api/Professores
 *
 * Mesmo formato "estranho" da Turma: um array onde cada item já vem
 * embrulhado em { status, message, data }, não um envelope só por fora.
 */
export async function listarProfessores() {
  const response = await fetchApi(`${API_URL}/Professores`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os professores.");
  }
  const dados = await response.json();
  return dados.map((item) => criarProfessorFromApi(item.data ?? item));
}

/**
 * Cria um professor — isso também cria o Usuario de login dele junto,
 * no back-end (ver Application/Services/ProfessorService.cs).
 * Endpoint: POST /api/Professores
 *
 * O e-mail é obrigatório porque é pra onde vai o link de recuperação de
 * senha (card [Back-end] Recuperação de Senha, que precisa do Usuario ter
 * um e-mail cadastrado pra isso funcionar).
 */
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

/**
 * Atualiza nome/telefone/e-mail de um professor (não altera usuário/senha —
 * isso é um fluxo separado, de reset de senha pelo Coordenador).
 * Endpoint: PUT /api/Professores/{id}
 */
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

/**
 * Remove um professor.
 * Endpoint: DELETE /api/Professores/{id}
 */
export async function removerProfessor(id) {
  const response = await fetchApi(`${API_URL}/Professores/${id}`, { method: "DELETE" });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível remover o professor.");
  }
}
