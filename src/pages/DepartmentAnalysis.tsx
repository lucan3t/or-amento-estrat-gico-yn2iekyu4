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
import {
  getDepartmentPerformanceData,
  getAvailableDepartments,
} from '@/services/budget'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { DEPARTMENTS } from '@/lib/constants'
import { formatCurrency, cn } from '@/lib/utils'
import { DateRangeFilter } from '@/components/DateRangeFilter'
import { useIsMobile } from '@/hooks/use-mobile'

export default function DepartmentAnalysis() {
  const [focusDept, setFocusDept] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [deptData, setDeptData] = useState<any[]>([])

  // Filter states
  const [deptOptions, setDeptOptions] = useState<string[]>([])
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null,
  )

  const isMobile = useIsMobile()

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const availableDepts = await getAvailableDepartments()
        setDeptOptions(availableDepts)
      } catch (error) {
        console.error('Error loading filter options:', error)
      }
    }
    loadOptions()
  }, [])

  // Handle Date Range Change
  const handleDateRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end })
  }, [])

  // Load dashboard data
  useEffect(() => {
    if (!dateRange) return

    const loadData = async () => {
      try {
        setLoading(true)

        const data = await getDepartmentPerformanceData(
          dateRange.start,
          dateRange.end,
          selectedDeptFilter,
        )
        setDeptData(data)
        setFocusDept('') // Reset detailed view on filter change
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dateRange, selectedDeptFilter])

  // Prepare data for the chart - Sort by Dotacao for better financial comparison
  const chartData = useMemo(() => {
    return [...deptData].sort((a, b) => b.dotacao - a.dotacao)
  }, [deptData])

  // Calculate dynamic height for scrollable chart
  const chartHeight = Math.max(450, chartData.length * 60)
  const yAxisWidth = isMobile ? 100 : 200

  const chartConfig = {
    dotacao: { label: 'Dotação', color: '#578FCA' },
    liquidado: { label: 'Liquidado', color: '#A1E3F9' },
  }

  const focusDeptData = focusDept
    ? deptData.find((d) => d.id === focusDept)
    : deptData[0]

  const getDeptLabel = (id: string) => {
    const dept = DEPARTMENTS.find((d) => d.id === id)
    return dept ? dept.name : id
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-4 rounded-lg shadow-sm border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-muted-foreground">
            Filtrar por Órgão Responsável
          </Label>
          <Select
            value={selectedDeptFilter}
            onValueChange={setSelectedDeptFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o órgão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Órgãos</SelectItem>
              {deptOptions.map((deptId) => (
                <SelectItem key={deptId} value={deptId}>
                  {getDeptLabel(deptId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Período de Análise</Label>
          <DateRangeFilter
            onFilterChange={handleDateRangeChange}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin mr-2" /> Carregando análise...
        </div>
      ) : deptData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            Nenhum dado encontrado para o período selecionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-none">
                <CardTitle>Comparativo Financeiro</CardTitle>
                <CardDescription>
                  Análise de Dotação vs Liquidado por Órgão (Ordenado por Maior
                  Orçamento)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[500px] p-0 relative">
                <div className="absolute inset-0 overflow-y-auto px-6 pb-6">
                  <div style={{ height: chartHeight }} className="w-full">
                    <ChartContainer
                      config={chartConfig}
                      className="h-full w-full aspect-auto"
                    >
                      <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          vertical={true}
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          tickFormatter={(value) =>
                            value >= 1000000
                              ? `R$${(value / 1000000).toFixed(0)}M`
                              : `R$${(value / 1000).toFixed(0)}k`
                          }
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={yAxisWidth}
                          tick={{ fontSize: 11 }}
                        />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          content={
                            <ChartTooltipContent
                              formatter={(value) => formatCurrency(value)}
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="dotacao"
                          fill="var(--color-dotacao)"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                        <Bar
                          dataKey="liquidado"
                          fill="var(--color-liquidado)"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-blue-50 text-blue-900 border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  Detalhes do Órgão
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Selecione um órgão abaixo para ver detalhes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={focusDept || deptData[0]?.id}
                  onValueChange={setFocusDept}
                >
                  <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-blue-200">
                    <SelectValue placeholder="Selecione" />
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
                        <p className="text-sm opacity-70">Execução (Liq/Dot)</p>
                        <p className="text-2xl font-bold">
                          {focusDeptData.executionRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-70">Disponível</p>
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
                  ? 'Este órgão apresenta um excelente ritmo de execução orçamentária (liquidação), superando a meta.'
                  : 'Atenção: A execução orçamentária (liquidação) está abaixo do esperado para o período. Recomenda-se revisão dos processos.'}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
