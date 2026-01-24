import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTMENTS, INSTITUTIONAL_AXIS, PERIODS } from '@/lib/constants'
import { getDepartmentPerformance } from '@/lib/mockData'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

export default function DepartmentAnalysis() {
  const [selectedAxis, setSelectedAxis] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024')
  const [focusDept, setFocusDept] = useState<string>('')

  const deptData = getDepartmentPerformance().slice(0, 8) // Limit for demo

  const chartConfig = {
    dotacao: { label: 'Dotação', color: 'hsl(var(--muted-foreground))' },
    empenhado: { label: 'Empenhado', color: 'hsl(var(--primary))' },
    pago: { label: 'Pago', color: 'hsl(var(--success))' },
  }

  const focusDeptData = focusDept
    ? deptData.find((d) => d.id === focusDept)
    : deptData[0]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
            Eixo Institucional
          </label>
          <Select value={selectedAxis} onValueChange={setSelectedAxis}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Eixo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eixos</SelectItem>
              {INSTITUTIONAL_AXIS.map((axis) => (
                <SelectItem key={axis.id} value={axis.id}>
                  {axis.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
            Período
          </label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Período" />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Comparativo Financeiro</CardTitle>
              <CardDescription>
                Análise de Dotação vs Empenhado vs Pago por Órgão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    data={deptData}
                    margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$${(value / 1000000).toFixed(0)}M`
                      }
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tick={{ fontSize: 10 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="dotacao"
                      fill="var(--color-dotacao)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="empenhado"
                      fill="var(--color-empenhado)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="pago"
                      fill="var(--color-pago)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Órgão</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Selecione um órgão no gráfico ou abaixo para ver detalhes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={focusDept || deptData[0].id}
                onValueChange={setFocusDept}
              >
                <SelectTrigger className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deptData.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {focusDeptData && (
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm opacity-70">Nome Completo</p>
                    <p className="font-medium text-sm leading-tight mt-1">
                      {focusDeptData.fullName}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm opacity-70">Execução</p>
                      <p className="text-2xl font-bold">
                        {focusDeptData.executionRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-70">Gap</p>
                      <p className="text-2xl font-bold opacity-80">
                        {(100 - focusDeptData.executionRate).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {focusDeptData && focusDeptData.executionRate > 70
                ? 'Este órgão apresenta um excelente ritmo de execução orçamentária, superando a meta trimestral.'
                : 'Atenção: A execução orçamentária está abaixo do esperado para o período. Recomenda-se revisão dos processos de empenho.'}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
