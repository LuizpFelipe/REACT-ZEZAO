/**
 * @typedef {Object} Contrato
 * @property {number} id
 * @property {number} alunoId
 * @property {string} dataInicio
 * @property {string} dataFim
 * @property {number} valorParcela
 * @property {number} numParcelas
 * @property {string} status
 * @property {string|null} pdfUrl
 */

/**
 * @param {any} apiResponse
 * @returns {Contrato}
 */
export function criarContratoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    alunoId: apiResponse.alunoId,
    dataInicio: apiResponse.dataInicio,
    dataFim: apiResponse.dataFim,
    valorParcela: apiResponse.valorParcela,
    numParcelas: apiResponse.numParcelas,
    status: apiResponse.status,
    pdfUrl: apiResponse.pdfUrl ?? null,
  };
}
