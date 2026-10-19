import { fetchApi } from "@shared/utils/http";
import { criarCategoriaFromApi } from "../models/Categoria";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarCategorias() {
  const response = await fetchApi(`${API_URL}/Categoria`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as categorias.");
  }
  const dados = await response.json();
  return dados.map(criarCategoriaFromApi);
}

export async function criarCategoria({ nome, idadeMin, idadeMax }) {
  const response = await fetchApi(`${API_URL}/Categoria`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, idadeMin, idadeMax }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível criar a categoria.");
  }
  return criarCategoriaFromApi(corpo.data);
}

export async function atualizarCategoria(id, { nome, idadeMin, idadeMax }) {
  const response = await fetchApi(`${API_URL}/Categoria/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, idadeMin, idadeMax }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível atualizar a categoria.");
  }
  return criarCategoriaFromApi(corpo.data);
}

export async function removerCategoria(id) {
  const response = await fetchApi(`${API_URL}/Categoria/${id}`, { method: "DELETE" });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível remover a categoria.");
  }
}
