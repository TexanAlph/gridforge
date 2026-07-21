import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SkillRadar } from './components/SkillRadar'
import { TechnicalDiagram } from './components/TechnicalDiagram'
import { demoScenarioId, getScenario, levels, scenariosFor, skillLabels, tracks } from './data/scenarioLibrary'
import type { Difficulty, Scenario, ScenarioOption, Skill, TrackId } from './data/types'
import './styles.css'

type View = 'home' | 'library' | 'simulator'

const skillKeys = Object.keys(skillLabels) as Skill[]
const initialCompetencies = skillKeys.reduce<Record<Skill, number>>((values, skill) => {
  values[skill] = 18
  return values
}, {} as Record<Skill, number>)

function loadCompetencies() {
  try {
    const stored = window.localStorage.getItem('gridforge-competencies')
    return stored ? { ...initialCompetencies, ...JSON.parse(stored) } : initialCompetencies
  } catch {
    return initialCompetencies
  }
}

function Icon({ name }: { name: 'bolt' | 'battery' | 'droplet' | 'arrow' | 'play' | 'shield' | 'signal' | 'book' }) {
  const paths = {
    bolt: <path d="M13 2 3.7 13h6.8L10 22l10.3-13h-6.8L13 2Z" />,
    battery: <><rect x="3" y="6" width="17" height="12" rx="2" /><path d="M21 10v4M7 10h5M9.5 7.5v5" /></>,
    droplet: <path d="M12 2.6c-2.8 3.8-6.3 7.4-6.3 11A6.3 6.3 0 0 0 18.3 13.6c0-3.6-3.5-7.2-6.3-11Z" />,
    arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
    play: <path d="m9 6 9 6-9 6V6Z" />,
    shield: <path d="M12 3.2 20 6v5.8c0 4.6-3.2 7.7-8 9-4.8-1.3-8-4.4-8-9V6l8-2.8Z" />,
    signal: <><path d="M4 18V9M9.3 18V5.5M14.7 18V9.5M20 18V3" /><path d="M3 20h18" /></>,
    book: <><path d="M4 5.3A3.3 3.3 0 0 1 7.3 2H20v17H7.3A3.3 3.3 0 0 0 4 22V5.3Z" /><path d="M4 19.2A3.3 3.3 0 0 1 7.3 16H20" /></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function impactText(value: number) {
  return `${value > 0 ? '+' : ''}${value}`
}

function displayDifficulty(value: Difficulty) {
  return value === 'Foundation' ? 'Beginner' : value
}

function App() {
  const [view, setView] = useState<View>('home')
  const [trackId, setTrackId] = useState<TrackId>('electrical')
  const [level, setLevel] = useState<Difficulty | 'All'>('All')
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [nodeId, setNodeId] = useState('')
  const [pendingChoice, setPendingChoice] = useState<ScenarioOption | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<ScenarioOption | null>(null)
  const [choiceCount, setChoiceCount] = useState(0)
  const [strongChoices, setStrongChoices] = useState(0)
  const [competencies, setCompetencies] = useState<Record<Skill, number>>(loadCompetencies)
  const [recentSkills, setRecentSkills] = useState<Skill[]>([])
  const mentorResponseRef = useRef<HTMLElement | null>(null)

  const activeTrack = tracks.find((track) => track.id === trackId) ?? tracks[0]
  const filteredScenarios = useMemo(
    () => scenariosFor(trackId, level === 'All' ? undefined : level),
    [trackId, level],
  )
  const activeNode = activeScenario && nodeId ? activeScenario.nodes[nodeId] : null
  const nextNode = activeScenario && selectedChoice ? activeScenario.nodes[selectedChoice.nextId] : null
  const nextStepLabel = nextNode?.kind === 'debrief'
    ? 'your lesson wrap-up'
    : nextNode?.kind === 'decision'
      ? nextNode.phase.replace(/^\d+\s*·\s*/, '')
      : 'the next step'
  const currentStepName = activeNode?.kind === 'decision'
    ? activeNode.phase.replace(/^\d+\s*·\s*/, '')
    : ''
  const totalStages = activeScenario?.id === demoScenarioId ? 4 : 3
  const phaseNumber = activeNode?.kind === 'decision'
    ? Number(activeNode.phase.match(/^(\d+)/)?.[1] ?? Math.min(choiceCount + 1, totalStages))
    : totalStages
  const stageNumber = Math.max(1, Math.min(totalStages, phaseNumber))
  const pendingChoiceNumber = activeNode?.kind === 'decision' && pendingChoice
    ? String(activeNode.options.findIndex((option) => option.id === pendingChoice.id) + 1).padStart(2, '0')
    : ''

  useEffect(() => {
    window.localStorage.setItem('gridforge-competencies', JSON.stringify(competencies))
  }, [competencies])

  useEffect(() => {
    if (!selectedChoice) return
    requestAnimationFrame(() => mentorResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [selectedChoice])

  function startScenario(scenario: Scenario) {
    setActiveScenario(scenario)
    setTrackId(scenario.trackId)
    setNodeId(scenario.startNodeId)
    setPendingChoice(null)
    setSelectedChoice(null)
    setChoiceCount(0)
    setStrongChoices(0)
    setRecentSkills([])
    setView('simulator')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function choose(option: ScenarioOption) {
    if (selectedChoice) return
    setPendingChoice(option)
  }

  function revealChoice() {
    if (!pendingChoice) return
    const option = pendingChoice
    const changedSkills = (Object.entries(option.impacts) as [Skill, number][])
      .filter(([, value]) => value !== 0)
      .map(([skill]) => skill)
    setRecentSkills(changedSkills)
    setCompetencies((current) => {
      const updated = { ...current }
      for (const [skill, impact] of Object.entries(option.impacts) as [Skill, number][]) {
        updated[skill] = Math.max(0, Math.min(100, updated[skill] + impact * 4))
      }
      return updated
    })
    setChoiceCount((count) => count + 1)
    if (Object.values(option.impacts).reduce((sum, impact) => sum + impact, 0) > 0) {
      setStrongChoices((count) => count + 1)
    }
    setSelectedChoice(option)
    setPendingChoice(null)
  }

  function advance() {
    if (!selectedChoice) return
    setNodeId(selectedChoice.nextId)
    setPendingChoice(null)
    setSelectedChoice(null)
    setRecentSkills([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function returnHome() {
    setView('home')
    setActiveScenario(null)
    setNodeId('')
    setPendingChoice(null)
    setSelectedChoice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={returnHome} aria-label="GridForge home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span>GRID<span>FORGE</span></span>
        </button>
        <nav className="header-nav" aria-label="Main navigation">
          <button className={view === 'home' ? 'is-active' : ''} onClick={returnHome}>Home</button>
          <button className={view === 'library' ? 'is-active' : ''} onClick={() => setView('library')}>All lessons</button>
        </nav>
        <div className="runtime-proof"><span className="status-dot" />KEYLESS · OFFLINE-READY</div>
      </header>

      {view === 'home' && (
        <main>
          <section className="hero-shell">
            <div className="hero-grid" />
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-pulse" />AI DATA CENTERS NEED PEOPLE WHO CAN KEEP THEM ALIVE</p>
              <h1>Train for the work<br />that <em>cannot</em> go dark.</h1>
              <p className="hero-text">GridForge is an AI-authored, zero-key training simulator for the electrical, power, and cooling careers behind the AI boom.</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => startScenario(getScenario(demoScenarioId)!)}><Icon name="play" />Begin Lesson 1: GPU cooling alert <Icon name="arrow" /></button>
                <p className="hero-cta-note">Your first lesson · 8–10 min · No experience needed</p>
              </div>
              <div className="proof-row"><span><Icon name="shield" />No account. No API key.</span><span><Icon name="signal" />Zero runtime API calls.</span></div>
            </div>
            <div className="hero-system-card">
              <div className="system-card-top"><span>YOUR FIRST LESSON</span><span className="system-live"><i />SIMULATED</span></div>
              <div className="hero-diagram"><TechnicalDiagram kind="cooling-loop" state="alarm" /></div>
              <div className="system-alert"><span className="alert-indicator" aria-hidden="true"><i /></span><div><strong>GPU rack cooling alert</strong><p>One aisle is getting warmer</p></div><span className="arrow-glyph">↗</span></div>
              <div className="system-card-footer"><span>LESSON 1 · BEGINNER</span><span>8–10 MIN</span></div>
            </div>
          </section>

          <section className="mission-strip">
            <p>THE SKILLED-LABOR GAP IS A CRITICAL INFRASTRUCTURE GAP.</p>
            <p>THE SKILLED-LABOR GAP IS A CRITICAL INFRASTRUCTURE GAP.</p>
          </section>

          <section className="home-section training-intro">
            <div><p className="section-kicker">THE TRAINING FLOOR</p><h2>Mentorship you can<br />practice under pressure.</h2></div>
            <p className="section-copy">Every lesson is a branching job-site simulation. You make the call, see the consequence, hear the mentor’s reasoning, and build judgment that respects both safety and uptime.</p>
          </section>

          <section className="track-grid home-section">
            {tracks.map((track, index) => (
              <article className="track-card" key={track.id} style={{ '--track-accent': track.accent } as React.CSSProperties}>
                <div className="track-card-top"><span>0{index + 1}</span><span className="track-icon"><Icon name={track.icon} /></span></div>
                <p className="card-eyebrow">{track.eyebrow}</p>
                <h3>{track.title}</h3>
                <p>{track.description}</p>
                <button onClick={() => { setTrackId(track.id); setLevel('All'); setView('library') }}>View {track.title} lessons <Icon name="arrow" /></button>
              </article>
            ))}
          </section>

          <section className="home-section architecture-section">
            <div className="architecture-copy"><p className="section-kicker">BUILT FOR ACCESS</p><h2>All the intelligence is already in the room.</h2><p>GPT-5.6 authored the lesson scenarios, mentor teaching, and branching consequences at build time. GridForge ships that library as static content—so learners can train freely, offline, and without a key.</p></div>
            <div className="architecture-flow" aria-label="Keyless learning flow"><div><span>01</span><strong>AI-authored<br />lessons</strong><small>Build time</small></div><i /><div><span>02</span><strong>Static lesson<br />library</strong><small>Inside the app</small></div><i /><div><span>03</span><strong>Free learner<br />simulator</strong><small>Zero runtime calls</small></div></div>
          </section>
        </main>
      )}

      {view === 'library' && (
        <main className="library-page">
          <section className="library-hero"><p className="eyebrow">ALL LESSONS · 15 STATIC SIMULATIONS</p><h1>Choose your<br /><em>lesson.</em></h1><p>Pick a career track, then choose a beginner, intermediate, or advanced simulation.</p></section>
          <section className="library-controls">
            <div className="track-tabs" role="tablist" aria-label="Choose track">
              {tracks.map((track) => <button key={track.id} role="tab" aria-selected={track.id === trackId} className={track.id === trackId ? 'is-selected' : ''} onClick={() => { setTrackId(track.id); setLevel('All') }}><Icon name={track.icon} />{track.title}</button>)}
            </div>
            <div className="level-tabs" aria-label="Choose level">{(['All', ...levels] as const).map((item) => <button key={item} className={item === level ? 'is-selected' : ''} onClick={() => setLevel(item)}>{item === 'All' ? item : displayDifficulty(item)}</button>)}</div>
          </section>
          <section className="library-missions">
            <div className="mission-list-heading"><div><p className="section-kicker">{activeTrack.eyebrow}</p><h2>{activeTrack.title}</h2></div><span>{filteredScenarios.length} lessons available</span></div>
            <div className="mission-grid">
              {filteredScenarios.map((scenario, index) => (
                <article className="mission-card" key={scenario.id}>
                  <div className="mission-card-line"><span>LESSON {String(index + 1).padStart(2, '0')}</span><span className={`level-badge level-${scenario.level.toLowerCase()}`}>{displayDifficulty(scenario.level)}</span></div>
                  <div className="mission-card-visual"><TechnicalDiagram kind={scenario.diagram} state={index % 2 ? 'stabilize' : 'alarm'} /></div>
                  <p className="mission-duration">{scenario.duration} · {scenario.mentor.split(' · ')[0]}</p>
                  <h3>{scenario.title}</h3><p>{scenario.subtitle}</p>
                  <button className="mission-start" onClick={() => startScenario(scenario)}>Start lesson <Icon name="arrow" /></button>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {view === 'simulator' && activeScenario && activeNode && (
        <main className="simulator-page">
          <section className="simulator-header">
            <button className="back-link" onClick={() => setView('library')}>← All lessons</button>
            <div className="mission-meta"><span>{activeScenario.id === demoScenarioId ? 'Lesson 1' : 'Lesson'}</span><i /> <span>{activeScenario.track}</span><i /> <span>{activeScenario.duration}</span></div>
            <div className="mission-counter">YOUR CHOICES <strong>{choiceCount}</strong></div>
          </section>
          {activeNode.kind === 'decision' ? (
            <section className="simulator-layout">
              <div className="scenario-column">
                <div className="scenario-title-row"><div><p className="section-kicker">STEP {stageNumber} · {currentStepName}</p><h1>{activeNode.title}</h1></div><span className="mentor-badge">MV</span></div>
                {nodeId === activeScenario.startNodeId && <p className="opening-text">{activeScenario.opening}</p>}
                <section className="mission-progress" aria-label={`Lesson step ${stageNumber} of ${totalStages}`}>
                  <div><span>LESSON PROGRESS</span><strong>Step {stageNumber} of {totalStages}</strong></div>
                  <div className="progress-track"><i style={{ width: `${(stageNumber / totalStages) * 100}%` }} /></div>
                  <p>{selectedChoice ? 'Feedback unlocked — read it, then continue.' : pendingChoice ? 'Choice selected — you can revise it or lock it in.' : 'Start here: select one response card below to proceed.'}</p>
                </section>
                <div className="reading-strip">{activeNode.systemReadout.map((reading) => <span key={reading}>{reading}</span>)}</div>
                <p className="situation-text">{activeNode.situation}</p>
                {nodeId === activeScenario.startNodeId && !selectedChoice && (
                  <section className="how-it-works">
                    <span>HOW THIS SIMULATION WORKS</span>
                    <ol><li>Read the job-site condition.</li><li>Select one response card below.</li><li>Revise it if needed, then lock it in.</li><li>Use mentor feedback to continue.</li></ol>
                  </section>
                )}
                <section className="decision-panel">
                  <div className="decision-label"><span>{selectedChoice ? 'RESPONSE LOCKED' : pendingChoice ? 'NEXT · REVIEW THEN LOCK YOUR RESPONSE' : 'START HERE · SELECT ONE RESPONSE BELOW TO PROCEED'}</span><p>{activeNode.prompt}</p></div>
                  <div className="option-list">
                    {activeNode.options.map((option, index) => (
                      <button className={selectedChoice?.id === option.id ? 'option-card is-locked' : pendingChoice?.id === option.id ? 'option-card is-selected' : 'option-card'} disabled={Boolean(selectedChoice)} aria-pressed={pendingChoice?.id === option.id || selectedChoice?.id === option.id} key={option.id} onClick={() => choose(option)}>
                        <span className="option-selector" aria-hidden="true"><i /></span><span className="option-index">0{index + 1}</span><span className="option-copy">{option.label}</span><Icon name="arrow" />
                      </button>
                    ))}
                  </div>
                </section>
                {pendingChoice && !selectedChoice && (
                  <section className="choice-confirmation" aria-live="polite">
                    <div><span>RESPONSE SELECTED · OPTION {pendingChoiceNumber}</span><strong>Review it before you lock it in.</strong><p>You can still pick a different option. Locking reveals the simulated outcome and mentor guidance.</p></div>
                    <div className="choice-confirmation-actions"><button className="text-button" onClick={() => setPendingChoice(null)}>Clear selection</button><button className="button button-primary" onClick={revealChoice}>Lock in &amp; see feedback <Icon name="arrow" /></button></div>
                  </section>
                )}
                {selectedChoice && (
                  <section className="mentor-response" ref={mentorResponseRef} tabIndex={-1} aria-live="polite">
                    <div className="response-kicker"><span className="response-dot" />RESPONSE SAVED · FEEDBACK READY</div>
                    <p className="consequence"><strong>System result:</strong> {selectedChoice.consequence}</p>
                    <blockquote>“{selectedChoice.mentor.replace(/^“|”$/g, '')}”</blockquote>
                    <p className="next-action"><span>NEXT STEP</span>Read the feedback above, then continue to <strong>{nextStepLabel}</strong>.</p>
                    <div className="response-bottom"><div className="impact-list">{(Object.entries(selectedChoice.impacts) as [Skill, number][]).map(([skill, impact]) => <span className={impact > 0 ? 'impact is-positive' : 'impact is-negative'} key={skill}>{skillLabels[skill]} {impactText(impact)}</span>)}</div><button className="button button-primary" onClick={advance}>{nextNode?.kind === 'debrief' ? 'See lesson wrap-up' : `Continue to ${nextStepLabel}`} <Icon name="arrow" /></button></div>
                  </section>
                )}
              </div>
              <aside className="simulation-aside">
                <TechnicalDiagram kind={activeScenario.diagram} state={activeNode.diagramState} />
                <section className="competency-card"><div className="competency-head"><div><p>YOUR READINESS</p><h2>Competency matrix</h2></div><span>LIVE</span></div><SkillRadar skills={activeScenario.skills} values={competencies} recent={recentSkills} /><div className="competency-list">{activeScenario.skills.map((skill) => <div className={recentSkills.includes(skill) ? 'competency-row is-updating' : 'competency-row'} key={skill}><span>{skillLabels[skill]}</span><strong>{competencies[skill]}<small>%</small></strong></div>)}</div></section>
              </aside>
            </section>
          ) : (
            <section className="debrief-layout">
              <div className="debrief-main"><p className="eyebrow"><span className="eyebrow-pulse" />LESSON COMPLETE · {displayDifficulty(activeScenario.level).toUpperCase()}</p><h1>{activeNode.title}</h1><p className="debrief-lead">{activeNode.lesson}</p><div className="debrief-principle"><span>MASTER PRINCIPLE</span><strong>{activeNode.principle}</strong></div><section className="master-note"><span className="mentor-badge">MV</span><div><p>MENTOR DEBRIEF</p><blockquote>“{activeNode.masterMove}”</blockquote></div></section><div className="debrief-actions"><button className="button button-primary" onClick={() => startScenario(activeScenario)}><Icon name="play" />Run it again</button><button className="button button-quiet" onClick={() => setView('library')}>Choose another lesson <Icon name="arrow" /></button></div><p className="safety-note"><Icon name="shield" />{activeNode.guardrail}</p></div>
              <aside className="debrief-score"><p>LESSON SCORE</p><div className="score-number">{choiceCount ? Math.round((strongChoices / choiceCount) * 100) : 0}<small>%</small></div><span>Decision quality</span><div className="score-line" /><p className="score-caption">{strongChoices} strong judgment calls across {choiceCount} decisions.</p><SkillRadar skills={activeScenario.skills} values={competencies} recent={[]} /></aside>
            </section>
          )}
        </main>
      )}

      <footer><span>GRIDFORGE · KEYLESS MISSION-CRITICAL TRAINING</span><span>AUTHORED AT BUILD TIME · RUNS ANYTIME</span></footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
