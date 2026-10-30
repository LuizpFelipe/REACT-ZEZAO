export function formatarDataBr(valor) {
  const digitos = (valor || "").replace(/\D/g, "").slice(0, 8);
  const dia = digitos.slice(0, 2);
  const mes = digitos.slice(2, 4);
  const ano = digitos.slice(4, 8);

  let resultado = dia;
  if (mes) resultado += `/${mes}`;
  if (ano) resultado += `/${ano}`;
  return resultado;
}

export function converterDataBrParaIso(dataBr) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((dataBr || "").trim());
  if (!match) return null;

  const [, dia, mes, ano] = match;

  // Rejeita datas que não existem no calendário (31/02, 15/13...).
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const dataExiste =
    data.getFullYear() === Number(ano) && data.getMonth() === Number(mes) - 1 && data.getDate() === Number(dia);
  if (!dataExiste) return null;

  return `${ano}-${mes}-${dia}`;
}

export function converterDataIsoParaBr(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("T")[0].split("-");
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}

function completarComZero(numero) {
  return String(numero).padStart(2, "0");
}

export function obterDataLocalIso(data = new Date()) {
  return `${data.getFullYear()}-${completarComZero(data.getMonth() + 1)}-${completarComZero(data.getDate())}`;
}

export function obterMesLocal(data = new Date()) {
  return `${data.getFullYear()}-${completarComZero(data.getMonth() + 1)}`;
}

export function formatarDiaMes(dataIso) {
  const [, mes, dia] = dataIso.split("T")[0].split("-");
  return `${dia}/${mes}`;
}
