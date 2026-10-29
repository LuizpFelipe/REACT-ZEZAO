export function criarProfessorFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    telefone: apiResponse.telefone,
    email: apiResponse.email ?? "",
    nomeUsuario: apiResponse.nomeUsuario ?? "",
    usuarioId: apiResponse.usuarioId,
  };
}
