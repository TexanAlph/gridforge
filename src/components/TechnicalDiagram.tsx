import type { DiagramKind, DiagramState } from '../data/types'

type TechnicalDiagramProps = {
  kind: DiagramKind
  state: DiagramState
}

const stateLabel: Record<DiagramState, string> = {
  alarm: 'Condition detected',
  stabilize: 'Capacity stabilizing',
  isolate: 'Controlled boundary',
  restore: 'Verified restoration',
}

function FlowDot({ className = '' }: { className?: string }) {
  return <circle className={`flow-dot ${className}`} cx="0" cy="0" r="4" />
}

function CoolingLoop({ liquid = false }: { liquid?: boolean }) {
  return (
    <svg viewBox="0 0 520 260" aria-hidden="true">
      <defs>
        <linearGradient id="pipe" x1="0" x2="1">
          <stop stopColor="#70dcff" />
          <stop offset="1" stopColor="#2a9ccb" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect className="diagram-panel" x="16" y="24" width="112" height="190" rx="12" />
      <text className="diagram-label" x="72" y="70" textAnchor="middle">{liquid ? 'CDU' : 'CRAC-04'}</text>
      <rect className="diagram-display" x="38" y="88" width="68" height="34" rx="6" />
      <text className="diagram-readout" x="72" y="110" textAnchor="middle">{liquid ? 'FLOW' : 'AIRFLOW'}</text>
      <path className="diagram-coil" d="M42 151h58M42 163h58M42 175h58" />
      <path className="diagram-pipe pipe-active" d="M128 83 H220 V54 H414" />
      <path className="diagram-pipe pipe-return" d="M414 186 H220 V155 H128" />
      <path className="diagram-pipe pipe-muted" d="M128 130 H184" />
      <g className="diagram-pump"><circle cx="184" cy="130" r="18" /><path d="M174 130h20M184 120v20" /></g>
      <rect className="diagram-rack" x="414" y="38" width="82" height="165" rx="10" />
      {[0, 1, 2, 3].map((index) => <rect className="diagram-server" key={index} x="428" y={55 + index * 32} width="54" height="17" rx="3" />)}
      <text className="diagram-label" x="455" y="190" textAnchor="middle">GPU RACKS</text>
      <g filter="url(#glow)"><FlowDot className="flow-forward" /><FlowDot className="flow-return" /></g>
      <text className="diagram-small-label" x="256" y="45">SUPPLY {liquid ? 'LOOP' : 'AIR'}</text>
      <text className="diagram-small-label" x="264" y="205">RETURN {liquid ? 'LOOP' : 'AIR'}</text>
    </svg>
  )
}

function PowerPath({ ups = false, generator = false, busway = false }: { ups?: boolean; generator?: boolean; busway?: boolean }) {
  const source = generator ? 'GEN' : 'UTILITY'
  const middle = ups ? 'UPS' : busway ? 'BUSWAY' : 'SWITCHGEAR'
  return (
    <svg viewBox="0 0 520 260" aria-hidden="true">
      <defs>
        <filter id="power-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path className="power-line" d="M68 130 H452" />
      {[68, 192, 326, 452].map((x, index) => <circle className={index === 1 && busway ? 'power-node is-alert' : 'power-node'} key={x} cx={x} cy="130" r="25" />)}
      <text className="diagram-label" x="68" y="135" textAnchor="middle">{source}</text>
      <text className="diagram-label" x="192" y="135" textAnchor="middle">{middle}</text>
      <text className="diagram-label" x="326" y="135" textAnchor="middle">PDU</text>
      <text className="diagram-label" x="452" y="135" textAnchor="middle">RACK</text>
      <path className="power-line-secondary" d="M192 184 H326" />
      <text className="diagram-small-label" x="258" y="210" textAnchor="middle">REDUNDANT PATH</text>
      {generator && <><path className="generator-wave" d="M44 90c10-18 20 18 30 0s20 18 30 0" /><text className="diagram-small-label" x="68" y="58" textAnchor="middle">READY SOURCE</text></>}
      {ups && <><rect className="ups-battery" x="164" y="165" width="56" height="22" rx="4" /><path className="battery-mark" d="M224 171v10M228 174v4" /><text className="diagram-small-label" x="192" y="208" textAnchor="middle">ENERGY STORE</text></>}
      <g filter="url(#power-glow)"><circle className="power-pulse" cx="0" cy="0" r="5" /></g>
    </svg>
  )
}

function Containment() {
  return (
    <svg viewBox="0 0 520 260" aria-hidden="true">
      <path className="containment-wall" d="M84 40v180M436 40v180" />
      <path className="containment-roof" d="M84 40H436" />
      <path className="air-path air-cold" d="M104 184H395Q422 184 422 156V95" />
      <path className="air-path air-hot" d="M98 77H390Q414 77 414 101v38" />
      {[0, 1, 2, 3].map((index) => <rect className="containment-rack" key={index} x={146 + index * 60} y="102" width="42" height="92" rx="5" />)}
      <rect className="containment-door" x="401" y="88" width="26" height="104" rx="4" />
      <text className="diagram-small-label" x="126" y="71">HOT RETURN</text>
      <text className="diagram-small-label" x="124" y="211">COLD SUPPLY</text>
      <text className="diagram-label" x="260" y="152" textAnchor="middle">CONTAINED AISLE</text>
      <circle className="air-dot air-dot-cold" cx="0" cy="0" r="4" />
      <circle className="air-dot air-dot-hot" cx="0" cy="0" r="4" />
    </svg>
  )
}

export function TechnicalDiagram({ kind, state }: TechnicalDiagramProps) {
  const diagram = kind === 'cooling-loop'
    ? <CoolingLoop />
    : kind === 'liquid-loop'
      ? <CoolingLoop liquid />
      : kind === 'containment'
        ? <Containment />
        : <PowerPath ups={kind === 'ups-chain'} generator={kind === 'generator'} busway={kind === 'busway'} />

  return (
    <section className={`technical-diagram state-${state}`}>
      <div className="diagram-topline">
        <span>LIVE SYSTEM MAP</span>
        <span className="diagram-state"><i />{stateLabel[state]}</span>
      </div>
      {diagram}
      <div className="diagram-legend"><span><i className="legend-dot is-flow" />Active path</span><span><i className="legend-dot is-muted" />Standby / boundary</span></div>
    </section>
  )
}
