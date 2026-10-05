import { fetchApi } from "@shared/utils/http";
import { criarUsuarioFromApi } from "../models/Usuario";

// URL base da API do back-end (ASP.NET). Configurar em um arquivo .env local:
// VITE_API_URL=http://localhost:5260/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * Envia usuário e senha para o back-end e devolve o Usuario autenticado.
 *
 * O back-end (padrão do template DDD) devolve a resposta "envelopada":
 * { message, status, data: { nomeUsuario, perfil, token } }
 * — por isso extraímos o campo "data" antes de converter pro formato
 * usado no front (ver models/Usuario.js).
 *
 * @param {string} nomeUsuario
 * @param {string} senha
 * @returns {Promise<import("../models/Usuario").Usuario>}
 */
export async function login(nomeUsuario, senha) {
  const response = await fetchApi(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeUsuario, senha }),
  });

  const corpo = await response.json();

  if (!response.ok || !corpo.data) {
    throw new Error(corpo.message || "Usuário ou senha inválidos.");
  }

  return criarUsuarioFromApi(corpo.data);
}

/**
 * Dispara a recuperação de senha por e-mail — pedido explícito do professor
 * na entrevista com o cliente. O login continua sendo por usuário/senha (não
 * por e-mail), mas o Usuario agora precisa ter um e-mail cadastrado (ver
 * Professores.jsx) só pra receber o link de redefinição.
 *
 * ATENÇÃO: endpoint ainda não existe no back-end — faz parte do card
 * [Back-end] Recuperação de Senha, ainda não implementado. O back precisa
 * achar o Usuario pelo e-mail cadastrado e enviar um link/token de
 * redefinição pra essa caixa de entrada.
 * Endpoint (a criar): POST /api/auth/recuperar-senha
 */
export async function solicitarRecuperacaoSenha({ email }) {
  const response = await fetchApi(`${API_URL}/auth/recuperar-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error("Não foi possível registrar o pedido de recuperação.");
  }
  return response.json().catch(() => ({}));
}
