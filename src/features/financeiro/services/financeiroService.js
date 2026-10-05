import { fetchApi } from "@shared/utils/http";
import { criarPagamentoFromApi } from "../models/Pagamento";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * ATENÇÃO: nenhum destes endpoints existe ainda no back-end — fazem parte
 * do card [Back-end] Financeiro (Parcelas/Avisos), ainda não implementado
 * (e que depende do card [Back-end] Contrato estar pronto primeiro, já que
 * uma Parcela só existe depois do Contrato gerar ela).
 *
 * Os endpoints abaixo são os já definidos pelo grupo nesse card — não são
 * CRUD genérico, são ações específicas em cima de Parcela:
 *   GET  /api/Financeiro/resumo        → alimenta os 3 cards de resumo
 *   GET  /api/Parcelas?status=&mes=&alunoId= → listagem com filtro
 *   PUT  /api/Parcelas/{id}/pagamento  → dá baixa (marca como paga)
 *   POST /api/Parcelas/{id}/cobranca   → dispara aviso manual (um de cada vez,
 *                                        não existe disparo em lote no back)
 */

/**
 * Busca o resumo financeiro do mês (recebido, pendente, inadimplência).
 * Endpoint (a criar): GET /api/Financeiro/resumo
 */
export async function listarResumoFinanceiro() {
  const response = await fetchApi(`${API_URL}/Financeiro/resumo`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar o resumo financeiro.");
  }
  const corpo = await response.json();
  return corpo?.data ?? corpo ?? null;
}

/**
 * Lista parcelas, com filtros opcionais por status, mês e aluno.
 * Endpoint (a criar): GET /api/Parcelas?status=Atrasado&mes=2026-10&alunoId=...
 *
 * @param {{ status?: "Pago"|"Pendente"|"Atrasado", mes?: string, alunoId?: string }} filtros
 */
export async function listarParcelas(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.mes) params.set("mes", filtros.mes);
  if (filtros.alunoId) params.set("alunoId", filtros.alunoId);

  const query = params.toString();
  const response = await fetchApi(`${API_URL}/Parcelas${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as parcelas.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarPagamentoFromApi);
}

/**
 * Dá baixa manual numa parcela (marca como paga).
 * Endpoint (a criar): PUT /api/Parcelas/{id}/pagamento
 */
export async function darBaixaParcela(parcelaId) {
  const response = await fetchApi(`${API_URL}/Parcelas/${parcelaId}/pagamento`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Não foi possível dar baixa na parcela.");
  }
  return response.json().catch(() => null);
}

/**
 * Dispara o aviso de cobrança manual de UMA parcela por vez — o back não
 * expõe disparo em lote, então "disparar para todos" ou "disparar para um
 * aluno" é feito no front chamando esta função uma vez por parcela.
 * Endpoint (a criar): POST /api/Parcelas/{id}/cobranca
 */
export async function dispararCobranca(parcelaId) {
  const response = await fetchApi(`${API_URL}/Parcelas/${parcelaId}/cobranca`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Não foi possível disparar o aviso de cobrança.");
  }
  return response.json().catch(() => null);
}
