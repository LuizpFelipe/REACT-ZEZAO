const STATUS_CONTRATO = ["Ativo", "Encerrado", "Renovado", "Cancelado"];

function traduzirStatus(status) {
  if (typeof status === "number") return STATUS_CONTRATO[status] ?? String(status);
  return status ?? "Ativo";
}

export function criarContratoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    alunoId: apiResponse.alunoId,
    alunoNome: apiResponse.alunoNome ?? "",
    dataInicio: apiResponse.dataInicio,
    dataFim: apiResponse.dataFim,
    valorParcela: apiResponse.valorParcela,
    numParcelas: apiResponse.numParcelas,
    status: traduzirStatus(apiResponse.status),
    pdfPath: apiResponse.pdfPath ?? apiResponse.pdfUrl ?? null,
  };
}
