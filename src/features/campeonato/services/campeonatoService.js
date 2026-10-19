import { fetchApi } from "@shared/utils/http";
import { criarCampeonatoFromApi } from "../models/Campeonato";
import { criarParticipacaoFromApi } from "../models/ParticipacaoCampeonato";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarCampeonatos() {
  const response = await fetchApi(`${API_URL}/Campeonatos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os campeonatos.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarCampeonatoFromApi);
}

export async function obterCampeonato(id) {
  const response = await fetchApi(`${API_URL}/Campeonatos/${id}`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar o campeonato.");
  }
  const corpo = await response.json();
  const dadosCampeonato = corpo?.nome !== undefined ? corpo : corpo?.data;
  return criarCampeonatoFromApi(dadosCampeonato);
}

export async function criarCampeonato({ nome, categoriaId, data }) {
  const response = await fetchApi(`${API_URL}/Campeonatos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, categoriaId, data }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível criar o campeonato.");
  }
  return criarCampeonatoFromApi(corpo.data);
}

export async function listarParticipacoes(campeonatoId) {
  const response = await fetchApi(`${API_URL}/Campeonatos/${campeonatoId}/participacoes`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as participações.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarParticipacaoFromApi);
}

export async function inscreverAluno(campeonatoId, { alunoId, posicao }) {
  const response = await fetchApi(`${API_URL}/Campeonatos/${campeonatoId}/participacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alunoId, posicao: posicao ?? null }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível inscrever o aluno.");
  }
  return criarParticipacaoFromApi(corpo.data);
}

export async function atualizarParticipacao(participacaoId, { posicao, jogosDisputados, aproveitamento }) {
  const response = await fetchApi(`${API_URL}/Participacoes/${participacaoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ posicao, jogosDisputados, aproveitamento }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível atualizar a participação.");
  }
  return criarParticipacaoFromApi(corpo.data);
}
