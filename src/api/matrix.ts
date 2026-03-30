import { api } from '@/request'

export interface Project {
  id: number
  user_id: number
  folder_id: number | null
  title: string
  created_at: string
  updated_at: string
}

export interface MatrixRow {
  id: number
  project_id: number
  name: string
  cover_image_url: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type MatrixColumnType = 'text' | 'numeric' | 'score' | 'select'

export interface MatrixColumn {
  id: number
  project_id: number
  title: string
  type: MatrixColumnType
  weight: number
  config: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MatrixCell {
  id: number
  project_id: number
  row_id: number
  column_id: number
  text_content: string
  numeric_value: number
  score_value: number
  created_at: string
  updated_at: string
}

export interface ProjectPayload {
  project: Project
  rows: MatrixRow[]
  columns: MatrixColumn[]
  cells: MatrixCell[]
}

export function getProjectsApi() {
  return api.get<Project[]>({
    url: '/projects',
  })
}

export function createProjectApi(data: { title: string, folder_id?: number | null }) {
  return api.post<Project>({
    url: '/projects',
    data,
  })
}

export function getProjectPayloadApi(projectID: number) {
  return api.get<ProjectPayload>({
    url: `/projects/${projectID}/payload`,
  })
}

export function createRowApi(projectID: number, data: { name: string }) {
  return api.post<MatrixRow>({
    url: `/projects/${projectID}/rows`,
    data,
  })
}

export function createColumnApi(projectID: number, data: { title: string, type: MatrixColumnType }) {
  return api.post<MatrixColumn>({
    url: `/projects/${projectID}/columns`,
    data,
  })
}

export function upsertCellApi(projectID: number, data: {
  row_id: number
  column_id: number
  text_content?: string
  numeric_value?: number
  score_value?: number
}) {
  return api.put<MatrixCell>({
    url: `/projects/${projectID}/cells`,
    data,
  })
}

export function generateProjectSummaryApi(projectID: number) {
  return api.post<{ summary: string }>({
    url: `/projects/${projectID}/ai/summary`,
    data: {},
  })
}
