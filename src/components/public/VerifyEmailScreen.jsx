import { useState } from "react"
import { T, btnP } from "../../utils/colors.js"

export function VerifyEmailScreen({ email, onResend, onBack }) {
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    await onResend(email)
    setLoading(false)
    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{
        background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:16, padding:"36px 28px", width:"100%", maxWidth:380,
        textAlign:"center",
      }}>
        {/* Ícone envelope */}
        <div style={{ fontSize:48, marginBottom:16 }}>✉️</div>

        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.12em", color:T.accent, marginBottom:8 }}>
          VERIFIQUE SEU EMAIL
        </div>

        <div style={{ fontSize:14, color:T.textMuted, marginBottom:8, lineHeight:1.6 }}>
          Enviamos um link de confirmação para:
        </div>
        <div style={{ fontSize:14, color:T.text, fontWeight:600, marginBottom:20, wordBreak:"break-all" }}>
          {email}
        </div>

        <div style={{ fontSize:13, color:T.textMuted, marginBottom:28, lineHeight:1.6 }}>
          Clique no link no email para ativar sua conta e acessar o sistema.
          Verifique também a pasta de spam.
        </div>

        <button
          onClick={handleResend}
          disabled={loading || resent}
          style={{
            ...btnP(),
            width:"100%",
            marginBottom:12,
            opacity:(loading||resent)?0.7:1,
          }}
        >
          {loading ? "Enviando..." : resent ? "Email reenviado!" : "Reenviar email"}
        </button>

        <button
          onClick={onBack}
          style={{
            background:"none", border:"none", color:T.textMuted,
            cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif",
            width:"100%", padding:"8px",
          }}
        >
          Voltar ao login
        </button>
      </div>
    </div>
  )
}
