import { supabase } from '@/lib/supabase/client'
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'

export interface BudgetEntry {
  id: string
  user_id: string
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('budget_entries')
    .insert({
      ...entry,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateBudgetEntry = async (
  id: string,
  entry: Partial<Omit<BudgetEntry, 'id' | 'user_id' | 'created_at'>>,
) => {
  const { error } = await supabase
    .from('budget_entries')
    .update(entry)
    .eq('id', id)

  if (error) throw error
}

export const deleteBudgetEntry = async (id: string) => {
  const { error } = await supabase.from('budget_entries').delete().eq('id', id)
  if (error) throw error
}

export const getBudgetEntries = async (startDate?: Date, endDate?: Date) => {
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

  const { data, error } = await query

  if (error) throw error
  return data as BudgetEntry[]
}

export const getAggregatedSummary = async () => {
  const entries = await getBudgetEntries()

  const initialSummary = {
    dotacao: 0,
    empenhado: 0,
    liquidado: 0,
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
) => {
  const entries = await getBudgetEntries(startDate, endDate)
  const deptMap = new Map<
    string,
    { dotacao: number; empenhado: number; pago: number }
  >()

  DEPARTMENTS.forEach((d) => {
    deptMap.set(d.id, { dotacao: 0, empenhado: 0, pago: 0 })
  })

  entries.forEach((entry) => {
    const current = deptMap.get(entry.department) || {
      dotacao: 0,
      empenhado: 0,
      pago: 0,
    }
    deptMap.set(entry.department, {
      dotacao: current.dotacao + entry.dotation,
      empenhado: current.empenhado + entry.committed,
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
          values.dotacao > 0 ? (values.pago / values.dotacao) * 100 : 0,
      }
    })
    .filter((d) => d.dotacao > 0 || d.empenhado > 0)
    .sort((a, b) => b.executionRate - a.executionRate)
}

export const getProgramPerformanceData = async () => {
  const entries = await getBudgetEntries()
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

export const getEvolutionChartData = async () => {
  const entries = await getBudgetEntries()
  const monthMap = new Map<string, { empenhado: number; pago: number }>()

  entries.forEach((entry) => {
    const date = new Date(entry.created_at)
    const monthKey = date.toLocaleString('default', { month: 'short' })
    const current = monthMap.get(monthKey) || { empenhado: 0, pago: 0 }
    monthMap.set(monthKey, {
      empenhado: current.empenhado + entry.committed,
      pago: current.pago + entry.paid,
    })
  })

  if (monthMap.size === 0) return []

  const monthsOrderPt = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ]

  return Array.from(monthMap.entries())
    .map(([month, values]) => ({
      month,
      ...values,
    }))
    .sort((a, b) => {
      const monthA = a.month.toLowerCase().substring(0, 3)
      const monthB = b.month.toLowerCase().substring(0, 3)
      return monthsOrderPt.indexOf(monthA) - monthsOrderPt.indexOf(monthB)
    })
}
