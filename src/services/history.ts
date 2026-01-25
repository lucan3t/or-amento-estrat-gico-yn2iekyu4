import { supabase } from '@/lib/supabase/client'

export interface BudgetHistoryEntry {
  id: string
  entry_id: string
  field_name: string
  old_value: string | null
  new_value: string | null
  changed_at: string
  changed_by: string | null
}

const CURRENCY_FIELDS = [
  'dotation',
  'committed',
  'liquidated',
  'paid',
  'reserved',
]

const FIELD_LABELS: Record<string, string> = {
  department: 'Órgão',
  program: 'Programa',
  dotation: 'Dotação',
  committed: 'Empenhado',
  liquidated: 'Liquidado',
  paid: 'Pago',
  reserved: 'Reservado',
}

export const getFieldLabel = (field: string) => FIELD_LABELS[field] || field

export const getBudgetHistory = async (entryId: string) => {
  const { data, error } = await supabase
    .from('budget_history')
    .select('*')
    .eq('entry_id', entryId)
    .order('changed_at', { ascending: false })

  if (error) throw error
  return data as BudgetHistoryEntry[]
}

export const createHistoryEntry = async (
  entryId: string,
  fieldName: string,
  oldValue: any,
  newValue: any,
) => {
  let formattedOld = String(oldValue)
  let formattedNew = String(newValue)

  if (CURRENCY_FIELDS.includes(fieldName)) {
    formattedOld = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(oldValue))
    formattedNew = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(newValue))
  }

  const { error } = await supabase.from('budget_history').insert({
    entry_id: entryId,
    field_name: fieldName,
    old_value: formattedOld,
    new_value: formattedNew,
    changed_by: 'Anonymous/Guest',
  })

  if (error) console.error('Error logging history:', error)
}
