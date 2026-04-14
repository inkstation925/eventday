import { useState, useCallback } from "react"
import { supabase } from "../lib/supabase.js"

export const DEFAULT_FIELDS_CONFIG = {
  bodyPartEnabled: false,
  bodyPartLabel: "Informacao adicional",
  bodyPartPlaceholder: "Ex: detalhe relevante para o atendimento",
  field1Enabled: false,
  field1Label: "Campo extra 1",
  field1Placeholder: "",
  field2Enabled: false,
  field2Label: "Campo extra 2",
  field2Placeholder: "",
  sessionLabel: "Atendimento",
  sinalValor: 50,
}

export const DEFAULT_DONATION_CONFIG = {
  enabled: false,
  itemName: "item",
  itemNamePlural: "itens",
  tiers: [],
}

export const DEFAULT_PIX = {
  key: "", keyType: "cpf", holderName: "", bank: "",
}

export function useConfig(studioId) {
  const [config, setConfig]           = useState(null)
  const [accentColor, setAccentColor] = useState("#e63946")
  const [bgColor, setBgColor]         = useState("#080808")
  const [pixConfig, setPixConfig]     = useState(DEFAULT_PIX)
  const [fieldsConfig, setFieldsConfig]   = useState(DEFAULT_FIELDS_CONFIG)
  const [donationConfig, setDonationConfig] = useState(DEFAULT_DONATION_CONFIG)
  const [flashLink, setFlashLink]     = useState("")
  const [studioName, setStudioName]   = useState("")

  const loadConfig = useCallback(async () => {
    if (!studioId) return
    const { data } = await supabase
      .from("studio_config")
      .select("*")
      .eq("studio_id", studioId)
      .single()
    if (!data) return
    setConfig(data)
    if (data.accent_color) setAccentColor(data.accent_color)
    if (data.bg_color)     setBgColor(data.bg_color)
    if (data.pix_key)      setPixConfig({ key:data.pix_key, keyType:data.pix_key_type||"cpf", holderName:data.pix_holder_name||"", bank:data.pix_bank||"" })
    if (data.flash_link)   setFlashLink(data.flash_link)
    if (data.fields_config)   setFieldsConfig({ ...DEFAULT_FIELDS_CONFIG, ...data.fields_config })
    if (data.donation_config) setDonationConfig({ ...DEFAULT_DONATION_CONFIG, ...data.donation_config })
    if (data.studio_name)  setStudioName(data.studio_name)
  }, [studioId])

  const saveField = useCallback(async (field, value) => {
    if (!studioId) return
    await supabase.from("studio_config").update({ [field]: value }).eq("studio_id", studioId)
  }, [studioId])

  const saveColors = async (accent, bg) => {
    setAccentColor(accent); setBgColor(bg)
    await saveField("accent_color", accent)
    await saveField("bg_color", bg)
  }

  const savePix = async (pix) => {
    setPixConfig(pix)
    await supabase.from("studio_config").update({
      pix_key: pix.key, pix_key_type: pix.keyType,
      pix_holder_name: pix.holderName, pix_bank: pix.bank,
    }).eq("studio_id", studioId)
  }

  const saveFlashLink = async (link) => {
    setFlashLink(link)
    await saveField("flash_link", link)
  }

  const saveFieldsConfig = async (fc) => {
    setFieldsConfig({ ...DEFAULT_FIELDS_CONFIG, ...fc })
    await saveField("fields_config", fc)
  }

  const saveDonationConfig = async (dc) => {
    setDonationConfig({ ...DEFAULT_DONATION_CONFIG, ...dc })
    await saveField("donation_config", dc)
  }

  const saveStudioName = async (name) => {
    setStudioName(name)
    await saveField("studio_name", name)
  }

  return {
    config, accentColor, bgColor, pixConfig, fieldsConfig, donationConfig, flashLink, studioName,
    loadConfig, saveColors, savePix, saveFlashLink, saveFieldsConfig, saveDonationConfig, saveStudioName,
  }
}
