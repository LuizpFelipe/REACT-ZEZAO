import { fetchApi } from "@shared/utils/http";
import { criarUsuarioFromApi } from "../models/Usuario";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

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

export async function solicitarRecuperacaoSenha({ email }) {
  const response = await fetchApi(`${API_URL}/auth/recuperar-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error("Não foi possível enviar o código. Tente novamente.");
  }
}

export async function validarCodigoRecuperacao({ email, codigo }) {
  const response = await fetchApi(`${API_URL}/auth/validar-codigo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, codigo }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status || !corpo?.data?.token) {
    throw new Error(corpo?.message || "Código inválido ou expirado.");
  }
  return corpo.data.token;
}

export async function redefinirSenha({ token, novaSenha }) {
  const response = await fetchApi(`${API_URL}/auth/redefinir-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, novaSenha }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível redefinir a senha.");
  }
}
