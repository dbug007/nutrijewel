import React, { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, ColumnChart, BarList, Funnel, StatTile, ChartCard,
  inrCompact, inrFull, intFull, shortDate,
} from './charts';

/*
 * The owner's dashboard. One filter row above everything it scopes; every chart
 * and tile re-renders against the same period, so the numbers always agree.
 *
 * Sales come from real orders. Visitor figures come from the site's own
 * cookie-free counts, which cover every visitor (see functions/api/track.js).
 * With no identifier, a visit is a page load that arrived from outside the site:
 * visits, not unique people, and the cards say so rather than overclaiming.
 */

/* "IN" -> "India". Falls back to the code where the browser has no names. */
let regionNames = null;
try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (_) { /* older browser */ }
const countryName = (code) => {
  if (!code || code === '??') return 'Unknown';
  try { return (regionNames && regionNames.of(code)) || code; } catch (_) { return code; }
};

const DEVICE_LABEL = { mobile: 'Phone', tablet: 'Tablet', desktop: 'Computer', unknown: 'Unknown' };
const oneDecimal = (n) => (Math.round(n * 10) / 10).toFixed(1);

const RANGES = [
  { days: 7, label: 'Last 7 days', short: '7 days' },
  { days: 30, label: 'Last 30 days', short: '30 days' },
  { days: 90, label: 'Last 90 days', short: '90 days' },
];

const STATUS_ORDER = ['paid', 'confirmed', 'packed', 'shipped', 'delivered', 'created', 'failed', 'cancelled', 'refunded'];
const STATUS_LABEL = {
  paid: 'Paid, new', confirmed: 'Confirmed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered',
  created: 'Awaiting payment', failed: 'Payment failed', cancelled: 'Cancelled', refunded: 'Refunded',
};

export default function Dashboard({ api }) {
  const [days, setDays] = useState(30);
  const [sales, setSales] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (d) => {
    setLoading(true); setError('');
    try {
      const [s, t] = await Promise.all([
        api(`/api/admin/analytics?days=${d}`),
        api(`/api/admin/traffic?days=${d}`).catch(() => null), // visitor data is optional
      ]);
      setSales(s);
      setTraffic(t && t.ok ? t : null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(days); }, [days, load]);

  const range = RANGES.find((r) => r.days === days);
  const period = `previous ${range.short}`;

  return (
    <div className={`njdash${loading && sales ? ' is-refreshing' : ''}`}>
      {/* The date range scopes everything below it, and sits above all of it. */}
      <nav className="njad-filters" aria-label="Date range">
        {RANGES.map((r) => (
          <button key={r.days} type="button" className={`njad-chip${days === r.days ? ' is-on' : ''}`}
            onClick={() => setDays(r.days)} aria-pressed={days === r.days}>{r.label}</button>
        ))}
      </nav>

      {error && <p className="njad-error">{error}</p>}
      {!sales && !error && <p className="njad-muted">Loading figures…</p>}

      {sales && (
        <>
          <section className="viz-stats" aria-label="Headline figures">
            <StatTile label="Revenue" value={inrFull(sales.current.revenuePaise)}
              current={sales.current.revenuePaise} previous={sales.previous.revenuePaise}
              periodName={period} spark={sales.series.map((d) => d.revenuePaise)} />
            <StatTile label="Paid orders" value={intFull(sales.current.orders)}
              current={sales.current.orders} previous={sales.previous.orders}
              periodName={period} spark={sales.series.map((d) => d.orders)} />
            <StatTile label="Average order" value={inrFull(sales.current.aovPaise)}
              current={sales.current.aovPaise} previous={sales.previous.aovPaise} periodName={period} />
            {traffic ? (
              <StatTile label="Conversion" value={`${traffic.conversionPct}%`}
                current={traffic.conversionPct} previous={traffic.previousConversionPct} periodName={period} />
            ) : (
              <div className="viz-stat">
                <span className="viz-stat-label">Conversion</span>
                <span className="viz-stat-value">n/a</span>
                <span className="viz-delta-vs">needs visitor data</span>
              </div>
            )}
          </section>

          <div className="viz-grid-2">
            <ChartCard
              title="Revenue" subtitle={`Per day, India time. ${range.label}.`}
              table={{ columns: ['Day', 'Revenue', 'Orders'], rows: sales.series.map((d) => [shortDate(d.day), inrFull(d.revenuePaise), d.orders]) }}
            >
              <AreaChart data={sales.series} valueKey="revenuePaise" formatAxis={(v) => inrCompact(v)}
                formatValue={inrFull} label={`Revenue per day, ${range.label}`}
                emptyText={`No paid orders in the ${range.label.toLowerCase()} yet.`} />
            </ChartCard>

            <ChartCard
              title="Paid orders" subtitle={`Per day. ${range.label}.`}
              table={{ columns: ['Day', 'Orders'], rows: sales.series.map((d) => [shortDate(d.day), d.orders]) }}
            >
              <ColumnChart data={sales.series} valueKey="orders" formatAxis={(v) => intFull(v)}
                formatValue={(v) => `${intFull(v)} order${v === 1 ? '' : 's'}`} label={`Paid orders per day, ${range.label}`}
                emptyText={`No paid orders in the ${range.label.toLowerCase()} yet.`} />
            </ChartCard>
          </div>

          <div className="viz-grid-2">
            <ChartCard
              title="Top products" subtitle="By revenue"
              table={{ columns: ['Product', 'Revenue', 'Units'], rows: sales.topProducts.map((p) => [p.name, inrFull(p.revenuePaise), p.units]) }}
            >
              {sales.topProducts.length ? (
                <BarList rows={sales.topProducts} valueKey="revenuePaise" formatValue={inrCompact}
                  subKey="units" subFormat={(u) => `${intFull(u)} sold`} />
              ) : <p className="njad-muted">No sales in this period yet.</p>}
            </ChartCard>

            <ChartCard title="Orders by status" subtitle="Everything created in this period">
              <ul className="njdash-status">
                {STATUS_ORDER.filter((s) => sales.statuses[s]).map((s) => (
                  <li key={s}><span>{STATUS_LABEL[s]}</span><strong>{intFull(sales.statuses[s])}</strong></li>
                ))}
                {!Object.keys(sales.statuses).length && <li className="njad-muted">No orders in this period.</li>}
              </ul>
            </ChartCard>
          </div>

          <h2 className="njdash-h">Visitors</h2>
          {!traffic && (
            <p className="njad-muted njdash-note">
              No visits recorded in the {range.label.toLowerCase()} yet. Every visitor is counted, without
              cookies, from the moment this counter went live.
            </p>
          )}
          {traffic && (
            <>
              <section className="viz-stats" aria-label="Visitor figures">
                <StatTile label="Visits" value={intFull(traffic.totals.visits)}
                  current={traffic.totals.visits} previous={traffic.previous.visits}
                  periodName={period} spark={traffic.series.map((d) => d.visits)} />
                <StatTile label="Page views" value={intFull(traffic.totals.views)}
                  current={traffic.totals.views} previous={traffic.previous.views}
                  periodName={period} spark={traffic.series.map((d) => d.views)} />
                <StatTile label="Pages per visit"
                  value={traffic.totals.visits ? oneDecimal(traffic.totals.views / traffic.totals.visits) : 'n/a'}
                  current={traffic.totals.visits ? traffic.totals.views / traffic.totals.visits : 0}
                  previous={traffic.previous.visits ? traffic.previous.views / traffic.previous.visits : 0}
                  periodName={period} />
                <div className="viz-stat">
                  <span className="viz-stat-label">On a phone</span>
                  <span className="viz-stat-value">
                    {`${(traffic.devices.find((d) => d.device === 'mobile') || { pct: 0 }).pct}%`}
                  </span>
                  <span className="viz-delta-vs">of visits</span>
                </div>
              </section>

              <div className="viz-grid-2">
                <ChartCard
                  title="Visits" subtitle={`Per day, India time. ${range.label}. Counted without cookies, so visits rather than unique people.`}
                  table={{ columns: ['Day', 'Visits', 'Page views'], rows: traffic.series.map((d) => [shortDate(d.day), d.visits, d.views]) }}
                >
                  <AreaChart data={traffic.series} valueKey="visits" formatAxis={(v) => intFull(v)}
                    formatValue={(v) => `${intFull(v)} visit${v === 1 ? '' : 's'}`} label={`Visits per day, ${range.label}`}
                    emptyText="No visits recorded yet." />
                </ChartCard>

                <ChartCard title="From visit to paid order" subtitle="Where people drop off"
                  table={{ columns: ['Step', 'Count'], rows: [
                    ['Visited', traffic.funnel.visits], ['Added to cart', traffic.funnel.carts],
                    ['Started checkout', traffic.funnel.checkouts], ['Paid', traffic.funnel.paid],
                  ] }}>
                  <Funnel stages={[
                    { label: 'Visited', value: traffic.funnel.visits },
                    { label: 'Added to cart', value: traffic.funnel.carts },
                    { label: 'Started checkout', value: traffic.funnel.checkouts },
                    { label: 'Paid', value: traffic.funnel.paid },
                  ]} />
                </ChartCard>
              </div>

              <div className="viz-grid-2">
                <ChartCard title="Top pages" subtitle="By page views"
                  table={{ columns: ['Page', 'Views'], rows: traffic.topPages.map((p) => [p.path, p.views]) }}>
                  <BarList rows={traffic.topPages} labelKey="path" valueKey="views" formatValue={intFull} />
                </ChartCard>
                <ChartCard title="Where visitors come from" subtitle="The site each visit arrived from"
                  table={{ columns: ['Source', 'Visits'], rows: traffic.referrers.map((r) => [r.source, r.visits]) }}>
                  <BarList rows={traffic.referrers} labelKey="source" valueKey="visits" formatValue={intFull} />
                </ChartCard>
              </div>

              <div className="viz-grid-2">
                <ChartCard title="Countries" subtitle="Where visits come from, by country"
                  table={{ columns: ['Country', 'Visits'], rows: traffic.countries.map((c) => [countryName(c.country), c.visits]) }}>
                  <BarList rows={traffic.countries.map((c) => ({ ...c, name: countryName(c.country) }))}
                    valueKey="visits" formatValue={intFull} />
                </ChartCard>
                <ChartCard title="Devices" subtitle="Share of visits"
                  table={{ columns: ['Device', 'Share'], rows: traffic.devices.map((d) => [DEVICE_LABEL[d.device] || d.device, `${d.pct}%`]) }}>
                  <BarList rows={traffic.devices.map((d) => ({ ...d, name: DEVICE_LABEL[d.device] || d.device }))}
                    valueKey="pct" formatValue={(v) => `${v}%`} />
                </ChartCard>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
