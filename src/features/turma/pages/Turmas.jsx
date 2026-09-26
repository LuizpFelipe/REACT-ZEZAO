import { useEffect, useState } from "react";
import Modal from "@shared/components/Modal/Modal";
import Input from "@shared/components/Input/Input";
import Select from "@shared/components/Select/Select";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import { listarTurmas, criarTurma, atualizarTurma, removerTurma } from "../services/turmaService";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { listarProfessores } from "@features/professor/services/professorService";
import "@shared/shared.css";

const FORM_INICIAL = { nome: "", diasSemana: "", horario: "", categoriaId: "", professorId: "" };

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    setCarregando(true);
    Promise.all([listarTurmas(), listarCategorias(), listarProfessores()])
      .then(([turmasApi, categoriasApi, professoresApi]) => {
        setTurmas(turmasApi);
        setCategorias(categoriasApi);
        setProfessores(professoresApi);
      })
      .catch((err) => setErro(err.message || "Não foi possível carregar os dados."))
      .finally(() => setCarregando(false));
  }

  function nomeCategoria(id) {
    return categorias.find((c) => c.id === id)?.nome ?? "—";
  }

  function nomeProfessor(id) {
    return professores.find((p) => p.id === id)?.nome ?? "—";
  }

  function abrirNova() {
    setEditandoId(null);
    setForm({
      ...FORM_INICIAL,
      categoriaId: categorias[0]?.id ?? "",
      professorId: professores[0]?.id ?? "",
    });
    setErroModal("");
    setModalAberto(true);
  }

  function abrirEdicao(turma) {
    setEditandoId(turma.id);
    setForm({
      nome: turma.nome,
      diasSemana: turma.diasSemana,
      horario: turma.horario,
      categoriaId: turma.categoriaId,
      professorId: turma.professorId,
    });
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroModal("");

    if (!form.nome || !form.diasSemana || !form.horario || !form.categoriaId || !form.professorId) {
      setErroModal("Preencha todos os campos.");
      return;
    }

    setEnviando(true);
    try {
      if (editandoId) {
        await atualizarTurma(editandoId, form);
        setMensagem({ tipo: "sucesso", texto: "Turma atualizada com sucesso." });
      } else {
        await criarTurma(form);
        setMensagem({ tipo: "sucesso", texto: "Turma criada com sucesso." });
      }
      fecharModal();
      carregar();
    } catch (err) {
      setErroModal(err.message || "Não foi possível salvar a turma.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemover(turma) {
    if (!window.confirm(`Remover a turma "${turma.nome}"?`)) return;
    try {
      await removerTurma(turma.id);
      setMensagem({ tipo: "sucesso", texto: "Turma removida." });
      carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível remover a turma." });
    }
  }

  const opcoesCategoria = categorias.map((c) => ({ value: c.id, label: c.nome }));
  const opcoesProfessor = professores.map((p) => ({ value: p.id, label: p.nome }));

  return (
    <div className="card">
      <div className="table-toolbar">
        <h3 style={{ margin: 0 }}>
          <span className="dot" /> Turmas
        </h3>
        <Button size="sm" onClick={abrirNova} disabled={categorias.length === 0 || professores.length === 0}>
          Nova Turma
        </Button>
      </div>

      {(categorias.length === 0 || professores.length === 0) && !carregando && (
        <p className="helper-text" style={{ color: "var(--amber-ink)" }}>
          É preciso ter pelo menos uma categoria e um professor cadastrados antes de criar uma turma.
        </p>
      )}

      {erro && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
          {mensagem.texto}
        </p>
      )}

      {carregando ? (
        <Loading label="Carregando turmas..." />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Horário</th>
                <th>Categoria</th>
                <th>Professor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr key={turma.id}>
                  <td>{turma.nome}</td>
                  <td className="mono">
                    {turma.diasSemana} {turma.horario}
                  </td>
                  <td>{nomeCategoria(turma.categoriaId)}</td>
                  <td>{nomeProfessor(turma.professorId)}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(turma)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemover(turma)}>
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
              {turmas.length === 0 && (
                <tr>
                  <td colSpan={5} className="helper-text">
                    Nenhuma turma cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} title={editandoId ? "Editar Turma" : "Nova Turma"} onClose={fecharModal}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              id="nome"
              label="Nome da turma"
              placeholder="Ex: Turma A"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
            <Input
              id="horario"
              label="Horário"
              placeholder="Ex: 17h"
              value={form.horario}
              onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
            />
          </div>
          <div className="form-row full">
            <Input
              id="diasSemana"
              label="Dias da semana"
              placeholder="Ex: Seg/Qua"
              value={form.diasSemana}
              onChange={(e) => setForm((f) => ({ ...f, diasSemana: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <Select
              id="categoriaId"
              label="Categoria"
              options={opcoesCategoria}
              value={form.categoriaId}
              onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
            />
            <Select
              id="professorId"
              label="Professor"
              options={opcoesProfessor}
              value={form.professorId}
              onChange={(e) => setForm((f) => ({ ...f, professorId: e.target.value }))}
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
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
