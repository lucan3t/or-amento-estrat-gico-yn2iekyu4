import { useState, useEffect, useCallback, useMemo } from 'react'
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
  type BudgetSummary,
} from '@/services/budget'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Line,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Area,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { MultiSelect, type Option } from '@/components/MultiSelect'
import { DateRangeFilter } from '@/components/DateRangeFilter'

export default function Index() {
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([])
  const [selectedProg, setSelectedProg] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{
    start: Date | undefined
    end: Date | undefined
  }>({ start: undefined, end: undefined })
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [deptPerformance, setDeptPerformance] = useState<any[]>([])
  const [evolutionData, setEvolutionData] = useState<any[]>([])

  // Prepare Department Options for MultiSelect
  const deptOptions = useMemo<Option[]>(
    () =>
      DEPARTMENTS.map((d) => ({
        label: d.name,
        value: d.id,
      })),
    [],
  )

  // Callback for date range filter to prevent infinite re-render loops
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange((prev) => {
      if (
        prev.start?.getTime() === start.getTime() &&
        prev.end?.getTime() === end.getTime()
      ) {
        return prev
      }
      return { start, end }
    })
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (!dateRange.start || !dateRange.end) return

      try {
        setLoading(true)
        const [sum, dept, evolution] = await Promise.all([
          getAggregatedSummary(
            selectedDeptIds,
            selectedProg,
            dateRange.start,
            dateRange.end,
          ),
          getDepartmentPerformanceData(
            dateRange.start,
            dateRange.end,
            selectedDeptIds,
            selectedProg,
          ),
          getEvolutionChartData(
            selectedDeptIds,
            selectedProg,
            dateRange.start,
            dateRange.end,
          ),
        ])
        setSummary(sum)
        setDeptPerformance(dept)
        setEvolutionData(evolution)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedDeptIds, selectedProg, dateRange])

  const formatCurrency = (value: number) => {
    const safeValue = isNaN(value) ? 0 : value
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(safeValue)
  }

  const getStatusColor = (percentage: number) => {
    if (isNaN(percentage)) return 'text-muted-foreground bg-muted'
    if (percentage > 70) return 'text-success bg-success/10 border-success/20'
    if (percentage >= 40) return 'text-warning bg-warning/10 border-warning/20'
    return 'text-danger bg-danger/10 border-danger/20 animate-pulse-slow'
  }

  const chartConfig = {
    dotacao: {
      label: 'Dotação',
      color: '#578FCA',
    },
    liquidado: {
      label: 'Liquidado',
      color: '#A1E3F9',
    },
    executionRate: {
      label: 'Liquidado vs Dotação',
      color: '#22c55e',
    },
  }

  const summaryCards = summary
    ? [
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
          percentage: summary.dotacao
            ? (summary.pago / summary.dotacao) * 100
            : 0,
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
    : []

  // Data for "Execução por Órgão" (Top 10 Rate)
  const topPerformers = useMemo(() => {
    return [...deptPerformance]
      .sort((a, b) => b.executionRate - a.executionRate)
      .slice(0, 10)
  }, [deptPerformance])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-lg shadow-sm border">
        <div className="w-full pb-2 border-b mb-2">
          <h3 className="text-sm font-semibold mb-3">Filtros de Período</h3>
          <DateRangeFilter
            onFilterChange={handleDateRangeChange}
            className="w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
              Órgão(s)
            </label>
            <MultiSelect
              options={deptOptions}
              selected={selectedDeptIds}
              onChange={setSelectedDeptIds}
              placeholder="Todos os Órgãos"
              className="w-full"
            />
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
      </div>

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-muted-foreground">
            Carregando dados...
          </span>
        </div>
      ) : !summary ||
        (summary.dotacao === 0 &&
          selectedDeptIds.length === 0 &&
          selectedProg === 'all') ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-muted/20 rounded-lg border-2 border-dashed">
          <h2 className="text-2xl font-semibold mb-2">
            Sem dados orçamentários
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Ainda não existem registros no banco de dados para os filtros
            selecionados.
          </p>
        </div>
      ) : (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {summaryCards.map((card, index) => (
              <Card
                key={index}
                className={cn(
                  'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
                  card.isMain
                    ? 'bg-blue-50 text-blue-900 border-blue-200 shadow-sm'
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
                      {isNaN(card.percentage)
                        ? '0.0'
                        : card.percentage.toFixed(1)}
                      %
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
                <div className="h-[400px]">
                  {topPerformers.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-full w-full"
                    >
                      <BarChart
                        accessibilityLayer
                        data={topPerformers}
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

            {/* Block 3 - Dotação vs Realizado (Temporal Evolution) */}
            <Card className="col-span-1 shadow-sm">
              <CardHeader>
                <CardTitle>Dotação Atualizada vs Realizado</CardTitle>
                <CardDescription>Comparativo por período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {evolutionData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-full w-full"
                    >
                      <ComposedChart
                        data={evolutionData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                        <XAxis
                          dataKey="date"
                          height={40}
                          tick={{ fontSize: 11 }}
                          tickMargin={10}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={(value) => {
                            if (value >= 1e9)
                              return `R$ ${(value / 1e9)
                                .toFixed(1)
                                .replace('.', ',')} bn`
                            if (value >= 1e6)
                              return `R$ ${(value / 1e6).toFixed(0)}M`
                            return `R$ ${value}`
                          }}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          width={65}
                          tick={{ fontSize: 11 }}
                        />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          // Sorting logic via itemSorter to ensure Dotação appears before Liquidado
                          itemSorter={(item) =>
                            item.name === 'Dotação' ? -1 : 1
                          }
                          content={
                            <ChartTooltipContent
                              indicator="dot"
                              formatter={(value) =>
                                new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(Number(value))
                              }
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area
                          type="monotone"
                          dataKey="liquidado"
                          fill="var(--color-liquidado)"
                          stroke="var(--color-liquidado)"
                          fillOpacity={0.6}
                          name="Liquidado"
                        />
                        <Line
                          type="monotone"
                          dataKey="dotacao"
                          stroke="var(--color-dotacao)"
                          strokeWidth={2}
                          dot={{ r: 3, strokeWidth: 2 }}
                          name="Dotação"
                        />
                      </ComposedChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Adicione dados para ver o comparativo
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
