import { fetchApi } from "../utils/http";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Solicita a geração do PDF do contrato e devolve o link para download.
 * Endpoint esperado no back-end: POST /api/contratos/gerar-pdf
 *
 * @param {{ alunoId: string, dataInicio: string, valorParcela: string }} dados
 */
export async function gerarContratoPdf(dados) {
  const response = await fetchApi(`${API_URL}/contratos/gerar-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error("Não foi possível gerar o contrato.");
  }

  return response.json(); // esperado: { urlPdf: string }
}
