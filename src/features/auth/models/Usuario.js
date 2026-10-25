export function criarUsuarioFromApi(apiResponse) {
  return {
    nomeUsuario: apiResponse.nomeUsuario,
    perfil: apiResponse.perfil,
    token: apiResponse.token,
    usuarioId: apiResponse.usuarioId,
  };
}
