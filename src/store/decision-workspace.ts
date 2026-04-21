import type {
  MatrixCellRecord,
  MatrixColumnRecord,
  MatrixColumnType,
  MatrixRowRecord,
  ProjectPayloadRecord,
  ProjectRecord,
} from '@/api/matrix'
import { defineStore } from 'pinia'
import {
  createColumnApi,
  createFolderApi,
  createProjectApi,
  createRowApi,
  deleteColumnApi,
  deleteProjectApi,
  deleteRowApi,
  generateProjectSummaryApi,
  getFoldersApi,
  getProjectPayloadApi,
  getProjectsApi,
  updateColumnApi,
  updateProjectApi,
  updateRowApi,
  upsertCellApi,
} from '@/api/matrix'

export type DecisionColumnType = MatrixColumnType

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
  sourceMarkdown?: string
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

interface DecisionWorkspaceState {
  folders: DecisionFolder[]
  templates: DecisionTemplate[]
  projects: DecisionProject[]
  selectedProjectId: string | null
  selectedFolderId: string
  hydratedProjectIds: string[]
  isLoading: boolean
  isLoaded: boolean
}

const folderAccents = ['bg-teal-500', 'bg-sky-500', 'bg-orange-500', 'bg-rose-500', 'bg-emerald-500']

let workspaceLoadPromise: Promise<boolean> | null = null
const cellSaveQueues = new Map<string, Promise<void>>()

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function nowISO() {
  return new Date().toISOString()
}

function toId(value: number | string | null | undefined) {
  return value === null || value === undefined ? null : String(value)
}

function toNumberId(value: string | null | undefined) {
  return value ? Number(value) : null
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

function hasCellContent(cell: DecisionCell) {
  return Boolean(
    cell.text.trim()
    || cell.note.trim()
    || cell.select
    || cell.score !== null
    || cell.numeric !== null,
  )
}

function createTemplateColumns(seed: Array<Partial<DecisionColumn> & Pick<DecisionColumn, 'title' | 'type'>>) {
  return seed.map(column => ({
    id: uid('column'),
    title: column.title,
    type: column.type,
    weight: column.weight ?? 1,
    unit: column.unit ?? '',
    options: [...(column.options ?? [])],
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
      description: '比较多个房源的通勤、预算和居住体验。',
      accent: 'from-cyan-500/20 via-teal-500/15 to-emerald-500/20',
      isOfficial: true,
      columns: createTemplateColumns([
        { title: '租金', type: 'numeric', unit: '元/月' },
        { title: '通勤', type: 'numeric', unit: '分钟' },
        { title: '是否有阳台', type: 'select', options: ['有', '无'] },
        { title: '居住舒适度', type: 'score', weight: 4 },
        { title: '备注', type: 'text' },
      ]),
      starterRows: createStarterRows([
        { title: '房源 A', subtitle: '靠近地铁，预算友好' },
        { title: '房源 B', subtitle: '空间更大，通勤更远' },
      ]),
    },
    {
      id: 'template-phone',
      name: '手机选购',
      category: '消费决策',
      description: '快速比较价格、续航、影像和系统偏好。',
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
        { title: '方案 B', subtitle: '偏整体体验' },
        { title: '方案 C', subtitle: '偏影像能力' },
      ]),
    },
    {
      id: 'template-offer',
      name: 'Offer 对比',
      category: '职业决策',
      description: '把薪资、成长空间和团队匹配度放到一起看。',
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

function createBlankTemplate(): DecisionTemplate {
  return {
    id: 'template-blank',
    name: '空白项目',
    category: '通用',
    description: '从一张干净的矩阵开始整理这次选择。',
    accent: '',
    isOfficial: false,
    columns: createTemplateColumns([
      { title: '成本 / 价格', type: 'numeric', unit: '元' },
      { title: '主观感受', type: 'score', weight: 3 },
      { title: '备注', type: 'text' },
    ]),
    starterRows: createStarterRows([
      { title: '方案 A', subtitle: '先写下第一个候选项' },
      { title: '方案 B', subtitle: '再放一个对照方案' },
    ]),
  }
}

function createDefaultState(): DecisionWorkspaceState {
  return {
    folders: [],
    templates: createOfficialTemplates(),
    projects: [],
    selectedProjectId: null,
    selectedFolderId: 'all',
    hydratedProjectIds: [],
    isLoading: false,
    isLoaded: false,
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
    description: project.description || `来自 ${project.title} 的模板`,
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

function parseOptions(raw: string) {
  if (!raw)
    return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map(item => String(item).trim()).filter(Boolean)
      : []
  }
  catch {
    return raw.split(/[,\n]/g).map(item => item.trim()).filter(Boolean)
  }
}

function buildFolderAccent(index: number) {
  return folderAccents[index % folderAccents.length]!
}

function mapFolder(record: { id: number, name: string }, index: number): DecisionFolder {
  return {
    id: String(record.id),
    name: record.name,
    accent: buildFolderAccent(index),
  }
}

function mapRow(record: MatrixRowRecord): DecisionRow {
  return {
    id: String(record.id),
    title: record.name,
    subtitle: record.subtitle || '',
  }
}

function mapColumn(record: MatrixColumnRecord): DecisionColumn {
  return {
    id: String(record.id),
    title: record.title,
    type: record.type,
    weight: record.weight ?? 1,
    unit: record.unit || '',
    options: parseOptions(record.options),
  }
}

function mapProjectSummary(record: ProjectRecord, existing?: DecisionProject): DecisionProject {
  return {
    id: String(record.id),
    title: record.title,
    description: record.description || '',
    folderId: toId(record.folder_id),
    isFavorite: Boolean(record.is_favorite),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastOpenedAt: record.last_opened_at || record.updated_at || record.created_at,
    rows: existing?.rows ?? [],
    columns: existing?.columns ?? [],
    cells: existing?.cells ?? {},
    aiSummary: existing?.aiSummary ?? null,
    shareToken: record.share_token,
  }
}

function mapCellSeed(record: MatrixCellRecord): Partial<DecisionCell> {
  return {
    text: record.text_content || '',
    note: record.note || '',
    score: typeof record.score_value === 'number' ? record.score_value : null,
    numeric: typeof record.numeric_value === 'number' ? record.numeric_value : null,
    select: record.select_value ?? null,
  }
}

function mapProjectPayload(payload: ProjectPayloadRecord, existing?: DecisionProject): DecisionProject {
  const rows = payload.rows.map(mapRow)
  const columns = payload.columns.map(mapColumn)
  const seed: Record<string, Partial<DecisionCell>> = {}

  payload.cells.forEach((cell) => {
    seed[getCellKey(String(cell.row_id), String(cell.column_id))] = mapCellSeed(cell)
  })

  const project = mapProjectSummary(payload.project, existing)
  project.rows = rows
  project.columns = columns
  project.cells = createProjectCells(rows, columns, seed)
  return project
}

function replaceProject(projects: DecisionProject[], nextProject: DecisionProject) {
  const index = projects.findIndex(project => project.id === nextProject.id)
  if (index >= 0) {
    const next = [...projects]
    next[index] = nextProject
    return next
  }

  return [nextProject, ...projects]
}

function createProjectUpdatePayload(project: DecisionProject) {
  return {
    title: project.title,
    description: project.description,
    folder_id: toNumberId(project.folderId),
    is_favorite: project.isFavorite,
    last_opened_at: project.lastOpenedAt || null,
    share_token: project.shareToken,
  }
}

function getProjectCellPayload(project: DecisionProject, rowId: string, columnId: string) {
  const cell = resolveProjectCell(project, rowId, columnId)

  return {
    row_id: Number(rowId),
    column_id: Number(columnId),
    text_content: cell.text,
    note: cell.note,
    numeric_value: cell.numeric,
    score_value: cell.score,
    select_value: cell.select,
  }
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
      if (cell.score === null || Number.isNaN(cell.score))
        return

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

function buildAISummary(project: DecisionProject, focusPrompt: string, sourceMarkdown?: string): DecisionAISummary {
  const ranking = calculateRanking(project)
  const completeRows = ranking.filter(row => row.total !== null)
  const scoreColumns = getScoreColumns(project)
  const topRow = completeRows[0]
  const gaps: string[] = []

  if (!scoreColumns.length) {
    gaps.push('当前项目还没有评分列，建议先补 1 到 2 个主观评分维度。')
  }

  ranking
    .filter(row => row.required > 0 && row.completed < row.required)
    .forEach((row) => {
      gaps.push(`${row.rowTitle} 还缺少 ${row.required - row.completed} 个评分项，暂未参与排序。`)
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
      bullets.push(`${scored[0].column.title} 得分最高，达到 ${scored[0].score} 分。`)
    }
    if (scored[0]?.note) {
      bullets.push(scored[0].note)
    }
    if (numericHighlights[0]) {
      bullets.push(`关键客观信息：${numericHighlights.slice(0, 2).join('，')}。`)
    }
    if (!bullets.length) {
      bullets.push('当前信息还不够完整，建议继续补充。')
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
      bullets.push('还没有形成足够的主观评分。')
    }

    return {
      rowId: row.id,
      rowTitle: row.title,
      bullets,
    }
  })

  const evidence = [
    `${project.rows.length} 个候选项，${project.columns.length} 个维度，其中 ${scoreColumns.length} 个评分列参与比较。`,
    completeRows.length
      ? `当前可参与排序的候选项有 ${completeRows.length} 个，领先项为 ${topRow?.rowTitle}。`
      : '暂时还没有完整评分项，尚未形成最终排序。',
    focusPrompt.trim()
      ? `这次总结优先围绕“${focusPrompt.trim()}”展开。`
      : '这次总结默认综合考虑客观数值、主观体验和备注信息。',
  ]

  return {
    focusPrompt,
    generatedAt: nowISO(),
    overview: completeRows.length
      ? `${project.title} 已经形成初步排序，目前 ${topRow?.rowTitle} 更均衡。${gaps.length ? '但仍有部分信息不完整，建议补齐后再做最终判断。' : '现有信息已经足以支撑一次初步决策。'}`
      : `${project.title} 目前还处于资料整理阶段，建议先补齐评分项后再生成总结。`,
    recommendation: completeRows.length && topRow
      ? `如果现在就要做决定，可以先把 ${topRow.rowTitle} 当作基准方案，再重点确认它在低分维度上的风险。`
      : '建议先补齐每个候选项的核心评分和关键备注，避免在信息不完整时过早下结论。',
    sourceMarkdown,
    strengths,
    tradeoffs,
    evidence,
    gaps,
  }
}

export const useDecisionWorkspaceStore = defineStore('decision-workspace', {
  state: (): DecisionWorkspaceState => createDefaultState(),

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
    markProjectHydrated(projectId: string) {
      if (!this.hydratedProjectIds.includes(projectId)) {
        this.hydratedProjectIds = [...this.hydratedProjectIds, projectId]
      }
    },

    setProject(project: DecisionProject) {
      this.projects = replaceProject(this.projects, project)
    },

    getProjectById(projectId: string) {
      return this.projects.find(project => project.id === projectId) ?? null
    },

    async persistProject(projectId: string) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      try {
        const response = await updateProjectApi(Number(project.id), createProjectUpdatePayload(project))
        const nextProject = mapProjectSummary(response.data, project)
        nextProject.rows = project.rows
        nextProject.columns = project.columns
        nextProject.cells = project.cells
        nextProject.aiSummary = project.aiSummary
        this.setProject(nextProject)
        return nextProject
      }
      catch {
        return null
      }
    },

    async ensureLoaded(force = false) {
      if (this.isLoaded && !force)
        return true

      if (workspaceLoadPromise && !force)
        return workspaceLoadPromise

      workspaceLoadPromise = (async () => {
        this.isLoading = true

        try {
          const [foldersResponse, projectsResponse] = await Promise.all([
            getFoldersApi(),
            getProjectsApi(),
          ])

          const folderMap = new Map(this.folders.map(folder => [folder.id, folder.accent]))
          this.folders = foldersResponse.data.map((folder, index) => ({
            ...mapFolder(folder, index),
            accent: folderMap.get(String(folder.id)) ?? buildFolderAccent(index),
          }))

          const existingProjects = new Map(this.projects.map(project => [project.id, project]))
          const summaries = projectsResponse.data.map(project => mapProjectSummary(project, existingProjects.get(String(project.id))))
          const payloadResults = await Promise.allSettled(
            projectsResponse.data.map(project => getProjectPayloadApi(project.id)),
          )

          const hydratedProjectIds: string[] = []
          const nextProjects = summaries.map((summary, index) => {
            const payloadResult = payloadResults[index]
            if (payloadResult?.status === 'fulfilled') {
              hydratedProjectIds.push(summary.id)
              return mapProjectPayload(payloadResult.value.data, existingProjects.get(summary.id))
            }
            return summary
          })

          this.projects = nextProjects
          this.hydratedProjectIds = hydratedProjectIds
          this.isLoaded = true

          if (!this.selectedProjectId || !nextProjects.some(project => project.id === this.selectedProjectId)) {
            this.selectedProjectId = nextProjects[0]?.id ?? null
          }

          return true
        }
        catch {
          return false
        }
        finally {
          this.isLoading = false
          workspaceLoadPromise = null
        }
      })()

      return workspaceLoadPromise
    },

    selectFolder(folderId: string) {
      this.selectedFolderId = folderId
    },

    async loadProject(projectId: string, markOpened = false) {
      try {
        const existing = this.getProjectById(projectId) ?? undefined
        const response = await getProjectPayloadApi(Number(projectId))
        const project = mapProjectPayload(response.data, existing)
        this.selectedProjectId = projectId
        this.setProject(project)
        this.markProjectHydrated(projectId)

        if (markOpened) {
          touchProject(project)
          await this.persistProject(projectId)
        }

        return this.getProjectById(projectId)
      }
      catch {
        return null
      }
    },

    async selectProject(projectId: string) {
      await this.ensureLoaded()

      const project = this.getProjectById(projectId)
      if (!project)
        return null

      this.selectedProjectId = projectId

      if (!this.hydratedProjectIds.includes(projectId)) {
        return this.loadProject(projectId, true)
      }

      touchProject(project)
      void this.persistProject(projectId)
      return project
    },

    async createFolder(name: string) {
      const trimmed = name.trim()
      if (!trimmed)
        return null

      try {
        const response = await createFolderApi({ name: trimmed })
        const folder = {
          ...mapFolder(response.data, this.folders.length),
          accent: buildFolderAccent(this.folders.length),
        }
        this.folders = [folder, ...this.folders]
        return folder
      }
      catch {
        return null
      }
    },

    async applyTemplate(projectId: string, template: DecisionTemplate) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      try {
        for (const column of template.columns) {
          await this.addColumn(projectId, {
            title: column.title,
            type: column.type,
            weight: column.weight,
            unit: column.unit,
            options: column.options,
          })
        }

        for (const row of template.starterRows) {
          await this.addRow(projectId, {
            title: row.title,
            subtitle: row.subtitle,
          })
        }

        return this.loadProject(projectId)
      }
      catch {
        return this.getProjectById(projectId)
      }
    },

    async createProject(input?: { title?: string, description?: string, folderId?: string | null, templateId?: string | null }) {
      await this.ensureLoaded()

      const template = input?.templateId
        ? this.templates.find(item => item.id === input.templateId) ?? createBlankTemplate()
        : createBlankTemplate()
      const title = input?.title?.trim() || (input?.templateId ? `${template.name} 新项目` : '新的决策项目')
      const description = input?.description?.trim() || template.description

      try {
        const response = await createProjectApi({
          title,
          description,
          folder_id: toNumberId(input?.folderId ?? null),
        })

        const project = mapProjectSummary(response.data)
        this.setProject(project)
        this.selectedProjectId = project.id
        await this.applyTemplate(project.id, template)
        return this.loadProject(project.id, true)
      }
      catch {
        return null
      }
    },

    async duplicateProject(projectId: string) {
      await this.ensureLoaded()

      let source = this.getProjectById(projectId)
      if (!source)
        return null

      if (!this.hydratedProjectIds.includes(projectId)) {
        source = await this.loadProject(projectId) ?? source
      }

      try {
        const createResponse = await createProjectApi({
          title: `${source.title} 副本`,
          description: source.description,
          folder_id: toNumberId(source.folderId),
          is_favorite: source.isFavorite,
        })

        const duplicated = mapProjectSummary(createResponse.data)
        this.setProject(duplicated)
        this.selectedProjectId = duplicated.id

        const columnIdMap = new Map<string, string>()
        const rowIdMap = new Map<string, string>()

        for (const column of source.columns) {
          const response = await createColumnApi(Number(duplicated.id), {
            title: column.title,
            type: column.type,
            weight: column.weight,
            unit: column.unit,
            options: column.options,
          })
          columnIdMap.set(column.id, String(response.data.id))
        }

        for (const row of source.rows) {
          const response = await createRowApi(Number(duplicated.id), {
            name: row.title,
            subtitle: row.subtitle,
          })
          rowIdMap.set(row.id, String(response.data.id))
        }

        for (const row of source.rows) {
          for (const column of source.columns) {
            const cell = resolveProjectCell(source, row.id, column.id)
            if (!hasCellContent(cell))
              continue

            const nextRowId = rowIdMap.get(row.id)
            const nextColumnId = columnIdMap.get(column.id)
            if (!nextRowId || !nextColumnId)
              continue

            await upsertCellApi(Number(duplicated.id), {
              row_id: Number(nextRowId),
              column_id: Number(nextColumnId),
              text_content: cell.text,
              note: cell.note,
              numeric_value: cell.numeric,
              score_value: cell.score,
              select_value: cell.select,
            })
          }
        }

        return this.loadProject(duplicated.id, true)
      }
      catch {
        return null
      }
    },

    async deleteProject(projectId: string) {
      try {
        await deleteProjectApi(Number(projectId))
        this.projects = this.projects.filter(project => project.id !== projectId)
        this.hydratedProjectIds = this.hydratedProjectIds.filter(id => id !== projectId)

        if (this.selectedProjectId === projectId) {
          this.selectedProjectId = this.projects[0]?.id ?? null
        }

        return true
      }
      catch {
        return false
      }
    },

    async updateProjectMeta(projectId: string, patch: Partial<Pick<DecisionProject, 'title' | 'description' | 'folderId'>>) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      Object.assign(project, patch)
      touchProject(project)
      await this.persistProject(projectId)
      return this.getProjectById(projectId)
    },

    async toggleFavorite(projectId: string) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      project.isFavorite = !project.isFavorite
      touchProject(project)
      await this.persistProject(projectId)
      return this.getProjectById(projectId)
    },

    async addRow(projectId: string, input?: Partial<DecisionRow>) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      try {
        const response = await createRowApi(Number(projectId), {
          name: input?.title || `方案 ${String.fromCharCode(65 + project.rows.length)}`,
          subtitle: input?.subtitle || '继续补充这个候选项的定位与约束',
        })

        const row = mapRow(response.data)
        project.rows.push(row)
        project.columns.forEach((column) => {
          project.cells[getCellKey(row.id, column.id)] = createCell()
        })
        touchProject(project)
        this.markProjectHydrated(projectId)
        return row
      }
      catch {
        return null
      }
    },

    async updateRow(projectId: string, rowId: string, patch: Partial<DecisionRow>) {
      const project = this.getProjectById(projectId)
      const row = project?.rows.find(item => item.id === rowId)
      if (!project || !row)
        return null

      Object.assign(row, patch)
      touchProject(project)

      try {
        await updateRowApi(Number(projectId), Number(rowId), {
          name: row.title,
          subtitle: row.subtitle,
        })
      }
      catch {}

      return row
    },

    async removeRow(projectId: string, rowId: string) {
      const project = this.getProjectById(projectId)
      if (!project || project.rows.length <= 1)
        return false

      try {
        await deleteRowApi(Number(projectId), Number(rowId))
        project.rows = project.rows.filter(row => row.id !== rowId)
        Object.keys(project.cells).forEach((key) => {
          if (key.startsWith(`${rowId}:`))
            delete project.cells[key]
        })
        touchProject(project)
        return true
      }
      catch {
        return false
      }
    },

    async addColumn(projectId: string, input?: Partial<DecisionColumn>) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      const type = input?.type ?? 'score'
      const title = input?.title ?? (type === 'score'
        ? '新的评分维度'
        : type === 'numeric'
          ? '新的数值维度'
          : type === 'select'
            ? '新的选择维度'
            : '新的信息维度')

      try {
        const response = await createColumnApi(Number(projectId), {
          title,
          type,
          weight: input?.weight ?? 1,
          unit: input?.unit ?? '',
          options: input?.options ?? (type === 'select' ? ['选项 1', '选项 2'] : []),
        })

        const column = mapColumn(response.data)
        project.columns.push(column)
        project.rows.forEach((row) => {
          project.cells[getCellKey(row.id, column.id)] = createCell()
        })
        touchProject(project)
        this.markProjectHydrated(projectId)
        return column
      }
      catch {
        return null
      }
    },

    async updateColumn(projectId: string, columnId: string, patch: Partial<DecisionColumn>) {
      const project = this.getProjectById(projectId)
      const column = project?.columns.find(item => item.id === columnId)
      if (!project || !column)
        return null

      Object.assign(column, patch)
      if (column.type === 'select' && !column.options.length) {
        column.options = ['选项 1', '选项 2']
      }
      touchProject(project)

      try {
        await updateColumnApi(Number(projectId), Number(columnId), {
          title: column.title,
          type: column.type,
          weight: column.weight,
          unit: column.unit,
          options: column.options,
        })
      }
      catch {}

      return column
    },

    async removeColumn(projectId: string, columnId: string) {
      const project = this.getProjectById(projectId)
      if (!project || project.columns.length <= 1)
        return false

      try {
        await deleteColumnApi(Number(projectId), Number(columnId))
        project.columns = project.columns.filter(column => column.id !== columnId)
        Object.keys(project.cells).forEach((key) => {
          if (key.endsWith(`:${columnId}`))
            delete project.cells[key]
        })
        touchProject(project)
        return true
      }
      catch {
        return false
      }
    },

    async updateCell(projectId: string, rowId: string, columnId: string, patch: Partial<DecisionCell>) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      const key = getCellKey(rowId, columnId)
      project.cells[key] = cloneCell({
        ...project.cells[key],
        ...patch,
      })
      touchProject(project)

      const queueKey = `${projectId}:${rowId}:${columnId}`
      const previous = cellSaveQueues.get(queueKey) ?? Promise.resolve()
      const persist = async () => {
        const nextProject = this.getProjectById(projectId)
        if (!nextProject)
          return

        await upsertCellApi(Number(projectId), getProjectCellPayload(nextProject, rowId, columnId))
      }

      const trackedPromise: Promise<void> = previous
        .catch(() => undefined)
        .then(persist)
        .finally(() => {
          if (cellSaveQueues.get(queueKey) === trackedPromise) {
            cellSaveQueues.delete(queueKey)
          }
        })

      cellSaveQueues.set(queueKey, trackedPromise)
      await trackedPromise.catch(() => undefined)

      return project.cells[key]
    },

    async generateSummary(projectId: string, focusPrompt: string) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      let sourceMarkdown = ''
      try {
        const response = await generateProjectSummaryApi(Number(projectId), {
          focus_prompt: focusPrompt,
        })
        sourceMarkdown = response.data.summary_markdown || response.data.summary || ''
      }
      catch {}

      project.aiSummary = buildAISummary(project, focusPrompt, sourceMarkdown)
      touchProject(project)
      return project.aiSummary
    },

    saveAsTemplate(projectId: string, name: string) {
      const project = this.getProjectById(projectId)
      const trimmed = name.trim()
      if (!project || !trimmed)
        return null

      const template = cloneTemplateFromProject(project, trimmed)
      this.templates = [template, ...this.templates]
      touchProject(project)
      return template
    },

    async createShareLink(projectId: string) {
      const project = this.getProjectById(projectId)
      if (!project)
        return null

      project.shareToken = project.shareToken || `cm_${Math.random().toString(36).slice(2, 10)}`
      touchProject(project)
      await this.persistProject(projectId)
      return project.shareToken
    },

    getProjectRanking(projectId: string) {
      const project = this.getProjectById(projectId)
      return project ? calculateRanking(project) : []
    },

    getProjectCell(projectId: string, rowId: string, columnId: string) {
      const project = this.getProjectById(projectId)
      return project ? resolveProjectCell(project, rowId, columnId) : createCell()
    },
  },
})
