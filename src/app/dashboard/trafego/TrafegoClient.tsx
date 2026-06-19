'use client';

import { useEffect, useMemo, useState } from 'react';

/* ---------- tipos ---------- */
type Platform = 'Meta' | 'Google';
type Row = {
  platform: Platform;
  campaign: string;
  date: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number | null;
  conv: number;
  convValue: number;
};
type ApiResp = { rows: Row[]; warnings: string[]; period: string; updatedAt: string };

type MetricKey =
  | 'spend' | 'impressions' | 'clicks' | 'ctr' | 'cpc' | 'cpm'
  | 'conv' | 'cpa' | 'convValue' | 'roas' | 'reach' | 'frequency';

type Totals = {
  spend: number; impressions: number; clicks: number; conv: number;
  convValue: number; reach: number;
  ctr: number; cpc: number; cpm: number; cpa: number; roas: number; frequency: number;
};
type CampRow = Totals & { platform: Platform; name: string; reachNull: boolean };

/* ---------- formatação ---------- */
const fmtBRL = (n: number) => 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const fmtPct = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const fmtNum = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METRICS: Record<MetricKey, { label: string; fmt: (n: number) => string }> = {
  spend: { label: 'Investimento', fmt: fmtBRL },
  impressions: { label: 'Impressões', fmt: fmtInt },
  clicks: { label: 'Cliques', fmt: fmtInt },
  ctr: { label: 'CTR', fmt: fmtPct },
  cpc: { label: 'CPC', fmt: fmtBRL },
  cpm: { label: 'CPM', fmt: fmtBRL },
  conv: { label: 'Conversões', fmt: fmtInt },
  cpa: { label: 'Custo/conv.', fmt: fmtBRL },
  convValue: { label: 'Valor conv.', fmt: fmtBRL },
  roas: { label: 'ROAS', fmt: (n) => fmtNum(n) + 'x' },
  reach: { label: 'Alcance', fmt: fmtInt },
  frequency: { label: 'Frequência', fmt: fmtNum },
};
const ALL_KEYS = Object.keys(METRICS) as MetricKey[];
const DEFAULT_SEL: MetricKey[] = ['spend', 'impressions', 'clicks', 'ctr', 'cpc', 'conv', 'cpa'];

/* ---------- agregação ---------- */
function derive(t: Totals): Totals {
  t.ctr = t.impressions ? (t.clicks / t.impressions) * 100 : 0;
  t.cpc = t.clicks ? t.spend / t.clicks : 0;
  t.cpm = t.impressions ? (t.spend / t.impressions) * 1000 : 0;
  t.cpa = t.conv ? t.spend / t.conv : 0;
  t.roas = t.spend ? t.convValue / t.spend : 0;
  t.frequency = t.reach ? t.impressions / t.reach : 0;
  return t;
}
function emptyTotals(): Totals {
  return { spend: 0, impressions: 0, clicks: 0, conv: 0, convValue: 0, reach: 0, ctr: 0, cpc: 0, cpm: 0, cpa: 0, roas: 0, frequency: 0 };
}
function totals(rows: Row[]): Totals {
  const t = emptyTotals();
  for (const r of rows) {
    t.spend += r.spend; t.impressions += r.impressions; t.clicks += r.clicks;
    t.conv += r.conv; t.convValue += r.convValue; t.reach += r.reach ?? 0;
  }
  return derive(t);
}
function campaignRows(rows: Row[]): CampRow[] {
  const map = new Map<string, { platform: Platform; name: string; t: Totals; anyReach: boolean }>();
  for (const r of rows) {
    const key = r.platform + '||' + r.campaign;
    let e = map.get(key);
    if (!e) { e = { platform: r.platform, name: r.campaign, t: emptyTotals(), anyReach: false }; map.set(key, e); }
    e.t.spend += r.spend; e.t.impressions += r.impressions; e.t.clicks += r.clicks;
    e.t.conv += r.conv; e.t.convValue += r.convValue;
    if (r.reach != null) { e.t.reach += r.reach; e.anyReach = true; }
  }
  return Array.from(map.values()).map((e) => ({ ...derive(e.t), platform: e.platform, name: e.name, reachNull: !e.anyReach }));
}
function dailyByMetric(rows: Row[], metric: 'spend' | 'clicks' | 'impressions' | 'conv'): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (!r.date) continue;
    m.set(r.date, (m.get(r.date) ?? 0) + r[metric]);
  }
  return m;
}

const pctStr = (n: number) => (n * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + '%';

/* ---------- gráfico SVG ---------- */
function TrendChart({ meta, google, money }: { meta: Map<string, number>; google: Map<string, number>; money: boolean }) {
  const dates = Array.from(new Set([...meta.keys(), ...google.keys()])).sort();
  if (dates.length === 0) return <div className="text-muted text-sm py-10 text-center">Sem dados diários no período.</div>;
  const W = 720, H = 240, padL = 48, padR = 12, padT = 12, padB = 24;
  const max = Math.max(1, ...dates.map((d) => Math.max(meta.get(d) ?? 0, google.get(d) ?? 0)));
  const x = (i: number) => padL + (dates.length === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (dates.length - 1));
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const path = (m: Map<string, number>) => dates.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(m.get(d) ?? 0).toFixed(1)}`).join(' ');
  const ticks = [0, max / 2, max];
  const fmtTick = (v: number) => (money ? 'R$ ' + Math.round(v).toLocaleString('pt-BR') : Math.round(v).toLocaleString('pt-BR'));
  const lbl = (d: string) => d.slice(8) + '/' + d.slice(5, 7);
  const step = Math.ceil(dates.length / 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 240 }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.12} />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="currentColor" fillOpacity={0.5}>{fmtTick(t)}</text>
        </g>
      ))}
      {dates.map((d, i) => (i % step === 0 ? (
        <text key={d} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity={0.5}>{lbl(d)}</text>
      ) : null))}
      <path d={path(google)} fill="none" stroke="#FF6B35" strokeWidth={2} />
      <path d={path(meta)} fill="none" stroke="#3b82f6" strokeWidth={2} />
    </svg>
  );
}

/* ---------- componente principal ---------- */
const PERIOD_LABEL: Record<string, string> = { last_7d: '7 dias', last_30d: '30 dias', last_90d: '90 dias' };

export default function TrafegoClient() {
  const [period, setPeriod] = useState('last_30d');
  const [data, setData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selMetrics, setSelMetrics] = useState<MetricKey[]>(DEFAULT_SEL);
  const [plats, setPlats] = useState<Record<Platform, boolean>>({ Meta: true, Google: true });
  const [search, setSearch] = useState('');
  const [minSpend, setMinSpend] = useState(0);
  const [chartMetric, setChartMetric] = useState<'spend' | 'clicks' | 'impressions' | 'conv'>('spend');
  const [sortKey, setSortKey] = useState<MetricKey | 'name' | 'platform'>('spend');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  useEffect(() => {
    try {
      const m = localStorage.getItem('tp_metrics');
      if (m) setSelMetrics(JSON.parse(m));
      const p = localStorage.getItem('tp_period');
      if (p) setPeriod(p);
    } catch { /* ignore */ }
  }, []);

  async function load(p: string, refresh: boolean) {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/trafego?period=${p}${refresh ? '&refresh=1' : ''}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao buscar dados (' + res.status + ')');
      const json: ApiResp = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(period, false); /* eslint-disable-next-line */ }, [period]);

  const allRows = data?.rows ?? [];
  const filtered = useMemo(() => allRows.filter((r) =>
    plats[r.platform] && r.spend >= minSpend &&
    (!search || r.campaign.toLowerCase().includes(search.toLowerCase()))
  ), [allRows, plats, minSpend, search]);

  const camp = useMemo(() => campaignRows(filtered), [filtered]);
  const tot = useMemo(() => totals(filtered), [filtered]);
  const metaTot = useMemo(() => totals(filtered.filter((r) => r.platform === 'Meta')), [filtered]);
  const googTot = useMemo(() => totals(filtered.filter((r) => r.platform === 'Google')), [filtered]);

  const metaDaily = useMemo(() => dailyByMetric(plats.Meta ? filtered.filter((r) => r.platform === 'Meta') : [], chartMetric), [filtered, plats, chartMetric]);
  const googDaily = useMemo(() => dailyByMetric(plats.Google ? filtered.filter((r) => r.platform === 'Google') : [], chartMetric), [filtered, plats, chartMetric]);

  const sortedCamp = useMemo(() => {
    const arr = [...camp];
    arr.sort((a, b) => {
      const k = sortKey;
      if (k === 'name' || k === 'platform') {
        const x = String(a[k]).toLowerCase(), y = String(b[k]).toLowerCase();
        return x < y ? -sortDir : x > y ? sortDir : 0;
      }
      return ((a[k] as number) - (b[k] as number)) * sortDir;
    });
    return arr;
  }, [camp, sortKey, sortDir]);

  function toggleMetric(k: MetricKey) {
    setSelMetrics((prev) => {
      let next = prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k];
      if (next.length === 0) next = [k];
      next = ALL_KEYS.filter((x) => next.includes(x));
      try { localStorage.setItem('tp_metrics', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function togglePlat(p: Platform) {
    setPlats((prev) => {
      const next = { ...prev, [p]: !prev[p] };
      if (!next.Meta && !next.Google) return prev;
      return next;
    });
  }
  function changePeriod(p: string) {
    setPeriod(p);
    try { localStorage.setItem('tp_period', p); } catch { /* ignore */ }
  }
  function clickHead(k: MetricKey | 'name' | 'platform') {
    if (k === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(k); setSortDir(k === 'name' || k === 'platform' ? 1 : -1); }
  }

  const insights = useMemo(() => buildInsights(filtered, tot, metaDaily, googDaily, plats), [filtered, tot, metaDaily, googDaily, plats]);

  const updated = data ? new Date(data.updatedAt).toLocaleString('pt-BR') : '';

  return (
    <div className="pb-16">
      <section className="glass-strong rounded-card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-2">Marketing</p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">Tráfego Pago</h2>
            <p className="text-muted text-sm mt-1">Meta Ads + Google Ads em um só painel.</p>
          </div>
          <button onClick={() => load(period, true)} disabled={loading} className="btn-accent text-sm disabled:opacity-60">
            {loading ? 'Atualizando…' : 'Atualizar dados'}
          </button>
        </div>
      </section>

      {/* controles */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="glass rounded-full p-1 flex">
          {(['last_7d', 'last_30d', 'last_90d'] as const).map((p) => (
            <button key={p} onClick={() => changePeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${period === p ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'text-muted'}`}>
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted ml-auto">{updated ? 'Atualizado ' + updated : ''}</span>
      </div>

      {/* filtros */}
      <div className="glass rounded-soft p-3 mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold mr-1">Plataforma</span>
        {(['Meta', 'Google'] as const).map((p) => (
          <button key={p} onClick={() => togglePlat(p)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${plats[p] ? 'bg-ink text-cream dark:bg-cream dark:text-ink border-transparent' : 'border-black/15 dark:border-white/15 text-muted'}`}>
            {p}
          </button>
        ))}
        <span className="w-2" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="buscar campanha…"
          className="input-glass !w-44 !py-1.5 !px-3 !rounded-full text-sm" />
        <input type="number" min={0} step={10} value={minSpend || ''} onChange={(e) => setMinSpend(Number(e.target.value) || 0)}
          placeholder="gasto mín." className="input-glass !w-32 !py-1.5 !px-3 !rounded-full text-sm" />
        {(search || minSpend > 0) && (
          <button onClick={() => { setSearch(''); setMinSpend(0); }} className="text-xs text-muted underline">limpar</button>
        )}
      </div>

      {/* métricas */}
      <div className="glass rounded-soft p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold mr-1">Métricas</span>
        {ALL_KEYS.map((k) => (
          <button key={k} onClick={() => toggleMetric(k)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${selMetrics.includes(k) ? 'bg-accent text-white border-transparent' : 'border-black/15 dark:border-white/15 text-muted'}`}>
            {METRICS[k].label}
          </button>
        ))}
      </div>

      {error && <div className="glass rounded-soft p-3 mb-4 text-sm border-l-4 border-accent">Erro: {error}</div>}
      {data?.warnings && data.warnings.length > 0 && (
        <div className="glass rounded-soft p-3 mb-4 text-sm border-l-4 border-accent">Aviso: {data.warnings.join(' · ')}</div>
      )}
      <p className="text-xs text-muted mb-4">
        Mostrando {filtered.length} de {allRows.length} linha(s).
        {search ? ` Busca: "${search}".` : ''}{minSpend ? ` Gasto ≥ ${fmtBRL(minSpend)}.` : ''}
      </p>

      {/* cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {selMetrics.map((k) => (
          <div key={k} className="glass rounded-soft p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{METRICS[k].label}</p>
            <p className="text-xl font-bold mt-1">{METRICS[k].fmt((tot as Totals)[k])}</p>
          </div>
        ))}
      </div>

      {/* insights */}
      <h3 className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">O que os dados estão dizendo</h3>
      <div className="grid gap-2 mb-6">
        {insights.map((i, idx) => (
          <div key={idx} className="glass rounded-soft p-3 text-sm" style={{ borderLeft: `4px solid ${i.color}` }}
            dangerouslySetInnerHTML={{ __html: i.html }} />
        ))}
      </div>

      {/* gráfico */}
      <div className="glass rounded-card p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">{METRICS[chartMetric as MetricKey].label} por dia</h3>
          <select value={chartMetric} onChange={(e) => setChartMetric(e.target.value as 'spend' | 'clicks' | 'impressions' | 'conv')}
            className="input-glass !w-auto !py-1.5 !px-3 !rounded-full text-sm">
            <option value="spend">Investimento</option>
            <option value="clicks">Cliques</option>
            <option value="impressions">Impressões</option>
            <option value="conv">Conversões</option>
          </select>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted mb-1">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: '#3b82f6' }} /> Meta</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 inline-block" style={{ background: '#FF6B35' }} /> Google</span>
        </div>
        <TrendChart meta={metaDaily} google={googDaily} money={chartMetric === 'spend'} />
      </div>

      {/* comparação por plataforma */}
      <h3 className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Comparação por plataforma</h3>
      <div className="glass rounded-card overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-[11px] uppercase tracking-wider">
              <th className="text-left p-3">Plataforma</th>
              {selMetrics.map((k) => <th key={k} className="text-right p-3">{METRICS[k].label}</th>)}
            </tr>
          </thead>
          <tbody>
            {plats.Meta && <PlatRow label="Meta" t={metaTot} sel={selMetrics} />}
            {plats.Google && <PlatRow label="Google" t={googTot} sel={selMetrics} />}
            <tr className="font-bold border-t border-black/10 dark:border-white/10">
              <td className="p-3">Total</td>
              {selMetrics.map((k) => <td key={k} className="text-right p-3">{METRICS[k].fmt((tot as Totals)[k])}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* campanhas */}
      <h3 className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Campanhas</h3>
      <div className="glass rounded-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-[11px] uppercase tracking-wider">
              <th className="text-left p-3 cursor-pointer" onClick={() => clickHead('platform')}>Plat.</th>
              <th className="text-left p-3 cursor-pointer" onClick={() => clickHead('name')}>Campanha</th>
              {selMetrics.map((k) => (
                <th key={k} className="text-right p-3 cursor-pointer whitespace-nowrap" onClick={() => clickHead(k)}>{METRICS[k].label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCamp.length === 0 ? (
              <tr><td colSpan={selMetrics.length + 2} className="text-center text-muted p-5">Nenhuma campanha com os filtros atuais.</td></tr>
            ) : sortedCamp.map((r, i) => (
              <tr key={i} className="border-t border-black/5 dark:border-white/5">
                <td className="p-3"><PlatPill p={r.platform} /></td>
                <td className="p-3 max-w-[260px] truncate" title={r.name}>{r.name}</td>
                {selMetrics.map((k) => (
                  <td key={k} className="text-right p-3 whitespace-nowrap">
                    {k === 'reach' && r.reachNull ? <span className="text-muted">—</span>
                      : k === 'convValue' && r.platform === 'Meta' ? <span className="text-muted">—</span>
                      : k === 'roas' && r.platform === 'Meta' ? <span className="text-muted">—</span>
                      : k === 'frequency' && r.reachNull ? <span className="text-muted">—</span>
                      : METRICS[k].fmt((r as Totals)[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted mt-6">
        Dados via Windsor.ai. Clique em “Atualizar dados” para forçar a busca mais recente. {updated ? 'Última atualização: ' + updated + '.' : ''}
      </p>
    </div>
  );
}

function PlatPill({ p }: { p: Platform }) {
  const cls = p === 'Meta' ? 'bg-blue-500/15 text-blue-500' : 'bg-accent/15 text-accent';
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{p}</span>;
}
function PlatRow({ label, t, sel }: { label: Platform; t: Totals; sel: MetricKey[] }) {
  return (
    <tr className="border-t border-black/5 dark:border-white/5">
      <td className="p-3"><PlatPill p={label} /></td>
      {sel.map((k) => <td key={k} className="text-right p-3 whitespace-nowrap">{METRICS[k].fmt(t[k])}</td>)}
    </tr>
  );
}

/* ---------- insights ---------- */
type Insight = { color: string; html: string };
function buildInsights(rows: Row[], tot: Totals, metaDaily: Map<string, number>, googDaily: Map<string, number>, plats: Record<Platform, boolean>): Insight[] {
  const C = { info: '#3b82f6', good: '#22c55e', alert: '#FF6B35', warn: '#eab308' };
  const out: Insight[] = [];
  if (rows.length === 0) return [{ color: C.info, html: 'Sem dados para os filtros atuais.' }];
  const camp = campaignRows(rows);
  const meta = totals(rows.filter((r) => r.platform === 'Meta'));
  const goog = totals(rows.filter((r) => r.platform === 'Google'));

  if (meta.spend > 0 && goog.spend > 0)
    out.push({ color: C.info, html: `Investimento: <b>${fmtBRL(tot.spend)}</b> no total — ${pctStr(meta.spend / tot.spend)} no Meta, ${pctStr(goog.spend / tot.spend)} no Google.` });
  else
    out.push({ color: C.info, html: `Investimento total no período: <b>${fmtBRL(tot.spend)}</b>.` });

  const top = [...camp].sort((a, b) => b.spend - a.spend)[0];
  if (top && tot.spend > 0) out.push({ color: C.info, html: `Campanha que mais consome: <b>${esc(top.name)}</b> (${fmtBRL(top.spend)}, ${pctStr(top.spend / tot.spend)} do total).` });

  const withConv = camp.filter((r) => r.conv > 0);
  if (withConv.length) {
    const best = [...withConv].sort((a, b) => a.cpa - b.cpa)[0];
    out.push({ color: C.good, html: `Melhor custo por conversão: <b>${esc(best.name)}</b> a <b>${fmtBRL(best.cpa)}</b> (${fmtInt(best.conv)} conv.).` });
    const worst = [...withConv].sort((a, b) => b.cpa - a.cpa)[0];
    if (worst && worst !== best && worst.cpa > best.cpa * 1.5)
      out.push({ color: C.warn, html: `Mais caro por conversão: <b>${esc(worst.name)}</b> a ${fmtBRL(worst.cpa)} — ${(worst.cpa / best.cpa).toFixed(1)}x o melhor. Vale revisar.` });
  }

  const avg = tot.spend / camp.length;
  const waste = camp.filter((r) => r.conv === 0 && r.spend >= Math.max(avg, 20));
  if (waste.length) {
    const w = [...waste].sort((a, b) => b.spend - a.spend)[0];
    out.push({ color: C.alert, html: `Atenção: <b>${esc(w.name)}</b> gastou ${fmtBRL(w.spend)} sem nenhuma conversão registrada${waste.length > 1 ? ` (e mais ${waste.length - 1} na mesma situação)` : ''}.` });
  }

  const ctrRows = camp.filter((r) => r.impressions > 200);
  if (ctrRows.length > 1) {
    const bestC = [...ctrRows].sort((a, b) => b.ctr - a.ctr)[0];
    out.push({ color: C.good, html: `Maior engajamento (CTR): <b>${esc(bestC.name)}</b> com ${fmtPct(bestC.ctr)}.` });
  }

  const days = Array.from(new Set([...metaDaily.keys(), ...googDaily.keys()])).sort();
  if (days.length >= 4) {
    const sp = (d: string) => (metaDaily.get(d) ?? 0) + (googDaily.get(d) ?? 0);
    const half = Math.floor(days.length / 2);
    const a = days.slice(0, half).reduce((s, d) => s + sp(d), 0);
    const b = days.slice(half).reduce((s, d) => s + sp(d), 0);
    if (a > 0) {
      const ch = (b - a) / a;
      if (Math.abs(ch) >= 0.15) out.push({ color: ch > 0 ? C.info : C.warn, html: `Ritmo ${ch > 0 ? 'subindo' : 'caindo'} <b>${pctStr(Math.abs(ch))}</b> na 2ª metade do período vs a 1ª.` });
    }
    const peak = days.map((d) => [d, sp(d)] as const).sort((x, y) => y[1] - x[1])[0];
    if (peak && peak[1] > 0) out.push({ color: C.info, html: `Maior valor em um dia: ${peak[1].toLocaleString('pt-BR', { maximumFractionDigits: 0 })} em ${peak[0].slice(8)}/${peak[0].slice(5, 7)}.` });
  }
  return out;
}
function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}
