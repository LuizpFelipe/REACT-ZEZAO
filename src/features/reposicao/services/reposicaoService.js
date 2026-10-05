import { fetchApi } from "@shared/utils/http";
import { criarReposicaoFromApi } from "../models/Reposicao";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * ATENÇÃO: nenhum destes endpoints existe ainda no back-end — fazem parte
 * do card [Back-end] Reposição de Aula, ainda não implementado. As chamadas
 * abaixo seguem a mesma convenção usada pelas outras entidades pra já
 * deixar o front pronto pra integrar assim que o back subir o
 * `ReposicoesController`.
 *
 * Regra de negócio (definida na entrevista com o cliente): aluno pode
 * remarcar livremente para outro horário da MESMA categoria, sem aviso
 * prévio nem atestado.
 */

/**
 * Lista as reposições já registradas.
 * Endpoint (a criar): GET /api/reposicoes
 */
export async function listarReposicoes() {
  const response = await fetchApi(`${API_URL}/reposicoes`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as reposições.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarReposicaoFromApi);
}

/**
 * Registra o remanejamento (reposição) de um aluno para outra turma.
 * Endpoint (a criar): POST /api/reposicoes
 *
 * @param {{ alunoId: string, turmaOrigemId: string, turmaDestinoId: string,
 *   dataOriginal: string, dataReposicao: string }} dados
 */
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
