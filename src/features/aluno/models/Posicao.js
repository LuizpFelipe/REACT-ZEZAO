export const POSICOES = [
  { value: 0, label: "Goleiro" },
  { value: 1, label: "Fixo" },
  { value: 2, label: "Ala direito" },
  { value: 3, label: "Ala esquerdo" },
  { value: 4, label: "Pivô" },
];

export function nomeDaPosicao(valor) {
  return POSICOES.find((posicao) => posicao.value === valor)?.label ?? "—";
}
