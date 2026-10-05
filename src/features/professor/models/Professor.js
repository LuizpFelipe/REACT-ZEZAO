/**
 * @typedef {Object} Professor
 * @property {string} id
 * @property {string} nome
 * @property {string} telefone
 * @property {string} email - usado pra disparo de recuperação de senha
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
    email: apiResponse.email ?? "",
    usuarioId: apiResponse.usuarioId,
  };
}
