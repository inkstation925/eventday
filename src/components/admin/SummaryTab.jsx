import { T, btnP } from "../../utils/colors.js"
import { exportXLS, exportPDF } from "../../utils/export.js"

export function SummaryTab({ bookings, slots, donations, event, donationConfig, fieldsConfig, accentColor }) {
  const fc = { sessionLabel:"Atendimento", ...fieldsConfig }
  const dc = { enabled:false, itemNamePlural:"itens", ...donationConfig }
  const sinalValor = fieldsConfig?.sinalValor || 50

  const done      = bookings.filter(b=>b.status==="done")
  const confirmed = bookings.filter(b=>b.status==="confirmed"||b.status==="done")
  const totalSinais  = confirmed.length * sinalValor
  const totalSessoes = done.reduce((a,b)=>a+Number(b.sessao?.valorCobrado||0),0)
  const totalDuracao = done.reduce((a,b)=>a+Number(b.sessao?.duracao||0),0)
  const totalItens   = donations.reduce((a,d)=>a+Number(d.quantidade||0),0)

  const cards = [
    { label:"Sinais",                     value:`R$ ${totalSinais.toFixed(2)}`,  color:T.accent },
    { label:`${fc.sessionLabel}s`,        value:`R$ ${totalSessoes.toFixed(2)}`, color:T.green },
    { label:"Total geral",                value:`R$ ${(totalSinais+totalSessoes).toFixed(2)}`, color:"#60a5fa" },
    { label:`${fc.sessionLabel}s realizados`, value:done.length,                 color:T.textMuted },
    { label:"Confirmados",                value:confirmed.length,                color:T.amber },
    { label:"Duracao total",              value:`${totalDuracao} min`,           color:T.textMuted },
  ]

  return (
    <div style={{ padding:"20px 16px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <button onClick={()=>exportXLS(bookings,slots,donations,event,donationConfig,fieldsConfig,sinalValor)}
          style={{ ...btnP(), flex:1, background:T.surface3, color:T.text }}>
          Exportar Excel (.xls)
        </button>
        <button onClick={()=>exportPDF(bookings,slots,donations,event,donationConfig,fieldsConfig,sinalValor,accentColor)}
          style={{ ...btnP(), flex:1 }}>
          Exportar PDF
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"16px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:c.color, lineHeight:1 }}>{c.value}</div>
            <div style={{ fontSize:10, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {dc.enabled && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ fontSize:12, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>
            {dc.itemNamePlural}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:T.text }}>Total recebido</span>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"#f97316" }}>{totalItens}</span>
          </div>
        </div>
      )}

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"18px 20px" }}>
        <div style={{ fontSize:12, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>
          Resumo financeiro
        </div>
        {[
          [`Sinais (${confirmed.length}x R$ ${sinalValor})`, `R$ ${totalSinais.toFixed(2)}`],
          [`${fc.sessionLabel}s encerrados`, `R$ ${totalSessoes.toFixed(2)}`],
          ["Total geral", `R$ ${(totalSinais+totalSessoes).toFixed(2)}`],
        ].map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:13, color:T.textMuted }}>{k}</span>
            <span style={{ fontSize:13, color:T.text, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
