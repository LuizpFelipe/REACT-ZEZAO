/**
 * Wrapper em cima do fetch nativo do navegador.
 *
 * Quando o servidor está fora do ar (ou há erro de rede/CORS), o fetch()
 * lança um TypeError com a mensagem "Failed to fetch" — texto do próprio
 * navegador, em inglês, que não deveria aparecer direto pro usuário.
 *
 * Esta função captura esse erro e relança com uma mensagem em português,
 * para todos os services usarem no lugar do fetch direto.
 */
export async function fetchApi(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
  }
}
