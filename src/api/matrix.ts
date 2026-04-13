import { api } from '@/request'

export type MatrixColumnType = 'text' | 'numeric' | 'score' | 'select'

export interface FolderRecord {
  id: number
  user_id: number
  name: string
  created_at: string
  updated_at: string
}

export interface ProjectRecord {
  id: number
  user_id: number
  folder_id: number | null
  title: string
  description: string
  is_favorite: boolean
  last_opened_at: string | null
  share_token: string | null
  created_at: string
  updated_at: string
}

export interface MatrixRowRecord {
  id: number
  project_id: number
  name: string
  subtitle: string
  cover_image_url: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MatrixColumnRecord {
  id: number
  project_id: number
  title: string
  type: MatrixColumnType
  weight: number
  unit: string
  options: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface MatrixCellRecord {
  id: number
  project_id: number
  row_id: number
  column_id: number
  text_content: string
  note: string
  numeric_value: number | null
  score_value: number | null
  select_value: string | null
  created_at: string
  updated_at: string
}

export interface ProjectPayloadRecord {
  project: ProjectRecord
  rows: MatrixRowRecord[]
  columns: MatrixColumnRecord[]
  cells: MatrixCellRecord[]
}

export function getFoldersApi() {
  return api.get<FolderRecord[]>({
    url: '/folders',
  })
}

export function createFolderApi(data: { name: string }) {
  return api.post<FolderRecord>({
    url: '/folders',
    data,
  })
}

export function getProjectsApi() {
  return api.get<ProjectRecord[]>({
    url: '/projects',
  })
}

export function createProjectApi(data: {
  title: string
  description?: string
  folder_id?: number | null
  is_favorite?: boolean
}) {
  return api.post<ProjectRecord>({
    url: '/projects',
    data,
  })
}

export function updateProjectApi(projectID: number, data: {
  title: string
  description: string
  folder_id: number | null
  is_favorite: boolean
  last_opened_at: string | null
  share_token: string | null
}) {
  return api.put<ProjectRecord>({
    url: `/projects/${projectID}`,
    data,
  })
}

export function deleteProjectApi(projectID: number) {
  return api.delete<{ id: number }>({
    url: `/projects/${projectID}`,
  })
}

export function getProjectPayloadApi(projectID: number) {
  return api.get<ProjectPayloadRecord>({
    url: `/projects/${projectID}/payload`,
  })
}

export function createRowApi(projectID: number, data: { name: string, subtitle?: string }) {
  return api.post<MatrixRowRecord>({
    url: `/projects/${projectID}/rows`,
    data,
  })
}

export function updateRowApi(projectID: number, rowID: number, data: { name: string, subtitle: string }) {
  return api.put<MatrixRowRecord>({
    url: `/projects/${projectID}/rows/${rowID}`,
    data,
  })
}

export function deleteRowApi(projectID: number, rowID: number) {
  return api.delete<{ id: number }>({
    url: `/projects/${projectID}/rows/${rowID}`,
  })
}

export function createColumnApi(projectID: number, data: {
  title: string
  type: MatrixColumnType
  weight?: number
  unit?: string
  options?: string[]
}) {
  return api.post<MatrixColumnRecord>({
    url: `/projects/${projectID}/columns`,
    data,
  })
}

export function updateColumnApi(projectID: number, columnID: number, data: {
  title: string
  type: MatrixColumnType
  weight: number
  unit: string
  options: string[]
}) {
  return api.put<MatrixColumnRecord>({
    url: `/projects/${projectID}/columns/${columnID}`,
    data,
  })
}

export function deleteColumnApi(projectID: number, columnID: number) {
  return api.delete<{ id: number }>({
    url: `/projects/${projectID}/columns/${columnID}`,
  })
}

export function upsertCellApi(projectID: number, data: {
  row_id: number
  column_id: number
  text_content: string
  note: string
  numeric_value: number | null
  score_value: number | null
  select_value: string | null
}) {
  return api.put<MatrixCellRecord>({
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
