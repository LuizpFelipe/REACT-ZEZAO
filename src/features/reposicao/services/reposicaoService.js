import { fetchApi } from "@shared/utils/http";
import { criarReposicaoFromApi } from "../models/Reposicao";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarReposicoes() {
  const response = await fetchApi(`${API_URL}/reposicoes`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as reposições.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarReposicaoFromApi);
}

export async function registrarRemanejamento(dados) {
  const response = await fetchApi(`${API_URL}/reposicoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível registrar o remanejamento.");
  }

  return criarReposicaoFromApi(corpo?.data ?? corpo);
}
