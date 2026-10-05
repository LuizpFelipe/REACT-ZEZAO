import { fetchApi } from "@shared/utils/http";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * ATENÇÃO: nenhum destes endpoints existe ainda no back-end — fazem parte
 * do card [Back-end] Reset de Senha (Usuario), ainda não implementado.
 *
 * Mecanismo único e genérico de reset de senha, usado tanto pra Professor
 * quanto pra Coordenador (substitui o antigo `POST /api/Professores/{id}/
 * resetar-senha`, que era específico de Professor). Restrito a usuários
 * com a role Coordenador no back.
 */

/**
 * Lista os usuários cadastrados (id, nome, perfil) — base pro futuro CRUD
 * de Coordenador e pra qualquer tela que precise resetar senha de alguém.
 * Endpoint (a criar): GET /api/usuarios
 */
export async function listarUsuarios() {
  const response = await fetchApi(`${API_URL}/usuarios`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os usuários.");
  }
  const corpo = await response.json();
  return corpo?.data ?? corpo ?? [];
}

/**
 * Reseta a senha de um usuário (Professor ou Coordenador) — só o
 * Coordenador pode disparar isso.
 * Endpoint (a criar): PUT /api/usuarios/{id}/resetar-senha
 *
 * @param {string} usuarioId
 * @param {string} novaSenha
 */
export async function resetarSenha(usuarioId, novaSenha) {
  const response = await fetchApi(`${API_URL}/usuarios/${usuarioId}/resetar-senha`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ novaSenha }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível resetar a senha.");
  }
}
