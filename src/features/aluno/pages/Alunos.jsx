import { useEffect, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Loading from "@shared/components/Loading/Loading";
import Modal from "@shared/components/Modal/Modal";
import Select from "@shared/components/Select/Select";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import { listarAlunos } from "../services/alunoService";
import { listarTurmas } from "@features/turma/services/turmaService";
import { registrarRemanejamento } from "@features/reposicao/services/reposicaoService";
import "@shared/shared.css";

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

  // Estado do modal de remanejamento
  const [alunoRemanejando, setAlunoRemanejando] = useState(null);
  const [novaTurmaId, setNovaTurmaId] = useState("");
  const [dataOriginal, setDataOriginal] = useState("");
  const [dataReposicao, setDataReposicao] = useState("");
  const [enviandoRemanejamento, setEnviandoRemanejamento] = useState(false);
  const [erroModal, setErroModal] = useState("");

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

  function abrirRemanejamento(aluno) {
    setAlunoRemanejando(aluno);
    setNovaTurmaId("");
    setDataOriginal("");
    setDataReposicao("");
    setErroModal("");
  }

  function fecharModal() {
    setAlunoRemanejando(null);
  }

  async function confirmarRemanejamento(event) {
    event.preventDefault();
    setErroModal("");

    if (!novaTurmaId) {
      setErroModal("Selecione a turma de destino.");
      return;
    }

    setEnviandoRemanejamento(true);
    try {
      await registrarRemanejamento({
        alunoId: alunoRemanejando.id,
        turmaOrigemId: alunoRemanejando.turmaId,
        turmaDestinoId: novaTurmaId,
        dataOriginal,
        dataReposicao,
      });
      setMensagem({
        tipo: "sucesso",
        texto: `Remanejamento de ${alunoRemanejando.nome} registrado com sucesso.`,
      });
      fecharModal();
    } catch (err) {
      setErroModal(err.message || "Não foi possível registrar o remanejamento.");
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
                      Remanejar
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

      <Modal open={!!alunoRemanejando} title="Remanejar Aluno" onClose={fecharModal}>
        {alunoRemanejando && (
          <form onSubmit={confirmarRemanejamento}>
            <p className="helper-text" style={{ marginTop: 0 }}>
              {alunoRemanejando.nome} · {nomeTurma(alunoRemanejando.turmaId)}
            </p>

            <div className="notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FB6C9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <div>Pode ser remanejado para qualquer turma da mesma categoria, sem aviso prévio.</div>
            </div>

            <div className="form-row full">
              <Select
                id="novaTurma"
                label="Nova turma"
                options={[
                  { value: "", label: "Selecione a turma de destino" },
                  ...turmas.map((t) => ({ value: t.id, label: `${t.nome} — ${t.diasSemana} ${t.horario}` })),
                ]}
                value={novaTurmaId}
                onChange={(e) => setNovaTurmaId(e.target.value)}
              />
            </div>

            <div className="form-row">
              <Input
                id="dataOriginal"
                label="Data original"
                placeholder="dd/mm/aaaa"
                value={dataOriginal}
                onChange={(e) => setDataOriginal(e.target.value)}
              />
              <Input
                id="dataReposicao"
                label="Data reposição"
                placeholder="dd/mm/aaaa"
                value={dataReposicao}
                onChange={(e) => setDataReposicao(e.target.value)}
              />
            </div>

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
