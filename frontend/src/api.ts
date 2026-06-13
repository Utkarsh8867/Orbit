import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

const api = axios.create({ baseURL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('orbit_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const importRepo = (gitlab_url: string) =>
  api.post('/repositories/', { gitlab_url }).then(r => r.data)

export const listRepos = () =>
  api.get('/repositories/').then(r => r.data)

export const runAnalysis = (repository_id: number, feature_request: string) =>
  api.post('/analyses/', { repository_id, feature_request }).then(r => r.data)

export const getAnalysis = (id: number) =>
  api.get(`/analyses/${id}`).then(r => r.data)

export const getRepoAnalyses = (repo_id: number) =>
  api.get(`/analyses/repository/${repo_id}`).then(r => r.data)

export const createIssues = (analysis_id: number, repository_id: number) =>
  api.post(`/analyses/${analysis_id}/create-issues`, { analysis_id, repository_id }).then(r => r.data)
