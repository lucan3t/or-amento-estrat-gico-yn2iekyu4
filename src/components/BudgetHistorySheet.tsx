import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import {
  getBudgetHistory,
  BudgetHistoryEntry,
  getFieldLabel,
} from '@/services/history'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BudgetHistorySheetProps {
  entryId: string | null
  isOpen: boolean
  onClose: () => void
}

export function BudgetHistorySheet({
  entryId,
  isOpen,
  onClose,
}: BudgetHistorySheetProps) {
  const [history, setHistory] = useState<BudgetHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && entryId) {
      setLoading(true)
      getBudgetHistory(entryId)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [isOpen, entryId])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Histórico de Alterações</SheetTitle>
          <SheetDescription>
            Registro detalhado de todas as modificações neste lançamento.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            Nenhuma alteração registrada.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Anterior</TableHead>
                <TableHead>Novo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(entry.changed_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {getFieldLabel(entry.field_name)}
                  </TableCell>
                  <TableCell
                    className="text-xs text-muted-foreground max-w-[100px] truncate"
                    title={entry.old_value || '-'}
                  >
                    {entry.old_value || '-'}
                  </TableCell>
                  <TableCell
                    className="text-xs max-w-[100px] truncate"
                    title={entry.new_value || '-'}
                  >
                    {entry.new_value || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SheetContent>
    </Sheet>
  )
}
