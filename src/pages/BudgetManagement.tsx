import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'

const budgetSchema = z.object({
  orgao: z.string().min(1, 'Selecione um órgão'),
  programa: z.string().min(1, 'Selecione um programa'),
  dotacao: z.string().min(1, 'Valor obrigatório'),
  empenhado: z.string().min(1, 'Valor obrigatório'),
  liquidado: z.string().min(1, 'Valor obrigatório'),
  pago: z.string().min(1, 'Valor obrigatório'),
  reservado: z.string().min(1, 'Valor obrigatório'),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

export default function BudgetManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      orgao: '',
      programa: '',
      dotacao: '',
      empenhado: '',
      liquidado: '',
      pago: '',
      reservado: '',
    },
  })

  // Format currency on blur or simple mask could be used, keeping it simple for now
  const onSubmit = async (data: BudgetFormValues) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(data)
    toast.success('Alterações salvas com sucesso!', {
      description: 'Os dados orçamentários foram atualizados.',
    })
    setIsSubmitting(false)
  }

  const calculateDisponivel = () => {
    const dotacao = Number(form.watch('dotacao')) || 0
    const empenhado = Number(form.watch('empenhado')) || 0
    const reservado = Number(form.watch('reservado')) || 0
    return dotacao - empenhado - reservado
  }

  const disponivel = calculateDisponivel()

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Gestão Orçamentária</CardTitle>
          <CardDescription>
            Atualize os dados de execução orçamentária por órgão e programa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="orgao"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Órgão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o Órgão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="programa"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Programa de Trabalho</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o Programa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROGRAMS.map((prog) => (
                            <SelectItem key={prog.id} value={prog.id}>
                              {prog.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="dotacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dotação Atualizada (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reservado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reservado (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="empenhado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empenhado (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liquidado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liquidado (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pago (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Disponível (Calculado)</FormLabel>
                  <div className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-80 font-mono font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(disponivel)}
                  </div>
                </FormItem>
              </div>

              <CardFooter className="flex justify-between px-0 pt-4">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => form.reset()}
                >
                  Limpar Formulário
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[150px]"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
