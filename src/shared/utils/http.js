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

function encerrarSessaoExpirada() {
  try {
    sessionStorage.removeItem(CHAVE_STORAGE_USUARIO);
    localStorage.removeItem(CHAVE_STORAGE_USUARIO);
  } catch {
    // storage indisponível: segue para o redirecionamento
  }

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

export async function fetchApi(url, options = {}) {
  const token = obterTokenSalvo();
  const headers = token
    ? { ...options.headers, Authorization: `Bearer ${token}` }
    : options.headers;

  let resposta;
  try {
    resposta = await fetch(url, { ...options, headers });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  // Só trata como sessão expirada se havia token. Senão, o 401 do próprio login
  // (senha errada) redirecionaria a tela de login para ela mesma.
  if (resposta.status === 401 && token) {
    encerrarSessaoExpirada();
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  return resposta;
}
