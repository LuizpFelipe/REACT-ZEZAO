/**
 * @typedef {Object} Professor
 * @property {string} id
 * @property {string} nome
 * @property {string} telefone
 * @property {string} usuarioId
 */

/**
 * @param {any} apiResponse
 * @returns {Professor}
 */
export function criarProfessorFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    telefone: apiResponse.telefone,
    usuarioId: apiResponse.usuarioId,
  };
}
