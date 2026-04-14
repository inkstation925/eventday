import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase.js"
import { genSlots, toMin } from "../utils/slots.js"

export const INIT_EVENT = {
  id: null, name: "", date: "", location: "",
  startTime: "10:00", endTime: "20:00", interval: 30, capacity: 3,
}

export function useEvent(studioId) {
  const [event, setEvent]   = useState(INIT_EVENT)
  const [slots, setSlots]   = useState([])
  const [loading, setLoading] = useState(false)

  const loadEvent = useCallback(async () => {
    if (!studioId) return
    setLoading(true)
    const { data: evRows } = await supabase
      .from("events")
      .select("*")
      .eq("studio_id", studioId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
    if (evRows && evRows.length > 0) {
      const ev = evRows[0]
      const mapped = {
        id: ev.id, name: ev.name, date: ev.date||"",
        location: ev.location||"", startTime: ev.start_time||"10:00",
        endTime: ev.end_time||"20:00", interval: ev.interval_min||30, capacity: ev.capacity||3,
      }
      setEvent(mapped)
      // Load slots
      const { data: slotRows } = await supabase
        .from("slots")
        .select("*")
        .eq("event_id", ev.id)
      if (slotRows && slotRows.length > 0) {
        const sorted = [...slotRows].sort((a,b) => toMin(a.time) - toMin(b.time))
        setSlots(sorted.map(s => ({ id:s.id, time:s.time, blocked:s.blocked })))
      } else {
        setSlots(genSlots(mapped.startTime, mapped.endTime, mapped.interval))
      }
    }
    setLoading(false)
  }, [studioId])

  const saveEvent = async (form) => {
    const payload = {
      studio_id: studioId, name: form.name, date: form.date,
      location: form.location, start_time: form.startTime, end_time: form.endTime,
      interval_min: Number(form.interval), capacity: Number(form.capacity), is_active: true,
    }
    if (event.id) {
      const { data, error } = await supabase.from("events").update(payload).eq("id", event.id).select()
      if (!error && data) setEvent(e => ({ ...e, ...form, id: data[0].id }))
      return { error }
    } else {
      const { data, error } = await supabase.from("events").insert([payload]).select()
      if (!error && data) setEvent({ ...form, id: data[0].id })
      return { error, eventId: data?.[0]?.id }
    }
  }

  const saveSlots = async (newSlots, eventId) => {
    const eId = eventId || event.id
    if (!eId) return
    await supabase.from("slots").delete().eq("event_id", eId)
    const rows = newSlots.map(s => ({ id:s.id, event_id:eId, studio_id:studioId, time:s.time, blocked:s.blocked }))
    await supabase.from("slots").insert(rows)
    setSlots(newSlots)
  }

  const toggleSlotBlocked = async (slotId) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return
    const newBlocked = !slot.blocked
    await supabase.from("slots").update({ blocked: newBlocked }).eq("id", slotId)
    setSlots(p => p.map(s => s.id===slotId ? {...s, blocked:newBlocked} : s))
  }

  const regenerateSlots = async () => {
    const newSlots = genSlots(event.startTime, event.endTime, event.interval)
    await saveSlots(newSlots)
  }

  return { event, slots, loading, loadEvent, saveEvent, saveSlots, setSlots, toggleSlotBlocked, regenerateSlots }
}
