import type { Scenario, Skill } from './types'

export const sampleScenario = {
  id: 'thermal-runaway-a04',
  track: 'Data Center Electrical',
  trackId: 'electrical',
  level: 'Foundation',
  duration: '8–10 min',
  title: 'GPU Rack Cooling Alert',
  subtitle: 'Stabilize an air-cooling fault without turning a warning into an outage.',
  mentor: 'Mara Vale · Master Critical-Facilities Technician',
  diagram: 'cooling-loop',
  opening:
    'Tuesday, 14:17. You are shadowing the afternoon critical-facilities shift in Hall A, a live GPU data hall. The NOC reports three rack-inlet temperature warnings in Aisle 04. CRAC-04 has a low-supply-airflow alarm. No customer load has tripped, but the aisle serves 48 GPU racks and the room is running near its planned thermal envelope.',
  skills: [
    'diagnosis',
    'coolingFundamentals',
    'safetyLoto',
    'uptimeJudgment',
    'procedureDiscipline',
    'communication',
  ] satisfies Skill[],
  nodes: {
    'first-move': {
      id: 'first-move',
      kind: 'decision',
      phase: '01 · Triage',
      title: 'The alarm is real. Your first move sets the pace.',
      situation:
        'The warmest inlet is 28.1°C and rising. The site’s escalation threshold is 30°C. CRAC-04 is part of an N+1 air-cooling group; CRAC-05 is available but in standby. The shift lead is in the control room, and the NOC is watching the same alarms.',
      systemReadout: [
        'Aisle 04 inlet: 28.1°C ↑',
        'CRAC-04: LOW SUPPLY AIRFLOW',
        'CRAC-05: STANDBY / AVAILABLE',
        'CDU-2: NORMAL · NO LEAK ALARM',
      ],
      diagramState: 'alarm',
      prompt: 'What do you do first?',
      options: [
        {
          id: 'coordinate-and-verify',
          label: 'Notify the shift lead and NOC, verify the alarm trend and cooling-group status, then request the approved stabilization sequence.',
          consequence:
            'The event is owned, time-stamped, and visible to the people who can authorize a change. You learn that the temperature rise is localized and that CRAC-05 has no active inhibit.',
          mentor:
            '“Good. In a live hall, speed is not the same as haste. First make the condition shared, then make a fact-based move. We protect people, protect the load, and leave a clean trail for the next shift.”',
          impacts: {
            communication: 2,
            diagnosis: 2,
            procedureDiscipline: 2,
            uptimeJudgment: 1,
          },
          nextId: 'stabilize-capacity',
        },
        {
          id: 'reset-crac',
          label: 'Go straight to CRAC-04 and reset it so the room recovers faster.',
          consequence:
            'A reset could erase useful fault context, restart a failing component into an unsafe state, or create a second transition while temperatures are already climbing. The shift lead stops the action before any reset occurs.',
          mentor:
            '“Pause there. A reset is a change, not a diagnosis. On critical equipment, we do not trade evidence and coordination for the feeling of doing something.”',
          impacts: { procedureDiscipline: -2, diagnosis: -1, uptimeJudgment: -1 },
          nextId: 'recovery-coordinate',
        },
        {
          id: 'open-doors',
          label: 'Open the cold-aisle containment doors to let more room air reach the warm racks.',
          consequence:
            'The doors disrupt designed airflow and can mix hot return air with the supply path. The NOC asks you to restore containment; the alarm trend has not improved.',
          mentor:
            '“Containment is part of the cooling plant. It is tempting to make the aisle look open and active, but random airflow changes are not a controlled mitigation.”',
          impacts: { coolingFundamentals: -2, uptimeJudgment: -1 },
          nextId: 'recovery-coordinate',
        },
        {
          id: 'shed-workload',
          label: 'Ask a nearby engineer to reduce GPU workload immediately.',
          consequence:
            'The request bypasses the workload-management and incident command path. The engineer cannot act on it, and precious minutes pass without increasing cooling capacity.',
          mentor:
            '“Load shed can be a valid controlled escalation, but it is not a side-channel decision. Know who owns the application, who owns the facility, and who can declare that response.”',
          impacts: { communication: -1, procedureDiscipline: -2, uptimeJudgment: -1 },
          nextId: 'recovery-coordinate',
        },
      ],
    },
    'recovery-coordinate': {
      id: 'recovery-coordinate',
      kind: 'decision',
      phase: 'Recovery · Reset the decision',
      title: 'The first instinct is corrected before the system is touched.',
      situation:
        'No equipment was changed. The shift lead asks you to restart the response from the control room: establish a shared picture, verify available redundancy, and use the site’s approved path.',
      systemReadout: [
        'Event log: OPEN',
        'CRAC-04: ALARM PERSISTS',
        'CRAC-05: STANDBY / AVAILABLE',
      ],
      diagramState: 'alarm',
      prompt: 'What is the corrected action?',
      options: [
        {
          id: 'restart-with-control',
          label: 'Notify the shift lead and NOC, confirm the trend and available capacity, then request the approved stabilization sequence.',
          consequence:
            'The team is now operating from the same facts. The shift lead authorizes the cooling-group response.',
          mentor:
            '“That is the reset I want: reset the decision process, not the machine. Now we can move quickly because the boundaries are clear.”',
          impacts: { communication: 1, procedureDiscipline: 2, uptimeJudgment: 1 },
          nextId: 'stabilize-capacity',
        },
      ],
    },
    'stabilize-capacity': {
      id: 'stabilize-capacity',
      kind: 'decision',
      phase: '02 · Stabilize',
      title: 'Add cooling capacity before you chase the fault.',
      situation:
        'BMS history shows CRAC-04 Fan 2 commanded RUN, but fan tachometer feedback is zero. VFD current is 2.1 A; normal for this fan bank is 12–14 A. There is no upstream electrical fault, no chilled-water differential-pressure alarm, and no CDU leak alarm. Rack inlets are 28.7°C and rising. CRAC-05 is the designated standby unit.',
      systemReadout: [
        'CRAC-04 Fan 2: COMMAND RUN / TACH 0 RPM',
        'Fan 2 VFD: 2.1 A · NO FAULT CODE',
        'Chilled-water DP: NORMAL',
        'Aisle 04 inlet: 28.7°C ↑',
      ],
      diagramState: 'stabilize',
      prompt: 'How do you protect the thermal envelope while the fault is investigated?',
      options: [
        {
          id: 'start-standby-approved',
          label: 'With the shift lead’s authorization, start CRAC-05 using the approved sequence and have the NOC watch inlet temperatures and cooling alarms.',
          consequence:
            'CRAC-05 starts cleanly. Supply airflow recovers across Aisle 04 and temperatures level at 29.0°C before beginning a slow decline. The hall retains cooling, but the N+1 margin is now consumed.',
          mentor:
            '“Exactly. Stabilize, then diagnose. Redundancy exists to buy us a calm, controlled window—not permission to stop caring about the failed unit.”',
          impacts: { coolingFundamentals: 2, uptimeJudgment: 3, communication: 1, procedureDiscipline: 2 },
          nextId: 'set-boundaries',
        },
        {
          id: 'wait-for-more-data',
          label: 'Wait another 15 minutes to collect a cleaner temperature trend before starting the standby unit.',
          consequence:
            'The trend gets clearer, but it also reaches 29.8°C. You used the safety margin to gather data that was already sufficient for a controlled mitigation.',
          mentor:
            '“Trend data matters, but so does the rate of change and the available margin. Waiting is an active choice. Make sure it is buying more than it costs.”',
          impacts: { diagnosis: 1, uptimeJudgment: -2, coolingFundamentals: -1 },
          nextId: 'recovery-stabilize',
        },
        {
          id: 'override-alarm',
          label: 'Override the low-airflow alarm so it stops distracting the NOC while you investigate.',
          consequence:
            'The alarm is no longer visible in the normal queue, but the airflow fault still exists and the NOC has lost a guardrail. The shift lead reverses the override.',
          mentor:
            '“Never silence the messenger because the message is inconvenient. If an alarm needs a temporary handling plan, that plan is documented, approved, time-bounded, and monitored.”',
          impacts: { procedureDiscipline: -3, communication: -1, uptimeJudgment: -2 },
          nextId: 'recovery-stabilize',
        },
        {
          id: 'start-everything',
          label: 'Start every available CRAC to guarantee maximum cooling.',
          consequence:
            'The group can support additional units, but you have not checked sequencing, load, or the effect on remaining redundancy. The shift lead declines the uncontrolled request and starts only the designated standby unit.',
          mentor:
            '“More equipment is not automatically more resilience. We bring on capacity deliberately, with a reason we can explain and a system state we can restore.”',
          impacts: { coolingFundamentals: -1, procedureDiscipline: -2, uptimeJudgment: -1 },
          nextId: 'recovery-stabilize',
        },
      ],
    },
    'recovery-stabilize': {
      id: 'recovery-stabilize',
      kind: 'decision',
      phase: 'Recovery · Protect the envelope',
      title: 'The thermal margin is no longer theoretical.',
      situation:
        'The shift lead keeps the alert active and directs the team to restore the designated standby capacity under the site procedure. This is the last low-risk window before rack inlets cross the escalation threshold.',
      systemReadout: [
        'Aisle 04 inlet: 29.8°C ↑',
        'CRAC-05: STANDBY / AVAILABLE',
        'N+1 margin: AT RISK',
      ],
      diagramState: 'stabilize',
      prompt: 'What controlled recovery do you take?',
      options: [
        {
          id: 'restore-designated-capacity',
          label: 'With authorization, start CRAC-05 by the approved sequence and keep the NOC on the temperature and alarm trend.',
          consequence:
            'The added unit restores airflow and the temperature trend turns down. The investigation can now proceed from a stable state.',
          mentor:
            '“Good recovery. You did not need to be the hero—you needed to bring the right capacity online without making a second problem.”',
          impacts: { coolingFundamentals: 2, uptimeJudgment: 2, procedureDiscipline: 2 },
          nextId: 'set-boundaries',
        },
      ],
    },
    'set-boundaries': {
      id: 'set-boundaries',
      kind: 'decision',
      phase: '03 · Boundaries',
      title: 'The symptom points to Fan 2. Do not confuse a clue with permission.',
      situation:
        'With CRAC-05 supporting the aisle, the BMS still shows CRAC-04 Fan 2 commanded to run with zero tach feedback. A visual check from the approved equipment boundary confirms no obvious water leak or smoke. You are a learner accompanying the shift; the exact fault and work boundary are not yet established.',
      systemReadout: [
        'Cooling capacity: STABLE · N+1 CONSUMED',
        'CRAC-04 Fan 2: RUN COMMAND / 0 RPM',
        'Visible condition: NO LEAK · NO SMOKE',
        'Work authorization: NOT YET ESTABLISHED',
      ],
      diagramState: 'isolate',
      prompt: 'What is the professional next step?',
      options: [
        {
          id: 'qualified-boundary',
          label: 'Preserve the fault state, brief the shift lead, and hand the diagnosis to qualified personnel under an approved work plan with the correct isolation and verification steps.',
          consequence:
            'The team records the observed state, keeps added cooling online, and establishes a formal work boundary. A qualified technician identifies a failed VFD control-power supply without exposing the team or the hall to an uncontrolled change.',
          mentor:
            '“That is mature judgment. You do not need to prove competence by reaching into equipment. You prove it by knowing the boundary, protecting the evidence, and bringing in the right qualification.”',
          impacts: { safetyLoto: 3, procedureDiscipline: 3, diagnosis: 2, uptimeJudgment: 2 },
          nextId: 'change-control',
        },
        {
          id: 'live-measurement',
          label: 'Open the VFD cabinet and take live measurements to prove whether control power is missing.',
          consequence:
            'This exceeds your role and introduces energized-work risk without an established need, authorization, hazard analysis, or qualified person. The shift lead stops the attempt.',
          mentor:
            '“No. A live facility does not make energized work routine. Qualification, documented justification, site procedure, arc-flash controls, and the right authority all matter. Training judgment includes knowing when to stop.”',
          impacts: { safetyLoto: -3, procedureDiscipline: -3, uptimeJudgment: -2 },
          nextId: 'recovery-boundary',
        },
        {
          id: 'manual-fan-spin',
          label: 'Try to turn the fan manually to see whether the motor is mechanically stuck.',
          consequence:
            'The action could disturb a faulted assembly and is not an approved diagnostic step in a live system. The shift lead directs you away from the equipment.',
          mentor:
            '“Hands off. We never improvise around rotating or electrically supplied equipment. Observation is not authorization.”',
          impacts: { safetyLoto: -3, procedureDiscipline: -2 },
          nextId: 'recovery-boundary',
        },
        {
          id: 'swap-vfd',
          label: 'Ask to swap in a spare VFD immediately; the current reading clearly means the VFD is bad.',
          consequence:
            'The reading is a clue, not a root cause. An uncontrolled component swap could misidentify the issue, affect configuration, and consume the recovery window without a back-out plan.',
          mentor:
            '“Diagnosis earns the repair. In critical infrastructure, we do not swap parts to feel decisive—especially when redundancy is already spent.”',
          impacts: { diagnosis: -2, procedureDiscipline: -2, uptimeJudgment: -2 },
          nextId: 'recovery-boundary',
        },
      ],
    },
    'recovery-boundary': {
      id: 'recovery-boundary',
      kind: 'decision',
      phase: 'Recovery · Re-establish control',
      title: 'The boundary holds. The system remains stable.',
      situation:
        'The shift lead stops the unapproved diagnostic action. Cooling remains stable on CRAC-05, but the site is operating without its normal spare capacity. The correct response is to preserve the fault state and establish the right people, plan, and controls.',
      systemReadout: [
        'Cooling capacity: STABLE · N+1 CONSUMED',
        'Unapproved work: STOPPED',
        'Fault evidence: PRESERVED',
      ],
      diagramState: 'isolate',
      prompt: 'How do you re-establish a safe path forward?',
      options: [
        {
          id: 'preserve-and-escalate',
          label: 'Brief the shift lead, preserve the fault state, and escalate to qualified personnel using an approved work plan and verified isolation boundary.',
          consequence:
            'The work is now owned by the correct team, with the facility state and the recovery plan understood by operations.',
          mentor:
            '“That is how we recover from a bad instinct: stop, communicate, and restore the process. The job is still very much winnable.”',
          impacts: { safetyLoto: 2, procedureDiscipline: 2, communication: 1 },
          nextId: 'change-control',
        },
      ],
    },
    'change-control': {
      id: 'change-control',
      kind: 'decision',
      phase: '04 · Controlled restoration',
      title: 'The repair is ready. The discipline continues.',
      situation:
        'Qualified personnel have identified and corrected the failed VFD control-power supply under the site’s approved process. Before CRAC-04 returns to service, the shift lead asks what the turnover must include. CRAC-05 is still carrying the extra load, and the NOC is monitoring the aisle.',
      systemReadout: [
        'Fault correction: COMPLETE / AWAITING RETURN',
        'CRAC-05: SUPPORTING AISLE 04',
        'NOC monitoring: ACTIVE',
        'Return to service: PENDING',
      ],
      diagramState: 'restore',
      prompt: 'What makes the return to service trustworthy?',
      options: [
        {
          id: 'controlled-turnover',
          label: 'Confirm the approved return sequence, active monitoring, expected normal readings, back-out criteria, and clear NOC/shift-lead communication before and after the restart.',
          consequence:
            'CRAC-04 returns with normal fan tach and airflow. The team trends temperatures and equipment status to stable normal conditions, then restores standby configuration only after acceptance criteria are met.',
          mentor:
            '“Exactly. A successful start is not the same as a successful restoration. We verify the system, the room, the alarms, the records, and the backup position.”',
          impacts: { procedureDiscipline: 3, uptimeJudgment: 3, communication: 2, coolingFundamentals: 1 },
          nextId: 'debrief',
        },
        {
          id: 'restart-and-leave',
          label: 'Restart CRAC-04, see the fan spin, and immediately return CRAC-05 to standby.',
          consequence:
            'The equipment appears to recover, but the team has not confirmed trend stability, alarm health, or a safe back-out state. The shift lead keeps CRAC-05 online until the return criteria are met.',
          mentor:
            '“One green indicator does not close an incident. Watch the system do its work before you take away the safety net.”',
          impacts: { uptimeJudgment: -2, procedureDiscipline: -2, coolingFundamentals: -1 },
          nextId: 'recovery-turnover',
        },
        {
          id: 'close-ticket-early',
          label: 'Close the event ticket once the technician reports the replacement complete.',
          consequence:
            'The ticket would lose the evidence needed for verification and the next shift. The NOC keeps it open pending operational acceptance.',
          mentor:
            '“Maintenance complete and operations accepted are two different checkpoints. Documentation is part of the plant, too.”',
          impacts: { communication: -1, procedureDiscipline: -2 },
          nextId: 'recovery-turnover',
        },
      ],
    },
    'recovery-turnover': {
      id: 'recovery-turnover',
      kind: 'decision',
      phase: 'Recovery · Verify, then release',
      title: 'The return is not complete until the system proves it.',
      situation:
        'The shift lead preserves the extra cooling capacity and keeps the event open. The room is stable, so you have time to complete the return to service deliberately.',
      systemReadout: [
        'CRAC-04 Fan 2: RUNNING',
        'Aisle 04 inlet: DECLINING',
        'Event ticket: OPEN / AWAITING ACCEPTANCE',
      ],
      diagramState: 'restore',
      prompt: 'What closes the loop?',
      options: [
        {
          id: 'verify-and-document',
          label: 'Use the approved return sequence, trend expected readings and alarms, confirm the back-out path, communicate acceptance, then document the final state before restoring standby configuration.',
          consequence:
            'The facility returns to normal operation with the event record complete and resilience restored only after the system proves stable.',
          mentor:
            '“Now it is finished. The quiet, methodical closeout is what makes the fast response safe.”',
          impacts: { procedureDiscipline: 2, uptimeJudgment: 2, communication: 2 },
          nextId: 'debrief',
        },
      ],
    },
    debrief: {
      id: 'debrief',
      kind: 'debrief',
      phase: '05 · Debrief',
      title: 'You protected the thermal envelope—and the process that protects it.',
      systemReadout: [
        'Aisle 04 inlet: 23.4°C · STABLE',
        'CRAC-04: NORMAL AIRFLOW',
        'CRAC-05: RESTORED TO STANDBY',
        'N+1 cooling posture: RESTORED',
      ],
      diagramState: 'restore',
      masterMove:
        'A master did not “fix a CRAC alarm.” They recognized a developing thermal event, made the condition visible, used designed redundancy through approved control, preserved fault evidence, respected qualification boundaries, and verified the return to service before releasing the safety net.',
      lesson:
        'AI-density halls can move from a localized airflow defect to a thermal-risk event quickly. The winning sequence is shared awareness → controlled stabilization → qualified diagnosis → verified restoration. Every step protects both uptime and the people doing the work.',
      principle:
        'Stabilize first. Diagnose with boundaries. Restore with proof.',
      guardrail:
        'This is a simulated judgment exercise, not operating instruction. Real critical-facilities work requires site-specific procedures, proper authorization, qualified personnel, applicable codes, and verified safety controls.',
    },
  },
  startNodeId: 'first-move',
} satisfies Scenario
