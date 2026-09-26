import { fetchApi } from "@shared/utils/http";
import { criarAlunoFromApi } from "../models/Aluno";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

/**
 * Lista os alunos matriculados.
 * Endpoint: GET /api/Alunos
 * Formato de resposta: { status, message, data: [ ...alunos ] }
 */
export async function listarAlunos() {
  const response = await fetchApi(`${API_URL}/Alunos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os alunos.");
  }
  const corpo = await response.json();
  const lista = corpo.data ?? [];
  return lista.map(criarAlunoFromApi);
}

/**
 * Cria um novo aluno. Envia como multipart/form-data por causa da foto.
 * Endpoint: POST /api/Alunos (recebe [FromForm] CriarAlunoRequestDTO + IFormFile? foto)
 *
 * @param {{ nomeCompleto: string, dataNascimentoIso: string, nivelTecnico: string,
 *   responsavelNome: string, telefone: string, endereco: string, turmaId: string,
 *   foto: File|null }} dados
 */
export async function criarAluno(dados) {
  const formData = new FormData();
  formData.append("NomeCompleto", dados.nomeCompleto);
  formData.append("DataNascimento", dados.dataNascimentoIso);
  formData.append("NivelTecnico", dados.nivelTecnico);
  formData.append("ResponsavelNome", dados.responsavelNome);
  formData.append("Telefone", dados.telefone);
  formData.append("Endereco", dados.endereco);
  formData.append("TurmaId", dados.turmaId);
  if (dados.foto) {
    formData.append("foto", dados.foto);
  }

  const response = await fetchApi(`${API_URL}/Alunos`, {
    method: "POST",
    body: formData,
  });

  const corpo = await response.json().catch(() => null);

  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível cadastrar o aluno.");
  }

  return corpo.data;
}
