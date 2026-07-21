import { skillLabels } from '../data/scenarioLibrary'
import type { Skill } from '../data/types'

type SkillRadarProps = {
  skills: Skill[]
  values: Record<Skill, number>
  recent: Skill[]
}

const center = 120
const radius = 78

function pointFor(index: number, count: number, value: number) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count
  const scaled = (Math.max(0, Math.min(100, value)) / 100) * radius
  return `${center + Math.cos(angle) * scaled},${center + Math.sin(angle) * scaled}`
}

function outerPoint(index: number, count: number, multiplier = 1) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count
  return `${center + Math.cos(angle) * radius * multiplier},${center + Math.sin(angle) * radius * multiplier}`
}

export function SkillRadar({ skills, values, recent }: SkillRadarProps) {
  const polygon = skills.map((skill, index) => pointFor(index, skills.length, values[skill])).join(' ')
  const axisPoints = skills.map((_, index) => outerPoint(index, skills.length)).join(' ')

  return (
    <div className="skill-radar">
      <svg viewBox="0 0 240 240" role="img" aria-label="Competency radar">
        {[0.25, 0.5, 0.75, 1].map((multiplier) => (
          <polygon
            className="radar-grid"
            key={multiplier}
            points={skills.map((_, index) => outerPoint(index, skills.length, multiplier)).join(' ')}
          />
        ))}
        {skills.map((_, index) => {
          const [x, y] = outerPoint(index, skills.length).split(',')
          return <line className="radar-axis" key={index} x1={center} y1={center} x2={x} y2={y} />
        })}
        <polygon className="radar-data" points={polygon} />
        {skills.map((skill, index) => {
          const [x, y] = pointFor(index, skills.length, values[skill]).split(',')
          return <circle className={recent.includes(skill) ? 'radar-dot is-recent' : 'radar-dot'} key={skill} cx={x} cy={y} r="3.3" />
        })}
        {skills.map((skill, index) => {
          const [x, y] = outerPoint(index, skills.length, 1.25).split(',')
          return (
            <text className="radar-label" key={skill} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
              {skillLabels[skill].replace(' ', '\n')}
            </text>
          )
        })}
        <polygon className="sr-only" points={axisPoints} />
      </svg>
    </div>
  )
}
