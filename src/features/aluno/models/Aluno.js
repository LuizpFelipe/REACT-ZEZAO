// O back-end não configura conversão de enum para string no JSON — então
// "nivelTecnico" e "status" chegam como número (a posição na declaração do
// enum em C#), não como texto. As duas listas abaixo traduzem isso pro
// texto usado na tela. Se a ordem dos valores no enum do C# mudar um dia
// (Domain/Enums/NivelTecnico.cs, Domain/Enums/StatusAluno.cs), essas listas
// precisam ser atualizadas juntas.
const NIVEIS_TECNICOS = ["Iniciante", "Intermediario", "Avancado"];
const STATUS_ALUNO = ["Ativo", "Inadimplente", "Inativo"];

/**
 * Formato dos dados de aluno usados no front-end.
 *
 * @typedef {Object} Aluno
 * @property {string} id
 * @property {string} nome
 * @property {string} dataNascimento - formato ISO (aaaa-mm-dd)
 * @property {string} nivel - "Iniciante" | "Intermediario" | "Avancado"
 * @property {string} status - "Ativo" | "Inadimplente" | "Inativo"
 * @property {string} turmaId
 * @property {string} categoriaId
 * @property {string|null} fotoUrl - caminho da foto salva no servidor
 */

/**
 * Converte a resposta bruta da API em um objeto Aluno.
 * @param {any} apiResponse
 * @returns {Aluno}
 */
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
    telefone: apiResponse.telefone,
    endereco: apiResponse.endereco,
    fotoUrl: apiResponse.fotoUrl ?? null,
  };
}
