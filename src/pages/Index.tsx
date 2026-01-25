import { useState, useEffect } from 'react'
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
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'
import {
  getAggregatedSummary,
  getDepartmentPerformanceData,
  getEvolutionChartData,
} from '@/services/budget'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function Index() {
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [selectedProg, setSelectedProg] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [deptPerformance, setDeptPerformance] = useState<any[]>([])
  const [evolutionData, setEvolutionData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [sum, dept, evol] = await Promise.all([
          getAggregatedSummary(),
          getDepartmentPerformanceData(),
          getEvolutionChartData(),
        ])
        setSummary(sum)
        setDeptPerformance(dept)
        setEvolutionData(evol)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage > 70) return 'text-success bg-success/10 border-success/20'
    if (percentage >= 40) return 'text-warning bg-warning/10 border-warning/20'
    return 'text-danger bg-danger/10 border-danger/20 animate-pulse-slow'
  }

  const chartConfig = {
    pago: {
      label: 'Pago',
      color: 'hsl(var(--success))',
    },
    empenhado: {
      label: 'Empenhado',
      color: 'hsl(var(--primary))',
    },
    executionRate: {
      label: 'Liquidado vs Dotação',
      color: 'hsl(var(--success))',
    },
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">
          Carregando dados...
        </span>
      </div>
    )
  }

  // Handle empty state
  if (!summary || summary.dotacao === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-muted/20 rounded-lg border-2 border-dashed">
        <h2 className="text-2xl font-semibold mb-2">Sem dados orçamentários</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Ainda não existem registros no banco de dados. Acesse "Gestão
          Orçamentária" para adicionar novos dados.
        </p>
      </div>
    )
  }

  const summaryCards = [
    {
      title: 'Dotação Total',
      value: summary.dotacao,
      percentage: 100,
      isMain: true,
    },
    {
      title: 'Empenhado',
      value: summary.empenhado,
      percentage: summary.dotacao
        ? (summary.empenhado / summary.dotacao) * 100
        : 0,
    },
    {
      title: 'Liquidado',
      value: summary.liquidado,
      percentage: summary.dotacao
        ? (summary.liquidado / summary.dotacao) * 100
        : 0,
    },
    {
      title: 'Pago',
      value: summary.pago,
      percentage: summary.dotacao ? (summary.pago / summary.dotacao) * 100 : 0,
    },
    {
      title: 'Reservado',
      value: summary.reservado,
      percentage: summary.dotacao
        ? (summary.reservado / summary.dotacao) * 100
        : 0,
    },
    {
      title: 'Disponível',
      value: summary.disponivel,
      percentage: summary.dotacao
        ? (summary.disponivel / summary.dotacao) * 100
        : 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
            Órgão
          </label>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Órgão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Órgãos</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
            Programa de Trabalho
          </label>
          <Select value={selectedProg} onValueChange={setSelectedProg}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Programa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Programas</SelectItem>
              {PROGRAMS.map((prog) => (
                <SelectItem key={prog.id} value={prog.id}>
                  {prog.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className={cn(
              'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
              card.isMain
                ? 'bg-primary text-primary-foreground border-primary'
                : '',
            )}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium opacity-85">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold truncate">
                {formatCurrency(card.value)}
              </div>
              {!card.isMain && (
                <div
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2',
                    getStatusColor(card.percentage),
                  )}
                >
                  {card.percentage.toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block 2 - Execução por Órgão */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Execução por Órgão</CardTitle>
            <CardDescription>
              Top 10 órgãos por percentual liquidado vs dotação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {deptPerformance.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    accessibilityLayer
                    data={deptPerformance.slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      horizontal={true}
                      vertical={false}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <XAxis type="number" hide />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar
                      dataKey="executionRate"
                      layout="vertical"
                      fill="var(--color-executionRate)"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Sem dados para exibir
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Block 3 - Evolução Geral */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Evolução da Execução</CardTitle>
            <CardDescription>Acumulado por mês de registro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {evolutionData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <AreaChart
                    data={evolutionData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="fillEmpenhado"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-empenhado)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-empenhado)"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                      <linearGradient id="fillPago" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-pago)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-pago)"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$${(value / 1000000).toFixed(0)}M`
                      }
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={60}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      dataKey="empenhado"
                      type="natural"
                      fill="url(#fillEmpenhado)"
                      fillOpacity={0.4}
                      stroke="var(--color-empenhado)"
                      stackId="a"
                    />
                    <Area
                      dataKey="pago"
                      type="natural"
                      fill="url(#fillPago)"
                      fillOpacity={0.4}
                      stroke="var(--color-pago)"
                      stackId="b"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Adicione dados para ver a evolução
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
