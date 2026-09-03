import { useState } from "react";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import Button from "../../../components/Button/Button";
import { criarAluno } from "../../../services/alunoService";
import { TURMAS } from "../../../utils/turmas";
import "../../../styles/coordenador.css";

const NIVEIS_TECNICOS = [
  { value: "Iniciante", label: "Iniciante" },
  { value: "Intermediario", label: "Intermediário" },
  { value: "Avancado", label: "Avançado" },
];

const CATEGORIAS = [
  { nome: "Sub-11", faixa: "9–10 anos" },
  { nome: "Sub-12", faixa: "11 anos" },
  { nome: "Sub-13", faixa: "12 anos" },
  { nome: "Sub-14", faixa: "13–14 anos" },
];

const FORM_INICIAL = {
  nomeCompleto: "",
  dataNascimento: "",
  nivelTecnico: NIVEIS_TECNICOS[0].value,
  turma: TURMAS[0].value,
  responsavel: "",
  telefone: "",
  foto: null,
};

export default function NovoAluno() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: "sucesso" | "erro", texto }

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem(null);
    setEnviando(true);

    try {
      // criarAluno já envia como multipart/form-data por causa da foto —
      // ver services/alunoService.js
      await criarAluno(form);
      setMensagem({ tipo: "sucesso", texto: "Aluno cadastrado com sucesso." });
      setForm(FORM_INICIAL);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível cadastrar o aluno." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h3>
          <span className="dot" /> Cadastro de Aluno
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="photo-block">
            <div className="photo-upload">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#9C9B9E" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
              </svg>
            </div>
            <div className="photo-text">
              <div className="t1">Foto do aluno</div>
              <div className="t2">
                {form.foto ? form.foto.name : "JPG ou PNG — salva em pasta própria, o back-end guarda só o caminho"}
              </div>
            </div>
            <label className="btn btn-outline btn-sm photo-upload-btn">
              Escolher arquivo
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => atualizarCampo("foto", e.target.files?.[0] ?? null)}
                className="photo-upload-input"
              />
            </label>
          </div>

          <div className="section-label">Dados pessoais</div>
          <div className="form-row">
            <Input
              id="nomeCompleto"
              label="Nome completo"
              placeholder="Ex: Enzo Ferreira"
              value={form.nomeCompleto}
              onChange={(e) => atualizarCampo("nomeCompleto", e.target.value)}
            />
            <Input
              id="dataNascimento"
              label="Data de nascimento"
              type="text"
              placeholder="dd/mm/aaaa"
              value={form.dataNascimento}
              onChange={(e) => atualizarCampo("dataNascimento", e.target.value)}
            />
          </div>
          <div className="form-row">
            <Input
              id="responsavel"
              label="Responsável"
              placeholder="Nome do responsável"
              value={form.responsavel}
              onChange={(e) => atualizarCampo("responsavel", e.target.value)}
            />
            <Input
              id="telefone"
              label="Telefone"
              placeholder="(44) 9 9999-0000"
              value={form.telefone}
              onChange={(e) => atualizarCampo("telefone", e.target.value)}
            />
          </div>

          <div className="section-label">Turma e nível</div>
          <div className="form-row">
            <Input id="categoria" label="Categoria (automática)" value="Calculada pela data de nascimento" disabled />
            <Select
              id="nivelTecnico"
              label="Nível técnico"
              options={NIVEIS_TECNICOS}
              value={form.nivelTecnico}
              onChange={(e) => atualizarCampo("nivelTecnico", e.target.value)}
            />
          </div>
          <div className="form-row full">
            <Select
              id="turma"
              label="Turma / Horário"
              options={TURMAS}
              value={form.turma}
              onChange={(e) => atualizarCampo("turma", e.target.value)}
            />
          </div>

          <Button type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar Aluno"}
          </Button>

          {mensagem && (
            <p
              className="helper-text"
              style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}
            >
              {mensagem.texto}
            </p>
          )}

          <p className="helper-text">O cadastro gera automaticamente o lançamento financeiro do aluno.</p>

          <div className="notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FB6C9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            <div>
              O sistema verifica automaticamente se já existe cadastro com o mesmo nome e data de nascimento,
              evitando duplicidade de aluno e de cobrança.
            </div>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Categorias por Idade e Nível
        </h3>
        <ul className="tag-list">
          {CATEGORIAS.map((cat) => (
            <li key={cat.nome}>
              {cat.nome} <span className="tag">{cat.faixa}</span>
            </li>
          ))}
        </ul>
        <p className="helper-text">
          O nível técnico permite que um aluno mais novo jogue com uma categoria acima da sua idade. Não é permitido
          jogar em categoria abaixo da própria idade.
        </p>
      </div>
    </div>
  );
}
