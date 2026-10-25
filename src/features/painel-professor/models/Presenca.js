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

export function criarChamadaFromApi(corpo) {
  const dados = corpo?.data ?? corpo;
  const podeEditar = dados?.podeEditar ?? corpo?.podeEditar ?? true;
  return {
    alunos: criarListaChamadaFromApi(dados),
    podeEditar,
    motivoSomenteLeitura: dados?.motivoSomenteLeitura ?? corpo?.motivoSomenteLeitura ?? "",
  };
}

function interpretarPresenca(valor) {
  if (valor === true || valor === "presente" || valor === "C") return "C";
  if (valor === false || valor === "falta" || valor === "F") return "F";
  return null;
}

function criarMapaDePresencas(presencas, datas) {
  const mapa = {};
  if (Array.isArray(presencas)) {
    presencas.forEach((item, indice) => {
      if (item !== null && typeof item === "object" && item.data) {
        mapa[item.data.split("T")[0]] = interpretarPresenca(item.presente ?? item.situacao);
      } else if (datas[indice]) {
        mapa[datas[indice].dataIso] = interpretarPresenca(item);
      }
    });
  } else if (presencas && typeof presencas === "object") {
    Object.entries(presencas).forEach(([dataIso, valor]) => {
      mapa[dataIso.split("T")[0]] = interpretarPresenca(valor);
    });
  }
  return mapa;
}

export function criarChamadaMensalFromApi(corpo) {
  const dados = corpo?.data ?? corpo;

  const datas = (dados?.datas ?? []).map((item) => {
    const textoDaData = typeof item === "string" ? item : item.data;
    return {
      dataIso: textoDaData.split("T")[0],
      podeEditar: typeof item === "string" ? false : !!item.podeEditar,
    };
  });

  const alunos = (dados?.alunos ?? []).map((item) => ({
    alunoId: item.alunoId ?? item.id,
    nome: item.nome ?? item.nomeCompleto ?? "",
    ehInadimplente: !!(item.ehInadimplente ?? item.EhInadimplente),
    presencaPorData: criarMapaDePresencas(item.presencas, datas),
  }));

  return {
    mes: dados?.mes ?? "",
    turma: dados?.turma ?? null,
    datas,
    alunos,
  };
}
