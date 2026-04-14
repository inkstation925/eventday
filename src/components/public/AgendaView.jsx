import { T, btnP } from "../../utils/colors.js"
import { Chip } from "../ui/Chips.jsx"
import { getSlotStatus } from "../../utils/slots.js"

function fmtDate(d) {
  if (!d) return ""
  return new Date(d+"T12:00:00").toLocaleDateString("pt-BR",{ weekday:"long", day:"2-digit", month:"long", year:"numeric" })
}

export function AgendaView({ event, slots, bookings, flashLink, studioName, onSelectSlot }) {
  const cap = event?.capacity || 3

  const words = (studioName||"EventDay").split(" ")

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"24px 16px" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, letterSpacing:"0.1em", lineHeight:1, marginBottom:8 }}>
          {words.map((w,i) => (
            <span key={i} style={{ color: i===0 ? T.accent : T.text }}>
              {i>0?" ":""}{w}
            </span>
          ))}
        </div>
        {event.name && (
          <div style={{ fontSize:15, color:T.textMuted, fontWeight:500, marginBottom:4 }}>{event.name}</div>
        )}
        {event.date && (
          <div style={{ fontSize:13, color:T.textDim }}>{fmtDate(event.date)}</div>
        )}
        {event.location && (
          <div style={{ fontSize:12, color:T.textDim, marginTop:2 }}>📍 {event.location}</div>
        )}
      </div>

      {flashLink && (
        <a href={flashLink} target="_blank" rel="noopener noreferrer" style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          background:T.accentDim, border:`1px solid ${T.accent}40`,
          borderRadius:12, padding:"14px 20px", marginBottom:20,
          color:T.accent, fontSize:14, fontWeight:600, textDecoration:"none",
        }}>
          <span style={{ fontSize:20 }}>🖼</span>
          Ver catalogo de designs
          <span style={{ fontSize:12, opacity:0.7, marginLeft:"auto" }}>↗</span>
        </a>
      )}

      {slots.length === 0 && (
        <div style={{ textAlign:"center", color:T.textMuted, padding:"40px 0", fontSize:14 }}>
          Nenhum horario disponivel no momento.
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
        {slots.map(slot => {
          const status = getSlotStatus(slot, bookings, cap)
          const disabled = status==="full" || status==="blocked"
          return (
            <button
              key={slot.id}
              onClick={() => !disabled && onSelectSlot(slot)}
              disabled={disabled}
              style={{
                background: T.surface, border:`1px solid ${T.border}`,
                borderRadius:12, padding:"16px 12px", cursor:disabled?"default":"pointer",
                textAlign:"center", opacity:disabled?0.5:1,
                transition:"border-color 0.15s",
                fontFamily:"'DM Sans',sans-serif",
              }}
              onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.borderColor=T.accent }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border }}
            >
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:"0.04em", color:T.text, marginBottom:8 }}>
                {slot.time}
              </div>
              <Chip status={status} />
            </button>
          )
        })}
      </div>

      <div style={{ textAlign:"center", marginTop:24, fontSize:11, color:T.textDim }}>
        Powered by EventDay
      </div>
    </div>
  )
}
