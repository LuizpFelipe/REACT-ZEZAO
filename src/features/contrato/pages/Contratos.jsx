import { useState } from "react";
import Select from "@shared/components/Select/Select";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import { gerarContratoPdf } from "../services/contratoService";
import "@shared/shared.css";

// Lista de alunos para o seletor — troca pela chamada real (alunoService.listar())
// quando o back-end estiver disponível.
const ALUNOS = [
  { value: "1", label: "Enzo Ferreira" },
  { value: "2", label: "Helena Souza" },
  { value: "3", label: "Davi Lucca" },
];

export default function Contratos() {
  const [alunoId, setAlunoId] = useState(ALUNOS[0].value);
  const [dataInicio, setDataInicio] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [gerando, setGerando] = useState(false);

  const alunoSelecionado = ALUNOS.find((a) => a.value === alunoId);

  async function handleGerarPdf() {
    setGerando(true);
    try {
      await gerarContratoPdf({ alunoId, dataInicio, valorParcela });
    } catch (err) {
      alert(err.message || "Não foi possível gerar o contrato.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="grid-2">
      <div className="card ticket-card">
        <div className="ticket-header">
          <div className="avatar" style={{ width: 40, height: 40 }}>
            {alunoSelecionado ? alunoSelecionado.label[0] : "-"}
          </div>
          <div>
            <div className="ticket-title">Contrato de Matrícula</div>
            <div className="ticket-sub">{alunoSelecionado?.label ?? "Selecione um aluno"}</div>
          </div>
        </div>
        <div className="clause">Vigência anual, renovada no início do ano letivo.</div>
        <div className="clause">Pagamento em 12 parcelas mensais.</div>
        <div className="clause">2 aulas semanais, reposição livre na mesma categoria.</div>
        <Button onClick={handleGerarPdf} disabled={gerando}>
          {gerando ? "Gerando..." : "Gerar Contrato em PDF"}
        </Button>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Emitir Novo Contrato
        </h3>
        <div className="form-row full">
          <Select id="aluno" label="Selecionar aluno" options={ALUNOS} value={alunoId} onChange={(e) => setAlunoId(e.target.value)} />
        </div>
        <div className="form-row">
          <Input id="dataInicio" label="Data de início" type="text" placeholder="dd/mm/aaaa" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          <Input
            id="valorParcela"
            label="Valor da parcela"
            placeholder="R$ 180,00"
            value={valorParcela}
            onChange={(e) => setValorParcela(e.target.value)}
          />
        </div>
        <Button variant="outline">Pré-visualizar</Button>
      </div>
    </div>
  );
}
