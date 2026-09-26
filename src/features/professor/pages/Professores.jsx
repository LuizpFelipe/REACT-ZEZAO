import { useEffect, useState } from "react";
import Modal from "@shared/components/Modal/Modal";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import {
  listarProfessores,
  criarProfessor,
  atualizarProfessor,
  removerProfessor,
} from "../services/professorService";
import "@shared/shared.css";

const FORM_INICIAL = { nome: "", telefone: "", nomeUsuario: "", senha: "" };

export default function Professores() {
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
    listarProfessores()
      .then(setProfessores)
      .catch((err) => setErro(err.message || "Não foi possível carregar os professores."))
      .finally(() => setCarregando(false));
  }

  function abrirNovo() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErroModal("");
    setModalAberto(true);
  }

  function abrirEdicao(professor) {
    setEditandoId(professor.id);
    // Usuário/senha não são editáveis aqui — troca de senha é um fluxo à parte.
    setForm({ nome: professor.nome, telefone: professor.telefone, nomeUsuario: "", senha: "" });
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroModal("");

    if (!form.nome || !form.telefone) {
      setErroModal("Preencha nome e telefone.");
      return;
    }
    if (!editandoId && (!form.nomeUsuario || !form.senha)) {
      setErroModal("Preencha usuário e senha para criar o acesso do professor.");
      return;
    }

    setEnviando(true);
    try {
      if (editandoId) {
        await atualizarProfessor(editandoId, { nome: form.nome, telefone: form.telefone });
        setMensagem({ tipo: "sucesso", texto: "Professor atualizado com sucesso." });
      } else {
        await criarProfessor(form);
        setMensagem({ tipo: "sucesso", texto: "Professor cadastrado com sucesso." });
      }
      fecharModal();
      carregar();
    } catch (err) {
      setErroModal(err.message || "Não foi possível salvar o professor.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemover(professor) {
    if (!window.confirm(`Remover o professor "${professor.nome}"?`)) return;
    try {
      await removerProfessor(professor.id);
      setMensagem({ tipo: "sucesso", texto: "Professor removido." });
      carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível remover o professor." });
    }
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        <h3 style={{ margin: 0 }}>
          <span className="dot" /> Professores
        </h3>
        <Button size="sm" onClick={abrirNovo}>
          Novo Professor
        </Button>
      </div>

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
        <Loading label="Carregando professores..." />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {professores.map((prof) => (
                <tr key={prof.id}>
                  <td>{prof.nome}</td>
                  <td className="mono">{prof.telefone}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(prof)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemover(prof)}>
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
              {professores.length === 0 && (
                <tr>
                  <td colSpan={3} className="helper-text">
                    Nenhum professor cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} title={editandoId ? "Editar Professor" : "Novo Professor"} onClose={fecharModal}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              id="nome"
              label="Nome"
              placeholder="Nome do professor"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
            <Input
              id="telefone"
              label="Telefone"
              placeholder="(44) 9 9999-0000"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            />
          </div>

          {!editandoId && (
            <>
              <div className="section-label">Acesso ao sistema</div>
              <div className="form-row">
                <Input
                  id="nomeUsuario"
                  label="Usuário"
                  placeholder="nome.sobrenome"
                  value={form.nomeUsuario}
                  onChange={(e) => setForm((f) => ({ ...f, nomeUsuario: e.target.value }))}
                />
                <Input
                  id="senha"
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                />
              </div>
            </>
          )}

          {editandoId && (
            <p className="helper-text">
              Usuário e senha não são alterados aqui — reset de senha é feito em outra tela.
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
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
