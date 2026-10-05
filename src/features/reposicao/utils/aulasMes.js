const DIAS_SEMANA = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
const LABEL_DIA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function normalizar(token) {
  return token
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .slice(0, 3);
}

/**
 * Converte um texto tipo "Seg/Qua", "Ter/Qui" ou "Sex" numa lista de
 * números de dia da semana (0 = domingo ... 6 = sábado).
 */
export function parseDiasSemana(diasSemanaStr) {
  if (!diasSemanaStr) return [];
  return diasSemanaStr
    .split("/")
    .map(normalizar)
    .map((d) => DIAS_SEMANA[d])
    .filter((d) => d !== undefined);
}

/**
 * Extrai hora:minuto de um texto tipo "18h" ou "17h30".
 */
export function parseHorario(horarioStr) {
  const match = /(\d{1,2})h(\d{2})?/.exec(horarioStr ?? "");
  if (!match) return { hora: 0, minuto: 0 };
  return { hora: Number(match[1]), minuto: Number(match[2] ?? 0) };
}

/**
 * Gera todas as datas (já com a hora da aula) de um mês em que a turma tem
 * aula, a partir dos dias da semana e do horário cadastrados nela.
 *
 * @param {{ diasSemana: string, horario: string }} turma
 * @param {number} ano
 * @param {number} mes - 0-indexado (0 = janeiro, 11 = dezembro)
 * @returns {Date[]}
 */
export function gerarOcorrenciasDoMes(turma, ano, mes) {
  const diasSemana = parseDiasSemana(turma.diasSemana);
  const { hora, minuto } = parseHorario(turma.horario);
  const ocorrencias = [];

  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = new Date(ano, mes, dia, hora, minuto, 0, 0);
    if (diasSemana.includes(data.getDay())) {
      ocorrencias.push(data);
    }
  }
  return ocorrencias;
}

/** Compara só a parte de data (ignora hora), útil pra "até hoje" / "a partir de hoje". */
export function mesmoDiaOuAntes(data, referencia) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const r = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  return d <= r;
}

export function mesmoDiaOuDepois(data, referencia) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const r = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
  return d >= r;
}

/** yyyy-mm-dd, para enviar pro back-end. */
export function paraIsoData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function formatarDataHora(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${LABEL_DIA_SEMANA[data.getDay()]} ${dia}/${mes} às ${hora}:${minuto}`;
}
