import { fetchApi } from "../utils/http";
import { criarUsuarioFromApi } from "../models/Usuario";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Envia usuário e senha para o back-end e devolve o Usuario autenticado.
 * Por enquanto o back-end ainda não existe — esta função já está com a
 * assinatura e o formato de retorno prontos para quando a rota
 * POST /api/auth/login estiver disponível.
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

  if (!response.ok) {
    throw new Error("Usuário ou senha inválidos.");
  }

  const data = await response.json();
  return criarUsuarioFromApi(data);
}
