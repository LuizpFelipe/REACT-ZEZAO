import { fetchApi } from "@shared/utils/http";
import { criarPagamentoFromApi } from "../models/Pagamento";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarResumoFinanceiro() {
  const response = await fetchApi(`${API_URL}/Financeiro/resumo`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar o resumo financeiro.");
  }
  const corpo = await response.json();
  return corpo?.data ?? corpo ?? null;
}

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

export async function darBaixaParcela(parcelaId) {
  const response = await fetchApi(`${API_URL}/Parcelas/${parcelaId}/pagamento`, {
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error("Não foi possível dar baixa na parcela.");
  }
  return response.json().catch(() => null);
}

export async function dispararCobranca(parcelaId) {
  const response = await fetchApi(`${API_URL}/Parcelas/${parcelaId}/cobranca`, {
    method: "POST",
  });
  if (!response.ok) {
    const corpo = await response.json().catch(() => null);
    throw new Error(corpo?.message ?? corpo?.Message ?? "Não foi possível disparar o aviso de cobrança.");
  }
  return response.json().catch(() => null);
}
