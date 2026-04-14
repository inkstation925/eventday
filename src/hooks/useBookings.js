import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase.js"

function mapBooking(b) {
  return {
    id: b.id, slotId: b.slot_id, name: b.name, phone: b.phone,
    dob: b.dob||"", bodyPart: b.body_part||"",
    extraField1: b.extra_field_1||"", extraField2: b.extra_field_2||"",
    notes: b.notes||"", quantidade: b.quantidade||0,
    status: b.status, sessao: b.sessao||null,
    sinalValor: b.sinal_valor||50,
    createdAt: b.created_at||"",
  }
}

export function useBookings(studioId, eventId) {
  const [bookings, setBookings] = useState([])

  const loadBookings = useCallback(async () => {
    if (!eventId) return
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("event_id", eventId)
    if (data) setBookings(data.map(mapBooking))
  }, [eventId])

  const addBooking = async (form, slotId, sinalValor) => {
    const row = {
      event_id: eventId, studio_id: studioId, slot_id: slotId,
      name: form.name, phone: form.phone, dob: form.dob||null,
      body_part: form.bodyPart||null,
      extra_field_1: form.extraField1||null,
      extra_field_2: form.extraField2||null,
      notes: form.notes||null, quantidade: form.quantidade||0,
      status: "pending", sinal_valor: sinalValor||50,
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("bookings").insert([row]).select()
    if (!error && data) setBookings(p => [...p, mapBooking(data[0])])
    return { error, booking: data?.[0] ? mapBooking(data[0]) : null }
  }

  const updateBooking = async (id, updates) => {
    const { error } = await supabase.from("bookings").update(updates).eq("id", id)
    if (!error) {
      setBookings(p => p.map(b => b.id===id ? { ...b, ...mapBooking({ ...b, ...updates, id, slot_id:updates.slot_id||b.slotId, body_part:updates.body_part||b.bodyPart, extra_field_1:updates.extra_field_1||b.extraField1, extra_field_2:updates.extra_field_2||b.extraField2, created_at:b.createdAt } ) } : b))
      // Reload to be safe
      await loadBookings()
    }
    return { error }
  }

  const confirmSinal = async (id) => {
    return updateBooking(id, { status: "confirmed" })
  }

  const closeSession = async (id, sessao) => {
    return updateBooking(id, { status: "done", sessao })
  }

  const deleteBooking = async (id) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id)
    if (!error) setBookings(p => p.filter(b => b.id !== id))
    return { error }
  }

  // Realtime subscription
  const subscribeRealtime = useCallback((onInsert) => {
    if (!eventId) return () => {}
    const channel = supabase
      .channel(`bookings-${eventId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "bookings",
        filter: `event_id=eq.${eventId}`,
      }, payload => {
        const b = mapBooking(payload.new)
        setBookings(p => {
          if (p.find(x => x.id===b.id)) return p
          return [...p, b]
        })
        onInsert?.(b)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [eventId])

  return { bookings, loadBookings, addBooking, updateBooking, confirmSinal, closeSession, deleteBooking, subscribeRealtime }
}
