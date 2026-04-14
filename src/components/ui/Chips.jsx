import { T } from "../../utils/colors.js"

export function Chip({ status }) {
  const cfg = {
    available: { label:"Disponivel",  bg:T.greenDim, clr:T.green },
    last:      { label:"Ultima vaga", bg:T.amberDim, clr:T.amber },
    full:      { label:"Lotado",      bg:T.redDim,   clr:T.red   },
    blocked:   { label:"Bloqueado",   bg:T.grayDim,  clr:T.gray  },
  }[status] || {}
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:cfg.bg, color:cfg.clr, borderRadius:100,
      padding:"3px 10px", fontSize:11, fontWeight:600, letterSpacing:"0.04em",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.clr }} />
      {cfg.label}
    </span>
  )
}

const STATUS_LABELS = {
  pending: "Aguardando sinal",
  confirmed: "Confirmado",
  done: "Realizado",
  cancelled: "Cancelado",
}

export function BChip({ status }) {
  const cfg = {
    pending:   { bg:"#1c1400", clr:T.amber },
    confirmed: { bg:"#0d2618", clr:T.green },
    done:      { bg:"#0d1826", clr:"#60a5fa" },
    cancelled: { bg:"#200c0c", clr:T.red },
  }[status] || {}
  return (
    <span style={{
      background:cfg.bg, color:cfg.clr, borderRadius:100,
      padding:"2px 9px", fontSize:11, fontWeight:600,
    }}>
      {STATUS_LABELS[status]||status}
    </span>
  )
}
