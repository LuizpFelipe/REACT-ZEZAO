/**
 * @typedef {Object} Reposicao
 * @property {number} id
 * @property {number} alunoId
 * @property {string} turmaOrigemId
 * @property {string} turmaDestinoId
 * @property {string} dataOriginal
 * @property {string} dataReposicao
 */

/**
 * @param {any} apiResponse
 * @returns {Reposicao}
 */
export function criarReposicaoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    alunoId: apiResponse.alunoId,
    turmaOrigemId: apiResponse.turmaOrigemId,
    turmaDestinoId: apiResponse.turmaDestinoId,
    dataOriginal: apiResponse.dataOriginal,
    dataReposicao: apiResponse.dataReposicao,
  };
}
