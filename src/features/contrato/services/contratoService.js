import { fetchApi } from "@shared/utils/http";
import { criarContratoFromApi } from "../models/Contrato";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * ATENÇÃO: nenhum destes endpoints existe ainda no back-end — fazem parte
 * do card [Back-end] Contrato, ainda não implementado.
 *
 * Importante: não existe (nem vai existir) uma ação de "emitir contrato"
 * chamada pelo front. O Contrato é criado automaticamente pelo back quando
 * um aluno é cadastrado (`AlunoService.CriarAsync()` chama
 * `ContratoService.CriarAsync()`, que já gera o contrato e as 12 parcelas
 * de uma vez). O front só lista os contratos já existentes, baixa o PDF e
 * pode cancelar um contrato (o que apenas muda o Status, nunca apaga a
 * linha — mesmo padrão de soft delete do Aluno).
 */

/**
 * Lista os contratos já emitidos.
 * Endpoint (a criar): GET /api/Contratos
 */
export async function listarContratos() {
  const response = await fetchApi(`${API_URL}/Contratos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os contratos.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarContratoFromApi);
}

/**
 * Baixa o PDF do contrato (gerado pelo back na hora, pra impressão/assinatura).
 * Endpoint (a criar): GET /api/Contratos/{id}/pdf
 */
export async function baixarContratoPdf(contratoId) {
  const response = await fetchApi(`${API_URL}/Contratos/${contratoId}/pdf`);
  if (!response.ok) {
    throw new Error("Não foi possível gerar o PDF do contrato.");
  }
  return response.blob();
}

/**
 * Cancela um contrato — só muda o Status para "Cancelado", nunca apaga a
 * linha (as parcelas já geradas continuam no histórico).
 * Endpoint (a criar): PUT /api/Contratos/{id}
 */
export async function cancelarContrato(contratoId) {
  const response = await fetchApi(`${API_URL}/Contratos/${contratoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Cancelado" }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível cancelar o contrato.");
  }
  return criarContratoFromApi(corpo?.data ?? corpo);
}
