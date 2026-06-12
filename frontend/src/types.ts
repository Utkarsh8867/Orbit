export type Repository = {
  id: number
  gitlab_url: string
  name: string
  description?: string
  created_at: string
}

export type Service = {
  name: string
  description: string
  tech_stack?: string
}

export type Dependency = {
  from: string
  to: string
  type: string
}

export type Architecture = {
  summary: string
  services: Service[]
  layers: { name: string; components: string[] }[]
  dependencies: Dependency[]
  architecture_type: string
  feature_approach: string
}

export type AffectedFile = {
  path: string
  change_type: string
  reason: string
}

export type AffectedService = {
  name: string
  reason: string
}

export type AffectedApi = {
  endpoint: string
  method: string
  change: string
  reason: string
}

export type Impact = {
  affected_services: AffectedService[]
  affected_files: AffectedFile[]
  affected_apis: AffectedApi[]
  affected_db_tables: { table: string; changes: string[] }[]
  affected_modules: string[]
  estimated_files_changed: number
}

export type SecurityRisk = {
  title: string
  category: string
  description: string
  severity: string
}

export type Mitigation = {
  risk_title: string
  action: string
  priority: string
}

export type Security = {
  risk_level: string
  risks: SecurityRisk[]
  mitigations: Mitigation[]
  compliance_notes: string[]
}

export type TestCase = {
  name: string
  description: string
}

export type Testing = {
  unit_tests: TestCase[]
  integration_tests: TestCase[]
  e2e_tests: TestCase[]
  regression_tests: string[]
  estimated_test_count: number
}

export type Task = {
  title: string
  description: string
  assignee_role: string
  effort_hours: number
}

export type Phase = {
  phase_number: number
  name: string
  description: string
  tasks: Task[]
}

export type GitLabIssue = {
  title: string
  description: string
  labels: string[]
  phase: string
}

export type Roadmap = {
  phases: Phase[]
  total_effort_hours: number
  estimated_days: number
  recommended_team_size: number
  complexity: string
  gitlab_issues: GitLabIssue[]
}

export type Analysis = {
  id: number
  repository_id: number
  feature_request: string
  architecture?: Architecture
  impact?: Impact
  security?: Security
  testing?: Testing
  roadmap?: Roadmap
  gitlab_issues?: { title: string; url?: string; id?: number; error?: string }[]
  created_at: string
}
