const CHAVE_STORAGE_USUARIO = "zezao:usuario";

/**
 * Lê o token salvo pelo AuthContext no login (localStorage, chave
 * "zezao:usuario"). Sem isso, nenhuma rota protegida com [Authorize] no
 * back-end funcionaria pelo front — e endpoints que filtram pelo usuário
 * logado (ex: GET /api/Professores/minhas-turmas) não teriam como saber
 * quem é quem.
 */
function obterTokenSalvo() {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE_USUARIO);
    return salvo ? JSON.parse(salvo)?.token ?? null : null;
  } catch {
    return null;
  }
}

/**
 * Wrapper em cima do fetch nativo do navegador.
 *
 * Quando o servidor está fora do ar (ou há erro de rede/CORS), o fetch()
 * lança um TypeError com a mensagem "Failed to fetch" — texto do próprio
 * navegador, em inglês, que não deveria aparecer direto pro usuário.
 *
 * Esta função captura esse erro e relança com uma mensagem em português,
 * para todos os services usarem no lugar do fetch direto.
 *
 * Também anexa automaticamente o header `Authorization: Bearer <token>`
 * quando há um usuário logado — nenhum service precisa fazer isso na mão.
 */
export async function fetchApi(url, options = {}) {
  const token = obterTokenSalvo();
  const headers = token
    ? { ...options.headers, Authorization: `Bearer ${token}` }
    : options.headers;

  try {
    return await fetch(url, { ...options, headers });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }
}
