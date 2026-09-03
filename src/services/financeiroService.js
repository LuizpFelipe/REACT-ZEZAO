import { fetchApi } from "../utils/http";
import { criarPagamentoFromApi } from "../models/Pagamento";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Lista as parcelas do mês atual.
 * Endpoint esperado no back-end: GET /api/financeiro/parcelas
 */
export async function listarParcelasDoMes() {
  const response = await fetchApi(`${API_URL}/financeiro/parcelas`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar as parcelas.");
  }
  const dados = await response.json();
  return dados.map(criarPagamentoFromApi);
}

/**
 * Busca o resumo financeiro (recebido no mês, pendente, % inadimplência).
 * Endpoint esperado no back-end: GET /api/financeiro/resumo
 */
export async function listarResumoFinanceiro() {
  const response = await fetchApi(`${API_URL}/financeiro/resumo`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar o resumo financeiro.");
  }
  return response.json(); // esperado: { recebidoMes, pendente, inadimplencia }
}

/**
 * Dispara o aviso de cobrança por WhatsApp.
 * Sem parcelaId, dispara em massa para todas as parcelas pendentes/atrasadas.
 * Endpoint esperado no back-end: POST /api/financeiro/disparar-aviso
 *
 * @param {number} [parcelaId]
 */
export async function dispararAvisoCobranca(parcelaId) {
  const response = await fetchApi(`${API_URL}/financeiro/disparar-aviso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parcelaId: parcelaId ?? null }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível disparar o aviso de cobrança.");
  }

  return response.json();
}
