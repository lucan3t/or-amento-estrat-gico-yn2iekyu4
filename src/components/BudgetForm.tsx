import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { DEPARTMENTS, PROGRAMS } from '@/lib/constants'
import { useEffect } from 'react'
import { formatCurrency, parseCurrency } from '@/lib/utils'

const budgetSchema = z.object({
  orgao: z.string().min(1, 'Selecione um órgão'),
  programa: z.string().min(1, 'Selecione um programa'),
  dotacao: z.string().min(1, 'Valor obrigatório'),
  empenhado: z.string().min(1, 'Valor obrigatório'),
  liquidado: z.string().min(1, 'Valor obrigatório'),
  pago: z.string().min(1, 'Valor obrigatório'),
  reservado: z.string().min(1, 'Valor obrigatório'),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  initialData?: BudgetFormValues
  onSubmit: (data: BudgetFormValues) => Promise<void>
  isSubmitting: boolean
  onCancel?: () => void
  submitLabel?: string
}

export function BudgetForm({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
  submitLabel = 'Salvar',
}: BudgetFormProps) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      orgao: '',
      programa: '',
      dotacao: '0,00',
      empenhado: '0,00',
      liquidado: '0,00',
      pago: '0,00',
      reservado: '0,00',
    },
  })

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        dotacao: formatCurrency(initialData.dotacao),
        empenhado: formatCurrency(initialData.empenhado),
        liquidado: formatCurrency(initialData.liquidado),
        pago: formatCurrency(initialData.pago),
        reservado: formatCurrency(initialData.reservado),
      })
    }
  }, [initialData, form])

  const calculateDisponivel = () => {
    const dotacao = parseCurrency(form.watch('dotacao')) || 0
    const empenhado = parseCurrency(form.watch('empenhado')) || 0
    const reservado = parseCurrency(form.watch('reservado')) || 0
    return dotacao - empenhado - reservado
  }

  const disponivel = calculateDisponivel()

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => {
    const value = e.target.value.replace(/\D/g, '')
    const formatted = formatCurrency(Number(value) / 100)
    onChange(formatted)
  }

  return (
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
                  value={field.value}
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
                  value={field.value}
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
                <FormLabel>Dotação (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => handleAmountChange(e, field.onChange)}
                  />
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
                  <Input
                    type="text"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => handleAmountChange(e, field.onChange)}
                  />
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
                  <Input
                    type="text"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => handleAmountChange(e, field.onChange)}
                  />
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
                  <Input
                    type="text"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => handleAmountChange(e, field.onChange)}
                  />
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
                  <Input
                    type="text"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => handleAmountChange(e, field.onChange)}
                  />
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

        <div className="flex justify-between pt-4">
          {onCancel && (
            <Button variant="ghost" type="button" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          {!onCancel && (
            <Button variant="ghost" type="button" onClick={() => form.reset()}>
              Limpar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[150px] ml-auto"
          >
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
