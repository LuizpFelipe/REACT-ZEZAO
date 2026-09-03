import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Loading from "../../../components/Loading/Loading";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import { listarAlunos } from "../../../services/alunoService";
import { registrarRemanejamento } from "../../../services/reposicaoService";
import { TURMAS } from "../../../utils/turmas";
import "../../../styles/coordenador.css";

// Dados de exemplo, usados só enquanto o back-end não está plugado.
// turmaId aqui já aponta para os values de TURMAS (utils/turmas.js).
const ALUNOS_MOCK = [
  { id: 1, nome: "Enzo Ferreira", categoria: "Sub-13", nivel: "Intermediário", turma: "Turma B", turmaId: "turma-b", status: "Ativo" },
  { id: 2, nome: "Helena Souza", categoria: "Sub-11", nivel: "Iniciante", turma: "Turma A", turmaId: "turma-a", status: "Ativo" },
  { id: 3, nome: "Davi Lucca", categoria: "Sub-14", nivel: "Avançado", turma: "Turma D", turmaId: "turma-d", status: "Inadimplente" },
  { id: 4, nome: "Sophia Martins", categoria: "Sub-12", nivel: "Intermediário", turma: "Turma C", turmaId: "turma-c", status: "Ativo" },
];

const OPCOES_TURMA_FILTRO = [
  { value: "todas", label: "Todas as turmas" },
  ...TURMAS.map((t) => ({ value: t.value, label: t.label })),
];

function iniciais(nome) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
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

    listarAlunos()
      .then((dados) => {
        if (ativo) setAlunos(dados);
      })
      .catch(() => {
        // Back-end ainda não existe: cai no mock para a tela não ficar vazia.
        if (ativo) {
          setAlunos(ALUNOS_MOCK);
          setErroCarregamento("Não foi possível conectar à API — exibindo dados de exemplo.");
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const alunosFiltrados = alunos.filter((aluno) => {
    const bateTurma = turmaFiltro === "todas" || aluno.turmaId === turmaFiltro;
    const bateBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase());
    return bateTurma && bateBusca;
  });

  const turmaSelecionada = TURMAS.find((t) => t.value === turmaFiltro);
  const totalInadimplentes = alunosFiltrados.filter((a) => a.status === "Inadimplente").length;

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
          options={OPCOES_TURMA_FILTRO}
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
            <b>{turmaSelecionada.curto}</b> · {turmaSelecionada.horario} · {turmaSelecionada.categoria}
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
        <p className="helper-text" style={{ color: "var(--amber-ink)" }}>
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
                  {turmaFiltro === "todas" && <td>{aluno.turma}</td>}
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
              {alunoRemanejando.nome} · {alunoRemanejando.turma}
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
                options={[{ value: "", label: "Selecione a turma de destino" }, ...TURMAS.map((t) => ({ value: t.value, label: t.label }))]}
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
