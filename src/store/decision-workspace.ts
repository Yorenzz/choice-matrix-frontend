import { defineStore } from 'pinia'

export type DecisionColumnType = 'text' | 'numeric' | 'score' | 'select'

export interface DecisionFolder {
  id: string
  name: string
  accent: string
}

export interface DecisionColumn {
  id: string
  title: string
  type: DecisionColumnType
  weight: number
  unit: string
  options: string[]
}

export interface DecisionRow {
  id: string
  title: string
  subtitle: string
}

export interface DecisionCell {
  text: string
  note: string
  score: number | null
  numeric: number | null
  select: string | null
}

export interface DecisionSummaryEntry {
  rowId: string
  rowTitle: string
  bullets: string[]
}

export interface DecisionAISummary {
  focusPrompt: string
  generatedAt: string
  overview: string
  recommendation: string
  strengths: DecisionSummaryEntry[]
  tradeoffs: DecisionSummaryEntry[]
  evidence: string[]
  gaps: string[]
}

export interface DecisionProject {
  id: string
  title: string
  description: string
  folderId: string | null
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  lastOpenedAt: string
  rows: DecisionRow[]
  columns: DecisionColumn[]
  cells: Record<string, DecisionCell>
  aiSummary: DecisionAISummary | null
  shareToken: string | null
}

export interface DecisionTemplate {
  id: string
  name: string
  category: string
  description: string
  accent: string
  isOfficial: boolean
  columns: DecisionColumn[]
  starterRows: DecisionRow[]
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function nowISO() {
  return new Date().toISOString()
}

function createCell(): DecisionCell {
  return {
    text: '',
    note: '',
    score: null,
    numeric: null,
    select: null,
  }
}

function getCellKey(rowId: string, columnId: string) {
  return `${rowId}:${columnId}`
}

function cloneCell(cell?: Partial<DecisionCell>): DecisionCell {
  return {
    text: cell?.text ?? '',
    note: cell?.note ?? '',
    score: typeof cell?.score === 'number' ? cell.score : null,
    numeric: typeof cell?.numeric === 'number' ? cell.numeric : null,
    select: cell?.select ?? null,
  }
}

function createTemplateColumns(seed: Array<Partial<DecisionColumn> & Pick<DecisionColumn, 'title' | 'type'>>) {
  return seed.map(column => ({
    id: uid('column'),
    title: column.title,
    type: column.type,
    weight: column.weight ?? 1,
    unit: column.unit ?? '',
    options: column.options ?? [],
  }))
}

function createStarterRows(seed: Array<Partial<DecisionRow> & Pick<DecisionRow, 'title'>>) {
  return seed.map(row => ({
    id: uid('row'),
    title: row.title,
    subtitle: row.subtitle ?? '',
  }))
}

function createProjectCells(rows: DecisionRow[], columns: DecisionColumn[], seed?: Record<string, Partial<DecisionCell>>) {
  const cells: Record<string, DecisionCell> = {}

  rows.forEach((row) => {
    columns.forEach((column) => {
      const key = getCellKey(row.id, column.id)
      cells[key] = cloneCell(seed?.[key] ?? createCell())
    })
  })

  return cells
}

function createOfficialTemplates(): DecisionTemplate[] {
  return [
    {
      id: 'template-rent',
      name: '租房对比',
      category: '生活决策',
      description: '适合比较多个房源的客观条件与主观居住体验。',
      accent: 'from-cyan-500/20 via-teal-500/15 to-emerald-500/20',
      isOfficial: true,
      columns: createTemplateColumns([
        { title: '租金', type: 'numeric', unit: '元/月' },
        { title: '通勤', type: 'numeric', unit: '分钟' },
        { title: '是否带阳台', type: 'select', options: ['是', '否'] },
        { title: '居住舒适度', type: 'score', weight: 4 },
        { title: '房源备注', type: 'text' },
      ]),
      starterRows: createStarterRows([
        { title: '房源 A', subtitle: '靠近地铁，预算友好' },
        { title: '房源 B', subtitle: '空间更大，通勤稍远' },
      ]),
    },
    {
      id: 'template-phone',
      name: '手机选购',
      category: '消费决策',
      description: '比较价格、影像、续航和上手体验，快速得出推荐结论。',
      accent: 'from-slate-900/15 via-slate-700/10 to-orange-500/20',
      isOfficial: true,
      columns: createTemplateColumns([
        { title: '价格', type: 'numeric', unit: '元' },
        { title: '续航体验', type: 'score', weight: 4 },
        { title: '影像表现', type: 'score', weight: 3 },
        { title: '系统偏好', type: 'select', options: ['iOS', 'Android'] },
        { title: '主观备注', type: 'text' },
      ]),
      starterRows: createStarterRows([
        { title: '方案 A', subtitle: '偏性价比' },
        { title: '方案 B', subtitle: '偏体验完整度' },
        { title: '方案 C', subtitle: '偏影像能力' },
      ]),
    },
    {
      id: 'template-offer',
      name: 'Offer 比较',
      category: '职业决策',
      description: '把薪资、地点、成长性和主观匹配度放到同一张表里判断。',
      accent: 'from-violet-500/18 via-fuchsia-500/14 to-sky-500/18',
      isOfficial: true,
      columns: createTemplateColumns([
        { title: '年包', type: 'numeric', unit: '万元' },
        { title: '城市', type: 'select', options: ['上海', '杭州', '深圳', '北京'] },
        { title: '成长空间', type: 'score', weight: 4 },
        { title: '团队匹配度', type: 'score', weight: 3 },
        { title: '风险备注', type: 'text' },
      ]),
      starterRows: createStarterRows([
        { title: 'Offer A', subtitle: '成熟团队' },
        { title: 'Offer B', subtitle: '高增长业务' },
      ]),
    },
  ]
}

function createProjectFromTemplate(template: DecisionTemplate, overrides?: Partial<DecisionProject>): DecisionProject {
  const now = nowISO()
  const columns = template.columns.map(column => ({
    ...column,
    id: uid('column'),
    options: [...column.options],
  }))
  const rows = template.starterRows.map(row => ({
    ...row,
    id: uid('row'),
  }))

  return {
    id: uid('project'),
    title: overrides?.title ?? template.name,
    description: overrides?.description ?? template.description,
    folderId: overrides?.folderId ?? null,
    isFavorite: overrides?.isFavorite ?? false,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    rows,
    columns,
    cells: createProjectCells(rows, columns),
    aiSummary: null,
    shareToken: null,
  }
}

function createDefaultProject(): DecisionProject {
  const templates = createOfficialTemplates()
  const template = templates[1] ?? templates[0]!
  const project = createProjectFromTemplate(template, {
    title: '2026 旗舰手机决策',
    description: '比较三款手机在价格、续航、影像和系统体验上的综合表现。',
    folderId: 'folder-shopping',
    isFavorite: true,
  })

  const price = project.columns[0]!
  const battery = project.columns[1]!
  const camera = project.columns[2]!
  const system = project.columns[3]!
  const note = project.columns[4]!
  const rowA = project.rows[0]!
  const rowB = project.rows[1]!
  const rowC = project.rows[2]!

  project.cells[getCellKey(rowA.id, price.id)] = { ...createCell(), numeric: 4999 }
  project.cells[getCellKey(rowA.id, battery.id)] = { ...createCell(), score: 8, note: '续航稳定，重度使用一天无压力' }
  project.cells[getCellKey(rowA.id, camera.id)] = { ...createCell(), score: 7, note: '白天表现稳，夜景一般' }
  project.cells[getCellKey(rowA.id, system.id)] = { ...createCell(), select: 'Android' }
  project.cells[getCellKey(rowA.id, note.id)] = { ...createCell(), text: '整体均衡，预算压力最小。' }

  project.cells[getCellKey(rowB.id, price.id)] = { ...createCell(), numeric: 6999 }
  project.cells[getCellKey(rowB.id, battery.id)] = { ...createCell(), score: 9, note: '续航和充电都更从容' }
  project.cells[getCellKey(rowB.id, camera.id)] = { ...createCell(), score: 8, note: '视频能力稳定，成片率高' }
  project.cells[getCellKey(rowB.id, system.id)] = { ...createCell(), select: 'iOS' }
  project.cells[getCellKey(rowB.id, note.id)] = { ...createCell(), text: '价格偏高，但整体体验完整。' }

  project.cells[getCellKey(rowC.id, price.id)] = { ...createCell(), numeric: 6499 }
  project.cells[getCellKey(rowC.id, battery.id)] = { ...createCell(), score: 7, note: '续航中规中矩' }
  project.cells[getCellKey(rowC.id, camera.id)] = { ...createCell(), score: 9, note: '影像能力最强，长焦更有优势' }
  project.cells[getCellKey(rowC.id, system.id)] = { ...createCell(), select: 'Android' }
  project.cells[getCellKey(rowC.id, note.id)] = { ...createCell(), text: '适合重视拍照的人。' }

  return project
}

function createSecondProject(): DecisionProject {
  const templates = createOfficialTemplates()
  const template = templates[0]!
  const project = createProjectFromTemplate(template, {
    title: '春季租房比较',
    description: '优先考虑通勤和居住舒适度，价格其次。',
    folderId: 'folder-life',
  })

  const rent = project.columns[0]!
  const commute = project.columns[1]!
  const balcony = project.columns[2]!
  const comfort = project.columns[3]!
  const remark = project.columns[4]!
  const rowA = project.rows[0]!
  const rowB = project.rows[1]!

  project.cells[getCellKey(rowA.id, rent.id)] = { ...createCell(), numeric: 4300 }
  project.cells[getCellKey(rowA.id, commute.id)] = { ...createCell(), numeric: 28 }
  project.cells[getCellKey(rowA.id, balcony.id)] = { ...createCell(), select: '是' }
  project.cells[getCellKey(rowA.id, comfort.id)] = { ...createCell(), score: 8, note: '采光更好，楼层合适' }
  project.cells[getCellKey(rowA.id, remark.id)] = { ...createCell(), text: '附近商圈成熟，周末方便。' }

  project.cells[getCellKey(rowB.id, rent.id)] = { ...createCell(), numeric: 3900 }
  project.cells[getCellKey(rowB.id, commute.id)] = { ...createCell(), numeric: 43 }
  project.cells[getCellKey(rowB.id, balcony.id)] = { ...createCell(), select: '否' }
  project.cells[getCellKey(rowB.id, comfort.id)] = { ...createCell(), score: 6, note: '价格低，但整体体验一般' }
  project.cells[getCellKey(rowB.id, remark.id)] = { ...createCell(), text: '性价比更高，适合压预算。' }

  return project
}

function createDefaultState() {
  const templates = createOfficialTemplates()
  const folders: DecisionFolder[] = [
    { id: 'folder-shopping', name: '消费决策', accent: 'bg-amber-500' },
    { id: 'folder-life', name: '生活选择', accent: 'bg-teal-500' },
    { id: 'folder-career', name: '职业规划', accent: 'bg-sky-500' },
  ]
  const projects = [createDefaultProject(), createSecondProject()]

  return {
    folders,
    templates,
    projects,
    selectedProjectId: projects[0]?.id ?? null,
    selectedFolderId: 'all',
  }
}

function touchProject(project: DecisionProject) {
  const now = nowISO()
  project.updatedAt = now
  project.lastOpenedAt = now
}

function cloneTemplateFromProject(project: DecisionProject, name: string): DecisionTemplate {
  return {
    id: uid('template'),
    name,
    category: '我的模板',
    description: project.description || `来自 ${project.title} 的个人模板`,
    accent: 'from-slate-900/15 via-teal-500/14 to-orange-500/18',
    isOfficial: false,
    columns: project.columns.map(column => ({
      ...column,
      id: uid('column'),
      options: [...column.options],
    })),
    starterRows: [],
  }
}

function getScoreColumns(project: DecisionProject) {
  return project.columns.filter(column => column.type === 'score')
}

function resolveProjectCell(project: DecisionProject, rowId: string, columnId: string) {
  return project.cells[getCellKey(rowId, columnId)] ?? createCell()
}

export interface RankedRow {
  rowId: string
  rowTitle: string
  total: number | null
  completed: number
  required: number
  rank: number | null
}

function calculateRanking(project: DecisionProject): RankedRow[] {
  const scoreColumns = getScoreColumns(project)

  const result: RankedRow[] = project.rows.map((row) => {
    if (!scoreColumns.length) {
      return {
        rowId: row.id,
        rowTitle: row.title,
        total: null,
        completed: 0,
        required: 0,
        rank: null,
      }
    }

    let weighted = 0
    let totalWeight = 0
    let completed = 0

    scoreColumns.forEach((column) => {
      const cell = resolveProjectCell(project, row.id, column.id)
      if (cell.score === null || Number.isNaN(cell.score)) {
        return
      }

      completed += 1
      weighted += cell.score * column.weight
      totalWeight += column.weight
    })

    const isComplete = completed === scoreColumns.length && totalWeight > 0

    return {
      rowId: row.id,
      rowTitle: row.title,
      total: isComplete ? Number((weighted / totalWeight).toFixed(1)) : null,
      completed,
      required: scoreColumns.length,
      rank: null,
    }
  }).sort((left, right) => {
    if (left.total === null && right.total === null)
      return left.rowTitle.localeCompare(right.rowTitle, 'zh-CN')
    if (left.total === null)
      return 1
    if (right.total === null)
      return -1
    if (right.total !== left.total)
      return right.total - left.total
    return left.rowTitle.localeCompare(right.rowTitle, 'zh-CN')
  })

  let currentRank = 0
  let lastTotal: number | null = null

  result.forEach((row, index) => {
    if (row.total === null) {
      row.rank = null
      return
    }

    if (lastTotal === null || row.total !== lastTotal) {
      currentRank = index + 1
      lastTotal = row.total
    }

    row.rank = currentRank
  })

  return result
}

function buildAISummary(project: DecisionProject, focusPrompt: string): DecisionAISummary {
  const ranking = calculateRanking(project)
  const completeRows = ranking.filter(row => row.total !== null)
  const scoreColumns = getScoreColumns(project)
  const topRow = completeRows[0]
  const gaps: string[] = []

  if (!scoreColumns.length) {
    gaps.push('当前项目还没有计分列，建议先创建 1-2 个主观评分维度。')
  }

  ranking
    .filter(row => row.required > 0 && row.completed < row.required)
    .forEach((row) => {
      gaps.push(`${row.rowTitle} 还缺少 ${row.required - row.completed} 个评分项，暂未参与排名。`)
    })

  const strengths: DecisionSummaryEntry[] = project.rows.map((row) => {
        const bullets: string[] = []

    const scored = (scoreColumns
      .map(column => ({
        column,
        score: resolveProjectCell(project, row.id, column.id).score,
        note: resolveProjectCell(project, row.id, column.id).note,
      }))
      .filter(item => item.score !== null) as Array<{ column: DecisionColumn, score: number, note: string }>)
      .sort((left, right) => right.score - left.score)

    const numericHighlights = project.columns
      .filter(column => column.type === 'numeric')
      .map((column) => {
        const cell = resolveProjectCell(project, row.id, column.id)
        return cell.numeric === null ? null : `${column.title} ${cell.numeric}${column.unit}`
      })
      .filter(Boolean) as string[]

    if (scored[0]) {
      bullets.push(`${scored[0].column.title} 得分最高，为 ${scored[0].score} 分。`)
    }
    if (scored[0]?.note) {
      bullets.push(scored[0].note)
    }
    if (numericHighlights[0]) {
      bullets.push(`关键客观信息：${numericHighlights.slice(0, 2).join('，')}。`)
    }

    if (!bullets.length) {
      bullets.push('当前信息还不够充分，建议继续补充。')
    }

    return {
      rowId: row.id,
      rowTitle: row.title,
      bullets,
    }
  })

  const tradeoffs: DecisionSummaryEntry[] = project.rows.map((row) => {
    const bullets: string[] = []

    const scored = (scoreColumns
      .map(column => ({
        column,
        score: resolveProjectCell(project, row.id, column.id).score,
      }))
      .filter(item => item.score !== null) as Array<{ column: DecisionColumn, score: number }>)
      .sort((left, right) => left.score - right.score)

    if (scored[0]) {
      bullets.push(`${scored[0].column.title} 是当前短板，只有 ${scored[0].score} 分。`)
    }
    if (!scored.length) {
      bullets.push('尚未形成可判断的主观评分。')
    }

    return {
      rowId: row.id,
      rowTitle: row.title,
      bullets,
    }
  })

  const evidence = [
    `${project.rows.length} 个选项，${project.columns.length} 个维度，${scoreColumns.length} 个计分列参与比较。`,
    completeRows.length
      ? `当前可参与排名的选项有 ${completeRows.length} 个，领先项为 ${topRow?.rowTitle}。`
      : '暂无完整评分项，尚未形成最终排名。',
    focusPrompt.trim()
      ? `本次总结优先围绕“${focusPrompt.trim()}”展开。`
      : '本次总结默认综合考虑价格、主观体验和补充备注。',
  ]

  return {
    focusPrompt,
    generatedAt: nowISO(),
    overview: completeRows.length
      ? `${project.title} 已经形成初步排序，其中 ${topRow?.rowTitle} 目前最均衡。${gaps.length ? '但仍有部分选项信息不完整，建议补齐后再做最终判断。' : '现有信息已经足以支撑一次初步决策。'}`
      : `${project.title} 目前仍处在资料整理阶段，建议先补足关键评分项，再使用 AI 总结做最后收敛。`,
    recommendation: completeRows.length && topRow
      ? `如果你现在就要做决定，可以先把 ${topRow.rowTitle} 作为基准方案，再重点确认它在低分维度上的风险。`
      : '建议先补全每个选项的主观评分与核心数值字段，避免在信息残缺时过早下结论。',
    strengths,
    tradeoffs,
    evidence,
    gaps,
  }
}

export const useDecisionWorkspaceStore = defineStore('decision-workspace', {
  state: () => createDefaultState(),

  getters: {
    currentProject(state): DecisionProject | null {
      return state.projects.find(project => project.id === state.selectedProjectId) ?? null
    },
    filteredProjects(state): DecisionProject[] {
      const projects = [...state.projects].sort((left, right) => {
        if (left.isFavorite !== right.isFavorite)
          return left.isFavorite ? -1 : 1
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      })

      if (state.selectedFolderId === 'all')
        return projects
      if (state.selectedFolderId === 'ungrouped')
        return projects.filter(project => !project.folderId)
      return projects.filter(project => project.folderId === state.selectedFolderId)
    },
  },

  actions: {
    selectFolder(folderId: string) {
      this.selectedFolderId = folderId
    },

    selectProject(projectId: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return
      touchProject(project)
      this.selectedProjectId = projectId
    },

    createFolder(name: string) {
      const trimmed = name.trim()
      if (!trimmed)
        return

      this.folders.unshift({
        id: uid('folder'),
        name: trimmed,
        accent: ['bg-teal-500', 'bg-sky-500', 'bg-orange-500', 'bg-rose-500'][this.folders.length % 4]!,
      })
    },

    createProject(input?: { title?: string, description?: string, folderId?: string | null, templateId?: string | null }) {
      const template = input?.templateId ? this.templates.find(item => item.id === input.templateId) : null
      const project = template
        ? createProjectFromTemplate(template, {
            title: input?.title || `${template.name} 新项目`,
            description: input?.description || template.description,
            folderId: input?.folderId ?? null,
          })
        : createProjectFromTemplate({
            id: 'blank',
            name: '空白项目',
            category: '空白',
            description: '从一张空白矩阵开始整理你的复杂选择。',
            accent: '',
            isOfficial: false,
            columns: createTemplateColumns([
              { title: '价格 / 成本', type: 'numeric', unit: '元' },
              { title: '主观感受', type: 'score', weight: 3 },
              { title: '备注', type: 'text' },
            ]),
            starterRows: createStarterRows([
              { title: '方案 A', subtitle: '先写下第一个候选项' },
              { title: '方案 B', subtitle: '再放一个对照方案' },
            ]),
          }, {
            title: input?.title || '新的决策项目',
            description: input?.description || '先列出候选方案，再逐步补齐维度、评分和备注。',
            folderId: input?.folderId ?? null,
          })

      this.projects.unshift(project)
      this.selectedProjectId = project.id
      touchProject(project)
    },

    duplicateProject(projectId: string) {
      const source = this.projects.find(item => item.id === projectId)
      if (!source)
        return

      const project: DecisionProject = {
        ...structuredClone(source),
        id: uid('project'),
        title: `${source.title} 副本`,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        lastOpenedAt: nowISO(),
        shareToken: null,
      }

      this.projects.unshift(project)
      this.selectedProjectId = project.id
    },

    deleteProject(projectId: string) {
      this.projects = this.projects.filter(project => project.id !== projectId)
      if (this.selectedProjectId === projectId) {
        this.selectedProjectId = this.projects[0]?.id ?? null
      }
    },

    updateProjectMeta(projectId: string, patch: Partial<Pick<DecisionProject, 'title' | 'description' | 'folderId'>>) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return
      Object.assign(project, patch)
      touchProject(project)
    },

    toggleFavorite(projectId: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return
      project.isFavorite = !project.isFavorite
      touchProject(project)
    },

    addRow(projectId: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return
      const row: DecisionRow = {
        id: uid('row'),
        title: `方案 ${String.fromCharCode(65 + project.rows.length)}`,
        subtitle: '继续补充这个候选项的定位与约束',
      }
      project.rows.push(row)
      project.columns.forEach((column) => {
        project.cells[getCellKey(row.id, column.id)] = createCell()
      })
      touchProject(project)
    },

    updateRow(projectId: string, rowId: string, patch: Partial<DecisionRow>) {
      const project = this.projects.find(item => item.id === projectId)
      const row = project?.rows.find(item => item.id === rowId)
      if (!project || !row)
        return
      Object.assign(row, patch)
      touchProject(project)
    },

    removeRow(projectId: string, rowId: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project || project.rows.length <= 1)
        return
      project.rows = project.rows.filter(row => row.id !== rowId)
      Object.keys(project.cells).forEach((key) => {
        if (key.startsWith(`${rowId}:`))
          delete project.cells[key]
      })
      touchProject(project)
    },

    addColumn(projectId: string, input?: Partial<DecisionColumn>) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return

      const type = input?.type ?? 'score'
      const column: DecisionColumn = {
        id: uid('column'),
        title: input?.title ?? (type === 'score' ? '新的评分维度' : '新的维度'),
        type,
        weight: input?.weight ?? 1,
        unit: input?.unit ?? '',
        options: input?.options ?? (type === 'select' ? ['选项 1', '选项 2'] : []),
      }

      project.columns.push(column)
      project.rows.forEach((row) => {
        project.cells[getCellKey(row.id, column.id)] = createCell()
      })
      touchProject(project)
    },

    updateColumn(projectId: string, columnId: string, patch: Partial<DecisionColumn>) {
      const project = this.projects.find(item => item.id === projectId)
      const column = project?.columns.find(item => item.id === columnId)
      if (!project || !column)
        return

      Object.assign(column, patch)
      if (patch.type === 'select' && (!patch.options || !patch.options.length) && !column.options.length) {
        column.options = ['选项 1', '选项 2']
      }
      touchProject(project)
    },

    removeColumn(projectId: string, columnId: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project || project.columns.length <= 1)
        return
      project.columns = project.columns.filter(column => column.id !== columnId)
      Object.keys(project.cells).forEach((key) => {
        if (key.endsWith(`:${columnId}`))
          delete project.cells[key]
      })
      touchProject(project)
    },

    updateCell(projectId: string, rowId: string, columnId: string, patch: Partial<DecisionCell>) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return
      const key = getCellKey(rowId, columnId)
      project.cells[key] = cloneCell({
        ...project.cells[key],
        ...patch,
      })
      touchProject(project)
    },

    generateSummary(projectId: string, focusPrompt: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return null
      project.aiSummary = buildAISummary(project, focusPrompt)
      touchProject(project)
      return project.aiSummary
    },

    saveAsTemplate(projectId: string, name: string) {
      const project = this.projects.find(item => item.id === projectId)
      const trimmed = name.trim()
      if (!project || !trimmed)
        return
      this.templates.unshift(cloneTemplateFromProject(project, trimmed))
      touchProject(project)
    },

    createShareLink(projectId: string) {
      const project = this.projects.find(item => item.id === projectId)
      if (!project)
        return null
      project.shareToken = `cm_${Math.random().toString(36).slice(2, 10)}`
      touchProject(project)
      return project.shareToken
    },

    getProjectRanking(projectId: string) {
      const project = this.projects.find(item => item.id === projectId)
      return project ? calculateRanking(project) : []
    },

    getProjectCell(projectId: string, rowId: string, columnId: string) {
      const project = this.projects.find(item => item.id === projectId)
      return project ? resolveProjectCell(project, rowId, columnId) : createCell()
    },
  },

  persist: {
    storage: localStorage,
  },
})
