import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, ArrowLeftRight, Copy, Crown, Dices, RotateCcw, Scale, Shield, Swords, Users } from 'lucide-react'
import './styles.css'

const initialPlayers = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  name: `Player ${String(i + 1).padStart(2, '0')}`,
  level: 3,
}))

function bestTeams(players, captainA, captainB) {
  const remaining = players.filter(p => p.id !== captainA && p.id !== captainB)
  let best = null
  const combinations = []
  function choose(start, chosen) {
    if (chosen.length === 4) {
      combinations.push(chosen)
      return
    }
    for (let i = start; i <= remaining.length - (4 - chosen.length); i++) {
      choose(i + 1, [...chosen, remaining[i]])
    }
  }
  choose(0, [])
  for (const groupA of combinations) {
    const ids = new Set(groupA.map(p => p.id))
    const teamA = [players.find(p => p.id === captainA), ...groupA]
    const teamB = [players.find(p => p.id === captainB), ...remaining.filter(p => !ids.has(p.id))]
    const sumA = teamA.reduce((s, p) => s + p.level, 0)
    const sumB = teamB.reduce((s, p) => s + p.level, 0)
    const diff = Math.abs(sumA - sumB)
    if (!best || diff < best.diff) best = { teamA, teamB, sumA, sumB, diff }
  }
  return best
}

function App() {
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('vtb-players')
      return saved ? JSON.parse(saved) : initialPlayers
    } catch { return initialPlayers }
  })
  const [captainA, setCaptainA] = useState(() => localStorage.getItem('vtb-cap-a') || '1')
  const [captainB, setCaptainB] = useState(() => localStorage.getItem('vtb-cap-b') || '2')
  const [result, setResult] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => localStorage.setItem('vtb-players', JSON.stringify(players)), [players])
  useEffect(() => localStorage.setItem('vtb-cap-a', captainA), [captainA])
  useEffect(() => localStorage.setItem('vtb-cap-b', captainB), [captainB])

  const updatePlayer = (id, field, value) => {
    setPlayers(old => old.map(p => p.id === id ? { ...p, [field]: value } : p))
    setResult(null)
  }

  const generate = () => {
    if (captainA === captainB) {
      setNotice('Escolha dois capitães diferentes.')
      return
    }
    if (players.some(p => !p.name.trim())) {
      setNotice('Preencha o nickname dos 10 jogadores.')
      return
    }
    setResult(bestTeams(players, captainA, captainB))
    setNotice('')
  }

  const reset = () => {
    setPlayers(initialPlayers)
    setCaptainA('1')
    setCaptainB('2')
    setResult(null)
    setNotice('Lista restaurada para os jogadores de exemplo.')
  }

  const copyResult = async () => {
    if (!result) return
    const text = [
      'VALORANT CUSTOMS — TEAM BALANCER',
      '',
      `TIME A | Média: ${(result.sumA / 5).toFixed(2)}`,
      ...result.teamA.map(p => `${p.name} — Nível ${p.level}${p.id === captainA ? ' (CAPITÃO)' : ''}`),
      '',
      `TIME B | Média: ${(result.sumB / 5).toFixed(2)}`,
      ...result.teamB.map(p => `${p.name} — Nível ${p.level}${p.id === captainB ? ' (CAPITÃO)' : ''}`),
      '',
      `Diferença entre médias: ${(result.diff / 5).toFixed(2)}`
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setNotice('Resultado copiado!')
    } catch {
      setNotice('Não foi possível copiar automaticamente neste navegador.')
    }
  }

  const status = result?.diff === 0 ? 'Equilíbrio perfeito' : result?.diff <= 2 ? 'Equipes próximas' : 'Menor diferença encontrada'

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Valorant Team Balancer">
          <span className="brand-mark">V</span>
          <span><strong>TEAM BALANCER</strong><small>VALORANT CUSTOMS</small></span>
        </a>
        <span className="live-pill"><i /> SISTEMA 5V5</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CUSTOM MATCH • 10 JOGADORES</p>
          <h1>Monte times.<br /><em>Equilibre a partida.</em></h1>
          <p className="hero-sub">Classifique os jogadores, escolha os capitães e deixe o algoritmo encontrar a divisão mais equilibrada.</p>
        </div>
        <div className="hero-icon"><Swords size={76} strokeWidth={1.2} /></div>
      </section>

      <section className="content-grid">
        <div className="panel roster-panel">
          <div className="section-heading">
            <div><span className="step">01 / ELENCO</span><h2><Users size={19} /> Jogadores</h2></div>
            <span className="counter">10 / 10</span>
          </div>
          <p className="muted">Digite os nicknames e atribua um nível de habilidade de 1 a 5.</p>
          <div className="level-guide">
            {[['1','INICIANTE'],['2','BÁSICO'],['3','MÉDIO'],['4','AVANÇADO'],['5','ELITE']].map(([n,label]) =>
              <div className={`level-chip level-${n}`} key={n}><b>{n}</b><small>{label}</small></div>
            )}
          </div>
          <div className="player-list">
            {players.map((p, i) => (
              <div className="player-row" key={p.id}>
                <span className="player-index">{String(i + 1).padStart(2, '0')}</span>
                <input aria-label={`Nickname do jogador ${i + 1}`} value={p.name} onChange={e => updatePlayer(p.id, 'name', e.target.value)} />
                <select aria-label={`Nível do jogador ${i + 1}`} value={p.level} onChange={e => updatePlayer(p.id, 'level', Number(e.target.value))}>
                  {[1,2,3,4,5].map(n => <option value={n} key={n}>Nível {n}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button className="text-button" onClick={reset}><RotateCcw size={14} /> Restaurar jogadores de exemplo</button>
        </div>

        <aside className="side-column">
          <div className="panel captain-panel">
            <div className="section-heading">
              <div><span className="step">02 / LIDERANÇA</span><h2><Crown size={19} /> Capitães</h2></div>
            </div>
            <p className="muted">Os capitães ficam fixos nas equipes escolhidas.</p>
            <label className="captain-label red-label">TIME A — CAPITÃO</label>
            <select className="captain-select red-select" value={captainA} onChange={e => {setCaptainA(e.target.value);setResult(null)}}>{players.map(p => <option key={p.id} value={p.id}>{p.name || `Jogador ${p.id}`} · N{p.level}</option>)}</select>
            <label className="captain-label blue-label">TIME B — CAPITÃO</label>
            <select className="captain-select blue-select" value={captainB} onChange={e => {setCaptainB(e.target.value);setResult(null)}}>{players.map(p => <option key={p.id} value={p.id}>{p.name || `Jogador ${p.id}`} · N{p.level}</option>)}</select>
            <button className="generate-button" onClick={generate}><Scale size={18} /> BALANCEAR EQUIPES <ArrowLeftRight size={17} /></button>
            {notice && <p className="notice" role="status">{notice}</p>}
            <p className="algorithm-note"><Activity size={14} /> O algoritmo avalia as 70 combinações possíveis dos oito jogadores restantes.</p>
          </div>

          <div className="panel info-panel">
            <span className="step">COMO FUNCIONA</span>
            <div className="info-line"><span>01</span><p>Capitães definidos manualmente</p></div>
            <div className="info-line"><span>02</span><p>70 combinações analisadas</p></div>
            <div className="info-line"><span>03</span><p>Menor diferença entre as médias</p></div>
          </div>
        </aside>
      </section>

      {result && <section className="results panel">
        <div className="section-heading result-heading">
          <div><span className="step">03 / RESULTADO</span><h2><Shield size={19} /> Times balanceados</h2></div>
          <span className="result-status">{status}</span>
        </div>
        <div className="metrics">
          <div className="metric metric-red"><small>MÉDIA TIME A</small><strong>{(result.sumA / 5).toFixed(2)}</strong><span>{result.sumA} pontos totais</span></div>
          <div className="difference"><small>DIFERENÇA</small><strong>{(result.diff / 5).toFixed(2)}</strong><span>entre as médias</span></div>
          <div className="metric metric-blue"><small>MÉDIA TIME B</small><strong>{(result.sumB / 5).toFixed(2)}</strong><span>{result.sumB} pontos totais</span></div>
        </div>
        <div className="teams">
          <Team title="TIME A" team={result.teamA} captain={captainA} color="red" />
          <Team title="TIME B" team={result.teamB} captain={captainB} color="blue" />
        </div>
        <button className="copy-button" onClick={copyResult}><Copy size={16} /> COPIAR TIMES PARA COMPARTILHAR</button>
      </section>}

      <footer><span>VALORANT TEAM BALANCER</span><span>Feito para suas customs • 5v5</span></footer>
    </main>
  )
}

function Team({ title, team, captain, color }) {
  return <div className={`team-card ${color}`}>
    <h3>{title}</h3>
    {team.map(p => <div className="team-player" key={p.id}>
      <span className="team-player-name">{p.name}{p.id === captain && <small><Crown size={11} /> CAPITÃO</small>}</span>
      <b>N{p.level}</b>
    </div>)}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
