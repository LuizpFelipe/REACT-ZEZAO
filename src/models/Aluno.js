/**
 * Formato dos dados de aluno usados no front-end.
 *
 * @typedef {Object} Aluno
 * @property {number} id
 * @property {string} nome
 * @property {string} dataNascimento
 * @property {string} categoria - calculada pelo back-end a partir da data de nascimento
 * @property {string} nivel
 * @property {string} turma
 * @property {string} status - "Ativo" | "Inadimplente"
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
    nome: apiResponse.nomeCompleto ?? apiResponse.nome,
    dataNascimento: apiResponse.dataNascimento,
    categoria: apiResponse.categoria,
    nivel: apiResponse.nivelTecnico ?? apiResponse.nivel,
    turma: apiResponse.turma,
    status: apiResponse.status,
    fotoUrl: apiResponse.fotoUrl ?? null,
  };
}
