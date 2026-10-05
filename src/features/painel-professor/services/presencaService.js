import { fetchApi } from "@shared/utils/http";
import { montarRegistrarChamadaPayload, criarListaChamadaFromApi } from "../models/Presenca";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * ATENÇÃO: estes endpoints ainda não existem no back-end — fazem parte do
 * card [Back-end] Presença (Chamada), que ainda não foi implementado. As
 * chamadas abaixo estão prontas pra funcionar assim que o back subir;
 * até lá, vão falhar com 404 (o try/catch das telas já trata isso
 * mostrando um aviso).
 */

/**
 * Registra a chamada de uma turma numa data.
 * Endpoint (a criar): POST /api/Turmas/{turmaId}/chamada
 * [Authorize(Roles = "Professor")]
 *
 * @param {string} turmaId
 * @param {string} dataIso - aaaa-mm-dd
 * @param {Array<{ alunoId: string, presente: boolean }>} presencas
 */
export async function registrarChamada(turmaId, dataIso, presencas) {
  const response = await fetchApi(`${API_URL}/Turmas/${turmaId}/chamada`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(montarRegistrarChamadaPayload(dataIso, presencas)),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível salvar a chamada.");
  }
  return corpo;
}

/**
 * Busca a chamada de uma turma numa data: lista de alunos da turma já com
 * `presente` (chamada já registrada, ou tudo desmarcado se ainda não
 * houver) e `ehInadimplente` — sem expor nenhum valor financeiro, só o
 * booleano calculado no back-end.
 * Endpoint (a criar): GET /api/Turmas/{turmaId}/chamada?data=aaaa-mm-dd
 * [Authorize(Roles = "Professor,Coordenador")]
 *
 * @param {string} turmaId
 * @param {string} dataIso
 */
export async function obterChamadaPorTurmaEData(turmaId, dataIso) {
  const response = await fetchApi(`${API_URL}/Turmas/${turmaId}/chamada?data=${dataIso}`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar a chamada.");
  }
  const corpo = await response.json();
  return criarListaChamadaFromApi(corpo?.data ?? corpo);
}
