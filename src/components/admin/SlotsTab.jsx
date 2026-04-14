import { T, btnP } from "../../utils/colors.js"
import { getSlotStatus } from "../../utils/slots.js"
import { Chip } from "../ui/Chips.jsx"

export function SlotsTab({ slots, bookings, event, onToggleBlocked, onRegenerate }) {
  const cap = event?.capacity || 3
  return (
    <div style={{ padding:"20px 16px" }}>
      <button onClick={onRegenerate} style={{ ...btnP(), width:"100%", marginBottom:20, background:T.surface3, color:T.text }}>
        Regenerar slots (baseado nas configs do evento)
      </button>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
        {slots.map(slot => {
          const status = getSlotStatus(slot, bookings, cap)
          const count  = bookings.filter(b=>b.slotId===slot.id&&b.status!=="cancelled").length
          return (
            <div key={slot.id} style={{
              background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px",
            }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:"0.04em", marginBottom:6 }}>{slot.time}</div>
              <div style={{ marginBottom:10 }}>
                <Chip status={status} />
              </div>
              <div style={{ fontSize:11, color:T.textMuted, marginBottom:10 }}>{count}/{cap} vagas</div>
              <button onClick={()=>onToggleBlocked(slot.id)} style={{
                width:"100%", background:slot.blocked?T.surface3:T.redDim,
                border:`1px solid ${slot.blocked?T.border2:T.red+"40"}`,
                color:slot.blocked?T.textMuted:T.red, borderRadius:6, padding:"4px 0",
                fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600,
              }}>
                {slot.blocked ? "Desbloquear" : "Bloquear"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
