import { useState } from "react"
import { T, btnP, inp, lbl } from "../../utils/colors.js"
import { PwdInput } from "../ui/PwdInput.jsx"

export function SignupScreen({ onSignup, onGoLogin }) {
  const [email, setEmail]     = useState("")
  const [pwd, setPwd]         = useState("")
  const [confirm, setConfirm] = useState("")
  const [err, setErr]         = useState("")
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email || !pwd) { setErr("Preencha todos os campos."); return }
    if (pwd.length < 6)  { setErr("Senha deve ter pelo menos 6 caracteres."); return }
    if (pwd !== confirm)  { setErr("As senhas nao coincidem."); return }
    setLoading(true); setErr("")
    const { error } = await onSignup(email, pwd)
    if (error) {
      const msg = error.message || ""
      if (msg.includes("already registered") || msg.includes("already been registered"))
        setErr("Este email ja esta cadastrado. Tente fazer login.")
      else if (msg.includes("invalid email"))
        setErr("Email invalido.")
      else if (msg.includes("Password should be"))
        setErr("Senha fraca. Use pelo menos 6 caracteres.")
      else
        setErr("Erro ao criar conta. Tente novamente.")
    }
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
            CRIAR CONTA
          </div>
          <div style={{ fontSize:13, color:T.textMuted }}>Comece a usar o EventDay</div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Email</label>
          <input type="email" placeholder="seu@email.com" value={email}
            onChange={e=>{ setEmail(e.target.value); setErr("") }} style={inp} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Senha</label>
          <PwdInput value={pwd} placeholder="Minimo 6 caracteres"
            onChange={e=>{ setPwd(e.target.value); setErr("") }} />
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Confirmar senha</label>
          <PwdInput value={confirm} placeholder="Repita a senha"
            onChange={e=>{ setConfirm(e.target.value); setErr("") }}
            onKeyDown={e=>e.key==="Enter"&&handle()}
            borderColor={err ? T.red : T.border2} />
          {err && <div style={{ fontSize:12, color:T.red, marginTop:6 }}>{err}</div>}
        </div>

        <button onClick={handle} disabled={loading} style={{ ...btnP(), width:"100%", marginTop:4, opacity:loading?0.7:1 }}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:T.textMuted }}>
          Ja tem conta?{" "}
          <button onClick={onGoLogin} style={{ background:"none", border:"none", color:T.accent, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
            Fazer login
          </button>
        </div>
      </div>
    </div>
  )
}
