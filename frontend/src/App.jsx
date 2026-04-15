import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "acta_token";

const nextStatusMap = {
  REGISTRADA: "EM_ANALISE",
  EM_ANALISE: "RESOLVIDA",
  RESOLVIDA: "ENCERRADA",
};

const statusMeta = {
  REGISTRADA: { label: "Registrada", tone: "status status-gray" },
  EM_ANALISE: { label: "Em analise", tone: "status status-blue" },
  RESOLVIDA: { label: "Resolvida", tone: "status status-green" },
  ENCERRADA: { label: "Encerrada", tone: "status status-dark" },
};

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || "";

const getPageFromHash = () => {
  const hash = window.location.hash.replace("#", "");

  if (hash.startsWith("/occurrences/")) {
    return { view: "detail", id: hash.split("/")[2] || "" };
  }

  if (hash === "/dashboard") {
    return { view: "dashboard", id: "" };
  }

  return { view: "login", id: "" };
};

const navigateTo = (path) => {
  window.location.hash = path;
};

const decodeJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (_error) {
    return null;
  }
};

const formatDate = (dateValue) => new Date(dateValue).toLocaleString("pt-BR");

const getErrorMessage = (payload) => {
  if (!payload) {
    return "Nao foi possivel concluir a solicitacao.";
  }

  if (payload.error?.message) {
    return payload.error.message;
  }

  if (payload.message) {
    return payload.message;
  }

  return "Nao foi possivel concluir a solicitacao.";
};

async function apiRequest(path, options = {}, token = "") {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload.data;
}

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.REGISTRADA;
  return <span className={meta.tone}>{meta.label}</span>;
}

function LoginPage({ onLogin, loading, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin({ email, password });
  };

  return (
    <section className="login-shell">
      <div className="brand-block">
        <p className="eyebrow">ACTA</p>
        <h1>Gestao de ocorrencias com rastreabilidade institucional.</h1>
        <p className="lead">
          Um painel simples para acompanhar registros, analise, resolucao e encerramento.
        </p>
      </div>

      <div className="login-card">
        <h2>Acessar sistema</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="professor@acta.local"
            />
          </label>
          <label>
            Senha
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Sua senha"
            />
          </label>
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {error ? <p className="error-banner">{error}</p> : null}
      </div>
    </section>
  );
}

function DashboardPage({
  items,
  loading,
  error,
  user,
  onRefresh,
  onLogout,
  onSelectOccurrence,
}) {
  return (
    <section className="panel-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Painel institucional</p>
          <h1>Ocorrencias registradas</h1>
          <p className="lead">
            Usuario: {user?.name || user?.email} | Perfil: {user?.role}
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={onRefresh} type="button">
            Atualizar
          </button>
          <button className="secondary-button" onClick={onLogout} type="button">
            Sair
          </button>
        </div>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>Lista de ocorrencias</h2>
            <p className="lead">Visualize status, data e descricao de cada registro.</p>
          </div>
          {loading ? <span className="muted">Carregando...</span> : null}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Descricao</th>
                <th>Status</th>
                <th>Criada em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    Nenhuma ocorrencia encontrada.
                  </td>
                </tr>
              ) : (
                items.map((occurrence) => (
                  <tr key={occurrence.id}>
                    <td>
                      <strong>{occurrence.studentName}</strong>
                      <div className="table-subtitle">{occurrence.description}</div>
                    </td>
                    <td>
                      <StatusBadge status={occurrence.status} />
                    </td>
                    <td>{formatDate(occurrence.createdAt)}</td>
                    <td>
                      <button
                        className="link-button"
                        onClick={() => onSelectOccurrence(occurrence.id)}
                        type="button"
                      >
                        Ver detalhe
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function Timeline({ history }) {
  return (
    <ol className="timeline">
      {history.map((item) => (
        <li key={item.id} className="timeline-item">
          <div className="timeline-marker" />
          <div className="timeline-content">
            <p className="timeline-title">{item.action}</p>
            <p className="muted">
              {item.previousStatus || "INICIAL"} {"->"} {item.newStatus}
            </p>
            <p className="muted">
              {item.performedBy?.name} | {formatDate(item.timestamp)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function DetailPage({
  occurrence,
  history,
  loading,
  error,
  onBack,
  onAdvanceStatus,
  canAdvance,
  updatingStatus,
}) {
  const nextStatus = occurrence ? nextStatusMap[occurrence.status] : "";

  return (
    <section className="panel-shell">
      <header className="hero-card">
        <div>
          <button className="back-button" onClick={onBack} type="button">
            Voltar ao painel
          </button>
          <p className="eyebrow">Ocorrencia</p>
          <h1>Detalhes do registro</h1>
        </div>
        <button
          className="primary-button"
          disabled={!canAdvance || updatingStatus}
          onClick={onAdvanceStatus}
          type="button"
        >
          {updatingStatus
            ? "Atualizando..."
            : canAdvance
              ? `Mover para ${nextStatus}`
              : "Transicao indisponivel"}
        </button>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      {loading || !occurrence ? (
        <section className="content-card">
          <p>Carregando detalhes...</p>
        </section>
      ) : (
        <div className="detail-grid">
          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Informacoes gerais</h2>
                <p className="lead">Dados principais da ocorrencia e responsavel pelo registro.</p>
              </div>
              <StatusBadge status={occurrence.status} />
            </div>

            <div className="detail-list">
              <div>
                <span className="detail-label">Aluno</span>
                <strong>{occurrence.studentName}</strong>
              </div>
              <div>
                <span className="detail-label">Descricao</span>
                <strong>{occurrence.description}</strong>
              </div>
              <div>
                <span className="detail-label">Criado por</span>
                <strong>
                  {occurrence.createdBy?.name} ({occurrence.createdBy?.role})
                </strong>
              </div>
              <div>
                <span className="detail-label">Data de criacao</span>
                <strong>{formatDate(occurrence.createdAt)}</strong>
              </div>
              <div>
                <span className="detail-label">Ultima atualizacao</span>
                <strong>{formatDate(occurrence.updatedAt)}</strong>
              </div>
            </div>
          </section>

          <section className="content-card">
            <div className="section-header">
              <div>
                <h2>Historico</h2>
                <p className="lead">Linha do tempo das movimentacoes realizadas.</p>
              </div>
            </div>

            {history.length === 0 ? (
              <p className="muted">Sem historico para exibir.</p>
            ) : (
              <Timeline history={history} />
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [token, setToken] = useState(getStoredToken());
  const [route, setRoute] = useState(getPageFromHash());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [occurrences, setOccurrences] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [occurrenceDetail, setOccurrenceDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const user = useMemo(() => decodeJwtPayload(token), [token]);

  useEffect(() => {
    const syncRoute = () => setRoute(getPageFromHash());

    window.addEventListener("hashchange", syncRoute);
    syncRoute();

    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    if (!token) {
      navigateTo("/login");
      return;
    }

    if (route.view === "login") {
      navigateTo("/dashboard");
    }
  }, [token, route.view]);

  const loadOccurrences = async () => {
    setListLoading(true);
    setListError("");

    try {
      const data = await apiRequest("/occurrences", {}, token);
      setOccurrences(data);
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  };

  const loadOccurrenceDetail = async (id) => {
    if (!id) {
      return;
    }

    setDetailLoading(true);
    setDetailError("");

    try {
      const [occurrenceData, historyData] = await Promise.all([
        apiRequest(`/occurrences/${id}`, {}, token),
        apiRequest(`/occurrences/${id}/history`, {}, token),
      ]);

      setOccurrenceDetail(occurrenceData);
      setHistory(historyData);
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (token && route.view === "dashboard") {
      loadOccurrences();
    }
  }, [token, route.view]);

  useEffect(() => {
    if (token && route.view === "detail" && route.id) {
      loadOccurrenceDetail(route.id);
    }
  }, [token, route.view, route.id]);

  const handleLogin = async (credentials) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      navigateTo("/dashboard");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOccurrences([]);
    setOccurrenceDetail(null);
    setHistory([]);
    setAuthError("");
    setListError("");
    setDetailError("");
    navigateTo("/login");
  };

  const handleOpenDetail = (id) => {
    navigateTo(`/occurrences/${id}`);
  };

  const handleAdvanceStatus = async () => {
    if (!occurrenceDetail) {
      return;
    }

    setUpdatingStatus(true);
    setDetailError("");

    try {
      await apiRequest(
        `/occurrences/${occurrenceDetail.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatusMap[occurrenceDetail.status] }),
        },
        token
      );

      await Promise.all([loadOccurrences(), loadOccurrenceDetail(occurrenceDetail.id)]);
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canAdvance = Boolean(
    occurrenceDetail &&
      nextStatusMap[occurrenceDetail.status] &&
      ((user?.role === "COORDINATOR" &&
        ["REGISTRADA", "EM_ANALISE"].includes(occurrenceDetail.status)) ||
        (user?.role === "DIRECTOR" && occurrenceDetail.status === "RESOLVIDA"))
  );

  return (
    <main className="app-shell">
      {route.view === "login" || !token ? (
        <LoginPage error={authError} loading={authLoading} onLogin={handleLogin} />
      ) : null}

      {token && route.view === "dashboard" ? (
        <DashboardPage
          error={listError}
          items={occurrences}
          loading={listLoading}
          onLogout={handleLogout}
          onRefresh={loadOccurrences}
          onSelectOccurrence={handleOpenDetail}
          user={user}
        />
      ) : null}

      {token && route.view === "detail" ? (
        <DetailPage
          canAdvance={canAdvance}
          error={detailError}
          history={history}
          loading={detailLoading}
          occurrence={occurrenceDetail}
          onAdvanceStatus={handleAdvanceStatus}
          onBack={() => navigateTo("/dashboard")}
          updatingStatus={updatingStatus}
        />
      ) : null}
    </main>
  );
}
