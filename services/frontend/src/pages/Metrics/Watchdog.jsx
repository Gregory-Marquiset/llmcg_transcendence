import "../../styles/App.css";
import "../Dashboard/Settings/Settings.css";
import { useEffect, useState, useCallback } from "react";
import { Footer, Background, HeaderBar, LeftMenu, LogTitle, Loading } from "../../components";

import "./Watchdog.css";

function Badge({ status }) {
  const cls =
    status === "healthy" ? "wd-badge wd-ok"
    : status === "starting" ? "wd-badge wd-wait"
    : "wd-badge wd-ko";

  const label =
    status === "healthy" ? "OK"
    : status === "starting" ? "WAIT"
    : "KO";

  return <span className={cls}>{label}</span>;
}

function StatusLabel({ status }) {
  if (status === "healthy" || status === "starting" || status === "unhealthy") return null;
  return <span className="wd-extra">{status}</span>;
}

export default function WatchdogPage() {
  const [data, setData] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchWatchdog = useCallback(async () => {
    try {
      // setIsLoading(true);
      setError("");

      const res = await fetch("/api/v1/watchdog", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      const bres = await fetch("/api/v1/backups", { cache: "no-store" });
      const bjson = await bres.json().catch(() => null);
      setBackupInfo(bjson);

      setData(json);

      if (!res.ok) {
        setError(`Erreur watchdog: HTTP ${res.status}`);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      // setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchdog();
    const id = setInterval(fetchWatchdog, 2000);
    return () => clearInterval(id);
  }, [fetchWatchdog]);

  const globalStatus =
    data?.global === "ok" ? "healthy"
    : data?.global === "wait" ? "starting"
    : "unhealthy";
    useEffect(() => {
      const interval = setInterval(setIsLoading(true), 2000);
      setIsLoading(false);
      return () => clearInterval(interval);
      }, []);
  if (isLoading) return <Loading/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar />

          <div className="core-container">
            <LeftMenu setIsLoading={setIsLoading} />

            <div className="setting-wrapper">
              <h2 className="settings-title">
                <LogTitle text="Watchdog 🐕" />
              </h2>

              <section className="wd-card">
                <div className="wd-global-row">
                  <div className="wd-global-left">
                    <span className="wd-label">Global</span>
                    <Badge status={globalStatus} />
                    {data?.checkedAt ? <span className="wd-time">{data.checkedAt}</span> : null}
                  </div>
                </div>

                {error && <div className="wd-error">{error}</div>}
              </section>


              <section className="wd-card">
                <div className="wd-services-title">Backups</div>

                {!backupInfo ? (
                  <div className="wd-loading">Chargement…</div>
                ) : (
                  <div className="wd-backups">
                    <div className="wd-backups-row">
                      <span className="wd-label">Dernier fichier</span>
                      <span className="wd-time">
                        {backupInfo.latest?.name ? backupInfo.latest.name : "Aucun"}
                      </span>
                    </div>

                    <div className="wd-backups-row">
                      <span className="wd-label">Taille</span>
                      <span className="wd-time">
                        {typeof backupInfo.latest?.size === "number" ? `${backupInfo.latest.size} bytes` : "-"}
                      </span>
                    </div>

                    <div className="wd-backups-row">
                      <span className="wd-label">Dernier run</span>
                      <span className="wd-time">
                        {backupInfo.meta?.lastRunAt ?? "-"}
                      </span>
                    </div>

                    <div className="wd-backups-row">
                      <span className="wd-label">Prochain run</span>
                      <span className="wd-time">
                        {backupInfo.meta?.nextRunAt ?? "-"}
                      </span>
                    </div>

                    {backupInfo.meta?.lastOk === false && backupInfo.meta?.lastError ? (
                      <pre className="wd-output">{backupInfo.meta.lastError}</pre>
                    ) : null}
                  </div>
                )}
              </section>


              {!data ? (
                <section className="wd-card">
                  <div className="wd-loading">Chargement…</div>
                </section>
              ) : (
                <section className="wd-card">
                  <div className="wd-services-title">Services</div>

                  <div className="wd-list">
                    {data.services?.map((s) => (
                      <div className="wd-row" key={s.name}>
                        <div className="wd-row-head">
                          <div className="wd-name">{s.name}</div>

                          <div className="wd-state">
                            <Badge status={s.status} />
                            <StatusLabel status={s.status} />
                          </div>

                          <div className="wd-meta">
                            {typeof s.failingStreak === "number" ? `fail=${s.failingStreak}` : ""}
                            {s.lastCheck?.exitCode !== undefined ? ` | exit=${s.lastCheck.exitCode}` : ""}
                          </div>
                        </div>

                        {s.lastCheck?.output ? (
                          <pre className="wd-output">{s.lastCheck.output}</pre>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <Footer />
        </div>
      </Background>
    </>
  );
}
