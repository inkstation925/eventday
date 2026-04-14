import { useState } from "react"
import { T, btnP, inp, lbl, COLOR_PRESETS, BG_PRESETS } from "../../utils/colors.js"

export function OnboardingWizard({ onFinish }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    studioName: "", eventName: "", city: "",
    pixKey: "", pixKeyType: "cpf", pixHolder: "",
    accent: "#e63946", bg: "#080808",
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const finish = () => onFinish(form)

  const stepIndicator = (
    <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:28 }}>
      {[1,2,3].map(n => (
        <div key={n} style={{
          width: n===step ? 24 : 8, height:8, borderRadius:100,
          background: n<=step ? T.accent : T.border2,
          transition:"all 0.2s",
        }} />
      ))}
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{
        background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:16, padding:"36px 28px", width:"100%", maxWidth:440,
      }}>
        {stepIndicator}

        {step === 1 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.08em", marginBottom:6 }}>Seu negocio</div>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:24 }}>Essas informacoes aparecem para seus clientes.</div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Nome do seu negocio</label>
              <input type="text" placeholder="Ex: Studio Ana Lima" value={form.studioName}
                onChange={e=>set("studioName",e.target.value)} style={inp} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Nome do evento</label>
              <input type="text" placeholder="Ex: Flash Day, Dia Especial..." value={form.eventName}
                onChange={e=>set("eventName",e.target.value)} style={inp} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={lbl}>Cidade / Localizacao</label>
              <input type="text" placeholder="Ex: Sao Paulo, SP" value={form.city}
                onChange={e=>set("city",e.target.value)} style={inp} />
            </div>
            <button onClick={next} disabled={!form.studioName} style={{ ...btnP(), width:"100%", opacity:form.studioName?1:0.5 }}>
              Continuar
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.08em", marginBottom:6 }}>Pagamento PIX</div>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:24 }}>Seus clientes pagam o sinal via PIX. Pode configurar depois.</div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Tipo de chave</label>
              <select value={form.pixKeyType} onChange={e=>set("pixKeyType",e.target.value)} style={inp}>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">Email</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave aleatoria</option>
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Chave PIX</label>
              <input type="text" placeholder="Sua chave PIX" value={form.pixKey}
                onChange={e=>set("pixKey",e.target.value)} style={inp} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={lbl}>Nome do titular</label>
              <input type="text" placeholder="Como aparece no PIX" value={form.pixHolder}
                onChange={e=>set("pixHolder",e.target.value)} style={inp} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={back} style={{ ...btnP(), background:T.surface3, color:T.text, flex:1 }}>Voltar</button>
              <button onClick={next} style={{ ...btnP(), flex:2 }}>Continuar</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:"0.08em", marginBottom:6 }}>Identidade visual</div>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:24 }}>Escolha as cores do seu evento. Pode mudar depois.</div>
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Cor de destaque</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {COLOR_PRESETS.map(c => (
                  <button key={c.value} type="button" onClick={()=>set("accent",c.value)} title={c.label}
                    style={{ width:36, height:36, borderRadius:"50%", background:c.value, border:`3px solid ${form.accent===c.value?"#fff":"#333"}`, cursor:"pointer", boxShadow:form.accent===c.value?`0 0 0 2px ${c.value}`:"none" }} />
                ))}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={lbl}>Cor de fundo</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {BG_PRESETS.map(c => (
                  <button key={c.value} type="button" onClick={()=>set("bg",c.value)} title={c.label}
                    style={{ width:36, height:36, borderRadius:"50%", background:c.value, border:`3px solid ${form.bg===c.value?"#fff":"#333"}`, cursor:"pointer", boxShadow:form.bg===c.value?`0 0 0 2px ${T.accent}`:"none" }} />
                ))}
              </div>
            </div>
            <div style={{ background:form.bg, border:`1px solid ${form.accent}40`, borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:form.accent }} />
              <span style={{ fontSize:12, color:form.accent, fontWeight:600 }}>Previa da combinacao</span>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={back} style={{ ...btnP(), background:T.surface3, color:T.text, flex:1 }}>Voltar</button>
              <button onClick={finish} style={{ ...btnP(), background:form.accent, flex:2 }}>Comecar a usar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
