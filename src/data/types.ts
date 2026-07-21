export type TrackId = 'electrical' | 'power' | 'cooling'

export type Difficulty = 'Foundation' | 'Intermediate' | 'Advanced'

export type Skill =
  | 'diagnosis'
  | 'powerSystems'
  | 'coolingFundamentals'
  | 'safetyLoto'
  | 'uptimeJudgment'
  | 'procedureDiscipline'
  | 'communication'

export type SkillImpact = Partial<Record<Skill, number>>

export type DiagramKind =
  | 'cooling-loop'
  | 'power-path'
  | 'containment'
  | 'ups-chain'
  | 'generator'
  | 'liquid-loop'
  | 'busway'

export type DiagramState = 'alarm' | 'stabilize' | 'isolate' | 'restore'

export type ScenarioOption = {
  id: string
  label: string
  consequence: string
  mentor: string
  impacts: SkillImpact
  nextId: string
}

export type DecisionNode = {
  id: string
  kind: 'decision'
  phase: string
  title: string
  situation: string
  systemReadout: string[]
  diagramState: DiagramState
  prompt: string
  options: ScenarioOption[]
}

export type DebriefNode = {
  id: string
  kind: 'debrief'
  phase: string
  title: string
  systemReadout: string[]
  diagramState: 'restore'
  masterMove: string
  lesson: string
  principle: string
  guardrail: string
}

export type ScenarioNode = DecisionNode | DebriefNode

export type Scenario = {
  id: string
  track: string
  trackId: TrackId
  level: Difficulty
  duration: string
  title: string
  subtitle: string
  mentor: string
  opening: string
  skills: Skill[]
  diagram: DiagramKind
  nodes: Record<string, ScenarioNode>
  startNodeId: string
}

export type Track = {
  id: TrackId
  title: string
  eyebrow: string
  description: string
  accent: string
  skills: Skill[]
  icon: 'bolt' | 'battery' | 'droplet'
}
