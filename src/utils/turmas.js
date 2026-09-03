// Lista de turmas usada nos seletores do sistema (Novo Aluno, filtro de
// chamada em Alunos, remanejamento). Centralizada aqui para não duplicar
// a mesma lista em cada tela.
//
// - value: identificador usado ao enviar para a API (futuro turmaId)
// - curto: como a turma aparece nas tabelas (bate com o campo `turma` do Aluno)
// - label: texto completo mostrado nos seletores
export const TURMAS = [
  { value: "turma-a", curto: "Turma A", label: "Turma A — Seg/Qua 17h (Sub-11)", categoria: "Sub-11", horario: "Seg/Qua 17h" },
  { value: "turma-b", curto: "Turma B", label: "Turma B — Ter/Qui 18h (Sub-13)", categoria: "Sub-13", horario: "Ter/Qui 18h" },
  { value: "turma-c", curto: "Turma C", label: "Turma C — Sex 17h (Sub-12)", categoria: "Sub-12", horario: "Sex 17h" },
  { value: "turma-d", curto: "Turma D", label: "Turma D — Seg/Qua 19h (Sub-14)", categoria: "Sub-14", horario: "Seg/Qua 19h" },
];
