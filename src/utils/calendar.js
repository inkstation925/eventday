export function genCalendarUrl(event, time, name, bodyPart, bodyPartLabel) {
  if (!event?.date) return null
  const [y, m, d] = event.date.split("-")
  const [hh, mm] = time.split(":")
  const pad = n => String(n).padStart(2,"0")
  const start = `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`
  const endMin = parseInt(hh)*60 + parseInt(mm) + 60
  const endH = pad(Math.floor(endMin/60))
  const endM = pad(endMin%60)
  const end = `${y}${pad(m)}${pad(d)}T${endH}${endM}00`
  const details = encodeURIComponent(
    ["Nome: "+name, bodyPart ? (bodyPartLabel||"Info")+": "+bodyPart : "", event.name]
      .filter(Boolean).join("\n")
  )
  return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(event.name) +
    "&dates=" + start + "/" + end +
    "&location=" + encodeURIComponent(event.location||"") +
    "&details=" + details
}
