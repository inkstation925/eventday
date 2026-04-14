export function isLightColor(hex) {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  const toLinear = c => c<=0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4)
  return 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b) > 0.179
}

export function adjustBrightness(hex, amount) {
  if (!hex || hex.length < 7) return hex
  let r = parseInt(hex.slice(1,3),16)+amount
  let g = parseInt(hex.slice(3,5),16)+amount
  let b = parseInt(hex.slice(5,7),16)+amount
  r = Math.max(0,Math.min(255,r))
  g = Math.max(0,Math.min(255,g))
  b = Math.max(0,Math.min(255,b))
  return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("")
}

// Objeto global de tema — mutado antes de cada render no App
export const T = {
  bg:"#080808", surface:"#111111", surface2:"#181818", surface3:"#222222",
  border:"#232323", border2:"#2e2e2e",
  accent:"#e63946", accentDim:"#e6394618",
  text:"#f0f0f0", textMuted:"#777777", textDim:"#444444",
  green:"#4ade80", greenDim:"#4ade8018",
  amber:"#fbbf24", amberDim:"#fbbf2418",
  red:"#f87171",   redDim:"#f8717118",
  gray:"#6b7280",  grayDim:"#6b728018",
}

export function applyTheme(accentColor, bgColor) {
  T.accent    = accentColor
  T.accentDim = accentColor + "18"
  T.bg        = bgColor
  const light = isLightColor(bgColor)
  if (light) {
    T.surface   = adjustBrightness(bgColor, -12)
    T.surface2  = adjustBrightness(bgColor, -22)
    T.surface3  = adjustBrightness(bgColor, -32)
    T.border    = adjustBrightness(bgColor, -40)
    T.border2   = adjustBrightness(bgColor, -55)
    T.text      = "#111111"
    T.textMuted = "#555555"
    T.textDim   = "#999999"
  } else {
    T.surface   = adjustBrightness(bgColor, 10)
    T.surface2  = adjustBrightness(bgColor, 18)
    T.surface3  = adjustBrightness(bgColor, 26)
    T.border    = "#232323"
    T.border2   = "#2e2e2e"
    T.text      = "#f0f0f0"
    T.textMuted = "#777777"
    T.textDim   = "#444444"
  }
  document.body.style.background = bgColor
  document.body.style.color = T.text
}

export const btnP = () => ({
  background: T.accent, color: "#fff",
  border: "none", borderRadius: 10, padding: "12px 20px",
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.02em",
})

export const inp = {
  width: "100%", boxSizing: "border-box",
  background: T.surface2, border: `1px solid ${T.border2}`,
  borderRadius: 8, padding: "10px 12px", fontSize: 14,
  color: T.text, fontFamily: "'DM Sans',sans-serif", outline: "none",
}

export const lbl = {
  display: "block", fontSize: 11, color: T.textMuted,
  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6,
}

export const COLOR_PRESETS = [
  { label:"Vermelho",  value:"#e63946" },
  { label:"Rosa",      value:"#ec4899" },
  { label:"Laranja",   value:"#f97316" },
  { label:"Ambar",     value:"#f59e0b" },
  { label:"Verde",     value:"#22c55e" },
  { label:"Ciano",     value:"#06b6d4" },
  { label:"Azul",      value:"#3b82f6" },
  { label:"Roxo",      value:"#8b5cf6" },
]

export const BG_PRESETS = [
  { label:"Preto",        value:"#080808" },
  { label:"Grafite",      value:"#111827" },
  { label:"Azul escuro",  value:"#0a0f1e" },
  { label:"Verde escuro", value:"#071a0f" },
  { label:"Roxo escuro",  value:"#0f0a1e" },
  { label:"Marrom",       value:"#150c06" },
]
