import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'
import {
  createBudgetEntry,
  getBudgetEntries,
  deleteBudgetEntry,
  updateBudgetEntry,
  BudgetEntry,
} from '@/services/budget'
import { BudgetForm, BudgetFormValues } from '@/components/BudgetForm'
import { Loader2, Pencil, Trash2 } from 'lucide-react'

export default function BudgetManagement() {
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      const data = await getBudgetEntries()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error('Erro ao carregar registros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleCreate = async (data: BudgetFormValues) => {
    setIsSubmitting(true)
    try {
      await createBudgetEntry({
        department: data.orgao,
        program: data.programa,
        dotation: Number(data.dotacao),
        committed: Number(data.empenhado),
        liquidated: Number(data.liquidado),
        paid: Number(data.pago),
        reserved: Number(data.reservado),
      })
      toast.success('Registro criado com sucesso!')
      fetchEntries()
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar', {
        description: error.message || 'Não foi possível salvar os dados.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: BudgetFormValues) => {
    if (!editingEntry) return
    setIsSubmitting(true)
    try {
      await updateBudgetEntry(editingEntry.id, {
        department: data.orgao,
        program: data.programa,
        dotation: Number(data.dotacao),
        committed: Number(data.empenhado),
        liquidated: Number(data.liquidado),
        paid: Number(data.pago),
        reserved: Number(data.reservado),
      })
      toast.success('Registro atualizado com sucesso!')
      setEditingEntry(null)
      fetchEntries()
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao atualizar', {
        description: error.message || 'Não foi possível atualizar os dados.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteBudgetEntry(deletingId)
      toast.success('Registro excluído com sucesso')
      fetchEntries()
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao excluir', {
        description: error.message,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getDeptName = (id: string) =>
    DEPARTMENTS.find((d) => d.id === id)?.name.split(' - ')[1] || id
  const getProgName = (id: string) =>
    PROGRAMS.find((p) => p.id === id)?.name.split(' - ')[1] || id

  return (
    <div className="space-y-8 pb-10">
      <Card className="w-full shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle>Nova Entrada Orçamentária</CardTitle>
          <CardDescription>
            Adicione novos registros ao orçamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            submitLabel="Criar Registro"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Registros Cadastrados
        </h2>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                Nenhum registro encontrado.
              </div>
            ) : (
              <div className="overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Órgão</TableHead>
                      <TableHead>Programa</TableHead>
                      <TableHead className="text-right">Dotação</TableHead>
                      <TableHead className="text-right">Empenhado</TableHead>
                      <TableHead className="text-right">Pago</TableHead>
                      <TableHead className="text-center w-[100px]">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium text-xs md:text-sm">
                          {getDeptName(entry.department)}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {getProgName(entry.program)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(entry.dotation)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(entry.committed)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(entry.paid)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingEntry(entry)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeletingId(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <BudgetForm
              initialData={{
                orgao: editingEntry.department,
                programa: editingEntry.program,
                dotacao: String(editingEntry.dotation),
                empenhado: String(editingEntry.committed),
                liquidated: String(editingEntry.liquidated),
                pago: String(editingEntry.paid),
                reservado: String(editingEntry.reserved),
              }}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
              onCancel={() => setEditingEntry(null)}
              submitLabel="Salvar Alterações"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              registro do banco de dados e atualizará os painéis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
