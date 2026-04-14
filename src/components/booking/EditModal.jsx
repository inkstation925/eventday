import { useState } from "react"
import { T, btnP, inp, lbl } from "../../utils/colors.js"
import { Overlay } from "../ui/Overlay.jsx"
import { BChip } from "../ui/Chips.jsx"

const STATUS_LABELS = { pending:"Aguardando sinal", confirmed:"Confirmado", done:"Realizado", cancelled:"Cancelado" }

export function EditModal({ booking, slots, onSave, onClose, onRequestCancel, fieldsConfig }) {
  const fc = { bodyPartEnabled:false, bodyPartLabel:"Informacao adicional", bodyPartPlaceholder:"", ...fieldsConfig }
  const slot = slots.find(s => s.id === booking.slotId)

  const [form, setForm] = useState({
    name: booking.name||"", phone: booking.phone||"",
    dob: booking.dob||"", bodyPart: booking.bodyPart||"",
    notes: booking.notes||"", status: booking.status||"pending",
  })

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const save = () => onSave(booking.id, {
    name: form.name, phone: form.phone,
    dob: form.dob||null, body_part: form.bodyPart||null,
    notes: form.notes||null, status: form.status,
  })

  return (
    <Overlay onClose={onClose}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
        <div>
          <div style={{ fontSize:10, color:T.accent, letterSpacing:"0.18em", marginBottom:4, textTransform:"uppercase" }}>Editar agendamento</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28 }}>{booking.name}</div>
          {slot && <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>Hora: {slot.time}</div>}
        </div>
        <BChip status={booking.status} />
      </div>

      {[
        { k:"name",  label:"Nome",              type:"text" },
        { k:"phone", label:"Telefone",           type:"tel"  },
        { k:"dob",   label:"Data de nascimento", type:"date" },
      ].map(f => (
        <div key={f.k} style={{ marginBottom:12 }}>
          <label style={lbl}>{f.label}</label>
          <input type={f.type} value={form[f.k]||""} onChange={e=>set(f.k,e.target.value)} style={inp} />
        </div>
      ))}

      {fc.bodyPartEnabled && (
        <div style={{ marginBottom:12 }}>
          <label style={lbl}>{fc.bodyPartLabel}</label>
          <input type="text" placeholder={fc.bodyPartPlaceholder} value={form.bodyPart}
            onChange={e=>set("bodyPart",e.target.value)} style={inp} />
        </div>
      )}

      <div style={{ marginBottom:12 }}>
        <label style={lbl}>Status</label>
        <select value={form.status} onChange={e=>set("status",e.target.value)} style={inp}>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={lbl}>Observacoes</label>
        <textarea value={form.notes} onChange={e=>set("notes",e.target.value)}
          style={{ ...inp, height:72, resize:"vertical" }} />
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:12 }}>
        <button onClick={onClose} style={{ ...btnP(), background:T.surface3, color:T.text, flex:1 }}>Cancelar</button>
        <button onClick={save}    style={{ ...btnP(), flex:2 }}>Salvar</button>
      </div>
      {booking.status !== "cancelled" && (
        <button onClick={onRequestCancel} style={{ ...btnP(), width:"100%", background:T.redDim, color:T.red }}>
          Cancelar agendamento
        </button>
      )}
    </Overlay>
  )
}
