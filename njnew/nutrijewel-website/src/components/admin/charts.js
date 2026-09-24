import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './charts.css';

/*
 * Admin charts, hand-drawn in SVG.
 *
 * Specs follow the house data-viz rules: 2px lines, bars no thicker than 24px
 * with a 4px rounded data end and a square baseline, a 2px surface gap between
 * adjacent bars, a 10% area wash, solid hairline gridlines, markers of at least
 * 8px with a 2px surface ring, and a crosshair that snaps to the nearest point.
 *
 * Charts draw at their real pixel width rather than scaling a fixed viewBox,
 * because scaling shrinks the text too: 12px labels became about 7px on a 375px
 * phone. Colours are CSS custom properties, validated for both light and dark in
 * charts.css. Labels are inserted as text, never as HTML.
 */

/* ---------- formatting ---------- */

// Indian grouping and units: 1,50,000 is 1.5L, not 150K.
export function inrCompact(paise) {
  const r = (paise || 0) / 100;
  const a = Math.abs(r);
  if (a >= 1e7) return `₹${(r / 1e7).toFixed(a >= 1e8 ? 0 : 1).replace(/\.0$/, '')}Cr`;
  if (a >= 1e5) return `₹${(r / 1e5).toFixed(a >= 1e6 ? 0 : 1).replace(/\.0$/, '')}L`;
  if (a >= 1e3) return `₹${(r / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '')}K`;
  return `₹${Math.round(r)}`;
}
export const inrFull = (paise) => `₹${Math.round((paise || 0) / 100).toLocaleString('en-IN')}`;
export const intFull = (n) => (n || 0).toLocaleString('en-IN');

export function shortDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

/* Clean ticks: 0 / 500 / 1,000, never 0 / 437 / 874. */
export function niceTicks(maxVal, count = 4) {
  if (!(maxVal > 0)) return [0, 1];
  const raw = maxVal / count;
  const exp = 10 ** Math.floor(Math.log10(raw));
  const f = raw / exp;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
  const top = Math.ceil(maxVal / step) * step;
  const ticks = [];
  for (let t = 0; t <= top + step * 1e-6; t += step) ticks.push(Math.round(t * 1e6) / 1e6);
  return ticks;
}

/* ---------- measuring ---------- */

function useWidth(fallback = 320) {
  const ref = useRef(null);
  const [w, setW] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setW(Math.max(200, Math.floor(el.getBoundingClientRect().width)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/* ---------- tooltip ---------- */

function Tooltip({ x, y, width, lines }) {
  if (!lines) return null;
  // Keep it inside the card on a narrow phone.
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div className="viz-tip" style={{ left, top: y }} role="status">
      {lines.map((l, i) => (
        <div key={i} className={i === 0 ? 'viz-tip-value' : 'viz-tip-label'}>
          {i === 0 && <span className="viz-tip-key" aria-hidden="true" />}
          {l}
        </div>
      ))}
    </div>
  );
}

/* ---------- area chart: one series over time, crosshair + tooltip ---------- */

export function AreaChart({ data, valueKey, formatAxis, formatValue, label, height = 200 }) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const pad = { top: 14, right: 14, bottom: 26, left: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const values = data.map((d) => d[valueKey] || 0);
  const ticks = useMemo(() => niceTicks(Math.max(...values, 0)), [values.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = ticks[ticks.length - 1] || 1;
  const n = data.length;
  const xAt = (i) => pad.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (v) => pad.top + plotH - (v / top) * plotH;

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(d[valueKey] || 0).toFixed(1)}`).join(' ');
  const area = n ? `${line} L${xAt(n - 1).toFixed(1)},${yAt(0)} L${xAt(0).toFixed(1)},${yAt(0)} Z` : '';

  const pick = (clientX) => {
    const box = ref.current.getBoundingClientRect();
    const px = clientX - box.left - pad.left;
    const i = Math.round((px / plotW) * (n - 1));
    setActive(Math.max(0, Math.min(n - 1, i)));
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setActive((a) => Math.min(n - 1, a == null ? n - 1 : a + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setActive((a) => Math.max(0, a == null ? n - 1 : a - 1)); }
    if (e.key === 'Escape') setActive(null);
  };

  // A handful of x labels, never one per day: the first, the last, and a middle.
  const xLabelIdx = n <= 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1];
  const a = active != null ? data[active] : null;

  return (
    <div className="viz-wrap" ref={ref}>
      <svg
        width={width} height={height} className="viz-svg" role="img" aria-label={label}
        tabIndex={0} onKeyDown={onKey}
        onPointerMove={(e) => pick(e.clientX)} onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="viz-grid" x1={pad.left} x2={width - pad.right} y1={yAt(t)} y2={yAt(t)} />
            <text className="viz-axis" x={pad.left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle">{formatAxis(t)}</text>
          </g>
        ))}
        {xLabelIdx.map((i) => (
          <text key={i} className="viz-axis" x={xAt(i)} y={height - 6}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{shortDate(data[i].day)}</text>
        ))}
        <path className="viz-area" d={area} />
        <path className="viz-line" d={line} />
        {n > 0 && !a && (
          <circle className="viz-dot" cx={xAt(n - 1)} cy={yAt(data[n - 1][valueKey] || 0)} r={4} />
        )}
        {a && (
          <g>
            <line className="viz-crosshair" x1={xAt(active)} x2={xAt(active)} y1={pad.top} y2={pad.top + plotH} />
            <circle className="viz-dot" cx={xAt(active)} cy={yAt(a[valueKey] || 0)} r={4} />
          </g>
        )}
      </svg>
      {a && <Tooltip x={xAt(active)} y={pad.top} width={width} lines={[formatValue(a[valueKey] || 0), shortDate(a.day)]} />}
    </div>
  );
}

/* ---------- column chart: one bar per day, per-bar hit target ---------- */

export function ColumnChart({ data, valueKey, formatAxis, formatValue, label, height = 170 }) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const pad = { top: 14, right: 14, bottom: 26, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const n = data.length;
  const values = data.map((d) => d[valueKey] || 0);
  const ticks = useMemo(() => niceTicks(Math.max(...values, 0)), [values.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const top = ticks[ticks.length - 1] || 1;
  const slot = plotW / Math.max(n, 1);
  const GAP = 2; // the surface gap between touching bars
  const barW = Math.max(1, Math.min(24, slot - GAP));
  const yAt = (v) => pad.top + plotH - (v / top) * plotH;

  /* Rounded data end, square baseline: only the top corners curve. */
  const barPath = (x, y, w, h) => {
    if (h <= 0) return '';
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
  };

  const xLabelIdx = n <= 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1];
  const a = active != null ? data[active] : null;

  return (
    <div className="viz-wrap" ref={ref}>
      <svg width={width} height={height} className="viz-svg" role="img" aria-label={label}
        onPointerLeave={() => setActive(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="viz-grid" x1={pad.left} x2={width - pad.right} y1={yAt(t)} y2={yAt(t)} />
            <text className="viz-axis" x={pad.left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle">{formatAxis(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const v = d[valueKey] || 0;
          const x = pad.left + i * slot + (slot - barW) / 2;
          const y = yAt(v);
          return (
            <g key={d.day}>
              <path className={`viz-bar${active === i ? ' is-active' : ''}`} d={barPath(x, y, barW, pad.top + plotH - y)} />
              {/* The hit target is the whole column slot, far bigger than a thin bar. */}
              <rect className="viz-hit" x={pad.left + i * slot} y={pad.top} width={slot} height={plotH}
                tabIndex={0} aria-label={`${shortDate(d.day)}: ${formatValue(v)}`}
                onPointerEnter={() => setActive(i)} onPointerDown={() => setActive(i)}
                onFocus={() => setActive(i)} onBlur={() => setActive(null)} />
            </g>
          );
        })}
        {xLabelIdx.map((i) => (
          <text key={i} className="viz-axis" x={pad.left + i * slot + slot / 2} y={height - 6}
            textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{shortDate(data[i].day)}</text>
        ))}
      </svg>
      {a && <Tooltip x={pad.left + active * slot + slot / 2} y={pad.top} width={width}
        lines={[formatValue(a[valueKey] || 0), shortDate(a.day)]} />}
    </div>
  );
}

/* ---------- horizontal bar list: nominal categories, ONE colour ---------- */

/* Products have no natural order, so every bar is the same colour. Colouring
   them darker-where-bigger would double-encode length as hue, a documented
   anti-pattern. HTML rather than SVG so long product names wrap cleanly. */
export function BarList({ rows, valueKey, formatValue, labelKey = 'name', subKey, subFormat }) {
  const max = Math.max(...rows.map((r) => r[valueKey] || 0), 1);
  return (
    <ul className="viz-barlist">
      {rows.map((r) => {
        const pct = Math.max(1.5, ((r[valueKey] || 0) / max) * 100);
        return (
          <li key={r[labelKey]} className="viz-barrow" tabIndex={0}
            aria-label={`${r[labelKey]}: ${formatValue(r[valueKey])}`}>
            <span className="viz-barname">{r[labelKey]}</span>
            <span className="viz-bartrack">
              <span className="viz-barfill" style={{ width: `${pct * 0.8}%` }} />
              <span className="viz-barvalue">{formatValue(r[valueKey])}</span>
            </span>
            {subKey && <span className="viz-barsub">{subFormat ? subFormat(r[subKey]) : r[subKey]}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- funnel: ordered stages, validated ordinal ramp ---------- */

export function Funnel({ stages }) {
  const top = Math.max(stages[0] ? stages[0].value : 0, 1);
  return (
    <ol className="viz-funnel">
      {stages.map((s, i) => {
        const pct = Math.max(1.5, (s.value / top) * 100);
        const ofPrev = i === 0 || !stages[i - 1].value ? null : Math.round((s.value / stages[i - 1].value) * 1000) / 10;
        return (
          <li key={s.label} className="viz-fstage" tabIndex={0}
            aria-label={`${s.label}: ${intFull(s.value)}${ofPrev != null ? `, ${ofPrev}% of the previous step` : ''}`}>
            <span className="viz-barname">{s.label}</span>
            <span className="viz-bartrack">
              <span className={`viz-barfill viz-fstep-${i + 1}`} style={{ width: `${pct * 0.8}%` }} />
              <span className="viz-barvalue">{intFull(s.value)}</span>
            </span>
            <span className="viz-barsub">{ofPrev != null ? `${ofPrev}% of previous` : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- sparkline for stat tiles ---------- */

export function Sparkline({ values, width = 96, height = 28 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const n = values.length;
  const xAt = (i) => 2 + (i / (n - 1)) * (width - 4);
  const yAt = (v) => height - 3 - (v / max) * (height - 6);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} className="viz-spark" aria-hidden="true">
      <path d={d} className="viz-spark-line" />
      <circle cx={xAt(n - 1)} cy={yAt(values[n - 1])} r={2.5} className="viz-spark-end" />
    </svg>
  );
}

/* ---------- stat tile ---------- */

/* Signed change against a named period. Identity is never colour alone: the
   sign and the arrow are text; colour only reinforces them. */
export function StatTile({ label, value, current, previous, periodName, upIsGood = true, spark }) {
  let delta = null;
  if (previous > 0) {
    const pct = Math.round(((current - previous) / previous) * 1000) / 10;
    const good = pct === 0 ? null : (pct > 0) === upIsGood;
    delta = { pct, good };
  }
  return (
    <div className="viz-stat">
      <span className="viz-stat-label">{label}</span>
      <span className="viz-stat-value">{value}</span>
      <span className="viz-stat-foot">
        {delta ? (
          <span className={`viz-delta${delta.good === true ? ' is-good' : delta.good === false ? ' is-bad' : ''}`}>
            <span aria-hidden="true">{delta.pct > 0 ? '▲' : delta.pct < 0 ? '▼' : '•'}</span>
            {' '}{delta.pct > 0 ? '+' : ''}{delta.pct}% <span className="viz-delta-vs">vs {periodName}</span>
          </span>
        ) : (
          <span className="viz-delta-vs">{previous === 0 && current > 0 ? `new this period` : `no earlier data`}</span>
        )}
        {spark && <Sparkline values={spark} />}
      </span>
    </div>
  );
}

/* ---------- card with a chart / table toggle ---------- */

/* Every chart has a table twin, so no value is reachable only by hovering. */
export function ChartCard({ title, subtitle, table, children }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className="viz-card">
      <header className="viz-card-head">
        <div>
          <h3 className="viz-card-title">{title}</h3>
          {subtitle && <p className="viz-card-sub">{subtitle}</p>}
        </div>
        {table && (
          <button type="button" className="viz-toggle" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable}>
            {asTable ? 'Chart' : 'Table'}
          </button>
        )}
      </header>
      {asTable && table ? (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead><tr>{table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : children}
    </section>
  );
}
