/**
 * Formato dos dados de usuário usados no front-end.
 * Quando o back-end (ASP.NET) estiver pronto, o service de autenticação
 * deve devolver um objeto neste formato a partir da resposta da API.
 *
 * @typedef {Object} Usuario
 * @property {string} nomeUsuario
 * @property {"Coordenador" | "Professor"} perfil
 * @property {string} token - token de autenticação retornado pela API
 * @property {string} usuarioId - id do Usuario logado (Guid do back-end).
 *   Usado pelo Painel do Professor pra descobrir "qual professor é esse"
 *   (Professor.UsuarioId == usuario.usuarioId), via
 *   features/painel-professor/services/turmaProfessorService.js.
 */

/**
 * Cria um objeto Usuario a partir da resposta bruta da API de login.
 * Centralizar essa conversão aqui evita espalhar `response.data.campo`
 * pelos componentes — se o formato da API mudar, só se ajusta este arquivo.
 *
 * @param {any} apiResponse
 * @returns {Usuario}
 */
export function criarUsuarioFromApi(apiResponse) {
  return {
    nomeUsuario: apiResponse.nomeUsuario,
    perfil: apiResponse.perfil,
    token: apiResponse.token,
    usuarioId: apiResponse.usuarioId,
  };
}
