import { fetchApi } from "../utils/http";
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
