import { fetchApi } from "@shared/utils/http";
import { criarCategoriaFromApi } from "../models/Categoria";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * Lista as categorias (faixas etárias) cadastradas.
 * Endpoint: GET /api/Categoria
 * Devolve o array diretamente, sem envelope { status, message, data }.
 */
export async function listarCategorias() {
  const response = await fetchApi(`${API_URL}/Categoria`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as categorias.");
  }
  const dados = await response.json();
  return dados.map(criarCategoriaFromApi);
}

/**
 * Cria uma nova categoria.
 * Endpoint: POST /api/Categoria
 */
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

/**
 * Atualiza uma categoria existente.
 * Endpoint: PUT /api/Categoria/{id}
 */
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

/**
 * Remove uma categoria.
 * Endpoint: DELETE /api/Categoria/{id}
 */
export async function removerCategoria(id) {
  const response = await fetchApi(`${API_URL}/Categoria/${id}`, { method: "DELETE" });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível remover a categoria.");
  }
}
