import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase.js"
import { applyTheme } from "../utils/colors.js"
import { DEFAULT_FIELDS_CONFIG, DEFAULT_DONATION_CONFIG, DEFAULT_PIX } from "./useConfig.js"
import { genSlots, toMin } from "../utils/slots.js"

export function usePublicStudio(slug) {
  const [studio,        setStudio]        = useState(null)
  const [event,         setEvent]         = useState(null)
  const [slots,         setSlots]         = useState([])
  const [bookings,      setBookings]      = useState([])
  const [pixConfig,     setPixConfig]     = useState(DEFAULT_PIX)
  const [fieldsConfig,  setFieldsConfig]  = useState(DEFAULT_FIELDS_CONFIG)
  const [donationConfig,setDonationConfig]= useState(DEFAULT_DONATION_CONFIG)
  const [flashLink,     setFlashLink]     = useState("")
  const [studioName,    setStudioName]    = useState("")
  const [accentColor,   setAccentColor]   = useState("#e63946")
  const [bgColor,       setBgColor]       = useState("#080808")
  const [loading,       setLoading]       = useState(true)
  const [notFound,      setNotFound]      = useState(false)

  useEffect(() => {
    if (!slug) return
    load()
  }, [slug])

  const load = async () => {
    setLoading(true)

    // 1. Load studio by slug
    const { data: s } = await supabase
      .from("studios")
      .select("*")
      .eq("slug", slug)
      .single()

    if (!s) { setNotFound(true); setLoading(false); return }
    setStudio(s)

    // 2. Load config
    const { data: cfg } = await supabase
      .from("studio_config")
      .select("*")
      .eq("studio_id", s.id)
      .single()

    if (cfg) {
      if (cfg.accent_color)    setAccentColor(cfg.accent_color)
      if (cfg.bg_color)        setBgColor(cfg.bg_color)
      if (cfg.pix_key)         setPixConfig({ key:cfg.pix_key, keyType:cfg.pix_key_type||"cpf", holderName:cfg.pix_holder_name||"", bank:cfg.pix_bank||"" })
      if (cfg.flash_link)      setFlashLink(cfg.flash_link)
      if (cfg.fields_config)   setFieldsConfig({ ...DEFAULT_FIELDS_CONFIG, ...cfg.fields_config })
      if (cfg.donation_config) setDonationConfig({ ...DEFAULT_DONATION_CONFIG, ...cfg.donation_config })
      if (cfg.studio_name)     setStudioName(cfg.studio_name)
      applyTheme(cfg.accent_color || "#e63946", cfg.bg_color || "#080808")
    }

    // 3. Load active event
    const { data: evRows } = await supabase
      .from("events")
      .select("*")
      .eq("studio_id", s.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)

    if (!evRows || evRows.length === 0) { setLoading(false); return }
    const ev = evRows[0]
    const mapped = {
      id: ev.id, name: ev.name, date: ev.date||"",
      location: ev.location||"", startTime: ev.start_time||"10:00",
      endTime: ev.end_time||"20:00", interval: ev.interval_min||30, capacity: ev.capacity||3,
    }
    setEvent(mapped)

    // 4. Load slots
    const { data: slotRows } = await supabase
      .from("slots")
      .select("*")
      .eq("event_id", ev.id)

    const loadedSlots = slotRows && slotRows.length > 0
      ? [...slotRows].sort((a,b) => toMin(a.time) - toMin(b.time)).map(s => ({ id:s.id, time:s.time, blocked:s.blocked }))
      : genSlots(mapped.startTime, mapped.endTime, mapped.interval)
    setSlots(loadedSlots)

    // 5. Load bookings (for slot availability)
    const { data: bRows } = await supabase
      .from("bookings")
      .select("id, slot_id, status")
      .eq("event_id", ev.id)

    if (bRows) setBookings(bRows.map(b => ({ id:b.id, slotId:b.slot_id, status:b.status })))

    setLoading(false)
  }

  return {
    studio, event, slots, bookings, pixConfig, fieldsConfig,
    donationConfig, flashLink, studioName, accentColor, bgColor,
    loading, notFound,
  }
}
