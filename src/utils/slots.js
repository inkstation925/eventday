export function toMin(t) {
  const [h, m] = (t || "0:0").split(":").map(Number)
  return h * 60 + m
}

export function genSlots(start, end, interval) {
  const slots = []
  let cur = toMin(start)
  const fin = toMin(end)
  while (cur < fin) {
    const h = Math.floor(cur / 60).toString().padStart(2,"0")
    const m = (cur % 60).toString().padStart(2,"0")
    const time = `${h}:${m}`
    slots.push({ id: `slot-${cur}`, time, blocked: false })
    cur += interval
  }
  return slots
}

export function getSlotStatus(slot, bookings, capacity) {
  if (slot.blocked) return "blocked"
  const count = bookings.filter(b => b.slotId === slot.id && b.status !== "cancelled").length
  if (count >= capacity) return "full"
  if (count >= capacity - 1) return "last"
  return "available"
}
