import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = 'https://connectors.windsor.ai';
const PERIODS = new Set(['last_7d', 'last_30d', 'last_90d']);

type Row = {
  platform: 'Meta' | 'Google';
  campaign: string;
  date: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number | null;
  conv: number;
  convValue: number;
};

function num(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

async function windsor(
  connector: string,
  fields: string[],
  period: string,
  refresh: boolean,
): Promise<Record<string, unknown>[]> {
  const key = process.env.WINDSOR_API_KEY;
  if (!key) throw new Error('WINDSOR_API_KEY ausente no servidor');
  const params = new URLSearchParams({
    api_key: key,
    date_preset: period,
    fields: fields.join(','),
    _renderer: 'json',
  });
  if (refresh) params.set('force_refresh', 'true');
  const res = await fetch(`${BASE}/${connector}?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${t.slice(0, 140)}`);
  }
  const json: unknown = await res.json();
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  if (json && typeof json === 'object' && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: Record<string, unknown>[] }).data;
  }
  return [];
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'nao_autorizado' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  let period = sp.get('period') || 'last_30d';
  if (!PERIODS.has(period)) period = 'last_30d';
  const refresh = sp.get('refresh') === '1';

  const rows: Row[] = [];
  const warnings: string[] = [];

  try {
    const g = await windsor(
      'google_ads',
      ['campaign', 'date', 'spend', 'clicks', 'impressions', 'conversions', 'conversions_value'],
      period,
      refresh,
    );
    for (const r of g) {
      rows.push({
        platform: 'Google',
        campaign: String(r.campaign ?? '(sem nome)'),
        date: r.date ? String(r.date) : null,
        spend: num(r.spend),
        impressions: num(r.impressions),
        clicks: num(r.clicks),
        reach: null,
        conv: num(r.conversions),
        convValue: num(r.conversions_value),
      });
    }
  } catch (e) {
    warnings.push('Google: ' + (e instanceof Error ? e.message : String(e)));
  }

  try {
    const f = await windsor(
      'facebook',
      ['campaign', 'date', 'spend', 'clicks', 'impressions', 'reach', 'conversions'],
      period,
      refresh,
    );
    for (const r of f) {
      rows.push({
        platform: 'Meta',
        campaign: String(r.campaign ?? '(sem nome)'),
        date: r.date ? String(r.date) : null,
        spend: num(r.spend),
        impressions: num(r.impressions),
        clicks: num(r.clicks),
        reach: num(r.reach),
        conv: num(r.conversions),
        convValue: 0,
      });
    }
  } catch (e) {
    warnings.push('Meta: ' + (e instanceof Error ? e.message : String(e)));
  }

  return NextResponse.json(
    { rows, warnings, period, updatedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
