/**
 * @typedef {Object} Turma
 * @property {number} id
 * @property {string} nome
 * @property {number} categoriaId
 * @property {number} professorId
 * @property {string} diasSemana
 * @property {string} horario
 */

/**
 * @param {any} apiResponse
 * @returns {Turma}
 */
export function criarTurmaFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    categoriaId: apiResponse.categoriaId,
    professorId: apiResponse.professorId,
    diasSemana: apiResponse.diasSemana,
    horario: apiResponse.horario,
  };
}
