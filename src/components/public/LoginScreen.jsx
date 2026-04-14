import { useState } from "react"
import { T, btnP, inp, lbl } from "../../utils/colors.js"
import { PwdInput } from "../ui/PwdInput.jsx"

export function LoginScreen({ onLogin, onGoSignup, studioName }) {
  const [email, setEmail]   = useState("")
  const [pwd, setPwd]       = useState("")
  const [err, setErr]       = useState("")
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email || !pwd) { setErr("Preencha email e senha."); return }
    setLoading(true); setErr("")
    const { error } = await onLogin(email, pwd)
    if (error) setErr("Email ou senha incorretos.")
    setLoading(false)
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{
        background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:16, padding:"36px 28px", width:"100%", maxWidth:380,
      }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:"0.12em", color:T.accent, marginBottom:4 }}>
            {(studioName||"EventDay").toUpperCase()}
          </div>
          <div style={{ fontSize:13, color:T.textMuted }}>Painel administrativo</div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Email</label>
          <input type="email" placeholder="seu@email.com" value={email}
            onChange={e=>{ setEmail(e.target.value); setErr("") }}
            onKeyDown={e=>e.key==="Enter"&&handle()}
            style={inp} />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Senha</label>
          <PwdInput value={pwd} placeholder="Sua senha..."
            onChange={e=>{ setPwd(e.target.value); setErr("") }}
            onKeyDown={e=>e.key==="Enter"&&handle()}
            borderColor={err ? T.red : T.border2} />
          {err && <div style={{ fontSize:12, color:T.red, marginTop:6 }}>{err}</div>}
        </div>

        <button onClick={handle} disabled={loading} style={{ ...btnP(), width:"100%", marginTop:4, opacity:loading?0.7:1 }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:T.textMuted }}>
          Nao tem conta?{" "}
          <button onClick={onGoSignup} style={{ background:"none", border:"none", color:T.accent, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
            Criar conta gratis
          </button>
        </div>
      </div>
    </div>
  )
}
