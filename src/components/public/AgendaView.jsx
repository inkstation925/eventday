import { T } from "../../utils/colors.js"
import { Chip } from "../ui/Chips.jsx"
import { getSlotStatus } from "../../utils/slots.js"

function fmtDate(d) {
  if (!d) return ""
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  })
}

function fmtDateShort(d) {
  if (!d) return ""
  const dt = new Date(d + "T12:00:00")
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    + " — " + dt.toLocaleDateString("pt-BR", { weekday: "long" })
}

const STATUS_ORDER = { available: 0, last: 1, full: 2, blocked: 3 }

export function AgendaView({ event, slots, bookings, flashLink, studioName, onSelectSlot }) {
  const cap = event?.capacity || 3
  const today = new Date().toISOString().split("T")[0]
  const isToday = event?.date === today

  // Stats
  const activeBookings = bookings.filter(b => b.status !== "cancelled")
  const totalCapacity  = slots.filter(s => !s.blocked).length * cap
  const freeCount      = Math.max(0, totalCapacity - activeBookings.length)
  const bookedCount    = activeBookings.length

  // Studio name split for colored first word
  const words = (studioName || "EventDay").split(" ")

  // Slot with computed status
  const slotsWithStatus = slots.map(s => ({ ...s, status: getSlotStatus(s, bookings, cap) }))

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Hero header ── */}
      <div style={{
        background: `linear-gradient(180deg, ${T.accent}22 0%, ${T.bg} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        padding: "40px 20px 32px",
        textAlign: "center",
      }}>
        {/* Label */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          fontSize: 11, color: T.accent, letterSpacing: "0.22em",
          fontWeight: 600, marginBottom: 14, textTransform: "uppercase",
        }}>
          <span style={{ width: 28, height: 1, background: T.accent, display: "inline-block" }} />
          Evento especial
          <span style={{ width: 28, height: 1, background: T.accent, display: "inline-block" }} />
        </div>

        {/* Event name */}
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "clamp(40px, 10vw, 72px)",
          letterSpacing: "0.06em",
          lineHeight: 1.05,
          marginBottom: 16,
        }}>
          {event?.name
            ? event.name.split(" ").map((w, i) => (
                <span key={i} style={{ color: i === 0 ? T.accent : T.text }}>
                  {i > 0 ? " " : ""}{w}
                </span>
              ))
            : words.map((w, i) => (
                <span key={i} style={{ color: i === 0 ? T.accent : T.text }}>
                  {i > 0 ? " " : ""}{w}
                </span>
              ))
          }
        </div>

        {/* Date + location */}
        {(event?.date || event?.location) && (
          <div style={{
            fontSize: 13, color: T.textMuted, marginBottom: 12,
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px",
          }}>
            {event.date && <span>Data: {fmtDateShort(event.date)}</span>}
            {event.location && <span>Local: {event.location}</span>}
          </div>
        )}

        {/* Happening now badge */}
        {isToday && (
          <div style={{
            fontSize: 12, color: T.green, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
          }}>
            ● O evento está acontecendo agora!
          </div>
        )}

        {/* Stats */}
        {slots.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "14px 28px", textAlign: "center", minWidth: 100,
            }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: T.text, lineHeight: 1 }}>
                {bookedCount}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>
                Agendados
              </div>
            </div>
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "14px 28px", textAlign: "center", minWidth: 100,
            }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: freeCount > 0 ? T.green : T.red, lineHeight: 1 }}>
                {freeCount}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: "0.1em", marginTop: 4, textTransform: "uppercase" }}>
                Vagas livres
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* Catalog link */}
        {flashLink && (
          <a href={flashLink} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 12,
            background: T.accentDim, border: `1px solid ${T.accent}50`,
            borderRadius: 12, padding: "16px 20px", marginBottom: 20,
            color: T.accent, fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.15s",
          }}>
            <span style={{ fontSize: 22 }}>🖼</span>
            <span>Ver catálogo de designs {event?.name ? event.name.split(" ").slice(-2).join(" ") : ""}</span>
            <span style={{ marginLeft: "auto", fontSize: 14, opacity: 0.7 }}>↗</span>
          </a>
        )}

        {/* Legend */}
        {slots.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16,
            padding: "0 4px",
          }}>
            {["available","last","full","blocked"].map(s => (
              <Chip key={s} status={s} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {slots.length === 0 && (
          <div style={{ textAlign: "center", color: T.textMuted, padding: "60px 0", fontSize: 14 }}>
            Nenhum horário disponível no momento.
          </div>
        )}

        {/* Slot list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {slotsWithStatus.map(slot => {
            const disabled = slot.status === "full" || slot.status === "blocked"
            const booked   = bookings.filter(b => b.slotId === slot.id && b.status !== "cancelled").length
            const dots     = Array.from({ length: cap })

            return (
              <button
                key={slot.id}
                onClick={() => !disabled && onSelectSlot(slot)}
                disabled={disabled}
                style={{
                  display: "flex", alignItems: "center",
                  background: T.surface,
                  border: `1px solid ${slot.status === "available" || slot.status === "last" ? T.border : T.border}`,
                  borderLeft: `3px solid ${
                    slot.status === "available" ? T.accent :
                    slot.status === "last"      ? T.amber :
                    slot.status === "full"      ? T.red :
                    T.gray
                  }`,
                  borderRadius: 10, padding: "16px 18px",
                  cursor: disabled ? "default" : "pointer",
                  opacity: slot.status === "blocked" ? 0.45 : 1,
                  textAlign: "left", width: "100%",
                  fontFamily: "'DM Sans',sans-serif",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = T.surface3 }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface }}
              >
                {/* Time */}
                <div style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 28, letterSpacing: "0.04em",
                  color: disabled ? T.textDim : T.text,
                  minWidth: 72,
                }}>
                  {slot.time}
                </div>

                {/* Status chip */}
                <div style={{ flex: 1, paddingLeft: 14 }}>
                  <Chip status={slot.status} />
                  {!disabled && (
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>
                      {cap - booked} {cap - booked === 1 ? "vaga restante" : "vagas restantes"}
                    </div>
                  )}
                </div>

                {/* Capacity dots */}
                <div style={{ display: "flex", gap: 5, paddingLeft: 12 }}>
                  {dots.map((_, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: i < booked
                        ? (slot.status === "full" ? T.red : T.accent)
                        : T.border,
                    }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: T.textDim, letterSpacing: "0.06em" }}>
          Powered by <span style={{ color: T.accent, fontWeight: 600 }}>EventDay</span>
        </div>
      </div>
    </div>
  )
}
