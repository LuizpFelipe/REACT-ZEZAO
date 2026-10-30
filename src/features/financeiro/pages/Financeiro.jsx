import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Button from "@shared/components/Button/Button";
import Select from "@shared/components/Select/Select";
import Loading from "@shared/components/Loading/Loading";
import { darBaixaParcela, dispararCobranca, listarParcelas, listarResumoFinanceiro } from "../services/financeiroService";
import { converterDataIsoParaBr } from "@shared/utils/data";
import "@shared/shared.css";

function formatarMoeda(valor) {
  if (typeof valor !== "number") return valor ?? "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Em aberto primeiro (atrasadas antes das pendentes), pagas por último; dentro do grupo, vencimento mais antigo primeiro.
function ordenarParcelas(parcelas) {
  const prioridade = { Atrasado: 0, Pendente: 1, Pago: 2 };
  return [...parcelas].sort((a, b) => {
    const diferenca = (prioridade[a.status] ?? 1) - (prioridade[b.status] ?? 1);
    if (diferenca !== 0) return diferenca;
    const vencimentoA = String(a.vencimento ?? a.dataVencimento ?? "");
    const vencimentoB = String(b.vencimento ?? b.dataVencimento ?? "");
    return a.status === "Pago" ? vencimentoB.localeCompare(vencimentoA) : vencimentoA.localeCompare(vencimentoB);
  });
}

const LINHAS_POR_PAGINA = 100;

const RESUMO_VAZIO = { recebidoMes: "—", pendente: "—", inadimplencia: "—" };

const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  { value: "Pendente", label: "Pendente" },
  { value: "Atrasado", label: "Atrasado" },
  { value: "Pago", label: "Pago" },
];

export default function Financeiro() {
  const [parcelas, setParcelas] = useState([]);
  const [resumo, setResumo] = useState(RESUMO_VAZIO);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [disparando, setDisparando] = useState(false);
  const [processandoId, setProcessandoId] = useState(null);
  const [limiteDeLinhas, setLimiteDeLinhas] = useState(LINHAS_POR_PAGINA);
  useEffect(() => {
    carregar();
  }, [statusFiltro]);

  useEffect(() => {
    setLimiteDeLinhas(LINHAS_POR_PAGINA);
  }, [statusFiltro]);

  async function carregar() {
    setCarregando(true);
    try {
      const [parcelasApi, resumoApi] = await Promise.all([
        listarParcelas(statusFiltro ? { status: statusFiltro } : {}),
        listarResumoFinanceiro(),
      ]);
      setParcelas(ordenarParcelas(parcelasApi));
      setResumo(resumoApi ?? RESUMO_VAZIO);
    } catch {
      setParcelas([]);
      setResumo(RESUMO_VAZIO);
    } finally {
      setCarregando(false);
    }
  }

  const parcelasEmAberto = useMemo(() => parcelas.filter((p) => p.status !== "Pago"), [parcelas]);

  async function handleDispararTodos() {
    setDisparando(true);
    try {
      for (const parcela of parcelasEmAberto) {
        await dispararCobranca(parcela.id);
      }
    } catch (err) {
      alert(err.message || "Não foi possível disparar os avisos.");
    } finally {
      setDisparando(false);
    }
  }

  async function handleDispararUm(parcelaId) {
    setProcessandoId(parcelaId);
    try {
      await dispararCobranca(parcelaId);
    } catch (err) {
      alert(err.message || "Não foi possível disparar o aviso.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleDarBaixa(parcelaId) {
    setProcessandoId(parcelaId);
    try {
      await darBaixaParcela(parcelaId);
      await carregar();
    } catch (err) {
      alert(err.message || "Não foi possível dar baixa na parcela.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card"><div className="label">Recebido no mês</div><div className="value">{formatarMoeda(resumo.recebidoMes)}</div></div>
        <div className="stat-card accent"><div className="label">Pendente</div><div className="value">{formatarMoeda(resumo.pendente)}</div></div>
        <div className="stat-card warn"><div className="label">Inadimplência</div><div className="value">{formatarMoeda(resumo.inadimplencia)}</div></div>
      </div>
      <div className="card">
        <div className="table-toolbar">
          <h3 style={{ margin: 0 }}><span className="dot" /> Parcelas</h3>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Select
              id="filtro-status"
              options={OPCOES_STATUS}
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={handleDispararTodos} disabled={disparando || parcelasEmAberto.length === 0}>
              {disparando ? "Disparando..." : "Disparar Avisos de Cobrança"}
            </Button>
          </div>
        </div>
        {carregando ? <Loading label="Carregando parcelas..." /> : parcelas.length === 0 ? (
          <p className="helper-text">Nenhuma parcela encontrada.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Aluno</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {parcelas.slice(0, limiteDeLinhas).map((p) => (
                  <tr key={p.id}>
                    <td>{p.status === "Atrasado" ? (<span className="name-flag"><span className="flag-dot" />{p.aluno}</span>) : p.aluno}</td>
                    <td className="mono">{converterDataIsoParaBr(p.vencimento)}</td>
                    <td className="mono">{formatarMoeda(p.valor)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      {p.status === "Pago" ? (
                        "—"
                      ) : (
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDarBaixa(p.id)}
                            disabled={processandoId === p.id}
                          >
                            Dar Baixa
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDispararUm(p.id)}
                            disabled={processandoId === p.id}
                          >
                            {p.status === "Atrasado" ? "Enviar WhatsApp" : "Lembrete"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parcelas.length > limiteDeLinhas && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, alignItems: "center", marginTop: 12 }}>
                <span className="helper-text">Mostrando {limiteDeLinhas} de {parcelas.length}</span>
                <Button variant="outline" size="sm" onClick={() => setLimiteDeLinhas((atual) => atual + LINHAS_POR_PAGINA)}>
                  Mostrar mais
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
