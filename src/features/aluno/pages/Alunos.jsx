import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Loading from "@shared/components/Loading/Loading";
import Modal from "@shared/components/Modal/Modal";
import Select from "@shared/components/Select/Select";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import { listarAlunos } from "../services/alunoService";
import { listarTurmas } from "@features/turma/services/turmaService";
import { registrarRemanejamento } from "@features/reposicao/services/reposicaoService";
import {
  gerarOcorrenciasDoMes,
  mesmoDiaOuAntes,
  paraIsoData,
  formatarDataHora,
} from "@features/reposicao/utils/aulasMes";
import "@shared/shared.css";

// Aviso mínimo exigido pelo cliente: a reposição precisa ser remarcada com
// pelo menos 24h de antecedência da aula de destino.
const HORAS_MINIMAS_AVISO = 24;

function iniciais(nome) {
  return (nome || "")
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [busca, setBusca] = useState("");
  const [turmaFiltro, setTurmaFiltro] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [mensagem, setMensagem] = useState(null); // { tipo, texto }

  // Estado do modal de reposição/remanejamento
  const [alunoRemanejando, setAlunoRemanejando] = useState(null);
  const [aulaPerdida, setAulaPerdida] = useState("");
  const [destino, setDestino] = useState("");
  const [enviandoRemanejamento, setEnviandoRemanejamento] = useState(false);
  const [erroModal, setErroModal] = useState("");

  const agora = useMemo(() => new Date(), []);
  const limiteAviso = useMemo(() => new Date(agora.getTime() + HORAS_MINIMAS_AVISO * 60 * 60 * 1000), [agora]);
  const ano = agora.getFullYear();
  const mes = agora.getMonth();

  useEffect(() => {
    let ativo = true;

    Promise.all([listarAlunos(), listarTurmas()])
      .then(([alunosApi, turmasApi]) => {
        if (!ativo) return;
        setAlunos(alunosApi);
        setTurmas(turmasApi);
      })
      .catch((err) => {
        if (ativo) setErroCarregamento(err.message || "Não foi possível conectar à API.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  function nomeTurma(turmaId) {
    return turmas.find((t) => t.id === turmaId)?.nome ?? "—";
  }

  const alunosFiltrados = alunos.filter((aluno) => {
    const bateTurma = turmaFiltro === "todas" || aluno.turmaId === turmaFiltro;
    const bateBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase());
    return bateTurma && bateBusca;
  });

  const turmaSelecionada = turmas.find((t) => t.id === turmaFiltro);
  const totalInadimplentes = alunosFiltrados.filter((a) => a.status === "Inadimplente").length;

  const opcoesTurmaFiltro = [
    { value: "todas", label: "Todas as turmas" },
    ...turmas.map((t) => ({ value: t.id, label: `${t.nome} — ${t.diasSemana} ${t.horario}` })),
  ];

  const turmaOrigemRemanejando = turmas.find((t) => t.id === alunoRemanejando?.turmaId);

  // Aulas já dadas neste mês, da turma do aluno — candidatas a "aula perdida".
  const ocorrenciasPassadas = useMemo(() => {
    if (!turmaOrigemRemanejando) return [];
    return gerarOcorrenciasDoMes(turmaOrigemRemanejando, ano, mes).filter((data) => mesmoDiaOuAntes(data, agora));
  }, [turmaOrigemRemanejando, ano, mes, agora]);

  // Destinos possíveis: mesma categoria, outra turma, dentro do mesmo mês, e
  // com pelo menos 24h de antecedência a partir de agora.
  const destinosDisponiveis = useMemo(() => {
    if (!turmaOrigemRemanejando) return [];
    const turmasMesmaCategoria = turmas.filter(
      (t) => t.categoriaId === turmaOrigemRemanejando.categoriaId && t.id !== turmaOrigemRemanejando.id
    );
    const todos = turmasMesmaCategoria.flatMap((turma) =>
      gerarOcorrenciasDoMes(turma, ano, mes)
        .filter((data) => data >= limiteAviso)
        .map((data) => ({ turma, data }))
    );
    return todos.sort((a, b) => a.data - b.data);
  }, [turmaOrigemRemanejando, turmas, ano, mes, limiteAviso]);

  function abrirRemanejamento(aluno) {
    setAlunoRemanejando(aluno);
    setAulaPerdida("");
    setDestino("");
    setErroModal("");
  }

  function fecharModal() {
    setAlunoRemanejando(null);
  }

  async function confirmarRemanejamento(event) {
    event.preventDefault();
    setErroModal("");

    if (!aulaPerdida || !destino) {
      setErroModal("Selecione a aula perdida e a aula de reposição.");
      return;
    }

    const [turmaDestinoId] = destino.split("__");
    const ocorrenciaDestino = destinosDisponiveis.find((o) => `${o.turma.id}__${o.data.toISOString()}` === destino);

    if (!ocorrenciaDestino || ocorrenciaDestino.data < limiteAviso) {
      setErroModal(`A reposição precisa ser marcada com pelo menos ${HORAS_MINIMAS_AVISO}h de antecedência.`);
      return;
    }

    setEnviandoRemanejamento(true);
    try {
      await registrarRemanejamento({
        alunoId: alunoRemanejando.id,
        turmaOrigemId: alunoRemanejando.turmaId,
        turmaDestinoId,
        dataOriginal: aulaPerdida,
        dataReposicao: paraIsoData(ocorrenciaDestino.data),
      });
      setMensagem({
        tipo: "sucesso",
        texto: `Reposição de ${alunoRemanejando.nome} registrada com sucesso.`,
      });
      fecharModal();
    } catch (err) {
      setErroModal(err.message || "Não foi possível registrar a reposição.");
    } finally {
      setEnviandoRemanejamento(false);
    }
  }

  return (
    <div className="card">
      <h3>
        <span className="dot" /> Alunos por Turma (Chamada)
      </h3>

      <div className="table-toolbar">
        <Select
          id="turmaFiltro"
          label="Turma"
          options={opcoesTurmaFiltro}
          value={turmaFiltro}
          onChange={(e) => setTurmaFiltro(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <Input
          id="buscaAluno"
          label="Buscar aluno"
          placeholder="Nome do aluno..."
          className="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {turmaSelecionada && (
        <div className="notice" style={{ marginTop: 0, marginBottom: 16 }}>
          <div>
            <b>{turmaSelecionada.nome}</b> · {turmaSelecionada.diasSemana} {turmaSelecionada.horario}
            {" — "}
            <b>{alunosFiltrados.length}</b> aluno(s) matriculado(s)
            {totalInadimplentes > 0 && (
              <>
                {" · "}
                <b>{totalInadimplentes}</b> inadimplente(s)
              </>
            )}
          </div>
        </div>
      )}

      {erroCarregamento && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erroCarregamento}
        </p>
      )}

      {mensagem && (
        <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
          {mensagem.texto}
        </p>
      )}

      {carregando ? (
        <Loading label="Carregando alunos..." />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Aluno</th>
                {turmaFiltro === "todas" && <th>Turma</th>}
                <th>Nível</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td>
                    <div className="aluno-cell">
                      <div className="avatar">{iniciais(aluno.nome)}</div>
                      <span className={aluno.status === "Inadimplente" ? "name-flag" : ""}>
                        {aluno.status === "Inadimplente" && <span className="flag-dot" />}
                        {aluno.nome}
                      </span>
                    </div>
                  </td>
                  {turmaFiltro === "todas" && <td>{nomeTurma(aluno.turmaId)}</td>}
                  <td>{aluno.nivel}</td>
                  <td>
                    <StatusBadge status={aluno.status} />
                  </td>
                  <td>
                    <Button variant="outline" size="sm" onClick={() => abrirRemanejamento(aluno)}>
                      Repor Aula
                    </Button>
                  </td>
                </tr>
              ))}
              {alunosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={turmaFiltro === "todas" ? 5 : 4} className="helper-text">
                    Nenhum aluno encontrado para esse filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!alunoRemanejando} title="Repor Aula" onClose={fecharModal}>
        {alunoRemanejando && (
          <form onSubmit={confirmarRemanejamento}>
            <p className="helper-text" style={{ marginTop: 0 }}>
              {alunoRemanejando.nome} · Turma atual: <b>{nomeTurma(alunoRemanejando.turmaId)}</b>
              {turmaOrigemRemanejando
                ? ` (${turmaOrigemRemanejando.diasSemana} ${turmaOrigemRemanejando.horario})`
                : ""}
            </p>

            <div className="notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FB6C9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <div>
                Pode remarcar para outra turma da mesma categoria, dentro do mesmo mês da aula perdida,
                com pelo menos {HORAS_MINIMAS_AVISO}h de antecedência.
              </div>
            </div>

            <div className="form-row full">
              <Select
                id="aulaPerdida"
                label="Aula perdida (dias já dados este mês)"
                options={ocorrenciasPassadas.map((data) => ({
                  value: paraIsoData(data),
                  label: formatarDataHora(data),
                }))}
                value={aulaPerdida}
                onChange={(e) => setAulaPerdida(e.target.value)}
                disabled={ocorrenciasPassadas.length === 0}
              />
            </div>
            {ocorrenciasPassadas.length === 0 && (
              <p className="helper-text">Essa turma ainda não teve nenhuma aula este mês.</p>
            )}

            <div className="form-row full">
              <Select
                id="destino"
                label="Remarcar para"
                options={destinosDisponiveis.map((o) => ({
                  value: `${o.turma.id}__${o.data.toISOString()}`,
                  label: `${formatarDataHora(o.data)} — ${o.turma.nome}`,
                }))}
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                disabled={!aulaPerdida || destinosDisponiveis.length === 0}
              />
            </div>
            {aulaPerdida && destinosDisponiveis.length === 0 && (
              <p className="helper-text">
                Não há outra turma da mesma categoria com aula daqui a mais de {HORAS_MINIMAS_AVISO}h
                dentro deste mês.
              </p>
            )}

            {erroModal && (
              <p className="helper-text" style={{ color: "var(--red-ink)" }}>
                {erroModal}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviandoRemanejamento}>
                {enviandoRemanejamento ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
