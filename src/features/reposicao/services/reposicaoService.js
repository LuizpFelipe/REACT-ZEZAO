import { fetchApi } from "@shared/utils/http";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Registra o remanejamento (reposição) de um aluno para outra turma.
 * Endpoint esperado no back-end: POST /api/reposicoes
 *
 * @param {{ alunoId: number, turmaOrigemId: string, turmaDestinoId: string,
 *   dataOriginal: string, dataReposicao: string }} dados
 */
export async function registrarRemanejamento(dados) {
  const response = await fetchApi(`${API_URL}/reposicoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => null);
    throw new Error(erro?.mensagem || "Não foi possível registrar o remanejamento.");
  }

  return response.json();
}
