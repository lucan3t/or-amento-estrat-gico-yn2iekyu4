import * as React from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type FilterFrequency =
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'quadrimesterly'
  | 'semiannual'
  | 'annual'
  | 'custom'

interface DateRangeFilterProps {
  onFilterChange: (startDate: Date, endDate: Date) => void
  className?: string
}

export function DateRangeFilter({
  onFilterChange,
  className,
}: DateRangeFilterProps) {
  const [frequency, setFrequency] = React.useState<FilterFrequency>('annual') // Default to annual
  const [year, setYear] = React.useState<string>(
    new Date().getFullYear().toString(),
  )
  const [period, setPeriod] = React.useState<string>('1') // Default to first period
  const [customDate, setCustomDate] = React.useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  })

  // Generate year options (last 3 years + next year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - 3 + i).toString(),
  )

  const getPeriodOptions = () => {
    switch (frequency) {
      case 'monthly':
        return Array.from({ length: 12 }, (_, i) => ({
          value: (i + 1).toString(),
          label: format(new Date(parseInt(year), i, 1), 'MMMM', {
            locale: ptBR,
          }),
        }))
      case 'bimonthly':
        return [
          { value: '1', label: '1º Bimestre (Jan-Fev)' },
          { value: '2', label: '2º Bimestre (Mar-Abr)' },
          { value: '3', label: '3º Bimestre (Mai-Jun)' },
          { value: '4', label: '4º Bimestre (Jul-Ago)' },
          { value: '5', label: '5º Bimestre (Set-Out)' },
          { value: '6', label: '6º Bimestre (Nov-Dez)' },
        ]
      case 'quarterly':
        return [
          { value: '1', label: '1º Trimestre (Jan-Mar)' },
          { value: '2', label: '2º Trimestre (Abr-Jun)' },
          { value: '3', label: '3º Trimestre (Jul-Set)' },
          { value: '4', label: '4º Trimestre (Out-Dez)' },
        ]
      case 'quadrimesterly':
        return [
          { value: '1', label: '1º Quadrimestre (Jan-Abr)' },
          { value: '2', label: '2º Quadrimestre (Mai-Ago)' },
          { value: '3', label: '3º Quadrimestre (Set-Dez)' },
        ]
      case 'semiannual':
        return [
          { value: '1', label: '1º Semestre (Jan-Jun)' },
          { value: '2', label: '2º Semestre (Jul-Dez)' },
        ]
      case 'annual':
        return [{ value: '1', label: `Ano ${year}` }]
      default:
        return []
    }
  }

  // Calculate dates and notify parent
  React.useEffect(() => {
    let start: Date
    let end: Date
    const y = parseInt(year)
    const p = parseInt(period)

    if (frequency === 'custom') {
      if (customDate?.from) {
        start = startOfDay(customDate.from)
        end = customDate.to
          ? endOfDay(customDate.to)
          : endOfDay(customDate.from)
        onFilterChange(start, end)
      }
      return
    }

    switch (frequency) {
      case 'monthly':
        start = startOfMonth(new Date(y, p - 1, 1))
        end = endOfMonth(new Date(y, p - 1, 1))
        break
      case 'bimonthly':
        start = new Date(y, (p - 1) * 2, 1)
        end = endOfMonth(addMonths(start, 1))
        break
      case 'quarterly':
        start = new Date(y, (p - 1) * 3, 1)
        end = endOfMonth(addMonths(start, 2))
        break
      case 'quadrimesterly':
        start = new Date(y, (p - 1) * 4, 1)
        end = endOfMonth(addMonths(start, 3))
        break
      case 'semiannual':
        start = new Date(y, (p - 1) * 6, 1)
        end = endOfMonth(addMonths(start, 5))
        break
      case 'annual':
        start = startOfYear(new Date(y, 0, 1))
        end = endOfYear(new Date(y, 0, 1))
        break
      default:
        start = startOfYear(new Date(y, 0, 1))
        end = endOfYear(new Date(y, 0, 1))
    }

    onFilterChange(startOfDay(start), endOfDay(end))
  }, [frequency, year, period, customDate, onFilterChange])

  return (
    <div className={cn('flex flex-wrap gap-2 items-center', className)}>
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-medium mb-1 block text-muted-foreground">
          Tipo de Filtro
        </label>
        <Select
          value={frequency}
          onValueChange={(v) => {
            setFrequency(v as FilterFrequency)
            setPeriod('1') // Reset period when frequency changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="bimonthly">Bimestral</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="quadrimesterly">Quadrimestral</SelectItem>
            <SelectItem value="semiannual">Semestral</SelectItem>
            <SelectItem value="annual">Anual</SelectItem>
            <SelectItem value="custom">Intervalo Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frequency !== 'custom' ? (
        <>
          <div className="w-[120px]">
            <label className="text-xs font-medium mb-1 block text-muted-foreground">
              Ano
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {frequency !== 'annual' && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium mb-1 block text-muted-foreground">
                Período
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {getPeriodOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 min-w-[300px]">
          <label className="text-xs font-medium mb-1 block text-muted-foreground">
            Intervalo de Datas
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !customDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customDate?.from ? (
                  customDate.to ? (
                    <>
                      {format(customDate.from, 'dd/MM/yyyy')} -{' '}
                      {format(customDate.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(customDate.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customDate?.from}
                selected={customDate}
                onSelect={setCustomDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
