import { fetchApi } from "@shared/utils/http";
import { criarAlunoFromApi } from "../models/Aluno";
import { removerMascaraCpf } from "@shared/utils/cpf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function listarAlunos() {
  const response = await fetchApi(`${API_URL}/Alunos`);
  if (!response.ok) {
    throw new Error("Não foi possível carregar os alunos.");
  }
  const corpo = await response.json();
  const lista = corpo.data ?? [];
  return lista.map(criarAlunoFromApi);
}

export async function criarAluno(dados) {
  const formData = new FormData();
  formData.append("NomeCompleto", dados.nomeCompleto);
  formData.append("DataNascimento", dados.dataNascimentoIso);
  formData.append("NivelTecnico", dados.nivelTecnico);
  formData.append("ResponsavelNome", dados.responsavelNome);
  formData.append("ResponsavelCpf", removerMascaraCpf(dados.responsavelCpf));
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

export async function atualizarCpfDoResponsavel(aluno, responsavelCpf) {
  const formData = new FormData();
  formData.append("NomeCompleto", aluno.nome);
  formData.append("DataNascimento", aluno.dataNascimento.split("T")[0]);
  formData.append("NivelTecnico", aluno.nivel);
  formData.append("ResponsavelNome", aluno.responsavelNome);
  formData.append("ResponsavelCpf", removerMascaraCpf(responsavelCpf));
  formData.append("Telefone", aluno.telefone);
  formData.append("Endereco", aluno.endereco);
  formData.append("TurmaId", aluno.turmaId);
  if (aluno.fotoUrl) {
    formData.append("FotoUrl", aluno.fotoUrl);
  }

  const response = await fetchApi(`${API_URL}/Alunos/${aluno.id}`, {
    method: "PUT",
    body: formData,
  });

  const corpo = await response.json().catch(() => null);

  if (!response.ok || !corpo?.status) {
    throw new Error(corpo?.message || "Não foi possível atualizar o aluno.");
  }

  return corpo.data;
}
