import { useState } from "react"
import { T, btnP, inp, lbl } from "../../utils/colors.js"
import { Overlay } from "../ui/Overlay.jsx"
import { QRCodeCanvas } from "../ui/QRCode.jsx"
import { genPixPayload } from "../../utils/pix.js"
import { genCalendarUrl } from "../../utils/calendar.js"

const maxDob = new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]

function maskPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ""
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

export function BookModal({ slot, event, onBook, onClose, pixConfig, donationConfig, fieldsConfig, isSubmitting }) {
  const fc = { bodyPartEnabled:false, bodyPartLabel:"Informacao adicional", bodyPartPlaceholder:"", field1Enabled:false, sessionLabel:"Atendimento", sinalValor:50, ...fieldsConfig }
  const dc = { enabled:false, itemName:"item", itemNamePlural:"itens", tiers:[], ...donationConfig }

  const [form, setForm] = useState({ name:"", phone:"", dob:"", bodyPart:"", quantidade:0, notes:"" })
  const [step, setStep] = useState("form")
  const [booking, setBooking] = useState(null)
  const [err, setErr] = useState("")

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const validate = () => {
    if (!form.name.trim()) return "Nome obrigatorio."
    const digits = form.phone.replace(/\D/g, "")
    if (digits.length < 10) return "Informe um telefone completo com DDD."
    if (form.dob && form.dob > maxDob) return "E preciso ter 18 anos ou mais."
    return ""
  }

  const submit = async () => {
    const e = validate()
    if (e) { setErr(e); return }
    setErr("")
    const { error, booking: b } = await onBook(form, slot.id, fc.sinalValor)
    if (error) { setErr("Erro ao agendar. Tente novamente."); return }
    setBooking(b)
    setStep("confirm")
  }

  const pixPayload = booking?.id
    ? genPixPayload(pixConfig, fc.sinalValor, booking.id)
    : genPixPayload(pixConfig, fc.sinalValor)
  const calUrl = booking ? genCalendarUrl(event, slot.time, form.name, form.bodyPart, fc.bodyPartLabel) : null

  return (
    <Overlay onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:10, color:T.accent, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:2 }}>
            {step==="form" ? "Agendar horario" : "Agendamento feito!"}
          </div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:"0.04em" }}>
            {event.name} — {slot.time}
          </div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:22, padding:4 }}>×</button>
      </div>

      {step === "form" && (
        <>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Nome completo *</label>
            <input type="text" placeholder="Seu nome" value={form.name}
              onChange={e=>{ set("name",e.target.value); setErr("") }} style={inp} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>WhatsApp *</label>
            <input type="tel" placeholder="(11) 99999-9999" value={form.phone}
              onChange={e=>{ set("phone", maskPhone(e.target.value)); setErr("") }}
              style={inp} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Data de nascimento</label>
            <input type="date" value={form.dob} max={maxDob}
              onChange={e=>set("dob",e.target.value)} style={inp} />
          </div>
          {fc.bodyPartEnabled && (
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>{fc.bodyPartLabel}</label>
              <input type="text" placeholder={fc.bodyPartPlaceholder||"Detalhes..."} value={form.bodyPart}
                onChange={e=>set("bodyPart",e.target.value)} style={inp} />
            </div>
          )}
          {dc.enabled && dc.tiers?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>{dc.itemNamePlural}</label>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(dc.tiers.length+1,3)},1fr)`, gap:8 }}>
                {[{qty:0,benefit:""},...dc.tiers].map(opt => (
                  <button key={opt.qty} type="button" onClick={()=>set("quantidade",opt.qty)} style={{
                    background:form.quantidade===opt.qty?T.accentDim:T.surface3,
                    border:`1px solid ${form.quantidade===opt.qty?T.accent:T.border2}`,
                    borderRadius:8, padding:"10px 8px", cursor:"pointer", textAlign:"center", fontFamily:"'DM Sans',sans-serif",
                  }}>
                    <div style={{ fontSize:13, fontWeight:600, color:form.quantidade===opt.qty?T.accent:T.text }}>
                      {opt.qty===0 ? "Nenhum" : `${opt.qty} ${opt.qty===1?dc.itemName:dc.itemNamePlural}`}
                    </div>
                    {opt.benefit && <div style={{ fontSize:10, color:form.quantidade===opt.qty?T.accent:T.textDim, marginTop:3 }}>{opt.benefit}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Observacoes</label>
            <textarea placeholder="Algum detalhe importante?" value={form.notes}
              onChange={e=>set("notes",e.target.value)}
              style={{ ...inp, height:64, resize:"vertical" }} />
          </div>
          {err && <div style={{ fontSize:12, color:T.red, marginBottom:12 }}>{err}</div>}
          <button onClick={submit} disabled={isSubmitting} style={{ ...btnP(), width:"100%", opacity:isSubmitting?0.7:1 }}>
            {isSubmitting ? "Agendando..." : "Confirmar agendamento"}
          </button>
        </>
      )}

      {step === "confirm" && (
        <>
          <div style={{ background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:10, padding:"14px 16px", marginBottom:20, fontSize:13, color:T.accent, lineHeight:1.6 }}>
            Agendamento registrado! Para confirmar, pague o sinal de{" "}
            <strong>R$ {fc.sinalValor}</strong> via PIX abaixo.
          </div>
          {pixPayload && (
            <>
              <div style={{ fontSize:11, color:T.textMuted, textAlign:"center", marginBottom:4 }}>
                Escaneie o QR Code ou copie a chave
              </div>
              <QRCodeCanvas text={pixPayload} size={180} />
              <button onClick={()=>{ navigator.clipboard?.writeText(pixPayload); }} style={{ ...btnP(), width:"100%", marginBottom:16, background:T.surface3, color:T.text }}>
                Copiar codigo PIX
              </button>
            </>
          )}
          {calUrl && (
            <a href={calUrl} target="_blank" rel="noopener noreferrer" style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              background:"#0d1a2e", border:`1px solid #3b82f680`, borderRadius:10,
              padding:"14px 18px", color:"#60a5fa", fontSize:14, fontWeight:600,
              textDecoration:"none", marginBottom:16,
            }}>
              <span style={{ fontSize:20 }}>📅</span>
              <div>
                <div>Salvar na agenda</div>
                <div style={{ fontSize:11, fontWeight:400, color:"#93c5fd", marginTop:2 }}>Adicionar ao Google Calendar</div>
              </div>
              <span style={{ marginLeft:"auto", fontSize:16, opacity:0.7 }}>↗</span>
            </a>
          )}
          <button onClick={onClose} style={{ ...btnP(), width:"100%" }}>Entendido!</button>
        </>
      )}
    </Overlay>
  )
}
