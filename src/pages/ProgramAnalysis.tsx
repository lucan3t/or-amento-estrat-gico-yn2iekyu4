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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DEPARTMENTS, PROGRAMS, PERIODS } from '@/lib/constants'
import { getProgramRanking } from '@/lib/mockData'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'

export default function ProgramAnalysis() {
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024')

  const programData = getProgramRanking()

  const getStatus = (rate: number) => {
    if (rate >= 70)
      return {
        color: 'text-success',
        bg: 'bg-success',
        badge: 'bg-success/15 text-success hover:bg-success/25',
      }
    if (rate >= 40)
      return {
        color: 'text-warning',
        bg: 'bg-warning',
        badge: 'bg-warning/15 text-warning hover:bg-warning/25',
      }
    return {
      color: 'text-danger',
      bg: 'bg-danger',
      badge: 'bg-danger/15 text-danger hover:bg-danger/25',
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
            Filtrar por Órgão Responsável
          </label>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Órgãos" />
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
            Período de Análise
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
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Ranking de Execução por Programa
            </h2>
            <div className="text-sm text-muted-foreground">
              Ordenado por % Pago
            </div>
          </div>

          <div className="space-y-4">
            {programData.map((prog) => {
              const status = getStatus(prog.executionRate)
              return (
                <Card
                  key={prog.id}
                  className="group hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {prog.id}
                            </span>
                            <h3 className="font-medium text-sm md:text-base leading-tight">
                              {prog.name}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            {prog.fullName}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn('shrink-0', status.badge)}
                        >
                          {prog.executionRate.toFixed(1)}% Executado
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso Financeiro</span>
                          <span>
                            R$ {(prog.pago / 1000000).toFixed(1)}M de R${' '}
                            {(prog.dotacao / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <Progress
                          value={prog.executionRate}
                          className="h-2"
                          indicatorClassName={status.bg}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-50 border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Insights de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Alta Performance
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 programas superaram a meta de 70% de execução, com
                    destaque para <strong>ARAPIRACA MAIS SEGURA</strong>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-danger/10 rounded-lg border border-danger/20">
                <AlertCircle className="size-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Requer Atenção
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os programas de infraestrutura estão com execução média de
                    35%, impactando o resultado global.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-success"></div>
                <span className="text-sm text-muted-foreground">
                  Acima de 70% (Meta Atingida)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-warning"></div>
                <span className="text-sm text-muted-foreground">
                  Entre 40% e 70% (Em Progresso)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-danger"></div>
                <span className="text-sm text-muted-foreground">
                  Abaixo de 40% (Crítico)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
