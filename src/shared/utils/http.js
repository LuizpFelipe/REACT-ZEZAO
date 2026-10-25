const CHAVE_STORAGE_USUARIO = "zezao:usuario";

function obterTokenSalvo() {
  try {
    const salvo =
      sessionStorage.getItem(CHAVE_STORAGE_USUARIO) ?? localStorage.getItem(CHAVE_STORAGE_USUARIO);
    return salvo ? JSON.parse(salvo)?.token ?? null : null;
  } catch {
    return null;
  }
}

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
