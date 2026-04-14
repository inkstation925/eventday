import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase.js"

export function useDonations(studioId, eventId) {
  const [donations, setDonations] = useState([])

  const loadDonations = useCallback(async () => {
    if (!eventId) return
    const { data } = await supabase
      .from("donations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
    if (data) setDonations(data)
  }, [eventId])

  const addDonation = async (form) => {
    const row = {
      event_id: eventId, studio_id: studioId,
      booking_id: form.bookingId||null,
      tipo: form.tipo||"doacao",
      nome: form.nome, quantidade: Number(form.quantidade)||1,
      obs: form.obs||null,
    }
    const { data, error } = await supabase.from("donations").insert([row]).select()
    if (!error && data) setDonations(p => [data[0], ...p])
    return { error }
  }

  return { donations, loadDonations, addDonation }
}
