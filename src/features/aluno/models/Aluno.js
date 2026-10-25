const NIVEIS_TECNICOS = ["Iniciante", "Intermediario", "Avancado"];
const STATUS_ALUNO = ["Ativo", "Inadimplente", "Inativo"];

export function criarAlunoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nomeCompleto,
    dataNascimento: apiResponse.dataNascimento,
    nivel: NIVEIS_TECNICOS[apiResponse.nivelTecnico] ?? String(apiResponse.nivelTecnico),
    status: STATUS_ALUNO[apiResponse.status] ?? String(apiResponse.status),
    turmaId: apiResponse.turmaId,
    categoriaId: apiResponse.categoriaId,
    responsavelNome: apiResponse.responsavelNome,
    responsavelCpf: apiResponse.responsavelCpf ?? "",
    telefone: apiResponse.telefone,
    endereco: apiResponse.endereco,
    fotoUrl: apiResponse.fotoUrl ?? null,
  };
}
