import { fetchApi } from "@shared/utils/http";
import { criarCampeonatoFromApi } from "../models/Campeonato";
import { criarParticipacaoFromApi } from "../models/ParticipacaoCampeonato";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * ATENÇÃO: nenhum destes endpoints existe ainda no back-end — fazem parte
 * do card [Back-end] Campeonato, ainda não implementado. As chamadas abaixo
 * seguem os endpoints definidos no card.
 *
 * Nota: o card define `POST /api/Campeonatos/{id}/participacoes` (inscrever)
 * e `PUT /api/Participacoes/{id}` (atualizar jogos/aproveitamento), mas não
 * especifica um GET pra listar as participações de um campeonato — a tela
 * precisa disso pra montar o ranqueamento e a lista de inscritos, então
 * `listarParticipacoes` assume o GET correspondente pelo mesmo padrão REST
 * usado no resto do projeto. Vale confirmar com quem for implementar.
 */

/**
 * Lista os campeonatos cadastrados.
 * Endpoint (a criar): GET /api/Campeonatos
 */
export async function listarCampeonatos() {
  const response = await fetchApi(`${API_URL}/Campeonatos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os campeonatos.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarCampeonatoFromApi);
}

/**
 * Busca um campeonato específico.
 * Endpoint (a criar): GET /api/Campeonatos/{id}
 */
export async function obterCampeonato(id) {
  const response = await fetchApi(`${API_URL}/Campeonatos/${id}`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar o campeonato.");
  }
  const corpo = await response.json();
  // Cuidado: Campeonato tem um campo chamado "data" (a data do evento), então
  // não dá pra usar o truque genérico `corpo?.data ?? corpo` pra detectar se a
  // resposta veio embrulhada em {status,message,data:{...}} — quando NÃO vem
  // embrulhada, `corpo.data` já existe (é a data do evento) e o "?? corpo"
  // nunca dispara, quebrando tudo. Em vez disso, usa a presença de `nome`
  // (que só existe no objeto Campeonato de verdade) pra decidir.
  const dadosCampeonato = corpo?.nome !== undefined ? corpo : corpo?.data;
  return criarCampeonatoFromApi(dadosCampeonato);
}

/**
 * Cria um novo campeonato.
 * Endpoint (a criar): POST /api/Campeonatos
 */
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

/**
 * Lista as participações (inscrições) de um campeonato — usada tanto pro
 * ranqueamento quanto pra aba de Inscrições.
 * Endpoint (assumido, a criar): GET /api/Campeonatos/{id}/participacoes
 */
export async function listarParticipacoes(campeonatoId) {
  const response = await fetchApi(`${API_URL}/Campeonatos/${campeonatoId}/participacoes`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as participações.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarParticipacaoFromApi);
}

/**
 * Inscreve um aluno no campeonato. A posição é opcional no cadastro —
 * pode ser preenchida depois via `atualizarParticipacao`.
 * Endpoint (a criar): POST /api/Campeonatos/{id}/participacoes
 */
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

/**
 * Atualiza os dados de uma participação já existente (posição, jogos
 * disputados, aproveitamento).
 * Endpoint (a criar): PUT /api/Participacoes/{id}
 */
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
