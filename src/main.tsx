import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { TechnicalDiagram } from './components/TechnicalDiagram'
import { demoScenarioId, getScenario, levels, scenariosFor, skillLabels, tracks } from './data/scenarioLibrary'
import type { Difficulty, Scenario, ScenarioOption, Skill, TrackId } from './data/types'
import './styles.css'

type View = 'home' | 'library' | 'briefing' | 'simulator'

type LessonPrimer = {
  intro: string
  objective: string
  rules: string[]
  terms: Array<{ term: string; definition: string }>
}

const firstLessonPrimer: LessonPrimer = {
  intro: 'You do not need data-center experience for this first lesson. You will practice slowing down an alert, involving the right people, and protecting equipment before anyone changes it.',
  objective: 'Protect people and the GPU workload by sharing the alarm, checking available backup cooling, and following the approved response.',
  rules: [
    'An alarm is information—not an instruction to reset equipment.',
    'Tell the shift lead and NOC before any change so the team has one shared picture.',
    'Use the approved response path before touching cooling equipment.',
  ],
  terms: [
    { term: 'NOC', definition: 'The operations team watching alarms and coordinating the response.' },
    { term: 'CRAC', definition: 'A computer-room air conditioner that sends cool air toward the racks.' },
    { term: 'N+1', definition: 'One extra backup unit is available if another unit loses capacity.' },
  ],
}

const trackPrimers: Record<TrackId, LessonPrimer> = {
  electrical: {
    intro: 'This lesson practices how an electrical team thinks before taking action. It is a judgment simulation, not hands-on electrical instruction.',
    objective: 'Recognize the system boundary, communicate the condition, and use the approved procedure before changing a power path.',
    rules: [
      'Never treat a diagram or alarm as permission to operate equipment.',
      'Verify the power path and notify the people responsible for the load.',
      'Use site procedures and qualified personnel for any real electrical work.',
    ],
    terms: [
      { term: 'UPS', definition: 'Battery-backed equipment that keeps critical load powered during a power interruption.' },
      { term: 'One-line', definition: 'A simplified map showing how electrical power flows through a facility.' },
      { term: 'LOTO', definition: 'Lockout/tagout: a safety process used to control hazardous energy.' },
    ],
  },
  power: {
    intro: 'This lesson practices power-resilience decisions. You will learn the order of thinking before a UPS, generator, or transfer event is acted on.',
    objective: 'Protect the critical load by confirming the source, redundancy, and approved response before a power transition.',
    rules: [
      'Do not create a second transition while the first condition is still being understood.',
      'Confirm what is carrying the load before changing a power source.',
      'Coordinate every power response with the shift lead and operations team.',
    ],
    terms: [
      { term: 'Critical load', definition: 'The servers and systems that must stay powered.' },
      { term: 'Generator', definition: 'Backup equipment that produces power when utility power is unavailable.' },
      { term: 'Transfer', definition: 'Moving the load from one power source to another through a controlled process.' },
    ],
  },
  cooling: {
    intro: 'This lesson practices cooling-system judgment. You will learn to read the whole thermal picture before making a change.',
    objective: 'Protect temperature margin by checking airflow, liquid flow, and redundancy before acting on a cooling alarm.',
    rules: [
      'A temperature alarm is a trend to understand, not a signal to improvise.',
      'Check the backup path before changing an active cooling unit.',
      'Keep containment and liquid systems within their approved operating procedure.',
    ],
    terms: [
      { term: 'Containment', definition: 'The barriers that keep cold supply air separate from hot return air.' },
      { term: 'CDU', definition: 'A coolant distribution unit that manages liquid cooling for high-density equipment.' },
      { term: 'Thermal margin', definition: 'The safe space between current temperature and the site limit.' },
    ],
  },
}

const missionStripMessage = 'THE SKILLED-LABOR GAP IS A CRITICAL INFRASTRUCTURE GAP.'

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

function choiceScore(option: ScenarioOption) {
  return Object.values(option.impacts).reduce((sum, impact) => sum + impact, 0)
}

function displayDifficulty(value: Difficulty) {
  return value === 'Foundation' ? 'Beginner' : value
}

function levelGuidance(value: Difficulty) {
  if (value === 'Foundation') return 'Start here · no prior experience required'
  if (value === 'Intermediate') return 'Build on the basics · complete a beginner lesson first'
  return 'Advanced practice · review the guide if any term is unfamiliar'
}

function primerFor(scenario: Scenario) {
  return scenario.id === demoScenarioId ? firstLessonPrimer : trackPrimers[scenario.trackId]
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
  const mentorResponseRef = useRef<HTMLElement | null>(null)
  const decisionPanelRef = useRef<HTMLElement | null>(null)

  const activeTrack = tracks.find((track) => track.id === trackId) ?? tracks[0]
  const filteredScenarios = useMemo(
    () => scenariosFor(trackId, level === 'All' ? undefined : level),
    [trackId, level],
  )
  const activeNode = activeScenario && nodeId ? activeScenario.nodes[nodeId] : null
  const lessonPrimer = activeScenario ? primerFor(activeScenario) : null
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
  const selectedChoiceIsCorrect = selectedChoice ? choiceScore(selectedChoice) > 0 : false

  useEffect(() => {
    if (!selectedChoice) return
    requestAnimationFrame(() => mentorResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [selectedChoice])

  function prepareScenario(scenario: Scenario, nextView: 'briefing' | 'simulator') {
    setActiveScenario(scenario)
    setTrackId(scenario.trackId)
    setNodeId(scenario.startNodeId)
    setPendingChoice(null)
    setSelectedChoice(null)
    setChoiceCount(0)
    setStrongChoices(0)
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openLessonBriefing(scenario: Scenario) {
    prepareScenario(scenario, 'briefing')
  }

  function startLesson() {
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
    setChoiceCount((count) => count + 1)
    if (choiceScore(option) > 0) {
      setStrongChoices((count) => count + 1)
    }
    setSelectedChoice(option)
    setPendingChoice(null)
  }

  function advance() {
    if (!selectedChoice || !selectedChoiceIsCorrect) return
    setNodeId(selectedChoice.nextId)
    setPendingChoice(null)
    setSelectedChoice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retryQuestion() {
    setPendingChoice(null)
    setSelectedChoice(null)
    requestAnimationFrame(() => decisionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
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
                <button className="button button-primary" onClick={() => openLessonBriefing(getScenario(demoScenarioId)!)}><Icon name="play" />Learn the basics for Lesson 1 <Icon name="arrow" /></button>
                <p className="hero-cta-note">2-minute primer · Then start your first guided lesson</p>
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

          <section className="mission-strip" aria-label={missionStripMessage}>
            <div className="mission-strip-track" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => <p key={index}>{missionStripMessage}</p>)}
            </div>
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
                  <p className="lesson-fit">{levelGuidance(scenario.level)}</p>
                  <button className="mission-start" onClick={() => openLessonBriefing(scenario)}>Read the lesson guide <Icon name="arrow" /></button>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {view === 'briefing' && activeScenario && lessonPrimer && (
        <main className="briefing-page">
          <section className="briefing-shell">
            <div className="briefing-copy">
              <button className="back-link" onClick={() => setView('library')}>← All lessons</button>
              <p className="eyebrow"><span className="eyebrow-pulse" />BEFORE YOU DECIDE · {displayDifficulty(activeScenario.level).toUpperCase()}</p>
              <h1>{activeScenario.id === demoScenarioId ? <>Before Lesson 1,<br /><em>learn the basics.</em></> : <>Before this lesson,<br /><em>get oriented.</em></>}</h1>
              <p className="briefing-lead">{lessonPrimer.intro}</p>
              <p className="briefing-level">{levelGuidance(activeScenario.level)}</p>
              <section className="briefing-objective"><span>YOUR GOAL</span><strong>{lessonPrimer.objective}</strong></section>
              <button className="button button-primary" onClick={startLesson}><Icon name="play" />I’m ready — start {activeScenario.id === demoScenarioId ? 'Lesson 1' : 'this lesson'} <Icon name="arrow" /></button>
              <p className="briefing-note">You are not expected to know every term yet. This guide gives you the context you need for the first decision.</p>
            </div>
            <div className="briefing-teach">
              <section className="primer-card">
                <span>THREE THINGS TO KNOW</span>
                <ol>{lessonPrimer.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
              </section>
              <section className="primer-card primer-terms">
                <span>WORDS YOU’LL SEE</span>
                <dl>{lessonPrimer.terms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
              </section>
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
                    <ol><li>Read the job-site condition.</li><li>Select one response card below.</li><li>Revise it if needed, then lock it in.</li><li>Choose the recommended response to continue.</li></ol>
                  </section>
                )}
                <section className="decision-panel" ref={decisionPanelRef}>
                  <div className="decision-label"><span>{selectedChoice ? 'RESPONSE LOCKED' : pendingChoice ? 'NEXT · REVIEW THEN LOCK YOUR RESPONSE' : 'START HERE · SELECT ONE RESPONSE BELOW TO PROCEED'}</span><p>{activeNode.prompt}</p></div>
                  <div className="option-list">
                    {activeNode.options.map((option, index) => (
                      <button className={selectedChoice?.id === option.id ? `option-card is-locked ${selectedChoiceIsCorrect ? 'is-correct' : 'is-incorrect'}` : pendingChoice?.id === option.id ? 'option-card is-selected' : 'option-card'} disabled={Boolean(selectedChoice)} aria-pressed={pendingChoice?.id === option.id || selectedChoice?.id === option.id} key={option.id} onClick={() => choose(option)}>
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
                  <section className={`mentor-response ${selectedChoiceIsCorrect ? 'is-correct' : 'is-incorrect'}`} ref={mentorResponseRef} tabIndex={-1} aria-live="polite">
                    <div className="response-kicker"><span className="response-dot" />{selectedChoiceIsCorrect ? 'CORRECT RESPONSE · FEEDBACK READY' : 'INCORRECT RESPONSE · FEEDBACK READY'}</div>
                    <div className={`answer-outcome ${selectedChoiceIsCorrect ? 'is-correct' : 'is-incorrect'}`}>
                      <span className="outcome-icon" aria-hidden="true">{selectedChoiceIsCorrect ? '✓' : '!'}</span>
                      <div><span>{selectedChoiceIsCorrect ? 'CORRECT' : 'INCORRECT'}</span><strong>{selectedChoiceIsCorrect ? 'You chose the recommended response.' : 'This is not the recommended response.'}</strong><p>{selectedChoiceIsCorrect ? 'This protects safety, evidence, and uptime in the right order.' : 'Read the consequence below, then choose a different response for this same step.'}</p></div>
                    </div>
                    <p className="consequence"><strong>System result:</strong> {selectedChoice.consequence}</p>
                    <blockquote>“{selectedChoice.mentor.replace(/^“|”$/g, '')}”</blockquote>
                    <p className="next-action"><span>NEXT STEP</span>{selectedChoiceIsCorrect ? <>Read the feedback above, then continue to <strong>{nextStepLabel}</strong>.</> : <>To continue, choose the recommended response for this same step.</>}</p>
                    <div className="response-bottom"><div className="impact-list">{(Object.entries(selectedChoice.impacts) as [Skill, number][]).map(([skill, impact]) => <span className={impact > 0 ? 'impact is-positive' : 'impact is-negative'} key={skill}>{skillLabels[skill]} {impactText(impact)}</span>)}</div><button className="button button-primary" onClick={selectedChoiceIsCorrect ? advance : retryQuestion}>{selectedChoiceIsCorrect ? (nextNode?.kind === 'debrief' ? 'See lesson wrap-up' : `Continue to ${nextStepLabel}`) : 'Choose another response'} <Icon name="arrow" /></button></div>
                  </section>
                )}
              </div>
              <aside className="simulation-aside">
                <TechnicalDiagram kind={activeScenario.diagram} state={activeNode.diagramState} />
              </aside>
            </section>
          ) : (
            <section className="debrief-layout">
              <div className="debrief-main"><p className="eyebrow"><span className="eyebrow-pulse" />LESSON COMPLETE · {displayDifficulty(activeScenario.level).toUpperCase()}</p><h1>{activeNode.title}</h1><p className="debrief-lead">{activeNode.lesson}</p><div className="debrief-principle"><span>MASTER PRINCIPLE</span><strong>{activeNode.principle}</strong></div><section className="master-note"><span className="mentor-badge">MV</span><div><p>MENTOR DEBRIEF</p><blockquote>“{activeNode.masterMove}”</blockquote></div></section><div className="debrief-actions"><button className="button button-primary" onClick={() => openLessonBriefing(activeScenario)}><Icon name="play" />Run it again</button><button className="button button-quiet" onClick={() => setView('library')}>Choose another lesson <Icon name="arrow" /></button></div><p className="safety-note"><Icon name="shield" />{activeNode.guardrail}</p></div>
              <aside className="debrief-score"><p>LESSON RESULT</p><div className="score-number">{choiceCount ? Math.round((strongChoices / choiceCount) * 100) : 0}<small>%</small></div><span>Recommended response rate</span><div className="score-line" /><p className="score-caption">{strongChoices} recommended responses across {choiceCount} answer attempts.</p></aside>
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
