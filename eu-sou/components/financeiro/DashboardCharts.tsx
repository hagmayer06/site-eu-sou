'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { MesDado, CategoriaDado } from '@/lib/financeiroQueries'

const PIE_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#a855f7',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16',
]

type Props = {
  ultimosSeisMeses: MesDado[]
  entradasPorCategoria: CategoriaDado[]
}

function formatReaisBreve(centavos: number): string {
  const v = centavos / 100
  if (v >= 1000) return `R$${(v / 1000).toFixed(1)}k`
  return `R$${v.toFixed(0)}`
}

function formatReais(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardCharts({ ultimosSeisMeses, entradasPorCategoria }: Props) {
  const barData = ultimosSeisMeses.map(m => ({
    mes: m.mes,
    Entradas: +(m.entradas / 100).toFixed(2),
    Saídas: +(m.saidas / 100).toFixed(2),
  }))

  const pieData = entradasPorCategoria.map(c => ({
    name: c.categoria,
    value: +(c.valor / 100).toFixed(2),
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de barras: entradas vs saídas */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Entradas vs Saídas — últimos 6 meses
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              tickFormatter={formatReaisBreve}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: 12,
              }}
              labelStyle={{ color: '#fff', fontWeight: 700 }}
              formatter={(v) => formatReais(Number(v))}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Saídas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de pizza: entradas por categoria */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Entradas por categoria
        </h3>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-zinc-500 text-sm">
            Sem entradas registradas
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  (percent ?? 0) > 0.05 ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
                }
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                formatter={(v) => formatReais(Number(v))}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
