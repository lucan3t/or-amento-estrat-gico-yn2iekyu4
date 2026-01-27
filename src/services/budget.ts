import { supabase } from '@/lib/supabase/client'
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'
import { createHistoryEntry } from './history'
import {
  startOfYear,
  endOfYear,
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
} from 'date-fns'

export interface BudgetEntry {
  id: string
  user_id: string | null
  department: string
  program: string
  dotation: number
  committed: number
  liquidated: number
  paid: number
  reserved: number
  created_at: string
}

export interface BudgetSummary {
  dotacao: number
  empenhado: number
  liquidado: number
  pago: number
  reservado: number
  disponivel: number
}

export const createBudgetEntry = async (
  entry: Omit<BudgetEntry, 'id' | 'user_id' | 'created_at'>,
) => {
  const { data, error } = await supabase
    .from('budget_entries')
    .insert(entry as any)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateBudgetEntry = async (
  id: string,
  entry: Partial<Omit<BudgetEntry, 'id' | 'user_id' | 'created_at'>>,
) => {
  const { data: oldEntry, error: fetchError } = await supabase
    .from('budget_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('budget_entries')
    .update(entry)
    .eq('id', id)

  if (error) throw error

  if (oldEntry) {
    const promises = Object.keys(entry).map((key) => {
      const fieldKey = key as keyof typeof entry
      const oldValue = oldEntry[fieldKey]
      const newValue = entry[fieldKey]

      if (oldValue !== newValue) {
        return createHistoryEntry(id, key, oldValue, newValue)
      }
      return Promise.resolve()
    })
    await Promise.all(promises)
  }
}

export const deleteBudgetEntry = async (id: string) => {
  const { error } = await supabase.from('budget_entries').delete().eq('id', id)
  if (error) throw error
}

export const getAvailableYears = async () => {
  const { data, error } = await supabase
    .from('budget_entries')
    .select('created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  const years = Array.from(
    new Set(data.map((item) => new Date(item.created_at).getFullYear())),
  )
  return years.sort((a, b) => b - a)
}

export const getAvailableDepartments = async () => {
  const { data, error } = await supabase
    .from('budget_entries')
    .select('department')

  if (error) throw error

  const departments = Array.from(new Set(data.map((item) => item.department)))
  return departments.sort()
}

export const getBudgetEntries = async (
  startDate?: Date,
  endDate?: Date,
  departmentIds?: string | string[],
  programId?: string,
) => {
  let query = supabase
    .from('budget_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString())
  }

  if (departmentIds) {
    if (Array.isArray(departmentIds)) {
      const validIds = departmentIds.filter((id) => id !== 'all')
      if (validIds.length > 0) {
        query = query.in('department', validIds)
      }
    } else if (departmentIds !== 'all') {
      query = query.eq('department', departmentIds)
    }
  }

  if (programId && programId !== 'all') {
    query = query.eq('program', programId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BudgetEntry[]
}

export const getAggregatedSummary = async (
  departmentIds?: string | string[],
  programId?: string,
  startDate?: Date,
  endDate?: Date,
): Promise<BudgetSummary> => {
  const entries = await getBudgetEntries(
    startDate,
    endDate,
    departmentIds,
    programId,
  )

  const initialSummary: BudgetSummary = {
    dotacao: 0,
    empenhado: 0,
    liquidado: 0,
    pago: 0,
    reservado: 0,
    disponivel: 0,
  }

  const summary = entries.reduce((acc, curr) => {
    acc.dotacao += Number(curr.dotation || 0)
    acc.empenhado += Number(curr.committed || 0)
    acc.liquidado += Number(curr.liquidated || 0)
    acc.pago += Number(curr.paid || 0)
    acc.reservado += Number(curr.reserved || 0)
    return acc
  }, initialSummary)

  summary.disponivel = summary.dotacao - summary.empenhado - summary.reservado

  return summary
}

export const getDepartmentPerformanceData = async (
  startDate?: Date,
  endDate?: Date,
  departmentIds?: string | string[],
  programId?: string,
) => {
  const entries = await getBudgetEntries(
    startDate,
    endDate,
    departmentIds,
    programId,
  )
  const deptMap = new Map<
    string,
    { dotacao: number; empenhado: number; liquidado: number; pago: number }
  >()

  if (
    !departmentIds ||
    departmentIds === 'all' ||
    (Array.isArray(departmentIds) && departmentIds.length === 0)
  ) {
    DEPARTMENTS.forEach((d) => {
      deptMap.set(d.id, { dotacao: 0, empenhado: 0, liquidado: 0, pago: 0 })
    })
  } else {
    const ids = Array.isArray(departmentIds) ? departmentIds : [departmentIds]
    ids.forEach((id) => {
      deptMap.set(id, { dotacao: 0, empenhado: 0, liquidado: 0, pago: 0 })
    })
  }

  entries.forEach((entry) => {
    const current = deptMap.get(entry.department) || {
      dotacao: 0,
      empenhado: 0,
      liquidado: 0,
      pago: 0,
    }
    deptMap.set(entry.department, {
      dotacao: current.dotacao + Number(entry.dotation || 0),
      empenhado: current.empenhado + Number(entry.committed || 0),
      liquidado: current.liquidado + Number(entry.liquidated || 0),
      pago: current.pago + Number(entry.paid || 0),
    })
  })

  return Array.from(deptMap.entries())
    .map(([id, values]) => {
      const dept = DEPARTMENTS.find((d) => d.id === id)
      return {
        id,
        // Used simplified name from constants if available, otherwise use id (which is now simplified name in DB)
        name: dept ? dept.name : id,
        fullName: dept?.name || id,
        ...values,
        executionRate:
          values.dotacao > 0 ? (values.liquidado / values.dotacao) * 100 : 0,
      }
    })
    .filter((d) => d.dotacao > 0 || d.empenhado > 0)
    .sort((a, b) => b.executionRate - a.executionRate)
}

export const getProgramPerformanceData = async (
  startDate?: Date,
  endDate?: Date,
  departmentIds?: string | string[],
  programId?: string,
) => {
  const entries = await getBudgetEntries(
    startDate,
    endDate,
    departmentIds,
    programId,
  )
  const progMap = new Map<
    string,
    { dotacao: number; pago: number; liquidado: number }
  >()

  PROGRAMS.forEach((p) => {
    progMap.set(p.id, { dotacao: 0, pago: 0, liquidado: 0 })
  })

  entries.forEach((entry) => {
    const current = progMap.get(entry.program) || {
      dotacao: 0,
      pago: 0,
      liquidado: 0,
    }
    progMap.set(entry.program, {
      dotacao: current.dotacao + Number(entry.dotation || 0),
      pago: current.pago + Number(entry.paid || 0),
      liquidado: current.liquidado + Number(entry.liquidated || 0),
    })
  })

  return Array.from(progMap.entries())
    .map(([id, values]) => {
      const prog = PROGRAMS.find((p) => p.id === id)
      return {
        id,
        name: prog ? prog.name.split(' - ')[1] : id,
        fullName: prog?.name || id,
        ...values,
        executionRate:
          values.dotacao > 0 ? (values.liquidado / values.dotacao) * 100 : 0,
      }
    })
    .filter((p) => p.dotacao > 0)
    .sort((a, b) => b.executionRate - a.executionRate)
}

export const getEvolutionChartData = async (
  departmentIds?: string | string[],
  programId?: string,
  startDate?: Date,
  endDate?: Date,
) => {
  const currentYear = new Date().getFullYear()
  const reqStart = startDate || new Date(currentYear, 0, 1)
  const reqEnd = endDate || new Date(currentYear, 11, 31, 23, 59, 59)

  // Start calculation from the beginning of the year of the requested start date
  // This ensures correct accumulation from Jan 1st
  const calcStart = startOfYear(reqStart)

  // We need to fetch data up to reqEnd.
  // We fetch from start of year to build the cumulative state correctly.
  const entries = await getBudgetEntries(
    calcStart,
    reqEnd,
    departmentIds,
    programId,
  )

  // Determine granularity based on the requested range
  const daysDiff = differenceInDays(reqEnd, reqStart)
  const isDaily = daysDiff <= 60

  let periods: Date[] = []

  if (isDaily) {
    periods = eachDayOfInterval({ start: reqStart, end: reqEnd })
  } else {
    periods = eachMonthOfInterval({ start: reqStart, end: reqEnd })
  }

  // Sort entries by date to allow single-pass accumulation
  const sortedEntries = entries.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  let currentDotacao = 0
  let currentLiquidado = 0
  let entryIndex = 0

  const data = periods.map((periodDate) => {
    const periodEnd = isDaily ? endOfDay(periodDate) : endOfMonth(periodDate)

    // Process all entries up to the end of this period
    while (entryIndex < sortedEntries.length) {
      const entry = sortedEntries[entryIndex]
      const entryDate = new Date(entry.created_at)

      if (entryDate > periodEnd) {
        break
      }

      currentDotacao += Number(entry.dotation || 0)
      currentLiquidado += Number(entry.liquidated || 0)
      entryIndex++
    }

    return {
      date: isDaily
        ? format(periodDate, 'dd/MM')
        : format(periodDate, 'MM/yyyy'),
      fullDate: periodDate,
      dotacao: currentDotacao,
      liquidado: currentLiquidado,
    }
  })

  return data
}
