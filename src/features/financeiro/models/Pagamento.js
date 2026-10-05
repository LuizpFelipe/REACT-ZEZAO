/**
 * @typedef {Object} Pagamento
 * @property {number} id
 * @property {string} alunoId
 * @property {string} aluno
 * @property {string} vencimento
 * @property {string} valor
 * @property {string} status - "Pago" | "Pendente" | "Atrasado"
 */

/**
 * @param {any} apiResponse
 * @returns {Pagamento}
 */
export function criarPagamentoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    alunoId: apiResponse.alunoId,
    aluno: apiResponse.aluno ?? apiResponse.nomeAluno,
    vencimento: apiResponse.vencimento,
    valor: apiResponse.valor,
    status: apiResponse.status,
  };
}
