import { useEffect, useMemo, useState } from "react";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import { dispararCobranca, listarParcelas } from "../services/financeiroService";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { listarTurmas } from "@features/turma/services/turmaService";
import "@shared/shared.css";

/**
 * Este relatório não tem (nem precisa de) endpoint próprio no back: o card
 * [Back-end] Financeiro já prevê `GET /api/Parcelas?status=Atrasado`, então
 * a lista de inadimplentes é montada aqui agregando essas parcelas por
 * aluno, usando os dados de `listarAlunos()`/`listarTurmas()` que já
 * existem pra pegar turma/responsável/telefone.
 */

function diasDesde(dataIso) {
  if (!dataIso) return 0;
  const diffMs = Date.now() - new Date(dataIso).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function Inadimplentes() {
  const [parcelasAtrasadas, setParcelasAtrasadas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [disparandoId, setDisparandoId] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const [parcelasApi, alunosApi] = await Promise.all([
        listarParcelas({ status: "Atrasado" }),
        listarAlunos(),
      ]);
      setParcelasAtrasadas(parcelasApi);
      setAlunos(alunosApi);
      try {
        setTurmas(await listarTurmas());
      } catch {
        setTurmas([]);
      }
    } catch {
      setParcelasAtrasadas([]);
      setAlunos([]);
    } finally {
      setCarregando(false);
    }
  }

  const inadimplentes = useMemo(() => {
    const porAluno = new Map();
    for (const parcela of parcelasAtrasadas) {
      if (!parcela.alunoId) continue;
      const atual = porAluno.get(parcela.alunoId) ?? { parcelas: [] };
      atual.parcelas.push(parcela);
      porAluno.set(parcela.alunoId, atual);
    }

    return Array.from(porAluno.entries()).map(([alunoId, { parcelas }]) => {
      const aluno = alunos.find((a) => a.id === alunoId);
      const turma = turmas.find((t) => t.id === aluno?.turmaId);
      const maisAntiga = parcelas.reduce((maisVelha, p) => {
        if (!maisVelha) return p;
        return new Date(p.vencimento) < new Date(maisVelha.vencimento) ? p : maisVelha;
      }, null);
      const valorTotal = parcelas.reduce((soma, p) => {
        const numero = Number(String(p.valor).replace(/[^\d,.-]/g, "").replace(",", "."));
        return soma + (Number.isFinite(numero) ? numero : 0);
      }, 0);

      return {
        alunoId,
        nome: aluno?.nome ?? parcelas[0]?.aluno ?? "—",
        turma: turma?.nome ?? "—",
        responsavelNome: aluno?.responsavelNome ?? "—",
        telefone: aluno?.telefone ?? "—",
        qtdParcelasAtraso: parcelas.length,
        valorTotalAberto: valorTotal > 0 ? `R$ ${valorTotal.toFixed(2).replace(".", ",")}` : "—",
        diasAtraso: diasDesde(maisAntiga?.vencimento),
        parcelaIds: parcelas.map((p) => p.id),
      };
    }).sort((a, b) => b.diasAtraso - a.diasAtraso);
  }, [parcelasAtrasadas, alunos, turmas]);

  async function handleDisparar(inadimplente) {
    setDisparandoId(inadimplente.alunoId);
    try {
      // Não existe disparo por aluno no back — dispara uma a uma pra cada
      // parcela em atraso daquele aluno.
      for (const parcelaId of inadimplente.parcelaIds) {
        await dispararCobranca(parcelaId);
      }
    } catch (err) {
      alert(err.message || "Não foi possível disparar o aviso.");
    } finally {
      setDisparandoId(null);
    }
  }

  const totalInadimplentes = inadimplentes.length;
  const totalParcelas = inadimplentes.reduce((soma, i) => soma + (i.qtdParcelasAtraso || 0), 0);
  const maiorAtraso = inadimplentes.reduce((max, i) => Math.max(max, i.diasAtraso || 0), 0);

  if (carregando) return <Loading label="Carregando relatório..." />;

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card warn"><div className="label">Alunos inadimplentes</div><div className="value">{totalInadimplentes}</div></div>
        <div className="stat-card accent"><div className="label">Parcelas em atraso</div><div className="value">{totalParcelas}</div></div>
        <div className="stat-card"><div className="label">Maior atraso</div><div className="value">{maiorAtraso > 0 ? `${maiorAtraso} dias` : "—"}</div></div>
      </div>
      <div className="card">
        <h3><span className="dot" /> Inadimplentes</h3>
        {inadimplentes.length === 0 ? (
          <p className="helper-text">Nenhum aluno inadimplente no momento.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Aluno</th><th>Turma</th><th>Parcelas em atraso</th><th>Valor em aberto</th><th>Atraso</th><th>Contato</th><th>Ação</th></tr></thead>
              <tbody>
                {inadimplentes.map((i) => (
                  <tr key={i.alunoId}>
                    <td><span className="name-flag"><span className="flag-dot" />{i.nome}</span></td>
                    <td>{i.turma}</td>
                    <td className="mono">{i.qtdParcelasAtraso}</td>
                    <td className="mono">{i.valorTotalAberto}</td>
                    <td className="mono">{i.diasAtraso} dias</td>
                    <td className="mono">{i.telefone}</td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => handleDisparar(i)} disabled={disparandoId === i.alunoId}>
                        {disparandoId === i.alunoId ? "Enviando..." : "Enviar Aviso"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
