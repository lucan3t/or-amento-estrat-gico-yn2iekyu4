import { DEPARTMENTS, PROGRAMS } from './constants'

const generateRandomValue = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Global summary mock
export const getGlobalSummary = () => {
  const dotacao = 1500000000
  const empenhado = generateRandomValue(dotacao * 0.7, dotacao * 0.9)
  const liquidado = generateRandomValue(empenhado * 0.8, empenhado * 0.95)
  const pago = generateRandomValue(liquidado * 0.85, liquidado * 0.95)
  const reservado = generateRandomValue(dotacao * 0.05, dotacao * 0.1)
  const disponivel = dotacao - empenhado - reservado

  return {
    dotacao,
    empenhado,
    liquidado,
    pago,
    reservado,
    disponivel,
  }
}

// Department performance mock
export const getDepartmentPerformance = () => {
  return DEPARTMENTS.map((dept) => {
    const dotacao = generateRandomValue(20000000, 200000000)
    const empenhado = generateRandomValue(dotacao * 0.5, dotacao * 0.95)
    const pago = generateRandomValue(empenhado * 0.6, empenhado * 0.9)

    return {
      id: dept.id,
      name: dept.name.split(' - ')[1], // Short name for charts
      fullName: dept.name,
      dotacao,
      empenhado,
      pago,
      executionRate: (pago / dotacao) * 100,
    }
  }).sort((a, b) => b.executionRate - a.executionRate)
}

// Monthly evolution mock
export const getEvolutionData = () => {
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  let cumulativeEmpenhado = 0
  let cumulativePago = 0

  return months.map((month) => {
    cumulativeEmpenhado += generateRandomValue(50000000, 100000000)
    cumulativePago += generateRandomValue(40000000, 90000000)

    // Ensure logical consistency
    if (cumulativePago > cumulativeEmpenhado)
      cumulativePago = cumulativeEmpenhado * 0.9

    return {
      month,
      empenhado: cumulativeEmpenhado,
      pago: cumulativePago,
    }
  })
}

// Program ranking mock
export const getProgramRanking = () => {
  return PROGRAMS.map((prog) => {
    const dotacao = generateRandomValue(5000000, 50000000)
    const pago = generateRandomValue(dotacao * 0.2, dotacao * 0.98)

    return {
      id: prog.id,
      name: prog.name.split(' - ')[1],
      fullName: prog.name,
      dotacao,
      pago,
      executionRate: (pago / dotacao) * 100,
    }
  }).sort((a, b) => b.executionRate - a.executionRate)
}
