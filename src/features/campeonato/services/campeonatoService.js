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

async function chamar(url, opcoes, mensagemPadrao) {
  const response = await fetchApi(url, opcoes);
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || mensagemPadrao);
  }
  return corpo;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function removerInscricao(campeonatoId, participacaoId) {
  await chamar(`${API_URL}/Campeonatos/${campeonatoId}/participacoes/${participacaoId}`, { method: "DELETE" }, "Não foi possível remover a inscrição.");
}

export async function listarElegiveis(campeonatoId) {
  const corpo = await chamar(`${API_URL}/Campeonatos/${campeonatoId}/elegiveis`, undefined, "Não foi possível carregar os alunos elegíveis.");
  return corpo.data ?? [];
}

export async function listarEquipes(campeonatoId) {
  const corpo = await chamar(`${API_URL}/Campeonatos/${campeonatoId}/equipes`, undefined, "Não foi possível carregar os times.");
  return corpo.data ?? [];
}

export async function criarEquipe(campeonatoId, { nome, alunoIds, modoLivre = false }) {
  const corpo = await chamar(
    `${API_URL}/Campeonatos/${campeonatoId}/equipes`,
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ nome: nome || null, alunoIds, modoLivre }) },
    "Não foi possível criar o time."
  );
  return corpo.data;
}

export async function sortearEquipes(campeonatoId, quantidade, incluirTodos = false) {
  const corpo = await chamar(
    `${API_URL}/Campeonatos/${campeonatoId}/equipes/aleatorias`,
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ quantidade: quantidade || null, incluirTodos }) },
    "Não foi possível sortear os times."
  );
  return { equipes: corpo.data ?? [], mensagem: corpo.message };
}

export async function removerEquipe(campeonatoId, equipeId) {
  await chamar(`${API_URL}/Campeonatos/${campeonatoId}/equipes/${equipeId}`, { method: "DELETE" }, "Não foi possível remover o time.");
}

export async function gerarJogos(campeonatoId) {
  const corpo = await chamar(`${API_URL}/Campeonatos/${campeonatoId}/jogos/gerar`, { method: "POST" }, "Não foi possível gerar os jogos.");
  return corpo.data ?? [];
}

export async function listarJogos(campeonatoId) {
  const corpo = await chamar(`${API_URL}/Campeonatos/${campeonatoId}/jogos`, undefined, "Não foi possível carregar os jogos.");
  return corpo.data ?? [];
}

export async function reiniciarJogos(campeonatoId) {
  await chamar(`${API_URL}/Campeonatos/${campeonatoId}/jogos`, { method: "DELETE" }, "Não foi possível refazer o sorteio.");
}

export async function obterEstatisticas(jogoId) {
  const corpo = await chamar(`${API_URL}/Jogos/${jogoId}/estatisticas`, undefined, "Não foi possível carregar as estatísticas.");
  return corpo.data;
}

export async function salvarEstatisticas(jogoId, jogadores) {
  const corpo = await chamar(
    `${API_URL}/Jogos/${jogoId}/estatisticas`,
    { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ jogadores }) },
    "Não foi possível salvar as estatísticas."
  );
  return corpo.data;
}

export async function finalizarJogo(jogoId) {
  const corpo = await chamar(`${API_URL}/Jogos/${jogoId}/finalizar`, { method: "POST" }, "Não foi possível finalizar o jogo.");
  return corpo.data;
}

export async function obterRanking(campeonatoId) {
  const corpo = await chamar(`${API_URL}/Campeonatos/${campeonatoId}/ranking`, undefined, "Não foi possível carregar o ranking.");
  return corpo.data;
}
