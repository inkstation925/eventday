import { useState } from "react"
import { T, btnP, inp, lbl } from "../../utils/colors.js"
import { Overlay } from "../ui/Overlay.jsx"

export function SessionModal({ booking, slots, onSave, onClose, isEdit, donationConfig, fieldsConfig }) {
  const fc = { field1Enabled:false, field1Label:"Campo extra 1", field1Placeholder:"", field2Enabled:false, field2Label:"Campo extra 2", field2Placeholder:"", sessionLabel:"Atendimento", bodyPartEnabled:false, bodyPartLabel:"Info", ...fieldsConfig }
  const dc = { enabled:false, itemName:"item", itemNamePlural:"itens", tiers:[], ...donationConfig }
  const slot = slots.find(s => s.id === booking.slotId)

  const [form, setForm] = useState({
    valorCobrado: booking.sessao?.valorCobrado||"",
    duracao:      booking.sessao?.duracao||"",
    field1:       booking.sessao?.field1||"",
    field2:       booking.sessao?.field2||"",
    itensRecebidos: booking.sessao?.itensRecebidos||0,
    obs:          booking.sessao?.obs||"",
  })

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const save = () => onSave(booking.id, form)

  const tier = dc.enabled && Number(form.itensRecebidos) > 0
    ? [...(dc.tiers||[])].reverse().find(t => t.qty <= Number(form.itensRecebidos))
    : null

  const promisedTier = dc.enabled && booking.quantidade > 0
    ? [...(dc.tiers||[])].reverse().find(t => t.qty <= booking.quantidade)
    : null

  return (
    <Overlay onClose={onClose}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, color:"#60a5fa", letterSpacing:"0.18em", marginBottom:4, textTransform:"uppercase" }}>
          {isEdit ? `Editar ${fc.sessionLabel}` : `Concluir ${fc.sessionLabel}`}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.04em", lineHeight:1 }}>{booking.name}</div>
        <div style={{ fontSize:12, color:T.textMuted, marginTop:4, display:"flex", gap:12 }}>
          {slot && <span>Horario: {slot.time}</span>}
          {fc.bodyPartEnabled && booking.bodyPart && <span>{fc.bodyPartLabel}: {booking.bodyPart}</span>}
        </div>
      </div>

      {dc.enabled && booking.quantidade > 0 && (
        <div style={{ background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:12, color:T.accent }}>
          Cliente prometeu trazer <strong>{booking.quantidade} {booking.quantidade===1?dc.itemName:dc.itemNamePlural}</strong>
          {promisedTier ? ` — beneficio: ${promisedTier.benefit}` : ""}
        </div>
      )}

      {dc.enabled && (
        <div style={{ background:T.surface3, borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
          <div style={{ fontSize:10, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>
            {dc.itemNamePlural} recebidos
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>Quantidade</label>
              <input type="number" min="0" value={form.itensRecebidos}
                onChange={e=>set("itensRecebidos",e.target.value)}
                onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
                style={{ ...inp, textAlign:"right" }} />
            </div>
            {tier && (
              <div style={{ display:"flex", alignItems:"flex-end" }}>
                <div style={{ background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:8, padding:"10px 12px", fontSize:12, color:T.accent, width:"100%", boxSizing:"border-box" }}>
                  Beneficio: {tier.benefit}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ background:T.surface3, borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
        <div style={{ fontSize:10, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>Financeiro</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={lbl}>Valor cobrado (R$)</label>
            <input type="number" placeholder="0,00" value={form.valorCobrado}
              onChange={e=>set("valorCobrado",e.target.value)}
              onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
              style={{ ...inp, textAlign:"right" }} />
          </div>
          <div>
            <label style={lbl}>Duracao (min)</label>
            <input type="number" placeholder="60" value={form.duracao}
              onChange={e=>set("duracao",e.target.value)}
              onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
              style={{ ...inp, textAlign:"right" }} />
          </div>
        </div>
      </div>

      {(fc.field1Enabled || fc.field2Enabled) && (
        <div style={{ background:T.surface3, borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
          <div style={{ fontSize:10, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>Informacoes adicionais</div>
          {fc.field1Enabled && (
            <div style={{ marginBottom:fc.field2Enabled?14:4 }}>
              <label style={lbl}>{fc.field1Label}</label>
              <input type="text" placeholder={fc.field1Placeholder} value={form.field1}
                onChange={e=>set("field1",e.target.value)} style={inp} />
            </div>
          )}
          {fc.field2Enabled && (
            <div style={{ marginBottom:4 }}>
              <label style={lbl}>{fc.field2Label}</label>
              <input type="text" placeholder={fc.field2Placeholder} value={form.field2}
                onChange={e=>set("field2",e.target.value)} style={inp} />
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom:22 }}>
        <label style={lbl}>Observacoes do {fc.sessionLabel.toLowerCase()}</label>
        <textarea placeholder="Como foi, retoque necessario, etc..." value={form.obs}
          onChange={e=>set("obs",e.target.value)}
          style={{ ...inp, height:72, resize:"vertical" }} />
      </div>

      {!isEdit && (
        <div style={{ background:"#0a1a2e", border:"1px solid #60a5fa30", borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#93c5fd", lineHeight:1.6 }}>
          O agendamento sera marcado como <strong>Realizado</strong> ao salvar.
        </div>
      )}

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={{ ...btnP(), background:T.surface3, color:T.text, flex:1 }}>Cancelar</button>
        <button onClick={save}    style={{ ...btnP(), flex:2 }}>
          {isEdit ? "Salvar alteracoes" : `Concluir ${fc.sessionLabel}`}
        </button>
      </div>
    </Overlay>
  )
}
