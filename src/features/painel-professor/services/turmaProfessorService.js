import { fetchApi } from "@shared/utils/http";
import { criarTurmaFromApi } from "@features/turma/models/Turma";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * Lista só as turmas do professor logado.
 * Endpoint (a criar): GET /api/Professores/minhas-turmas
 * [Authorize(Roles = "Professor")]
 *
 * O back-end filtra pelo UsuarioId do token (JWT) — não recebe nenhum id
 * por parâmetro. Isso substitui o workaround anterior (`obterMeuProfessor`),
 * que dependia do login devolver `usuarioId` pra achar o Professor na mão
 * em GET /api/Professores; com o filtro no back pelo token, esse passo
 * extra deixa de ser necessário.
 */
export async function listarTurmasDoProfessor() {
  const response = await fetchApi(`${API_URL}/Professores/minhas-turmas`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar suas turmas.");
  }
  const dados = await response.json();
  const lista = dados?.data ?? dados ?? [];
  return lista.map((item) => criarTurmaFromApi(item.data ?? item));
}
