import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase.js"

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 40) || "meu-evento"
}

export function useStudio(user) {
  const [studio, setStudio]   = useState(null)
  const [loading, setLoading] = useState(false)

  const loadStudio = useCallback(async () => {
    if (!user) return null
    setLoading(true)
    const { data } = await supabase
      .from("studios")
      .select("*")
      .eq("owner_id", user.id)
      .single()
    setStudio(data)
    setLoading(false)
    return data
  }, [user])

  const createStudio = async (name) => {
    const baseSlug = generateSlug(name)
    // Ensure unique slug
    const { data: existing } = await supabase.from("studios").select("slug").eq("slug", baseSlug).single()
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug

    const { data, error } = await supabase
      .from("studios")
      .insert([{ owner_id: user.id, name, slug, plan: "trial", status: "inactive" }])
      .select()
    if (error) return { error }
    const s = data[0]
    await supabase.from("studio_config").insert([{ studio_id: s.id }])
    setStudio(s)
    return { data: s }
  }

  const updateStudio = async (updates) => {
    if (!studio) return
    const { data, error } = await supabase
      .from("studios")
      .update(updates)
      .eq("id", studio.id)
      .select()
    if (!error && data) setStudio(data[0])
    return { data, error }
  }

  return { studio, loading, loadStudio, createStudio, updateStudio }
}
