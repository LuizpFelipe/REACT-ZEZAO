import { fetchApi } from "../utils/http";
import { criarAlunoFromApi } from "../models/Aluno";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Lista os alunos matriculados.
 * Endpoint esperado no back-end: GET /api/alunos
 */
export async function listarAlunos() {
  const response = await fetchApi(`${API_URL}/alunos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os alunos.");
  }
  const dados = await response.json();
  return dados.map(criarAlunoFromApi);
}

/**
 * Cria um novo aluno. Envia como multipart/form-data por causa da foto.
 * Endpoint esperado no back-end: POST /api/alunos
 *
 * @param {{ nomeCompleto: string, dataNascimento: string, nivelTecnico: string,
 *   turma: string, responsavel: string, telefone: string, foto: File|null }} dadosFormulario
 */
export async function criarAluno(dadosFormulario) {
  const formData = new FormData();
  formData.append("nomeCompleto", dadosFormulario.nomeCompleto);
  formData.append("dataNascimento", dadosFormulario.dataNascimento);
  formData.append("nivelTecnico", dadosFormulario.nivelTecnico);
  formData.append("turma", dadosFormulario.turma);
  formData.append("responsavel", dadosFormulario.responsavel);
  formData.append("telefone", dadosFormulario.telefone);
  if (dadosFormulario.foto) {
    formData.append("foto", dadosFormulario.foto);
  }

  const response = await fetchApi(`${API_URL}/alunos`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => null);
    throw new Error(erro?.mensagem || "Não foi possível cadastrar o aluno.");
  }

  return criarAlunoFromApi(await response.json());
}
