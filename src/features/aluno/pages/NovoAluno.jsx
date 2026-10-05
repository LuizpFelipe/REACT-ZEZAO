import { useEffect, useState } from "react";
import Input from "@shared/components/Input/Input";
import Select from "@shared/components/Select/Select";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import { criarAluno } from "../services/alunoService";
import { listarTurmas } from "@features/turma/services/turmaService";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { converterDataBrParaIso } from "@shared/utils/data";
import "@shared/shared.css";

const NIVEIS_TECNICOS = [
  { value: "Iniciante", label: "Iniciante" },
  { value: "Intermediario", label: "Intermediário" },
  { value: "Avancado", label: "Avançado" },
];

const FORM_INICIAL = {
  nomeCompleto: "",
  dataNascimento: "",
  nivelTecnico: NIVEIS_TECNICOS[0].value,
  turmaId: "",
  responsavel: "",
  telefone: "",
  endereco: "",
  foto: null,
};

export default function NovoAluno() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: "sucesso" | "erro", texto }

  const [turmas, setTurmas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregandoListas, setCarregandoListas] = useState(true);
  const [erroListas, setErroListas] = useState("");

  useEffect(() => {
    let ativo = true;

    Promise.all([listarTurmas(), listarCategorias()])
      .then(([turmasApi, categoriasApi]) => {
        if (!ativo) return;
        setTurmas(turmasApi);
        setCategorias(categoriasApi);
        if (turmasApi.length > 0) {
          setForm((atual) => ({ ...atual, turmaId: turmasApi[0].id }));
        }
      })
      .catch((err) => {
        if (ativo) setErroListas(err.message || "Não foi possível carregar turmas e categorias.");
      })
      .finally(() => {
        if (ativo) setCarregandoListas(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function nomeCategoria(categoriaId) {
    return categorias.find((c) => c.id === categoriaId)?.nome ?? "";
  }

  function selecionarFoto(arquivo) {
    if (previewFoto) URL.revokeObjectURL(previewFoto);
    atualizarCampo("foto", arquivo ?? null);
    setPreviewFoto(arquivo ? URL.createObjectURL(arquivo) : null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem(null);

    const dataIso = converterDataBrParaIso(form.dataNascimento);
    if (!dataIso) {
      setMensagem({ tipo: "erro", texto: "Data de nascimento inválida. Use o formato dd/mm/aaaa." });
      return;
    }

    if (!form.turmaId) {
      setMensagem({ tipo: "erro", texto: "Selecione uma turma." });
      return;
    }

    setEnviando(true);
    try {
      await criarAluno({
        nomeCompleto: form.nomeCompleto,
        dataNascimentoIso: dataIso,
        nivelTecnico: form.nivelTecnico,
        responsavelNome: form.responsavel,
        telefone: form.telefone,
        endereco: form.endereco,
        turmaId: form.turmaId,
        foto: form.foto,
      });
      setMensagem({ tipo: "sucesso", texto: "Aluno cadastrado com sucesso." });
      setForm({ ...FORM_INICIAL, turmaId: turmas[0]?.id ?? "" });
      if (previewFoto) URL.revokeObjectURL(previewFoto);
      setPreviewFoto(null);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível cadastrar o aluno." });
    } finally {
      setEnviando(false);
    }
  }

  const opcoesTurma = turmas.map((t) => ({
    value: t.id,
    label: `${t.nome} — ${t.diasSemana} ${t.horario} (${nomeCategoria(t.categoriaId)})`,
  }));

  return (
    <div className="grid-2">
      <div className="card">
        <h3>
          <span className="dot" /> Cadastro de Aluno
        </h3>

        {erroListas && (
          <p className="helper-text" style={{ color: "var(--red-ink)" }}>
            {erroListas}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="photo-block">
            <div className="photo-upload">
              {previewFoto ? (
                <img src={previewFoto} alt="Prévia da foto do aluno" className="photo-preview-img" />
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#9C9B9E" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
                </svg>
              )}
            </div>
            <div className="photo-text">
              <div className="t1">Foto do aluno</div>
              <div className="t2">
                {form.foto ? form.foto.name : "JPG ou PNG"}
              </div>
            </div>
            <label className="btn btn-outline btn-sm photo-upload-btn">
              Escolher arquivo
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => selecionarFoto(e.target.files?.[0] ?? null)}
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
          <div className="form-row full">
            <Input
              id="endereco"
              label="Endereço"
              placeholder="Rua, número, bairro"
              value={form.endereco}
              onChange={(e) => atualizarCampo("endereco", e.target.value)}
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
            {carregandoListas ? (
              <Loading label="Carregando turmas..." />
            ) : (
              <Select
                id="turma"
                label="Turma / Horário"
                options={opcoesTurma.length > 0 ? opcoesTurma : [{ value: "", label: "Nenhuma turma cadastrada" }]}
                value={form.turmaId}
                onChange={(e) => atualizarCampo("turmaId", e.target.value)}
              />
            )}
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
        </form>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Categorias por Idade
        </h3>
        {carregandoListas ? (
          <Loading label="Carregando categorias..." />
        ) : (
          <ul className="tag-list">
            {categorias.map((cat) => (
              <li key={cat.id}>
                {cat.nome} <span className="tag">{cat.idadeMin}–{cat.idadeMax} anos</span>
              </li>
            ))}
            {categorias.length === 0 && <li>Nenhuma categoria cadastrada ainda.</li>}
          </ul>
        )}
        <p className="helper-text">
          O nível técnico permite que um aluno mais novo jogue com uma categoria acima da sua idade. Não é permitido
          jogar em categoria abaixo da própria idade.
        </p>
      </div>
    </div>
  );
}
