export function montarRegistrarChamadaPayload(dataIso, presencas) {
  return {
    data: dataIso,
    presencas: presencas.map((p) => ({ alunoId: p.alunoId, presente: p.presente })),
  };
}

export function criarListaChamadaFromApi(apiResponse) {
  const lista = apiResponse?.alunos ?? apiResponse ?? [];
  return lista.map((item) => ({
    alunoId: item.alunoId ?? item.id,
    nome: item.nome ?? item.nomeCompleto ?? "",
    presente: !!item.presente,
    ehInadimplente: !!(item.ehInadimplente ?? item.EhInadimplente),
  }));
}
