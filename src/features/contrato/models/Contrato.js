// O back-end não configura conversão de enum para string no JSON — então
// "status" pode chegar como número (a posição na declaração do enum em C#),
// não como texto. A lista abaixo traduz isso pro texto usado na tela, mas
// também aceita o valor já vindo como string. Se a ordem dos valores no
// enum do C# mudar um dia (Domain/Enums/StatusContrato.cs), essa lista
// precisa ser atualizada junto.
const STATUS_CONTRATO = ["Ativo", "Encerrado", "Renovado", "Cancelado"];

function traduzirStatus(status) {
  if (typeof status === "number") return STATUS_CONTRATO[status] ?? String(status);
  return status ?? "Ativo";
}

/**
 * @typedef {Object} Contrato
 * @property {string} id
 * @property {string} alunoId
 * @property {string} dataInicio
 * @property {string} dataFim
 * @property {number} valorParcela
 * @property {number} numParcelas
 * @property {string} status - "Ativo" | "Encerrado" | "Renovado" | "Cancelado"
 * @property {string|null} pdfPath
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
    status: traduzirStatus(apiResponse.status),
    pdfPath: apiResponse.pdfPath ?? apiResponse.pdfUrl ?? null,
  };
}
