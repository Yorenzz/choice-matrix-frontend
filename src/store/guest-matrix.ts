import { defineStore } from 'pinia'

interface GuestOption {
  id: string
  title: string
}

interface GuestDimension {
  id: string
  title: string
  weight: number
}

interface GuestCell {
  score: number | null
  note: string
}

type GuestCells = Record<string, GuestCell>

const MAX_OPTIONS = 5
const MAX_DIMENSIONS = 3

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createDefaultState() {
  const options: GuestOption[] = [
    { id: createId('option'), title: '方案 A' },
    { id: createId('option'), title: '方案 B' },
    { id: createId('option'), title: '方案 C' },
  ]

  const dimensions: GuestDimension[] = [
    { id: createId('dimension'), title: '性价比', weight: 4 },
    { id: createId('dimension'), title: '长期体验', weight: 3 },
    { id: createId('dimension'), title: '上手成本', weight: 2 },
  ]

  const cells: GuestCells = {}

  const presetScores = [
    [8, 7, 6],
    [7, 9, 8],
    [9, 6, 5],
  ]

  const presetNotes = [
    ['预算友好，配置均衡', '性能稳定，续航不错', '迁移成本较低'],
    ['价格略高但配置完整', '综合体验最稳', '熟悉度高，上手快'],
    ['初始成本最低', '后续升级空间一般', '需要额外适应'],
  ]

  options.forEach((option, optionIndex) => {
    dimensions.forEach((dimension, dimensionIndex) => {
      cells[`${option.id}:${dimension.id}`] = {
        score: presetScores[optionIndex]?.[dimensionIndex] ?? null,
        note: presetNotes[optionIndex]?.[dimensionIndex] ?? '',
      }
    })
  })

  return {
    title: '我的游客决策矩阵',
    options,
    dimensions,
    cells,
  }
}

export const useGuestMatrixStore = defineStore('guest-matrix', {
  state: () => createDefaultState(),

  getters: {
    maxOptions: () => MAX_OPTIONS,
    maxDimensions: () => MAX_DIMENSIONS,
  },

  actions: {
    getCell(optionID: string, dimensionID: string): GuestCell {
      const key = `${optionID}:${dimensionID}`
      if (!this.cells[key]) {
        this.cells[key] = { score: null, note: '' }
      }
      return this.cells[key]
    },

    setTitle(title: string) {
      this.title = title
    },

    addOption() {
      if (this.options.length >= MAX_OPTIONS) {
        return false
      }

      const option = {
        id: createId('option'),
        title: `方案 ${String.fromCharCode(65 + this.options.length)}`,
      }

      this.options.push(option)
      this.dimensions.forEach((dimension) => {
        this.cells[`${option.id}:${dimension.id}`] = { score: null, note: '' }
      })
      return true
    },

    removeOption(optionID: string) {
      this.options = this.options.filter(option => option.id !== optionID)
      Object.keys(this.cells).forEach((key) => {
        if (key.startsWith(`${optionID}:`)) {
          delete this.cells[key]
        }
      })
    },

    updateOptionTitle(optionID: string, title: string) {
      const target = this.options.find(option => option.id === optionID)
      if (target) {
        target.title = title
      }
    },

    addDimension() {
      if (this.dimensions.length >= MAX_DIMENSIONS) {
        return false
      }

      const dimension = {
        id: createId('dimension'),
        title: `维度 ${this.dimensions.length + 1}`,
        weight: 3,
      }

      this.dimensions.push(dimension)
      this.options.forEach((option) => {
        this.cells[`${option.id}:${dimension.id}`] = { score: null, note: '' }
      })
      return true
    },

    removeDimension(dimensionID: string) {
      this.dimensions = this.dimensions.filter(dimension => dimension.id !== dimensionID)
      Object.keys(this.cells).forEach((key) => {
        if (key.endsWith(`:${dimensionID}`)) {
          delete this.cells[key]
        }
      })
    },

    updateDimensionTitle(dimensionID: string, title: string) {
      const target = this.dimensions.find(dimension => dimension.id === dimensionID)
      if (target) {
        target.title = title
      }
    },

    updateDimensionWeight(dimensionID: string, weight: number) {
      const target = this.dimensions.find(dimension => dimension.id === dimensionID)
      if (target) {
        target.weight = Math.min(5, Math.max(1, Number.isNaN(weight) ? 1 : weight))
      }
    },

    updateCellScore(optionID: string, dimensionID: string, score: number | null) {
      const cell = this.getCell(optionID, dimensionID)
      if (score === null || Number.isNaN(score)) {
        cell.score = null
        return
      }

      cell.score = Math.min(10, Math.max(0, score))
    },

    updateCellNote(optionID: string, dimensionID: string, note: string) {
      const cell = this.getCell(optionID, dimensionID)
      cell.note = note
    },

    resetMatrix() {
      const nextState = createDefaultState()
      this.title = nextState.title
      this.options = nextState.options
      this.dimensions = nextState.dimensions
      this.cells = nextState.cells
    },
  },

  persist: {
    storage: localStorage,
  },
})
