import { sampleScenario } from './sampleScenario'
import type {
  Difficulty,
  DiagramKind,
  Scenario,
  ScenarioOption,
  Skill,
  SkillImpact,
  Track,
  TrackId,
} from './types'

type Choice = Omit<ScenarioOption, 'id' | 'nextId'>

type Beat = {
  phase: string
  title: string
  situation: string
  systemReadout: string[]
  prompt: string
  options: [Choice, Choice, Choice]
}

type ScenarioSpec = Omit<Scenario, 'nodes' | 'startNodeId'> & {
  beats: [Beat, Beat, Beat]
  debrief: Pick<
    Extract<Scenario['nodes'][string], { kind: 'debrief' }>,
    'title' | 'masterMove' | 'lesson' | 'principle'
  >
}

const guardrail =
  'This simulated scenario builds judgment only. Real critical-facilities work requires qualified personnel, site-specific procedures, proper authorization, applicable codes, and verified safety controls.'

const choice = (
  label: string,
  consequence: string,
  mentor: string,
  impacts: SkillImpact,
): Choice => ({ label, consequence, mentor, impacts })

function makeScenario(spec: ScenarioSpec): Scenario {
  const nodes: Scenario['nodes'] = {}

  spec.beats.forEach((beat, index) => {
    const id = `beat-${index + 1}`
    const recoveryId = `recover-${index + 1}`
    const nextId = index === spec.beats.length - 1 ? 'debrief' : `beat-${index + 2}`

    nodes[id] = {
      id,
      kind: 'decision',
      phase: beat.phase,
      title: beat.title,
      situation: beat.situation,
      systemReadout: beat.systemReadout,
      diagramState: index === 0 ? 'alarm' : index === 1 ? 'stabilize' : 'restore',
      prompt: beat.prompt,
      options: beat.options.map((option, optionIndex) => ({
        ...option,
        id: `${id}-option-${optionIndex + 1}`,
        nextId: optionIndex === 0 ? nextId : recoveryId,
      })),
    }

    nodes[recoveryId] = {
      id: recoveryId,
      kind: 'decision',
      phase: 'Recovery · Re-establish control',
      title: 'Pause, communicate, and return to the controlled path.',
      situation:
        'The shift lead stops the unapproved move before the equipment state changes. The system is still recoverable; reset the response process before continuing.',
      systemReadout: ['Equipment state: UNCHANGED', 'Event ownership: REQUIRED', 'Approved path: AVAILABLE'],
      diagramState: 'isolate',
      prompt: 'How do you recover this decision?',
      options: [
        {
          id: `${recoveryId}-option-1`,
          label: `Brief the shift lead, preserve the current state, then take the controlled action: ${beat.options[0].label}`,
          consequence: 'The team regains a shared picture and moves forward without creating a second incident.',
          mentor: '“Good recovery. In mission-critical work, stopping an unsafe idea early is progress—not failure.”',
          impacts: { procedureDiscipline: 2, communication: 1, uptimeJudgment: 1 },
          nextId,
        },
        {
          id: `${recoveryId}-option-2`,
          label: 'Continue the original action without notifying the shift lead.',
          consequence: 'The shift lead intervenes again. The missing coordination is still the main risk.',
          mentor: '“We do not solve a process problem by doubling down on it. Make the condition visible.”',
          impacts: { procedureDiscipline: -2, communication: -1 },
          nextId: recoveryId,
        },
        {
          id: `${recoveryId}-option-3`,
          label: 'Wait quietly for the alarm to clear on its own.',
          consequence: 'No new information or protection is added. The condition remains owned by nobody.',
          mentor: '“Waiting can be appropriate only when it is an explicit, monitored decision with a reason and an owner.”',
          impacts: { uptimeJudgment: -1, communication: -1 },
          nextId: recoveryId,
        },
      ],
    }
  })

  nodes.debrief = {
    id: 'debrief',
    kind: 'debrief',
    phase: 'Debrief',
    title: spec.debrief.title,
    systemReadout: ['Condition: STABLE', 'Event record: COMPLETE', 'Resilience posture: VERIFIED'],
    diagramState: 'restore',
    masterMove: spec.debrief.masterMove,
    lesson: spec.debrief.lesson,
    principle: spec.debrief.principle,
    guardrail,
  }

  return { ...spec, nodes, startNodeId: 'beat-1' }
}

export const tracks: Track[] = [
  {
    id: 'electrical',
    title: 'Data Center Electrical',
    eyebrow: 'FLAGSHIP TRACK',
    description: 'Read the path from service entrance to rack and make calm decisions around critical power.',
    accent: '#9af8cb',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    icon: 'bolt',
  },
  {
    id: 'power',
    title: 'Power & UPS Systems',
    eyebrow: 'RESILIENCE TRACK',
    description: 'Protect stored energy, generator readiness, and redundant paths without sacrificing evidence or control.',
    accent: '#f9c768',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    icon: 'battery',
  },
  {
    id: 'cooling',
    title: 'Cooling & Liquid Cooling',
    eyebrow: 'THERMAL TRACK',
    description: 'Manage air and liquid systems supporting the high-density racks traditional cooling never expected.',
    accent: '#79d7ff',
    skills: ['diagnosis', 'coolingFundamentals', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    icon: 'droplet',
  },
]

export const skillLabels: Record<Skill, string> = {
  diagnosis: 'Diagnosis',
  powerSystems: 'Power Systems',
  coolingFundamentals: 'Cooling Fundamentals',
  safetyLoto: 'Safety / LOTO',
  uptimeJudgment: 'Uptime Judgment',
  procedureDiscipline: 'Procedure Discipline',
  communication: 'Team Communication',
}

const electricalScenarios: Scenario[] = [
  makeScenario({
    id: 'busway-heat-b07',
    track: 'Data Center Electrical',
    trackId: 'electrical',
    level: 'Foundation',
    duration: '6–8 min',
    title: 'The Warm Joint on Busway B07',
    subtitle: 'Treat a thermal exception as a system condition, not a tightening task.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'busway',
    opening:
      'An infrared scan flags a warmer-than-peer connection on an overhead busway tap feeding a live cabinet row. The load is steady, no protective device has operated, and the row has dual-corded IT equipment.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Verify',
        title: 'A color map is a clue, not a work permit.',
        situation:
          'The scan shows one joint 18°C above comparable joints. The original image, load, ambient conditions, and scan distance are available. No smell, smoke, or protective alarm is reported.',
        systemReadout: ['B07 tap joint: +18°C vs peers', 'Row load: 61%', 'A/B rack feeds: PRESENT', 'Protective alarms: NONE'],
        prompt: 'What is your first response?',
        options: [
          choice(
            'Notify the shift lead, preserve the thermal evidence, compare under like-for-like conditions, and begin the approved escalation for a live-power exception.',
            'The team confirms the abnormality is repeatable and establishes a record before discussing any intervention.',
            '“Good. Thermal data earns attention; context tells us what it means. Preserve the evidence before anyone changes the scene.”',
            { diagnosis: 2, communication: 1, procedureDiscipline: 2 },
          ),
          choice(
            'Open the tap box and retorque the connection while the row stays online.',
            'The request introduces energized-work and outage risk without a work plan or verified boundary. It is stopped.',
            '“Never treat a hot joint like a loose cabinet handle. The equipment and the load both deserve a controlled plan.”',
            { safetyLoto: -3, procedureDiscipline: -3, uptimeJudgment: -2 },
          ),
          choice(
            'Ignore it until the next monthly infrared scan because the row is still online.',
            'The trend could worsen between scans, and no owner or monitoring plan has been created.',
            '“A non-trip is not a no-risk signal. We decide based on condition, trend, and consequence.”',
            { diagnosis: -1, uptimeJudgment: -2 },
          ),
        ],
      },
      {
        phase: '02 · Protect the load',
        title: 'The dual cords are a capability—verify the topology before using it.',
        situation:
          'The electrical one-line and rack-power map show the affected B feed has a distinct upstream path, but a few legacy racks have incomplete labeling. Operations can confirm their feed status.',
        systemReadout: ['B feed: thermal exception', 'A feed: healthy', 'Legacy rack labels: INCOMPLETE', 'NOC: AVAILABLE'],
        prompt: 'How do you create a safe maintenance window?',
        options: [
          choice(
            'Have operations verify affected racks and current A/B feed health, then plan a documented, authorized isolation with a back-out path and monitoring.',
            'The team proves the alternate path before relying on it and schedules the work at an appropriate risk window.',
            '“Exactly. Redundancy on paper is not redundancy until the actual load path is verified.”',
            { powerSystems: 2, uptimeJudgment: 3, communication: 2, procedureDiscipline: 2 },
          ),
          choice(
            'Assume every server is dual-corded and isolate the B feed now.',
            'A mislabeled or single-corded device could be affected. The shift lead blocks the assumption.',
            '“Assumptions are hidden single points of failure. Trace the load before you touch the path.”',
            { powerSystems: -2, uptimeJudgment: -3 },
          ),
          choice(
            'Move every workload first, even though the exact affected racks are not identified.',
            'A broad, uncoordinated move adds application risk and masks the electrical scope.',
            '“Contain the scope. A response that is too broad can create more change than the condition itself.”',
            { communication: -1, procedureDiscipline: -1 },
          ),
        ],
      },
      {
        phase: '03 · Return with proof',
        title: 'The repair report is not the operational acceptance.',
        situation:
          'Qualified personnel complete the approved work and report the connection condition corrected. The thermal signature is now close to peers under comparable load.',
        systemReadout: ['Repair status: COMPLETE', 'Post-work thermal delta: +2°C', 'Load: 60%', 'NOC event: OPEN'],
        prompt: 'What closes the event?',
        options: [
          choice(
            'Verify the expected thermal trend under stable load, confirm alarms and feed topology, document the finding, and formally release the event with operations.',
            'The record preserves the anomaly and the facility returns to a verified normal resilience posture.',
            '“That is a clean closeout. We validate the whole path, not just the wrench work.”',
            { diagnosis: 2, procedureDiscipline: 2, communication: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Close the ticket as soon as the temperature is lower once.',
            'A one-time observation does not prove stable operation or completed turnover.',
            '“Trend, acceptance, documentation. That sequence is what lets the next shift trust your work.”',
            { procedureDiscipline: -2, diagnosis: -1 },
          ),
          choice(
            'Remove the monitoring note so the NOC console looks clear.',
            'The data and guardrails disappear while the condition is still being validated.',
            '“We do not make the dashboard quieter by hiding the system’s voice.”',
            { communication: -2, uptimeJudgment: -1 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'A warm busway joint became a controlled reliability event—not a surprise outage.',
      masterMove: 'A master preserves evidence, verifies real dual-path protection, and brings qualified work into a documented window before the hardware is touched.',
      lesson: 'Electrical thermography is powerful when paired with comparable conditions, trend awareness, and a verified load path.',
      principle: 'See the condition. Prove the redundancy. Restore with evidence.',
    },
  }),
  makeScenario({
    id: 'maintenance-transfer-c12',
    track: 'Data Center Electrical',
    trackId: 'electrical',
    level: 'Intermediate',
    duration: '7–9 min',
    title: 'The Transfer That Should Wait',
    subtitle: 'A planned maintenance window meets a small but meaningful generator exception.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'power-path',
    opening:
      'A scheduled maintenance transfer would move one distribution lineup to generator-backed power. The pre-job check reveals a low-priority jacket-water heater alarm on the designated generator. The generator is not failed, but its readiness is no longer unquestioned.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Go / no-go',
        title: 'Planned does not automatically mean safe to execute.',
        situation: 'The maintenance ticket is approved, vendors are present, and the business window is tight. The heater alarm appeared 20 minutes ago and has not yet been assessed.',
        systemReadout: ['Transfer: SCHEDULED', 'Generator readiness: EXCEPTION', 'Heater alarm: ACTIVE', 'Maintenance window: 55 min'],
        prompt: 'What do you recommend?',
        options: [
          choice(
            'Call a formal go/no-go with the shift lead, assess generator readiness against the site criteria, and defer if the backup path cannot be positively verified.',
            'The team treats loss of confidence in a backup source as a decision-changing condition rather than schedule pressure.',
            '“Good. We do not borrow certainty from the calendar. The redundancy has to be ready before we intentionally lean on it.”',
            { powerSystems: 2, uptimeJudgment: 3, procedureDiscipline: 2, communication: 1 },
          ),
          choice(
            'Proceed because the generator has no shutdown alarm and the transfer is already approved.',
            'Approval was based on an earlier facility state. The new exception invalidates the old assumption.',
            '“A plan is a living document. When the plant changes, the plan must be reconsidered.”',
            { uptimeJudgment: -3, procedureDiscipline: -2 },
          ),
          choice(
            'Clear the heater alarm and complete the transfer quickly.',
            'Clearing an alarm does not establish readiness and removes a key signal from the decision.',
            '“Never erase the reason we stopped. Investigate it or formally defer; do not wish it away.”',
            { procedureDiscipline: -3, diagnosis: -1 },
          ),
        ],
      },
      {
        phase: '02 · Establish readiness',
        title: 'The backup path must prove itself on the site’s terms.',
        situation: 'The lead defers the transfer. A qualified generator technician reports the heater circuit needs corrective work but the unit itself has normal monitored operating parameters. Another generator path is healthy.',
        systemReadout: ['Designated generator: CONDITIONAL', 'Alternate generator path: HEALTHY', 'Transfer: DEFERRED', 'Vendor crew: ON SITE'],
        prompt: 'How do you turn this into a safe next plan?',
        options: [
          choice(
            'Document the exception, restore the normal lineup, schedule qualified corrective work, and resubmit the transfer only after backup readiness and change criteria are met.',
            'The work is deferred without losing the diagnostic trail or leaving the site in a vague state.',
            '“That is disciplined deferral. The right decision can still move the job forward—just not by spending resilience blindly.”',
            { diagnosis: 2, procedureDiscipline: 3, uptimeJudgment: 2, communication: 2 },
          ),
          choice(
            'Use the alternate generator immediately without revising the transfer plan.',
            'The alternate path may change coordination, protection, and back-out assumptions. A new plan is required.',
            '“Different source, different risk picture. Re-plan the topology; do not swap labels and call it equivalent.”',
            { powerSystems: -2, procedureDiscipline: -2 },
          ),
          choice(
            'Ask the vendor to repair the heater while the transfer is in progress.',
            'Coupling unscheduled corrective work to a transfer adds simultaneous changes during a reduced-margin condition.',
            '“One controlled change at a time whenever we can. Stacked changes blur cause and effect.”',
            { safetyLoto: -1, uptimeJudgment: -2 },
          ),
        ],
      },
      {
        phase: '03 · Turnover',
        title: 'A deferred change still needs a professional closeout.',
        situation: 'Normal utility-backed configuration is confirmed. The NOC asks whether the event can be closed and how the next shift will understand the rescheduled work.',
        systemReadout: ['Normal lineup: VERIFIED', 'Transfer: RESCHEDULE REQUIRED', 'Generator exception: TRACKED', 'NOC: AWAITING UPDATE'],
        prompt: 'What do you communicate?',
        options: [
          choice(
            'Record the reason for deferral, current plant state, owner, corrective-work dependency, and revised go/no-go criteria; brief the NOC and incoming shift.',
            'The next crew inherits a usable decision record instead of a mystery delay.',
            '“Excellent. A clean deferral is an uptime decision other people can trust.”',
            { communication: 3, procedureDiscipline: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Close the ticket as cancelled because no transfer occurred.',
            'The readiness exception and follow-up ownership would be lost.',
            '“No action occurred, but an important decision did. Capture it.”',
            { procedureDiscipline: -2, communication: -2 },
          ),
          choice(
            'Leave a verbal note for the next shift.',
            'Verbal handoff without an event record is too fragile for a critical plant condition.',
            '“If it matters to uptime, it deserves a durable handoff.”',
            { communication: -2, procedureDiscipline: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'The best transfer was the one you did not force.',
      masterMove: 'A master notices when a new readiness exception changes the go/no-go decision, even when the schedule is inconvenient.',
      lesson: 'Planned maintenance is safe only while the assumptions behind its redundancy and back-out plan remain true.',
      principle: 'A schedule is not a safety control. Verify the backup path.',
    },
  }),
  makeScenario({
    id: 'pdu-ground-fault-delta',
    track: 'Data Center Electrical',
    trackId: 'electrical',
    level: 'Intermediate',
    duration: '7–9 min',
    title: 'The PDU Ground-Fault Delta',
    subtitle: 'Interpret a protection exception without turning it into a blind reset.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'power-path',
    opening:
      'A downstream PDU reports an abnormal residual-current trend but has not tripped. The PDU feeds a mixed row of compute and network equipment. A maintenance crew suggests resetting the monitor to see if it returns.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Read the signal',
        title: 'Protection trend is evidence of an imbalance, not a nuisance.',
        situation: 'Residual current has moved from the normal baseline to 62% of the site alert threshold over four hours. The PDU load is steady, and no water event is reported nearby.',
        systemReadout: ['Residual-current trend: 62% of alert', 'PDU load: 54%', 'Trip state: NORMAL', 'Water alarm: NONE'],
        prompt: 'What is the correct first move?',
        options: [
          choice(
            'Escalate the trend, preserve event data, compare the branch and load history, and establish a controlled investigation with operations awareness.',
            'The team protects the evidence and begins scoping without disturbing an energized load path.',
            '“Good. A protection system is talking early. Listening early is how we keep it from talking late.”',
            { diagnosis: 3, communication: 1, procedureDiscipline: 2 },
          ),
          choice(
            'Reset the monitor because no breaker has opened.',
            'The reset may discard trending evidence while doing nothing to address the developing condition.',
            '“A monitor reset does not reset physics. Keep the history until a qualified diagnosis says otherwise.”',
            { diagnosis: -2, procedureDiscipline: -2 },
          ),
          choice(
            'Wait for an actual trip so the fault location becomes obvious.',
            'A trip could affect critical load and creates a worse diagnostic starting point.',
            '“We do not use an outage as a test instrument.”',
            { uptimeJudgment: -3, powerSystems: -1 },
          ),
        ],
      },
      {
        phase: '02 · Scope the path',
        title: 'Narrow the scope without guessing at live gear.',
        situation: 'The event review identifies a recently added cabinet in the affected PDU zone. Its branch history is the only material change during the trend window, but the exact cause remains unknown.',
        systemReadout: ['Recent change: CABINET D-21', 'Trend onset: AFTER INSTALL', 'Affected PDU: LIVE', 'Root cause: UNCONFIRMED'],
        prompt: 'How do you proceed?',
        options: [
          choice(
            'Coordinate with the change owner and qualified electrical staff to review installation records, topology, and approved test/isolation options while keeping the load protected.',
            'The investigation follows the evidence and respects the energized boundary.',
            '“Exactly. A correlation gives us a place to look, not a license to improvise.”',
            { diagnosis: 2, safetyLoto: 2, communication: 2, procedureDiscipline: 2 },
          ),
          choice(
            'Unplug the newest cabinet to see if the trend drops.',
            'The cabinet may host critical service, and the test is uncontrolled and poorly documented.',
            '“Do not make a customer-impacting experiment because it feels quick. Build a controlled test plan.”',
            { uptimeJudgment: -3, procedureDiscipline: -2 },
          ),
          choice(
            'Tell the NOC it is probably a sensor issue.',
            'The trend has not been disproven, and premature certainty can slow the correct response.',
            '“Say what we know, what we suspect, and what we are doing next. That is honest operations.”',
            { communication: -2, diagnosis: -1 },
          ),
        ],
      },
      {
        phase: '03 · Verify the outcome',
        title: 'Corrective work ends with a protection check.',
        situation: 'Qualified personnel correct an installation issue under the approved plan. The residual-current trend returns to baseline while load remains stable.',
        systemReadout: ['Corrective work: COMPLETE', 'Residual current: BASELINE', 'PDU load: STABLE', 'Change record: OPEN'],
        prompt: 'What is the right closeout?',
        options: [
          choice(
            'Trend the value through the acceptance period, confirm the protection system remains healthy, document the root cause, and capture the learning for future installs.',
            'The facility gains both a verified recovery and a prevention lesson.',
            '“That is reliability work: fix the condition, prove the protection, then improve the next change.”',
            { diagnosis: 2, procedureDiscipline: 3, communication: 2 },
          ),
          choice(
            'Close the event immediately because the current reading looks normal.',
            'A short return to normal is encouraging but not full operational acceptance.',
            '“We close on evidence, not relief.”',
            { procedureDiscipline: -2, uptimeJudgment: -1 },
          ),
          choice(
            'Remove the monitor from the alert list to avoid another escalation.',
            'The facility loses early warning instead of fixing confidence in the signal.',
            '“Our alarms are allies. Improve the response; do not hide the witness.”',
            { procedureDiscipline: -3, communication: -1 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You kept a subtle protection trend from becoming a service event.',
      masterMove: 'A master treats early electrical imbalance as data to preserve, then scopes it through records, qualification, and controlled verification.',
      lesson: 'Most critical electrical events are easier to manage before protection operates. Trending and change history are part of the diagnostic toolset.',
      principle: 'Protect the evidence. Protect the load. Prove the correction.',
    },
  }),
  makeScenario({
    id: 'dual-cord-mirage',
    track: 'Data Center Electrical',
    trackId: 'electrical',
    level: 'Advanced',
    duration: '9–11 min',
    title: 'The Dual-Cord Mirage',
    subtitle: 'Find the common-mode risk hiding behind two power cords.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'busway',
    opening:
      'During a capacity review for a new AI pod, the rack maps show every GPU server has A and B feeds. A careful topology review reveals that several cabinet PDUs are supplied from separate panels that share one upstream busway segment.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · See common mode',
        title: 'Two cords do not guarantee two independent paths.',
        situation: 'The new pod is planned at 72 kW per rack. The cabinet PDU labeling looks redundant, but the physical upstream trace exposes the shared busway section.',
        systemReadout: ['Server cords: A + B', 'Panel sources: SEPARATE', 'Upstream busway: SHARED SEGMENT', 'Planned rack density: 72 kW'],
        prompt: 'How do you frame the finding?',
        options: [
          choice(
            'Raise a common-mode resilience exception, validate the physical topology against the one-line, and pause final energization until the design owner reviews mitigation.',
            'The hidden single point is made visible before it becomes a production dependency.',
            '“Good eye. The labels were technically true and operationally misleading. We design for the failure that can touch both paths.”',
            { powerSystems: 3, diagnosis: 2, uptimeJudgment: 3, communication: 1 },
          ),
          choice(
            'Accept the design because each server still has two cords.',
            'A fault or maintenance event on the shared segment can defeat both supplies despite the dual cords.',
            '“Redundancy has to be electrically and physically independent where the risk demands it.”',
            { powerSystems: -3, uptimeJudgment: -3 },
          ),
          choice(
            'Increase the rack-power limit to prove the shared segment can handle it.',
            'Capacity does not solve common-mode exposure and may increase the consequence of a shared-path fault.',
            '“Ampacity and resilience are related, but they are not the same question.”',
            { powerSystems: -2, diagnosis: -1 },
          ),
        ],
      },
      {
        phase: '02 · Engineer the mitigation',
        title: 'Mitigation needs a verified end-to-end path.',
        situation: 'The design owner offers two options: reroute B feed through an independent busway segment, or keep the shared segment and classify the pod as reduced-resilience. The business team prefers the faster option.',
        systemReadout: ['Option A: INDEPENDENT B PATH', 'Option B: REDUCED RESILIENCE', 'Business schedule: COMPRESSED', 'Design review: OPEN'],
        prompt: 'What is your recommendation?',
        options: [
          choice(
            'Present the verified topology risk and recommend the independent path for the stated resilience target; document any conscious exception with the accountable owner.',
            'The decision is explicit, technically grounded, and owned by the correct level of authority.',
            '“Exactly. We can make trade-offs, but we never disguise them. Resilience claims must match the actual copper.”',
            { communication: 3, powerSystems: 2, procedureDiscipline: 2, uptimeJudgment: 2 },
          ),
          choice(
            'Keep the shared path but call it 2N because the cabinet labels say A and B.',
            'The resilience claim would be inaccurate and could mislead future operators.',
            '“Never upgrade a diagram with optimism. Call the topology what it is.”',
            { powerSystems: -3, communication: -2 },
          ),
          choice(
            'Reroute the feed during live production without a formal change because it improves resilience.',
            'An improvement can still create immediate risk if it is introduced without controlled work boundaries and verification.',
            '“A good end state does not justify an uncontrolled route there.”',
            { safetyLoto: -2, procedureDiscipline: -3 },
          ),
        ],
      },
      {
        phase: '03 · Commission the claim',
        title: 'The model is only trusted after field verification.',
        situation: 'The independent B path is installed during an approved window. Updated drawings are ready, but the NOC asks whether the pod can now be labeled fully resilient.',
        systemReadout: ['B path installation: COMPLETE', 'Drawings: UPDATED', 'Field verification: PENDING', 'Pod label: PENDING'],
        prompt: 'What proves the resilience label?',
        options: [
          choice(
            'Complete approved commissioning and end-to-end trace verification, reconcile labels and drawings, validate monitoring, then release the updated resilience classification.',
            'The documentation and the physical plant agree before operations relies on the new claim.',
            '“Perfect. We do not commission a story; we commission a system.”',
            { procedureDiscipline: 3, powerSystems: 2, communication: 2, uptimeJudgment: 2 },
          ),
          choice(
            'Apply the label as soon as the new cable is visible.',
            'Visible work is not proof of the complete electrical path or monitoring state.',
            '“Trust comes from verification, not from appearance.”',
            { diagnosis: -1, procedureDiscipline: -2 },
          ),
          choice(
            'Leave the old drawings because the field team knows what changed.',
            'Future operators would inherit inaccurate topology—a reliability risk in itself.',
            '“The next responder deserves the truth, not tribal knowledge.”',
            { communication: -2, procedureDiscipline: -3 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You found the single point hidden inside a dual-cord story.',
      masterMove: 'A master traces the physical common-mode path, names the resilience gap accurately, and verifies the mitigation before trusting the label.',
      lesson: '2N and N+1 are topologies, not marketing terms. Common-mode dependencies can hide above the rack.',
      principle: 'Trace past the labels. Independence must be real.',
    },
  }),
]

const powerScenarios: Scenario[] = [
  makeScenario({
    id: 'ups-battery-delta',
    track: 'Power & UPS Systems',
    trackId: 'power',
    level: 'Foundation',
    duration: '6–8 min',
    title: 'The Battery String Delta',
    subtitle: 'Use battery monitoring as an early-warning system, not a reason for an impulsive swap.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'ups-chain',
    opening:
      'The UPS monitoring platform flags one battery block with elevated internal resistance compared with its string peers. The UPS is in normal double-conversion mode, utility is stable, and the site has parallel UPS capacity.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Read the health signal',
        title: 'A weak block is a resilience concern before it is a failure.',
        situation: 'The flagged block has a 24% resistance delta and a slightly lower floating voltage. No UPS alarm threshold has been crossed, but the trend has persisted for three scans.',
        systemReadout: ['Block 18 resistance: +24%', 'Float voltage: SLIGHTLY LOW', 'UPS mode: DOUBLE CONVERSION', 'Parallel capacity: AVAILABLE'],
        prompt: 'What is your first action?',
        options: [
          choice(
            'Notify the shift lead, preserve the monitoring trend, verify the string context, and plan qualified battery service under the site’s approved maintenance process.',
            'The team treats the exception as a managed resilience issue without disturbing stored energy equipment.',
            '“Good. Batteries fail quietly until they do not. Trend early, plan carefully, and respect the energy in that cabinet.”',
            { diagnosis: 3, powerSystems: 2, procedureDiscipline: 2, communication: 1 },
          ),
          choice(
            'Pull the suspected block now to protect the rest of the string.',
            'Removing a block without an engineered, qualified plan can affect the UPS battery system and is stopped.',
            '“Stored energy is not forgiving. A suspected component does not grant an unplanned work boundary.”',
            { safetyLoto: -3, procedureDiscipline: -3 },
          ),
          choice(
            'Ignore it because the UPS has parallel capacity.',
            'Parallel capacity reduces immediate consequence but does not erase a degrading energy-storage component.',
            '“Redundancy buys us time to respond well, not permission to neglect the warning.”',
            { uptimeJudgment: -2, diagnosis: -2 },
          ),
        ],
      },
      {
        phase: '02 · Plan the work window',
        title: 'Battery maintenance is a facility state change.',
        situation: 'The qualified battery vendor is available tomorrow. The event review confirms the string is not at its maintenance threshold, but the site wants to retain maximum ride-through confidence during a planned utility-risk window tonight.',
        systemReadout: ['Vendor: AVAILABLE TOMORROW', 'Utility-risk window: TONIGHT', 'String health: DEGRADED / OPERATING', 'Maintenance threshold: NOT CROSSED'],
        prompt: 'How do you schedule the response?',
        options: [
          choice(
            'Document the monitored exception, defer nonurgent work through the utility-risk window, and schedule qualified service with UPS state, redundancy, monitoring, and back-out criteria explicitly reviewed.',
            'The team protects ride-through confidence while still giving the degrading block an owner and a deadline.',
            '“That is good temporal judgment. We do not add maintenance risk when the outside world is already raising the stakes.”',
            { uptimeJudgment: 3, procedureDiscipline: 3, communication: 2 },
          ),
          choice(
            'Start service immediately because the vendor has an opening.',
            'The timing ignores the higher-risk utility window and may reduce the site’s resilience at the wrong moment.',
            '“Availability is not the same as suitability. Consider the whole facility calendar.”',
            { uptimeJudgment: -3, procedureDiscipline: -1 },
          ),
          choice(
            'Disable battery alarms until the vendor arrives.',
            'The NOC loses the early-warning path while the condition remains active.',
            '“Keep the guardrail up. We manage alarm noise with ownership, not blindness.”',
            { procedureDiscipline: -3, communication: -1 },
          ),
        ],
      },
      {
        phase: '03 · Restore assurance',
        title: 'Service complete is only the start of verification.',
        situation: 'Qualified service is complete. Battery monitoring now shows the replacement block aligned with peers, and the UPS remains in normal double-conversion mode.',
        systemReadout: ['Battery delta: NORMALIZED', 'UPS mode: NORMAL', 'Event record: OPEN', 'Monitoring: ACTIVE'],
        prompt: 'How do you hand the system back?',
        options: [
          choice(
            'Confirm monitored values through the acceptance period, verify UPS alarms and redundancy state, update the maintenance record, and brief operations before closure.',
            'The site has evidence that its stored-energy margin is restored, not merely a vendor assertion.',
            '“Exactly. We return confidence to the facility one verified signal at a time.”',
            { diagnosis: 2, procedureDiscipline: 3, communication: 2 },
          ),
          choice(
            'Close the event as soon as the vendor signs the worksheet.',
            'The operational monitoring and acceptance portion remains incomplete.',
            '“Vendor completion matters. Operational acceptance is a separate responsibility.”',
            { procedureDiscipline: -2, communication: -1 },
          ),
          choice(
            'Wait until the next utility event to prove the batteries.',
            'Using a real utility disturbance as verification is neither controlled nor necessary.',
            '“We validate by approved methods, never by hoping the next emergency becomes a test.”',
            { uptimeJudgment: -3, powerSystems: -1 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You protected the quiet reserve that carries a loud emergency.',
      masterMove: 'A master turns a battery-health delta into a monitored, scheduled, and verified resilience action.',
      lesson: 'UPS batteries are part of the power path. Their trends and service windows deserve the same discipline as switchgear work.',
      principle: 'Monitor early. Schedule around risk. Verify the reserve.',
    },
  }),
  makeScenario({
    id: 'generator-readiness-walkdown',
    track: 'Power & UPS Systems',
    trackId: 'power',
    level: 'Foundation',
    duration: '6–8 min',
    title: 'The Generator Readiness Walkdown',
    subtitle: 'Separate a minor-looking alert from the readiness decision it affects.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'generator',
    opening:
      'Before a routine generator exercise, the BMS reports a fuel-polishing skid filter differential-pressure advisory. The generator has no active shutdown condition, but the exercise will be used as part of the site readiness record.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Own the advisory',
        title: 'Readiness is more than “the engine starts.”',
        situation: 'The advisory has been present since the prior weekend. Fuel level is normal, and the generator last ran successfully two weeks ago. The shift is behind on the exercise schedule.',
        systemReadout: ['Fuel skid DP: ADVISORY', 'Fuel level: NORMAL', 'Last run: 14 DAYS AGO', 'Exercise: OVERDUE'],
        prompt: 'What do you do?',
        options: [
          choice(
            'Notify the lead, review the advisory and prior maintenance history, and decide whether the exercise can safely proceed under the site criteria or needs qualified assessment first.',
            'The exercise is treated as a readiness event with known preconditions, not a box to check.',
            '“Good. A successful start proves one thing. Readiness means the whole support chain is understood.”',
            { diagnosis: 2, powerSystems: 2, procedureDiscipline: 2, communication: 1 },
          ),
          choice(
            'Run the generator immediately so the exercise is no longer overdue.',
            'Schedule pressure does not resolve the outstanding fuel-system advisory.',
            '“We do not use an exercise to surprise-test an exception we have not assessed.”',
            { uptimeJudgment: -2, procedureDiscipline: -2 },
          ),
          choice(
            'Mark the advisory as acknowledged and continue as normal.',
            'Acknowledgment without ownership or assessment does not protect readiness.',
            '“Acknowledged by whom, for what, until when? Those are the questions that turn an alarm into management.”',
            { communication: -2, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '02 · Test with intent',
        title: 'A controlled exercise has an objective and observers.',
        situation: 'The qualified assessment finds the advisory within an acceptable monitored range for the exercise, with filter service already scheduled. The NOC and operations lead are ready to observe.',
        systemReadout: ['Assessment: CONDITIONAL GO', 'Filter service: SCHEDULED', 'NOC monitoring: READY', 'Exercise procedure: APPROVED'],
        prompt: 'How do you execute?',
        options: [
          choice(
            'Follow the approved exercise procedure, keep the advisory visible, monitor the expected parameters and abort criteria, and record results with the NOC.',
            'The team creates useful readiness evidence while retaining the exception in the record.',
            '“Exactly. We test to learn, and we keep the known condition in view while we learn.”',
            { procedureDiscipline: 3, diagnosis: 2, communication: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Run the exercise with alarms suppressed so the report looks clean.',
            'The report would be less truthful and the NOC would lose important situational awareness.',
            '“A clean report built on hidden conditions is not a readiness record.”',
            { procedureDiscipline: -3, communication: -2 },
          ),
          choice(
            'Skip monitoring because the generator ran recently.',
            'Recent success does not replace the observation and acceptance criteria for this exercise.',
            '“Repeatable work earns trust by being repeatably observed.”',
            { diagnosis: -2, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '03 · Capture readiness',
        title: 'One good run does not erase the maintenance item.',
        situation: 'The exercise completes within expected parameters. The advisory persists at the known level, and filter service remains scheduled.',
        systemReadout: ['Exercise: PASS', 'Fuel skid advisory: ACTIVE', 'Service: SCHEDULED', 'Readiness record: DRAFT'],
        prompt: 'How do you close out?',
        options: [
          choice(
            'Record the successful test, retain the advisory and service owner, update readiness status honestly, and hand off the open maintenance dependency.',
            'Operations can distinguish “tested successfully with an exception” from “no exception exists.”',
            '“That nuance is professional. We tell the next shift exactly what confidence we earned—and what still needs work.”',
            { communication: 3, procedureDiscipline: 3, uptimeJudgment: 1 },
          ),
          choice(
            'Close the advisory because the generator started and ran.',
            'The filter condition has not changed, and the maintenance record becomes misleading.',
            '“A passing test is evidence, not erasure.”',
            { diagnosis: -1, procedureDiscipline: -2 },
          ),
          choice(
            'Delete the exercise note so the open advisory does not concern leadership.',
            'Removing context makes later decisions less safe, not more comfortable.',
            '“Transparency is an uptime tool.”',
            { communication: -3, uptimeJudgment: -1 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You turned a routine exercise into an honest readiness record.',
      masterMove: 'A master tests with a clear purpose, keeps known exceptions visible, and distinguishes verified operation from resolved maintenance.',
      lesson: 'Generator readiness includes fuel, controls, monitoring, process, and a truthful record—not just engine rotation.',
      principle: 'Test deliberately. Report honestly. Own the exception.',
    },
  }),
  makeScenario({
    id: 'static-bypass-temptation',
    track: 'Power & UPS Systems',
    trackId: 'power',
    level: 'Intermediate',
    duration: '7–9 min',
    title: 'The Static-Bypass Temptation',
    subtitle: 'A UPS warning invites a fast-looking move with a large blast radius.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'ups-chain',
    opening:
      'A UPS reports a noncritical rectifier communications fault while continuing normal double-conversion operation. A contractor offers to place it on static bypass so they can troubleshoot “without interruption.” The redundant UPS module is healthy, but the load is substantial.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Understand the state',
        title: 'Bypass is not a neutral parking place.',
        situation: 'The UPS output is stable. The fault is limited to communications visibility; there is no active overload or inverter failure. The proposed bypass would alter the load protection posture.',
        systemReadout: ['UPS mode: DOUBLE CONVERSION', 'Output: STABLE', 'Fault: RECTIFIER COMMS', 'Redundant module: HEALTHY'],
        prompt: 'What is your response?',
        options: [
          choice(
            'Keep the healthy operating mode, notify the shift lead and vendor, review the approved troubleshooting path, and assess whether a planned maintenance window is required.',
            'The team retains conditioned power while it distinguishes a visibility issue from a load-risk event.',
            '“Good. Bypass changes what stands between the load and the source. We do not take that lightly because a diagnostic sounds convenient.”',
            { powerSystems: 3, uptimeJudgment: 3, procedureDiscipline: 2, communication: 1 },
          ),
          choice(
            'Accept the bypass immediately because the redundant module is healthy.',
            'The change reduces protection and needs a designed, authorized sequence—not a vendor convenience decision.',
            '“Redundancy does not turn a power-path change into routine.”',
            { uptimeJudgment: -3, procedureDiscipline: -3 },
          ),
          choice(
            'Ignore the communication fault because output is stable.',
            'Loss of visibility can delay recognition of a real future fault and must be owned.',
            '“Stable output is good news. Blindness is not.”',
            { diagnosis: -2, communication: -1 },
          ),
        ],
      },
      {
        phase: '02 · Plan the diagnostic',
        title: 'Troubleshooting has to preserve the designed protection path.',
        situation: 'Vendor review confirms the fault is isolated to a communication card. The site has a documented maintenance-bypass procedure, but it requires load assessment, peer review, monitoring, and approved timing.',
        systemReadout: ['Root scope: COMMUNICATION CARD', 'Maintenance bypass: PROCEDURE EXISTS', 'Load assessment: REQUIRED', 'Peer review: REQUIRED'],
        prompt: 'How do you prepare the work?',
        options: [
          choice(
            'Build the formal change with load and redundancy verification, vendor scope, peer review, monitoring, back-out criteria, and a selected risk window before any mode change.',
            'The diagnostic becomes a controlled facility operation rather than a hurried intervention.',
            '“That is the work. The card replacement may be simple; the protection of the load is where professionalism lives.”',
            { procedureDiscipline: 3, uptimeJudgment: 3, communication: 2, powerSystems: 2 },
          ),
          choice(
            'Let the contractor determine the sequence because they know the UPS model.',
            'Vendor expertise is valuable, but site risk acceptance and operations control remain the facility’s responsibility.',
            '“The vendor knows the machine. We own the load and the plant.”',
            { communication: -2, procedureDiscipline: -2 },
          ),
          choice(
            'Perform the card swap during peak compute because the fault seems minor.',
            'Timing ignores the consequence of an unexpected mode change or a needed back-out.',
            '“Minor fault, major load. Match the window to the consequence.”',
            { uptimeJudgment: -3, procedureDiscipline: -1 },
          ),
        ],
      },
      {
        phase: '03 · Reclaim confidence',
        title: 'The monitoring path is part of the repair.',
        situation: 'The approved work is completed. The UPS remains in normal operation, telemetry is restored, and the redundant module is healthy.',
        systemReadout: ['UPS mode: NORMAL', 'Telemetry: RESTORED', 'Output: STABLE', 'Change: AWAITING ACCEPTANCE'],
        prompt: 'What completes the change?',
        options: [
          choice(
            'Verify alarms, telemetry, mode, and redundancy through acceptance monitoring; document the exact corrective action and release the change with operations.',
            'The facility restores both power protection and the ability to see its state.',
            '“Well done. In a critical room, visibility is part of resilience.”',
            { diagnosis: 2, procedureDiscipline: 3, communication: 2 },
          ),
          choice(
            'Close the change after the card boots once.',
            'A boot message is not a complete operational verification.',
            '“Let the system demonstrate stable operation before you retire the safety net.”',
            { procedureDiscipline: -2, uptimeJudgment: -1 },
          ),
          choice(
            'Leave telemetry troubleshooting to the next shift.',
            'The original monitoring gap remains if it has not been explicitly verified and handed over.',
            '“Do not hand off an assumption. Hand off a confirmed state.”',
            { communication: -2, diagnosis: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You protected the load from a “quick” bypass decision.',
      masterMove: 'A master separates a UPS component fault from the temptation to alter the protected power path without a full change plan.',
      lesson: 'Static and maintenance bypass modes are designed capabilities, but their use changes risk and deserves planned operations discipline.',
      principle: 'Keep protection in place until a controlled change says otherwise.',
    },
  }),
  makeScenario({
    id: 'ats-status-disagreement',
    track: 'Power & UPS Systems',
    trackId: 'power',
    level: 'Intermediate',
    duration: '7–9 min',
    title: 'The ATS Status Disagreement',
    subtitle: 'When indicators disagree, preserve the plant state and verify the source of truth.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'generator',
    opening:
      'During a routine walkdown, the BMS shows one ATS in a “source unavailable” advisory while its local status display indicates normal utility position. The load remains stable. A technician suggests toggling the controller to force a fresh status.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Preserve the state',
        title: 'A disagreement is not permission to command the switch.',
        situation: 'Both source voltage readings at the BMS are normal. The ATS supplies a live distribution panel, and the local display has no active fault code.',
        systemReadout: ['BMS: SOURCE ADVISORY', 'Local ATS: NORMAL UTILITY', 'Load: STABLE', 'Voltage readings: NORMAL'],
        prompt: 'What is your first move?',
        options: [
          choice(
            'Notify operations, compare time-stamped BMS and local evidence, verify monitoring communications, and escalate a controlled diagnostic path without issuing a transfer command.',
            'The team distinguishes a status-path question from a source-path emergency.',
            '“Exactly. When displays disagree, gather facts. Do not use a live transfer as a way to make the screen refresh.”',
            { diagnosis: 3, procedureDiscipline: 3, powerSystems: 2, communication: 1 },
          ),
          choice(
            'Toggle the controller so the BMS gets a new state.',
            'The action could initiate an unintended state transition on a live path and is stopped.',
            '“Never command a power device to debug a dashboard.”',
            { uptimeJudgment: -3, procedureDiscipline: -3 },
          ),
          choice(
            'Trust the local display and delete the BMS alarm.',
            'One indication may be wrong, but deleting the other removes evidence before reconciliation.',
            '“We do not choose the friendlier signal. We reconcile the system.”',
            { diagnosis: -2, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '02 · Find the trust boundary',
        title: 'Monitoring faults can still weaken operations.',
        situation: 'Network review identifies intermittent communication drops on the ATS gateway. Electrical readings and local state are verified healthy. The monitoring team proposes a gateway restart during business hours.',
        systemReadout: ['Electrical state: VERIFIED NORMAL', 'Gateway comms: INTERMITTENT', 'BMS visibility: DEGRADED', 'Restart proposal: PENDING'],
        prompt: 'How do you manage the visibility defect?',
        options: [
          choice(
            'Keep the electrical state under enhanced observation, open a monitored change for the gateway, define expected status restoration and rollback, and coordinate both electrical and monitoring owners.',
            'The facility protects situational awareness while repairing the communication layer deliberately.',
            '“Good. The load is fine, but the team’s eyes are degraded. That still deserves a controlled restoration.”',
            { communication: 3, procedureDiscipline: 3, diagnosis: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Restart the gateway whenever the alarm is annoying.',
            'Unplanned restarts can extend the visibility gap and create uncertain evidence.',
            '“If you need to restart it, make it a change with an owner and a success condition.”',
            { procedureDiscipline: -2, diagnosis: -1 },
          ),
          choice(
            'Leave it indefinitely because the ATS itself is healthy.',
            'The next true ATS event could be harder to detect or interpret with known degraded monitoring.',
            '“Healthy hardware and healthy awareness are both part of readiness.”',
            { uptimeJudgment: -2, communication: -1 },
          ),
        ],
      },
      {
        phase: '03 · Reconcile the record',
        title: 'The screen and the plant agree again.',
        situation: 'The approved gateway change restores consistent BMS and local status. The electrical path remains normal throughout.',
        systemReadout: ['BMS status: NORMAL', 'Local ATS: NORMAL', 'Comms trend: STABLE', 'Electrical path: UNCHANGED'],
        prompt: 'What final check matters most?',
        options: [
          choice(
            'Verify state consistency through monitoring, confirm no unintended ATS transition occurred, document the communications root cause, and update the handoff record.',
            'The team proves both the plant and its visibility layer are trustworthy again.',
            '“That is the full picture. Operations needs to trust the equipment and the indication.”',
            { diagnosis: 2, procedureDiscipline: 2, communication: 2 },
          ),
          choice(
            'Close the alarm once the BMS tile turns green.',
            'A green tile alone does not document the source, the action, or the absence of unintended effects.',
            '“Green is good. Verified and explained is better.”',
            { procedureDiscipline: -2, diagnosis: -1 },
          ),
          choice(
            'Keep the gateway restart undocumented since no load was affected.',
            'Undocumented changes undermine future diagnosis and shift awareness.',
            '“No customer impact does not mean no operational learning.”',
            { communication: -2, procedureDiscipline: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You restored confidence without creating a power transition.',
      masterMove: 'A master treats mismatched status as a diagnostic and visibility issue until evidence proves otherwise, rather than forcing a live device to react.',
      lesson: 'In critical facilities, trustworthy telemetry is part of readiness. Restore it with the same change discipline you use for electrical equipment.',
      principle: 'Reconcile the evidence before commanding the plant.',
    },
  }),
  makeScenario({
    id: 'two-n-maintenance-window',
    track: 'Power & UPS Systems',
    trackId: 'power',
    level: 'Advanced',
    duration: '9–11 min',
    title: 'The 2N Maintenance Window',
    subtitle: 'Use apparent redundancy only after proving the actual failure domains.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'power-path',
    opening:
      'A high-density pod is documented as 2N. The A-side UPS needs planned service. During review, you find the two UPS rooms share a building automation gateway and a recently added monitoring control that can issue coordinated inhibit commands if misconfigured.',
    skills: ['diagnosis', 'powerSystems', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Challenge the claim',
        title: '2N at the power bus can still share control-plane exposure.',
        situation: 'Electrical paths are physically separated, but the common monitoring/control element has not been evaluated in the maintenance plan. The scheduled service would take the A-side UPS out of normal protection.',
        systemReadout: ['A electrical path: SERVICE PENDING', 'B electrical path: HEALTHY', 'Control gateway: SHARED', 'Common-control review: MISSING'],
        prompt: 'What do you flag?',
        options: [
          choice(
            'Add the common-control dependency to the risk review, verify its command permissions and failure behavior, and update the go/no-go criteria before reducing A-side protection.',
            'The team recognizes that resilience includes control-plane behavior, not just copper and batteries.',
            '“Good. Modern critical systems can share a nervous system even when their muscles are separate.”',
            { powerSystems: 3, diagnosis: 2, procedureDiscipline: 3, uptimeJudgment: 2 },
          ),
          choice(
            'Ignore the gateway because the electrical rooms are physically separate.',
            'A shared control function can create common-mode consequences despite separated rooms.',
            '“Physical separation is powerful. It is not the only dependency worth tracing.”',
            { powerSystems: -3, uptimeJudgment: -2 },
          ),
          choice(
            'Disconnect the gateway during maintenance without involving monitoring owners.',
            'A visibility or control change needs planned scope, authorization, and rollback—not an ad hoc disconnect.',
            '“Do not cure an unknown dependency with an unknown outage in another layer.”',
            { procedureDiscipline: -3, communication: -2 },
          ),
        ],
      },
      {
        phase: '02 · Build the operating envelope',
        title: 'Reduced protection must have explicit guardrails.',
        situation: 'Review finds the gateway’s command scope can be safely limited through an approved configuration change. The maintenance plan must now state how the B path, monitoring, and back-out will be watched during A-side service.',
        systemReadout: ['Gateway scope: CAN BE LIMITED', 'A UPS: SERVICE WINDOW', 'B path: PRIMARY PROTECTION', 'Back-out criteria: REQUIRED'],
        prompt: 'What belongs in the change plan?',
        options: [
          choice(
            'Define verified B-path health, control-scope limitation, live monitoring, stop-work thresholds, peer roles, and a tested back-out sequence before entering the service state.',
            'The team creates a shared operating envelope for the temporary reduction in protection.',
            '“Exactly. A good maintenance plan says what must remain true, who is watching it, and what makes us stop.”',
            { procedureDiscipline: 3, uptimeJudgment: 3, communication: 2, powerSystems: 2 },
          ),
          choice(
            'Use the old 2N plan without changes because the work scope is still A-side only.',
            'The new common-control finding changes the assumptions behind the old plan.',
            '“When the model changes, the plan changes.”',
            { procedureDiscipline: -3, uptimeJudgment: -2 },
          ),
          choice(
            'Let the service vendor decide which monitoring is important.',
            'The vendor supports the equipment; site operations owns the integrated facility risk.',
            '“Expert partners matter. Risk ownership stays with the facility.”',
            { communication: -2, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '03 · Restore the architecture',
        title: 'Temporary controls should not become hidden permanent state.',
        situation: 'A-side UPS service completes successfully. The gateway command scope was limited for the window, and all monitored values are normal.',
        systemReadout: ['A UPS: NORMAL', 'B UPS: NORMAL', 'Gateway scope: TEMPORARILY LIMITED', 'Change: READY FOR RESTORE'],
        prompt: 'How do you restore full resilience?',
        options: [
          choice(
            'Use the approved restoration sequence to verify both UPS paths, restore and validate gateway scope, reconcile monitoring, update drawings and the dependency record, then close with operations acceptance.',
            'The facility returns to its intended architecture with the newly discovered dependency documented for future work.',
            '“That is advanced operations: leave the plant more understood than you found it.”',
            { procedureDiscipline: 3, communication: 3, powerSystems: 2, diagnosis: 2 },
          ),
          choice(
            'Leave the gateway restriction in place because everything is stable.',
            'A temporary safeguard can become a hidden operational constraint if not intentionally restored or documented.',
            '“Temporary is a configuration state, not a wish. Restore it or own it explicitly.”',
            { procedureDiscipline: -2, communication: -1 },
          ),
          choice(
            'Close the change before restoring the shared control layer.',
            'The architecture has not returned to its documented normal state.',
            '“We close when the designed posture is back and verified.”',
            { uptimeJudgment: -2, procedureDiscipline: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You proved that resilience includes the control plane.',
      masterMove: 'A master traces shared dependencies across electrical and digital layers, then designs maintenance guardrails around the true failure domains.',
      lesson: '2N is only as strong as its common-mode dependencies. Modern data centers require both power-path and control-path awareness.',
      principle: 'Trace the dependencies behind the topology.',
    },
  }),
]

const coolingScenarios: Scenario[] = [
  makeScenario({
    id: 'cdu-return-temperature',
    track: 'Cooling & Liquid Cooling',
    trackId: 'cooling',
    level: 'Foundation',
    duration: '6–8 min',
    title: 'The CDU Return-Temperature Drift',
    subtitle: 'Stabilize direct-to-chip cooling before a localized warning becomes a rack event.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'liquid-loop',
    opening:
      'A coolant distribution unit serving a GPU row reports rising secondary-loop return temperature. Flow remains above the warning threshold, but three high-density racks are climbing toward their workload thermal limit.',
    skills: ['diagnosis', 'coolingFundamentals', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Triage thermal risk',
        title: 'Temperature and flow must be read together.',
        situation: 'CDU supply temperature is stable, secondary-loop return is rising, and flow is 12% below its normal trend. No leak detection alarm is active. The NOC can see rack inlet and workload telemetry.',
        systemReadout: ['CDU supply: STABLE', 'Secondary return: RISING', 'Loop flow: -12% vs norm', 'Leak detection: NORMAL'],
        prompt: 'What do you do first?',
        options: [
          choice(
            'Notify the shift lead and NOC, verify the trend across supply, return, flow, and affected rack telemetry, then use the approved thermal-response plan to protect margin.',
            'The team establishes whether the issue is heat rejection, flow, load, or a combination before changing the plant.',
            '“Good. A CDU tells a story in relationships: supply, return, flow, and load. Read the whole sentence.”',
            { diagnosis: 3, coolingFundamentals: 3, communication: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Increase pump speed immediately without coordination.',
            'A speed change may be valid in an approved sequence, but an impulsive adjustment can obscure the condition and affect loop behavior.',
            '“A control knob is still a change. First understand what the loop is asking for.”',
            { procedureDiscipline: -2, diagnosis: -1 },
          ),
          choice(
            'Tell the NOC it is an air-cooling issue because rack temperatures are rising.',
            'The available CDU data points to a liquid-loop condition that needs coordinated assessment.',
            '“High-density halls are hybrid systems. Follow the measurements, not the familiar story.”',
            { coolingFundamentals: -3, diagnosis: -2 },
          ),
        ],
      },
      {
        phase: '02 · Stabilize the loop',
        title: 'Use designed capacity with the right authority.',
        situation: 'Trend review shows a secondary pump performance deviation. The CDU has an available redundant pump, and the approved control sequence includes a lead/lag transition. Rack temperatures are stable but still elevated.',
        systemReadout: ['Primary loop: HEALTHY', 'Secondary pump: PERFORMANCE DEVIATION', 'Redundant pump: AVAILABLE', 'Rack temperature: ELEVATED / STABLE'],
        prompt: 'How do you protect the racks?',
        options: [
          choice(
            'With authorization, perform the approved lead/lag transition while the NOC monitors rack telemetry and the team watches return temperature and flow response.',
            'The redundant pump restores flow margin and gives qualified personnel a stable condition to diagnose.',
            '“Exactly. Stabilize with the system you were given, then investigate with a cooler head.”',
            { coolingFundamentals: 3, uptimeJudgment: 3, procedureDiscipline: 2, communication: 1 },
          ),
          choice(
            'Open a manual bypass because more flow is always better.',
            'An unplanned bypass can change pressure and flow balance without addressing the suspected component condition.',
            '“More flow in one place can be less control everywhere. Use the designed sequence.”',
            { coolingFundamentals: -2, procedureDiscipline: -3 },
          ),
          choice(
            'Wait for the pump to fail completely before starting the standby.',
            'The available redundancy exists to prevent a hard failure from reaching the rack thermal envelope.',
            '“Do not wait for a warning to become a trip when you have a controlled mitigation.”',
            { uptimeJudgment: -3, coolingFundamentals: -1 },
          ),
        ],
      },
      {
        phase: '03 · Return with thermal proof',
        title: 'A lower temperature is promising, not yet a complete recovery.',
        situation: 'The redundant pump is operating. Flow returns to normal and the affected racks begin to cool. Qualified staff have a work package for the degraded pump.',
        systemReadout: ['Secondary flow: NORMAL', 'Rack thermal trend: DECLINING', 'Redundancy: CONSUMED', 'Work package: PENDING'],
        prompt: 'What does a strong handoff include?',
        options: [
          choice(
            'Trend the temperatures and flow through acceptance, record the degraded component and consumed redundancy, coordinate qualified repair, and brief the NOC and next shift.',
            'The system remains visible and owned until full cooling resilience is restored.',
            '“Good. A stable rack is the first win. Restoring the spare and the record is how we finish.”',
            { procedureDiscipline: 3, communication: 3, uptimeJudgment: 2, coolingFundamentals: 1 },
          ),
          choice(
            'Close the alarm once the rack temperature drops one degree.',
            'The degraded pump and lost redundancy still require ownership and acceptance monitoring.',
            '“We close when the plant is whole, not when the graph first turns.”',
            { procedureDiscipline: -2, uptimeJudgment: -1 },
          ),
          choice(
            'Return the redundant pump to standby immediately to avoid wear.',
            'Removing the added capacity before diagnosis and acceptance could reintroduce thermal risk.',
            '“Let the system prove stable before you take away its cushion.”',
            { coolingFundamentals: -2, uptimeJudgment: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You kept a liquid-loop signal from becoming a rack thermal event.',
      masterMove: 'A master reads supply, return, flow, and rack behavior together, then uses designed redundant capacity through a controlled sequence.',
      lesson: 'Direct-to-chip cooling adds another thermal system to understand. Flow trend and heat rejection are as operationally important as a temperature alarm.',
      principle: 'Read the loop. Stabilize the load. Restore the spare.',
    },
  }),
  makeScenario({
    id: 'cold-aisle-short-circuit',
    track: 'Cooling & Liquid Cooling',
    trackId: 'cooling',
    level: 'Foundation',
    duration: '6–8 min',
    title: 'The Cold-Aisle Short Circuit',
    subtitle: 'Find the airflow bypass that makes a healthy CRAC look weak.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'containment',
    opening:
      'Two racks in a contained cold aisle show elevated inlet temperature even though room supply temperature and CRAC capacity look normal. A recent equipment move left several open rack positions and a partially latched containment door.',
    skills: ['diagnosis', 'coolingFundamentals', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Follow the air',
        title: 'The room can be cold while the rack starves for supply air.',
        situation: 'BMS sees normal CRAC discharge. Handheld readings confirm the warm racks are localized. The NOC notes a cabinet deployment completed in the aisle earlier today.',
        systemReadout: ['CRAC discharge: NORMAL', 'Warm racks: LOCALIZED', 'Containment door: PARTIALLY LATCHED', 'Recent work: CABINET DEPLOYMENT'],
        prompt: 'What is your first diagnostic move?',
        options: [
          choice(
            'Notify the shift lead, inspect containment and rack blanking condition through the approved floor process, and compare the localized airflow path before changing cooling capacity.',
            'The team follows the air path to the likely bypass instead of treating a localized condition as a plant-wide shortage.',
            '“Good. Cooling failures are often geometry before they are machinery. Trace where the air is escaping.”',
            { diagnosis: 3, coolingFundamentals: 3, communication: 1, procedureDiscipline: 1 },
          ),
          choice(
            'Lower every CRAC supply-temperature setpoint immediately.',
            'The change consumes energy and can create broader effects without fixing the local air bypass.',
            '“Do not chill the whole building to solve a door that will not latch.”',
            { coolingFundamentals: -2, procedureDiscipline: -2 },
          ),
          choice(
            'Open more containment doors to equalize the aisle.',
            'More uncontrolled mixing worsens the designed airflow separation.',
            '“Containment is not decoration. It is a thermal control surface.”',
            { coolingFundamentals: -3, uptimeJudgment: -1 },
          ),
        ],
      },
      {
        phase: '02 · Correct the bypass',
        title: 'Small physical details carry high-density consequences.',
        situation: 'The inspection finds missing blanking panels near the warm racks and confirms the containment door latch is not engaging. No electrical or liquid cooling alarms are present.',
        systemReadout: ['Blanking panels: MISSING', 'Door latch: FAULTED', 'Plant cooling: HEALTHY', 'Rack inlets: ELEVATED'],
        prompt: 'How do you correct it?',
        options: [
          choice(
            'Coordinate an approved floor correction for the latch and blanking panels, keep the NOC watching inlet trend, and verify the intended containment path is restored.',
            'The repair directly addresses the bypass while operations observes the rack-level result.',
            '“Exactly. Good thermal work has a before-and-after story the rack sensors can confirm.”',
            { coolingFundamentals: 3, procedureDiscipline: 2, communication: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Tape the door open so it cannot move again.',
            'The temporary-looking fix locks in the airflow defect and bypasses site standards.',
            '“A workaround that defeats containment is not a workaround—it is a new condition.”',
            { procedureDiscipline: -2, coolingFundamentals: -2 },
          ),
          choice(
            'Add portable fans in front of the racks.',
            'Unplanned fans can distort airflow, create hazards, and obscure the actual containment defect.',
            '“Do not fight a designed airflow system with improvisation.”',
            { safetyLoto: -1, coolingFundamentals: -3 },
          ),
        ],
      },
      {
        phase: '03 · Learn from the move',
        title: 'The deployment process is part of the cooling system.',
        situation: 'The inlet trend returns to normal after containment is corrected. The hardware move is still open in the change record.',
        systemReadout: ['Rack inlets: NORMAL', 'Containment: RESTORED', 'CRAC capacity: NORMAL', 'Deployment change: OPEN'],
        prompt: 'What strengthens future work?',
        options: [
          choice(
            'Document the airflow finding, update the deployment closeout checklist for blanking and containment verification, and close with NOC-confirmed thermal trends.',
            'The next equipment move inherits a guardrail that prevents the same local thermal issue.',
            '“That is how operators become system builders: every closeout makes the next change safer.”',
            { procedureDiscipline: 3, communication: 2, coolingFundamentals: 2 },
          ),
          choice(
            'Close the alarm and keep the lesson informal.',
            'The process gap remains unaddressed and is likely to recur.',
            '“If we learned it the hard way, capture it the durable way.”',
            { procedureDiscipline: -2, communication: -1 },
          ),
          choice(
            'Increase room cooling permanently as insurance.',
            'A broad permanent setpoint change hides the corrected local cause and wastes capacity.',
            '“Fix the pathway first. Do not make the whole plant pay for one missing panel.”',
            { coolingFundamentals: -2, diagnosis: -1 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You restored the air path instead of overworking the plant.',
      masterMove: 'A master sees localized rack heat as an airflow question first, then verifies containment, blanking, and change history before changing central cooling.',
      lesson: 'High-density racks expose small airflow defects quickly. Physical containment discipline is a core data-center skill.',
      principle: 'Follow the air before adding more cold.',
    },
  }),
  makeScenario({
    id: 'rear-door-hx-drip',
    track: 'Cooling & Liquid Cooling',
    trackId: 'cooling',
    level: 'Intermediate',
    duration: '7–9 min',
    title: 'The Rear-Door HX Drip',
    subtitle: 'Treat unexpected moisture near IT as a safety and uptime condition until proven otherwise.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'liquid-loop',
    opening:
      'A technician reports moisture on the floor beside a rear-door heat exchanger serving a high-density rack. The leak-detection strip has not alarmed. The rack is online and adjacent power whips are present.',
    skills: ['diagnosis', 'coolingFundamentals', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Protect the scene',
        title: 'No alarm does not make moisture harmless.',
        situation: 'The moisture is limited to a small area, but its source is unknown. It could be condensation, a fitting issue, or a cleaning spill. The rack remains powered and the aisle is in active use.',
        systemReadout: ['Moisture: OBSERVED', 'Leak strip: NO ALARM', 'Rack state: ONLINE', 'Adjacent power: PRESENT'],
        prompt: 'What is the first professional response?',
        options: [
          choice(
            'Notify the shift lead and NOC, establish a controlled exclusion around the area, preserve the rack and loop state, and bring qualified facilities staff to assess the source under site procedure.',
            'The condition is made visible and bounded without guessing or exposing people to a possible liquid/electrical interface.',
            '“Good. Moisture near energized equipment is a stop-and-assess condition. We protect people and the load before we classify the drip.”',
            { safetyLoto: 3, communication: 3, procedureDiscipline: 2, uptimeJudgment: 2 },
          ),
          choice(
            'Wipe it up quickly and keep working since the leak strip is quiet.',
            'The source and extent remain unknown, and the action could expose personnel to a hidden hazard.',
            '“Quiet sensors do not overrule what you can see. Preserve the condition and get the right assessment.”',
            { safetyLoto: -3, diagnosis: -2 },
          ),
          choice(
            'Power down the rack immediately without coordinating with operations.',
            'A shutdown may be needed in some conditions, but uncoordinated action can cause avoidable workload impact and may not address the immediate safety boundary.',
            '“We escalate safety fast, but we still communicate and follow the site’s emergency authority.”',
            { communication: -2, uptimeJudgment: -2 },
          ),
        ],
      },
      {
        phase: '02 · Classify safely',
        title: 'Condensation and leakage require different responses—but the boundary comes first.',
        situation: 'Qualified staff determine the moisture is condensation caused by an insulation gap, not an active coolant leak. The rack’s rear-door loop is otherwise normal.',
        systemReadout: ['Source: CONDENSATION', 'Active leak: NOT FOUND', 'Insulation: GAP IDENTIFIED', 'Rack loop: NORMAL'],
        prompt: 'How do you manage the correction?',
        options: [
          choice(
            'Keep the condition documented, coordinate the approved insulation correction, verify dew-point and loop conditions, and monitor the area through the accepted repair plan.',
            'The team fixes the confirmed cause while preserving controls around a liquid-cooled rack.',
            '“Exactly. Classification lets us narrow the plan, not relax the discipline.”',
            { coolingFundamentals: 3, procedureDiscipline: 3, diagnosis: 2, communication: 1 },
          ),
          choice(
            'Wrap the gap with whatever tape is nearby and close the event.',
            'An improvised material may not meet the equipment or condensation-control requirements.',
            '“The right cause deserves the right corrective action, not the nearest adhesive.”',
            { procedureDiscipline: -2, coolingFundamentals: -1 },
          ),
          choice(
            'Disable the moisture observation because it was only condensation.',
            'The visual condition and its documented cause still need repair and verification.',
            '“A benign classification is not permission to lose the record.”',
            { diagnosis: -1, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '03 · Validate the environment',
        title: 'The corrected surface must stay dry under real conditions.',
        situation: 'The approved insulation correction is complete. Dew-point readings, rear-door temperatures, and leak detection are all normal during the acceptance period.',
        systemReadout: ['Insulation: CORRECTED', 'Dew point: NORMAL', 'Leak detection: NORMAL', 'Area: DRY'],
        prompt: 'What closes the condition?',
        options: [
          choice(
            'Verify dry conditions and normal loop telemetry through acceptance, update the incident and maintenance record, and communicate the outcome to operations.',
            'The team closes on evidence that both the rack environment and the leak safeguards are healthy.',
            '“Nicely done. In liquid cooling, a dry floor and good telemetry are both part of the acceptance test.”',
            { diagnosis: 2, procedureDiscipline: 3, communication: 2, coolingFundamentals: 1 },
          ),
          choice(
            'Close it as soon as the insulation is installed.',
            'Installation complete does not prove the condensation condition is resolved under operating conditions.',
            '“A repair needs a result, not just a receipt.”',
            { procedureDiscipline: -2, diagnosis: -1 },
          ),
          choice(
            'Remove the leak detection strip because it did not catch condensation.',
            'The strip serves a different condition and remains an important guardrail for actual leaks.',
            '“Do not punish a sensor for not detecting the thing it was never designed to detect.”',
            { coolingFundamentals: -2, procedureDiscipline: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You kept moisture near IT from becoming either a hidden hazard or a blind shutdown.',
      masterMove: 'A master treats the observation as real, establishes a safe boundary, then lets qualified assessment distinguish condensation from leakage.',
      lesson: 'Liquid-cooling operations require respect for the boundary between thermal hardware, water controls, and energized equipment.',
      principle: 'See moisture. Bound the risk. Classify before correcting.',
    },
  }),
  makeScenario({
    id: 'chilled-water-dp-dip',
    track: 'Cooling & Liquid Cooling',
    trackId: 'cooling',
    level: 'Intermediate',
    duration: '7–9 min',
    title: 'The Chilled-Water DP Dip',
    subtitle: 'Keep a plant-side pressure alarm from becoming a hall-side thermal problem.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'cooling-loop',
    opening:
      'The chilled-water distribution loop sees a differential-pressure dip. CRAH units still run, but two zones show declining valve authority and supply-air temperatures are beginning to drift upward.',
    skills: ['diagnosis', 'coolingFundamentals', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Read the cascade',
        title: 'A plant signal can arrive at the rack as an airflow symptom.',
        situation: 'The pressure dip began minutes after a plant maintenance activity. No water leak alarm is active. Room temperatures are stable but the affected zones are losing cooling control margin.',
        systemReadout: ['Loop DP: BELOW NORMAL', 'CRAH valves: LOSING AUTHORITY', 'Zone supply air: DRIFTING', 'Plant maintenance: RECENT'],
        prompt: 'What do you do first?',
        options: [
          choice(
            'Notify plant operations, the shift lead, and NOC; correlate the pressure event with current maintenance and zone trends; then apply the site’s approved thermal-protection escalation.',
            'The response connects the plant event, room effect, and workload visibility before anyone improvises controls.',
            '“Good. Do not let the building side and the data hall side troubleshoot in separate stories.”',
            { communication: 3, diagnosis: 3, coolingFundamentals: 2, uptimeJudgment: 1 },
          ),
          choice(
            'Force all CRAH valves open to maximize cooling.',
            'The action can disturb loop balance and may not address the reduced differential pressure.',
            '“A valve position is not a cure for a plant-side pressure problem.”',
            { coolingFundamentals: -3, procedureDiscipline: -2 },
          ),
          choice(
            'Focus only on rack temperatures because they are what customers see.',
            'Ignoring the plant signal delays the upstream team that can restore the condition.',
            '“The rack is where we feel it. The root may be much farther upstream.”',
            { diagnosis: -2, communication: -2 },
          ),
        ],
      },
      {
        phase: '02 · Coordinate stabilization',
        title: 'The loop needs a controlled recovery, not competing adjustments.',
        situation: 'Plant operations identify a maintenance-related pump sequencing issue. A standby pump is available under the approved sequence. The NOC sees rising—but below-threshold—rack inlet temperatures in the affected zones.',
        systemReadout: ['Cause: PUMP SEQUENCING', 'Standby pump: AVAILABLE', 'Rack inlets: RISING / BELOW THRESHOLD', 'Plant action: AUTHORIZATION REQUIRED'],
        prompt: 'How do you protect the hall?',
        options: [
          choice(
            'Have plant operations execute the approved standby-pump sequence while the data-center team monitors zone and rack response, with explicit stop thresholds and shared communications.',
            'The upstream fix and downstream monitoring occur as one controlled response.',
            '“Exactly. One plant, one response. Each team watches the part the other cannot see.”',
            { coolingFundamentals: 3, communication: 3, procedureDiscipline: 2, uptimeJudgment: 2 },
          ),
          choice(
            'Ask the data hall team to compensate by lowering all supply-temperature setpoints.',
            'The local adjustment can consume margin and obscure the plant response without restoring pressure.',
            '“Do not ask the room to compensate for a pump problem it cannot solve.”',
            { coolingFundamentals: -2, uptimeJudgment: -1 },
          ),
          choice(
            'Stop the plant maintenance without communicating the thermal effect.',
            'Stopping work may be appropriate, but uncoordinated action risks conflicting commands and incomplete restoration.',
            '“Stop-work is a powerful tool. Use it clearly, with the people who own the sequence.”',
            { communication: -2, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '03 · Verify full loop health',
        title: 'Pressure recovery must show up in the zones and the records.',
        situation: 'The standby pump restores loop differential pressure. CRAH valve authority and supply-air temperatures recover, and rack inlets return to baseline.',
        systemReadout: ['Loop DP: NORMAL', 'CRAH authority: RESTORED', 'Rack inlets: BASELINE', 'Maintenance state: ACTIVE'],
        prompt: 'What completes the response?',
        options: [
          choice(
            'Verify the end-to-end recovery across loop, CRAH, zone, and rack data; update the maintenance/change record with the sequencing lesson; and restore the intended redundancy posture.',
            'The plant returns to a known state and the contributing maintenance plan improves.',
            '“That is systems thinking. We close the loop physically and operationally.”',
            { diagnosis: 3, procedureDiscipline: 3, communication: 2, coolingFundamentals: 2 },
          ),
          choice(
            'Close the incident once plant pressure is normal.',
            'The downstream cooling and rack response still need confirmation before release.',
            '“The gauge is one witness. Let the entire chain testify.”',
            { diagnosis: -2, procedureDiscipline: -1 },
          ),
          choice(
            'Return the standby pump to off immediately to save energy.',
            'The team must first verify the intended operational state and available redundancy under the approved plan.',
            '“Efficiency matters. So does not re-creating the condition we just stabilized.”',
            { uptimeJudgment: -2, coolingFundamentals: -1 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You translated a plant pressure dip into a coordinated thermal response.',
      masterMove: 'A master connects water-loop behavior to CRAH control and rack conditions, then unites plant and data-hall operations around one sequence.',
      lesson: 'Cooling cascades across layers. The best diagnosis follows the signal from plant to valve to air to rack.',
      principle: 'Correlate upstream cause with downstream effect.',
    },
  }),
  makeScenario({
    id: 'eighty-kw-ramp',
    track: 'Cooling & Liquid Cooling',
    trackId: 'cooling',
    level: 'Advanced',
    duration: '9–11 min',
    title: 'The 80 kW Rack Ramp',
    subtitle: 'Commission a high-density AI rack with real thermal evidence, not nameplate confidence.',
    mentor: 'Mara Vale · Master Critical-Facilities Technician',
    diagram: 'liquid-loop',
    opening:
      'A new GPU cluster is scheduled to ramp from idle to 80 kW per rack. It uses direct-to-chip liquid cooling with rear-door heat exchangers. The capacity model supports the load, but live commissioning has not yet verified the combined air and liquid response.',
    skills: ['diagnosis', 'coolingFundamentals', 'safetyLoto', 'uptimeJudgment', 'procedureDiscipline', 'communication'],
    beats: [
      {
        phase: '01 · Commission the system, not the spreadsheet',
        title: 'Nameplate capacity is a hypothesis until the live system proves it.',
        situation: 'The deployment team wants to ramp all racks at once to meet a customer deadline. The NOC, facilities team, and application team are available, but the planned observation points have not been confirmed.',
        systemReadout: ['Target density: 80 kW / rack', 'Liquid loops: INSTALLED', 'Rear doors: INSTALLED', 'Live thermal validation: PENDING'],
        prompt: 'How do you start?',
        options: [
          choice(
            'Run the approved staged commissioning plan with named observers, defined ramp steps, live supply/return/flow and rack telemetry, stop thresholds, and a documented back-out path.',
            'The team turns a capacity model into controlled operating evidence instead of a single high-stakes leap.',
            '“Excellent. At this density, commissioning is a conversation between the rack, the liquid loop, the air path, and the people watching them.”',
            { procedureDiscipline: 3, coolingFundamentals: 3, communication: 3, uptimeJudgment: 2 },
          ),
          choice(
            'Ramp every rack to full load at once because the design model supports it.',
            'The action offers little diagnostic resolution and reduces the team’s ability to catch and isolate an emerging constraint.',
            '“A model earns trust through staged evidence. Do not turn commissioning into a cliff.”',
            { uptimeJudgment: -3, diagnosis: -2 },
          ),
          choice(
            'Rely on application throttling if the room gets too warm.',
            'Application behavior is one protective layer, not a substitute for controlled facility commissioning.',
            '“Workload controls help, but they are not your thermal acceptance plan.”',
            { coolingFundamentals: -2, procedureDiscipline: -2 },
          ),
        ],
      },
      {
        phase: '02 · Interpret the ramp',
        title: 'A rising return temperature can be healthy—until its relationships break.',
        situation: 'At 60 kW per rack, liquid return temperatures rise as expected, but one row shows a larger-than-peer differential and its rear-door heat exchanger airflow is lower than design. Rack telemetry remains below stop thresholds.',
        systemReadout: ['Ramp level: 60 kW / rack', 'One-row return delta: HIGH', 'Rear-door airflow: LOW', 'Rack telemetry: WITHIN LIMITS'],
        prompt: 'What do you do next?',
        options: [
          choice(
            'Hold at the current approved step, share the cross-system data, inspect the affected row through the commissioning plan, and correct the confirmed air/liquid integration issue before increasing load.',
            'The ramp pauses while the team learns why one row behaves differently without spending the remaining thermal margin.',
            '“That is exactly why we stage. A difference is information—if we stop long enough to read it.”',
            { diagnosis: 3, coolingFundamentals: 3, uptimeJudgment: 3, communication: 2 },
          ),
          choice(
            'Continue to 80 kW because no threshold has been crossed yet.',
            'The abnormal row is an early warning that could become harder to manage at full density.',
            '“Thresholds are guardrails, not targets. Do not sprint toward one because you have not hit it yet.”',
            { uptimeJudgment: -3, coolingFundamentals: -2 },
          ),
          choice(
            'Lower the temperature setpoint for the entire hall and keep ramping.',
            'A broad change can hide the localized integration issue and makes the commissioning data less useful.',
            '“Do not make the building compensate for a row you have not understood.”',
            { diagnosis: -2, coolingFundamentals: -2 },
          ),
        ],
      },
      {
        phase: '03 · Earn the operating envelope',
        title: 'Full density requires repeatable evidence and shared ownership.',
        situation: 'The affected rear-door airflow issue is corrected under the plan. A repeat ramp shows peer-consistent thermal behavior through 80 kW per rack, with all liquid and air readings inside the defined operating envelope.',
        systemReadout: ['Ramp: 80 kW / rack', 'Thermal behavior: CONSISTENT', 'Operating envelope: MET', 'Commissioning record: DRAFT'],
        prompt: 'How do you release the cluster?',
        options: [
          choice(
            'Verify the full data set, document normal ranges and alert thresholds, confirm monitoring ownership and escalation paths, update capacity records, and formally hand off the accepted operating envelope.',
            'The cluster enters production with a shared understanding of how healthy operation looks and who responds when it changes.',
            '“That is the real deliverable: not just 80 kW, but an operating envelope the whole team can recognize and defend.”',
            { procedureDiscipline: 3, communication: 3, diagnosis: 2, coolingFundamentals: 2 },
          ),
          choice(
            'Declare success because the temperature did not alarm at 80 kW.',
            'No alarm is weaker evidence than a complete accepted operating envelope and handoff.',
            '“Silent is not the same as understood.”',
            { diagnosis: -2, procedureDiscipline: -2 },
          ),
          choice(
            'Keep the commissioning thresholds informal so the team can stay flexible.',
            'Informal limits create inconsistent response at the exact density where fast, shared judgment matters.',
            '“Flexibility without boundaries is just surprise with better branding.”',
            { communication: -2, uptimeJudgment: -2 },
          ),
        ],
      },
    ],
    debrief: {
      title: 'You transformed an 80 kW ramp into a usable operating envelope.',
      masterMove: 'A master commissions in stages, pauses on cross-system anomalies, and hands production a clear set of healthy ranges, thresholds, and owners.',
      lesson: 'AI racks exceed old air-cooling assumptions. Capacity planning must be validated by integrated liquid, air, and workload telemetry.',
      principle: 'Ramp deliberately. Learn at each step. Release with an envelope.',
    },
  }),
]

export const scenarios: Scenario[] = [sampleScenario, ...electricalScenarios, ...powerScenarios, ...coolingScenarios]

export const demoScenarioId = sampleScenario.id

export const levels: Difficulty[] = ['Foundation', 'Intermediate', 'Advanced']

export function getScenario(id: string) {
  return scenarios.find((scenario) => scenario.id === id)
}

export function scenariosFor(trackId: TrackId, level?: Difficulty) {
  return scenarios.filter((scenario) => scenario.trackId === trackId && (!level || scenario.level === level))
}
