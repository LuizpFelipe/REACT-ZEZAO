import { fetchApi } from "@shared/utils/http";
import { criarTurmaFromApi } from "@features/turma/models/Turma";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarTurmasDoProfessor({ dataIso, professorId } = {}) {
  const parametros = new URLSearchParams();
  if (dataIso) parametros.set("data", dataIso);
  if (professorId) parametros.set("professorId", professorId);
  const textoDosParametros = parametros.toString();

  const response = await fetchApi(
    `${API_URL}/Professores/minhas-turmas${textoDosParametros ? `?${textoDosParametros}` : ""}`
  );
  if (!response.ok) {
    throw new Error("Não foi possível carregar suas turmas.");
  }
  const dados = await response.json();
  const lista = dados?.data ?? dados ?? [];
  return lista.map((item) => criarTurmaFromApi(item.data ?? item));
}
