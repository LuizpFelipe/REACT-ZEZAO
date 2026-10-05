/**
 * @typedef {Object} Campeonato
 * @property {string} id
 * @property {string} nome
 * @property {string} categoriaId
 * @property {string} data - formato ISO (aaaa-mm-dd)
 */

/**
 * @param {any} apiResponse
 * @returns {Campeonato}
 */
export function criarCampeonatoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    categoriaId: apiResponse.categoriaId,
    data: apiResponse.data,
  };
}

/**
 * O back-end não define um status pro Campeonato (card [Back-end]
 * Campeonato só modela `nome`, `data` e `categoriaId`) — então o estado
 * mostrado na tela é calculado localmente a partir da data, em vez de vir
 * da API.
 * @param {string} dataIso
 * @returns {"Agendado"|"Realizado"}
 */
export function estadoCampeonato(dataIso) {
  if (!dataIso) return "Agendado";
  return new Date(dataIso) < new Date() ? "Realizado" : "Agendado";
}
