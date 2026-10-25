import { fetchApi } from "@shared/utils/http";
import {
  montarRegistrarChamadaPayload,
  criarChamadaFromApi,
  criarChamadaMensalFromApi,
} from "../models/Presenca";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

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

export async function obterChamadaPorTurmaEData(turmaId, dataIso) {
  const response = await fetchApi(`${API_URL}/Turmas/${turmaId}/chamada?data=${dataIso}`);
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível carregar a chamada.");
  }
  return criarChamadaFromApi(corpo);
}

export async function obterChamadaMensal(turmaId, mes) {
  const response = await fetchApi(`${API_URL}/Turmas/${turmaId}/chamada-mensal?mes=${mes}`);
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível carregar a chamada do mês.");
  }
  return criarChamadaMensalFromApi(corpo);
}
