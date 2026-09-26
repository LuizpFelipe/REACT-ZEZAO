/**
 * @typedef {Object} Categoria
 * @property {number} id
 * @property {string} nome - ex: "Sub-13"
 * @property {number} idadeMin
 * @property {number} idadeMax
 */

/**
 * @param {any} apiResponse
 * @returns {Categoria}
 */
export function criarCategoriaFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    idadeMin: apiResponse.idadeMin,
    idadeMax: apiResponse.idadeMax,
  };
}
