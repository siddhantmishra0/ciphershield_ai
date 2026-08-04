import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Legend, AreaChart, Area
} from 'recharts';

const COLORS = {
  green: '#00ff80',
  cyan: '#00c8ff',
  purple: '#9333ea',
  blue: '#3b82f6',
  yellow: '#eab308',
  red: '#ef4444',
};

const tooltipStyle = {
  backgroundColor: 'rgba(5,13,26,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
};

// Histogram Chart
export function HistogramChart({ data, color = 'green', title }) {
  const chartData = data?.map((v, i) => ({ x: i, y: v })) || [];
  const c = COLORS[color] || COLORS.green;
  return (
    <div>
      {title && <p className="text-xs text-gray-400 font-mono mb-2">{title}</p>}
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: -30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="x" tick={{ fill: '#6b7280', fontSize: 9 }} interval={63} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'Count']} />
          <Bar dataKey="y" fill={c} opacity={0.8} radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart (time series)
export function CipherLineChart({ data, lines, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {lines.map(({ key, color, name }) => (
          <Line key={key} type="monotone" dataKey={key} stroke={COLORS[color] || color} name={name || key} strokeWidth={2} dot={{ r: 4, fill: COLORS[color] || color }} activeDot={{ r: 6 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Radar Chart
export function CipherRadarChart({ data, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
        <Radar name="Score" dataKey="value" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.15} strokeWidth={2} />
        <Radar name="Ideal" dataKey="ideal" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 4" />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Area Chart
export function CipherAreaChart({ data, areas, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          {areas.map(({ key, color }) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[color] || color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS[color] || color} stopOpacity={0.0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {areas.map(({ key, color, name }) => (
          <Area key={key} type="monotone" dataKey={key} stroke={COLORS[color] || color} fill={`url(#grad-${key})`} name={name || key} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Bar comparison chart
export function ComparisonBarChart({ data, bars, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {bars.map(({ key, color, name }) => (
          <Bar key={key} dataKey={key} fill={COLORS[color] || color} name={name || key} radius={[4, 4, 0, 0]} opacity={0.85} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
