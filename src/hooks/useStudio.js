import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase.js"

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
    const { data, error } = await supabase
      .from("studios")
      .insert([{ owner_id: user.id, name, status: "inactive" }])
      .select()
    if (error) return { error }
    const s = data[0]
    // Criar config padrão
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
