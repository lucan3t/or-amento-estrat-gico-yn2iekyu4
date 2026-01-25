/* General utility functions (exposes cn, formatCurrency, parseCurrency) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number or string into a Brazilian currency string (without symbol)
 * Example: 1234.56 -> "1.234,56"
 */
export const formatCurrency = (value: number | string) => {
  const numberValue = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

/**
 * Parses a Brazilian currency string into a number
 * Example: "1.234,56" -> 1234.56
 */
export const parseCurrency = (value: string) => {
  if (!value) return 0
  return Number(value.replace(/\./g, '').replace(',', '.'))
}
