import { fetchApi } from "@shared/utils/http";
import { criarContratoFromApi } from "../models/Contrato";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarContratos() {
  const response = await fetchApi(`${API_URL}/Contratos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os contratos.");
  }
  const corpo = await response.json();
  const lista = corpo?.data ?? corpo ?? [];
  return lista.map(criarContratoFromApi);
}

export async function baixarContratoPdf(contratoId) {
  const response = await fetchApi(`${API_URL}/Contratos/${contratoId}/pdf`);
  if (!response.ok) {
    throw new Error("Não foi possível gerar o PDF do contrato.");
  }
  return response.blob();
}

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
