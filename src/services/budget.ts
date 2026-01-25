import { supabase } from '@/lib/supabase/client'
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'
import { createHistoryEntry } from './history'

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
  departmentId?: string,
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

  if (departmentId && departmentId !== 'all') {
    query = query.eq('department', departmentId)
  }

  if (programId && programId !== 'all') {
    query = query.eq('program', programId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as BudgetEntry[]
}

export const getAggregatedSummary = async (
  departmentId?: string,
  programId?: string,
) => {
  const entries = await getBudgetEntries(
    undefined,
    undefined,
    departmentId,
    programId,
  )

  const initialSummary = {
    dotacao: 0,
    empenhado: 0,
    liquidated: 0,
    pago: 0,
    reservado: 0,
    disponivel: 0,
  }

  const summary = entries.reduce((acc, curr) => {
    acc.dotacao += curr.dotation
    acc.empenhado += curr.committed
    acc.liquidated += curr.liquidated
    acc.pago += curr.paid
    acc.reservado += curr.reserved
    return acc
  }, initialSummary)

  summary.disponivel = summary.dotacao - summary.empenhado - summary.reservado

  return summary
}

export const getDepartmentPerformanceData = async (
  startDate?: Date,
  endDate?: Date,
  departmentId?: string,
  programId?: string,
) => {
  const entries = await getBudgetEntries(
    startDate,
    endDate,
    departmentId,
    programId,
  )
  const deptMap = new Map<
    string,
    { dotacao: number; empenhado: number; liquidado: number; pago: number }
  >()

  DEPARTMENTS.forEach((d) => {
    deptMap.set(d.id, { dotacao: 0, empenhado: 0, liquidado: 0, pago: 0 })
  })

  entries.forEach((entry) => {
    const current = deptMap.get(entry.department) || {
      dotacao: 0,
      empenhado: 0,
      liquidado: 0,
      pago: 0,
    }
    deptMap.set(entry.department, {
      dotacao: current.dotacao + entry.dotation,
      empenhado: current.empenhado + entry.committed,
      liquidado: current.liquidado + entry.liquidated,
      pago: current.pago + entry.paid,
    })
  })

  return Array.from(deptMap.entries())
    .map(([id, values]) => {
      const dept = DEPARTMENTS.find((d) => d.id === id)
      return {
        id,
        name: dept ? dept.name.split(' - ')[1] : id,
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
  departmentId?: string,
  programId?: string,
) => {
  const entries = await getBudgetEntries(
    startDate,
    endDate,
    departmentId,
    programId,
  )
  const progMap = new Map<string, { dotacao: number; pago: number }>()

  PROGRAMS.forEach((p) => {
    progMap.set(p.id, { dotacao: 0, pago: 0 })
  })

  entries.forEach((entry) => {
    const current = progMap.get(entry.program) || { dotacao: 0, pago: 0 }
    progMap.set(entry.program, {
      dotacao: current.dotacao + entry.dotation,
      pago: current.pago + entry.paid,
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
          values.dotacao > 0 ? (values.pago / values.dotacao) * 100 : 0,
      }
    })
    .filter((p) => p.dotacao > 0)
    .sort((a, b) => b.executionRate - a.executionRate)
}

export const getEvolutionChartData = async (
  departmentId?: string,
  programId?: string,
) => {
  // Use current year
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59)

  const entries = await getBudgetEntries(
    startOfYear,
    endOfYear,
    departmentId,
    programId,
  )

  const monthsData = Array(12)
    .fill(0)
    .map(() => ({ dotacao: 0, liquidado: 0 }))

  entries.forEach((entry) => {
    const date = new Date(entry.created_at)
    if (date.getFullYear() === currentYear) {
      const monthIndex = date.getMonth()
      monthsData[monthIndex].dotacao += Number(entry.dotation)
      monthsData[monthIndex].liquidado += Number(entry.liquidated)
    }
  })

  let accDotacao = 0
  let accLiquidado = 0

  return monthsData.map((data, index) => {
    accDotacao += data.dotacao
    accLiquidado += data.liquidado

    const date = new Date(currentYear, index, 1)
    const month = date
      .toLocaleString('pt-BR', { month: 'short' })
      .replace('.', '')

    return {
      month,
      dotacao: accDotacao,
      liquidado: accLiquidado,
    }
  })
}
