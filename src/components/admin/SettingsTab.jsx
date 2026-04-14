import { useState } from "react"
import { T, btnP, inp, lbl, COLOR_PRESETS, BG_PRESETS } from "../../utils/colors.js"
import { PwdInput } from "../ui/PwdInput.jsx"
import { DEFAULT_FIELDS_CONFIG, DEFAULT_DONATION_CONFIG } from "../../hooks/useConfig.js"
import { genSlots } from "../../utils/slots.js"

export function SettingsTab({ event, pixConfig, flashLink, accentColor, bgColor, fieldsConfig, donationConfig, studioName, onSaveEvent, onSavePix, onSaveFlashLink, onSaveColors, onSaveFieldsConfig, onSaveDonationConfig, onSaveStudioName, onChangePassword }) {
  const [evForm, setEvForm]   = useState({...event})
  const [pix, setPix]         = useState({...pixConfig})
  const [link, setLink]       = useState(flashLink||"")
  const [localAccent, setLocalAccent] = useState(accentColor)
  const [localBg, setLocalBg]         = useState(bgColor)
  const [localFields, setLocalFields] = useState({...DEFAULT_FIELDS_CONFIG,...fieldsConfig})
  const [localDonation, setLocalDonation] = useState({...DEFAULT_DONATION_CONFIG,...donationConfig})
  const [localName, setLocalName]     = useState(studioName||"")
  const [pwdForm, setPwdForm] = useState({ current:"", newPwd:"", confirm:"" })
  const [pwdErr, setPwdErr]   = useState("")

  const setFc = (k,v) => setLocalFields(p=>({...p,[k]:v}))
  const setDc = (k,v) => setLocalDonation(p=>({...p,[k]:v}))

  const handleChangePwd = async () => {
    if (!pwdForm.newPwd || pwdForm.newPwd.length < 6) { setPwdErr("Minimo 6 caracteres."); return }
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdErr("Senhas nao coincidem."); return }
    const { error } = await onChangePassword(pwdForm.newPwd)
    if (error) { setPwdErr("Erro ao alterar senha."); return }
    setPwdForm({ current:"", newPwd:"", confirm:"" }); setPwdErr("")
  }

  const previewSlots = genSlots(evForm.startTime||"10:00", evForm.endTime||"20:00", evForm.interval||30)

  const sectionTitle = (t) => (
    <div style={{ fontSize:12, color:T.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:18 }}>{t}</div>
  )

  const card = (children) => (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:24, marginBottom:16 }}>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth:580, margin:"0 auto", padding:"24px 16px" }}>

      {card(<>
        {sectionTitle("Seu negocio")}
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Nome do negocio</label>
          <input type="text" placeholder="Ex: Studio Ana Lima" value={localName} onChange={e=>setLocalName(e.target.value)} style={inp} />
        </div>
        <button onClick={()=>onSaveStudioName(localName)} style={{ ...btnP(), width:"100%" }}>Salvar nome</button>
      </>)}

      {card(<>
        {sectionTitle("Dados do evento")}
        {[
          { k:"name",      label:"Nome do evento",   type:"text" },
          { k:"date",      label:"Data",              type:"date" },
          { k:"location",  label:"Local",             type:"text" },
          { k:"startTime", label:"Horario de inicio", type:"time" },
          { k:"endTime",   label:"Horario de termino",type:"time" },
        ].map(f=>(
          <div key={f.k} style={{ marginBottom:12 }}>
            <label style={lbl}>{f.label}</label>
            <input type={f.type} value={evForm[f.k]||""} onChange={e=>setEvForm(p=>({...p,[f.k]:e.target.value}))} style={inp} />
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <label style={lbl}>Intervalo (min)</label>
            <input type="number" value={evForm.interval||30} min="5"
              onChange={e=>setEvForm(p=>({...p,interval:Number(e.target.value)}))}
              onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
              style={inp} />
          </div>
          <div>
            <label style={lbl}>Vagas por slot</label>
            <input type="number" value={evForm.capacity||3} min="1"
              onChange={e=>setEvForm(p=>({...p,capacity:Number(e.target.value)}))}
              onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
              style={inp} />
          </div>
        </div>
        <div style={{ background:T.surface3, borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:12, color:T.textMuted }}>
          Previa: {previewSlots.length} slots de {evForm.interval||30} min
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>Valor do sinal (R$)</label>
          <input type="number" value={localFields.sinalValor||50} min="0"
            onChange={e=>setFc("sinalValor",Number(e.target.value))}
            onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
            style={inp} />
        </div>
        <button onClick={()=>{ onSaveEvent(evForm); onSaveFieldsConfig({...localFields}) }} style={{ ...btnP(), width:"100%" }}>
          Salvar evento
        </button>
      </>)}

      {card(<>
        {sectionTitle("Link do catalogo / portfolio")}
        <div style={{ marginBottom:14 }}>
          <label style={lbl}>URL do catalogo</label>
          <input type="url" placeholder="https://..." value={link} onChange={e=>setLink(e.target.value)} style={inp} />
        </div>
        <button onClick={()=>onSaveFlashLink(link)} style={{ ...btnP(), width:"100%" }}>Salvar link</button>
      </>)}

      {card(<>
        {sectionTitle("Pagamento PIX")}
        <div style={{ marginBottom:12 }}>
          <label style={lbl}>Tipo de chave</label>
          <select value={pix.keyType} onChange={e=>setPix(p=>({...p,keyType:e.target.value}))} style={inp}>
            <option value="cpf">CPF</option><option value="cnpj">CNPJ</option>
            <option value="email">Email</option><option value="phone">Telefone</option>
            <option value="random">Chave aleatoria</option>
          </select>
        </div>
        {[
          { k:"key",        label:"Chave PIX",        ph:"Sua chave" },
          { k:"holderName", label:"Nome do titular",  ph:"Como aparece no PIX" },
          { k:"bank",       label:"Banco (opcional)", ph:"Ex: Nubank" },
        ].map(f=>(
          <div key={f.k} style={{ marginBottom:12 }}>
            <label style={lbl}>{f.label}</label>
            <input type="text" placeholder={f.ph} value={pix[f.k]||""} onChange={e=>setPix(p=>({...p,[f.k]:e.target.value}))} style={inp} />
          </div>
        ))}
        <button onClick={()=>onSavePix(pix)} style={{ ...btnP(), width:"100%" }}>Salvar PIX</button>
      </>)}

      {card(<>
        {sectionTitle("Identidade visual")}
        <div style={{ marginBottom:18 }}>
          <label style={lbl}>Cor de destaque</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:10 }}>
            {COLOR_PRESETS.map(c=>(
              <button key={c.value} type="button" onClick={()=>setLocalAccent(c.value)} title={c.label}
                style={{ width:36, height:36, borderRadius:"50%", background:c.value, border:`3px solid ${localAccent===c.value?"#fff":"#333"}`, cursor:"pointer", boxShadow:localAccent===c.value?`0 0 0 2px ${c.value}`:"none" }} />
            ))}
            <div style={{ position:"relative", width:36, height:36 }}>
              <input type="color" value={localAccent} onChange={e=>setLocalAccent(e.target.value)}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer" }} />
              <div style={{ width:36, height:36, borderRadius:"50%", background:COLOR_PRESETS.some(c=>c.value===localAccent)?T.surface3:localAccent, border:`3px solid ${!COLOR_PRESETS.some(c=>c.value===localAccent)?"#fff":"#333"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎨</div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom:18 }}>
          <label style={lbl}>Cor de fundo</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {BG_PRESETS.map(c=>(
              <button key={c.value} type="button" onClick={()=>setLocalBg(c.value)} title={c.label}
                style={{ width:36, height:36, borderRadius:"50%", background:c.value, border:`3px solid ${localBg===c.value?"#fff":"#333"}`, cursor:"pointer", boxShadow:localBg===c.value?`0 0 0 2px ${localAccent}`:"none" }} />
            ))}
            <div style={{ position:"relative", width:36, height:36 }}>
              <input type="color" value={localBg} onChange={e=>setLocalBg(e.target.value)}
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0, cursor:"pointer" }} />
              <div style={{ width:36, height:36, borderRadius:"50%", background:BG_PRESETS.some(c=>c.value===localBg)?T.surface3:localBg, border:`3px solid ${!BG_PRESETS.some(c=>c.value===localBg)?"#fff":"#333"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎨</div>
            </div>
          </div>
        </div>
        <div style={{ background:localBg, border:`1px solid ${localAccent}40`, borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ width:12, height:12, borderRadius:"50%", background:localAccent }} />
          <span style={{ fontSize:12, color:localAccent, fontWeight:600 }}>Previa da combinacao</span>
        </div>
        <button onClick={()=>onSaveColors(localAccent, localBg)} style={{ ...btnP(), width:"100%", background:localAccent }}>Salvar cores</button>
      </>)}

      {card(<>
        {sectionTitle("Campos do formulario")}
        <div style={{ fontSize:12, color:T.textDim, marginBottom:16 }}>Personalize os campos exibidos no agendamento e no encerramento do {localFields.sessionLabel?.toLowerCase()||"atendimento"}.</div>
        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Como chamar o atendimento</label>
          <input type="text" placeholder="Ex: Sessao, Consulta, Corte..." value={localFields.sessionLabel||""} onChange={e=>setFc("sessionLabel",e.target.value)} style={inp} />
        </div>
        {[
          { ek:"bodyPartEnabled", lk:"bodyPartLabel", pk:"bodyPartPlaceholder", title:"Campo de identificacao (no agendamento)" },
          { ek:"field1Enabled",   lk:"field1Label",   pk:"field1Placeholder",   title:"Campo extra 1 (no encerramento)" },
          { ek:"field2Enabled",   lk:"field2Label",   pk:"field2Placeholder",   title:"Campo extra 2 (no encerramento)" },
        ].map(f=>(
          <div key={f.ek} style={{ background:T.surface3, borderRadius:10, padding:"14px 16px", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:localFields[f.ek]?12:0 }}>
              <span style={{ fontSize:13, color:T.text }}>{f.title}</span>
              <button type="button" onClick={()=>setFc(f.ek,!localFields[f.ek])} style={{
                background:localFields[f.ek]?T.accentDim:T.surface2, border:`1px solid ${localFields[f.ek]?T.accent:T.border2}`,
                borderRadius:100, padding:"3px 14px", fontSize:11, fontWeight:600,
                color:localFields[f.ek]?T.accent:T.textMuted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              }}>
                {localFields[f.ek]?"Ativo":"Desativado"}
              </button>
            </div>
            {localFields[f.ek] && (<>
              <div style={{ marginBottom:8 }}>
                <label style={lbl}>Label do campo</label>
                <input type="text" value={localFields[f.lk]||""} onChange={e=>setFc(f.lk,e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Placeholder</label>
                <input type="text" value={localFields[f.pk]||""} onChange={e=>setFc(f.pk,e.target.value)} style={inp} />
              </div>
            </>)}
          </div>
        ))}
        <button onClick={()=>onSaveFieldsConfig(localFields)} style={{ ...btnP(), width:"100%" }}>Salvar campos</button>
      </>)}

      {card(<>
        {sectionTitle("Funcionalidades")}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:localDonation.enabled?16:0 }}>
          <div>
            <div style={{ fontSize:14, color:T.text, fontWeight:600 }}>Beneficio / Doacao</div>
            <div style={{ fontSize:12, color:T.textDim, marginTop:2 }}>Clientes prometem trazer itens em troca de beneficios. Ex: bombons, alimentos para doacao.</div>
          </div>
          <button type="button" onClick={()=>setDc("enabled",!localDonation.enabled)} style={{
            flexShrink:0, marginLeft:12, background:localDonation.enabled?T.accentDim:T.surface3,
            border:`1px solid ${localDonation.enabled?T.accent:T.border2}`,
            borderRadius:100, padding:"5px 16px", fontSize:12, fontWeight:600,
            color:localDonation.enabled?T.accent:T.textMuted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
          }}>
            {localDonation.enabled?"Ativo":"Desativado"}
          </button>
        </div>
        {localDonation.enabled && (<>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={lbl}>Nome do item (singular)</label>
              <input type="text" placeholder="Ex: caixa de bombom" value={localDonation.itemName||""} onChange={e=>setDc("itemName",e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Nome do item (plural)</label>
              <input type="text" placeholder="Ex: caixas de bombom" value={localDonation.itemNamePlural||""} onChange={e=>setDc("itemNamePlural",e.target.value)} style={inp} />
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Tiers de beneficio</label>
            {(localDonation.tiers||[]).map((tier,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                <input type="number" placeholder="Qtd" value={tier.qty} min="1"
                  onChange={e=>setDc("tiers",localDonation.tiers.map((t,j)=>j===i?{...t,qty:Number(e.target.value)}:t))}
                  onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
                  style={{ ...inp, width:70 }} />
                <input type="text" placeholder="Descricao do beneficio" value={tier.benefit}
                  onChange={e=>setDc("tiers",localDonation.tiers.map((t,j)=>j===i?{...t,benefit:e.target.value}:t))}
                  style={{ ...inp, flex:1 }} />
                <button onClick={()=>setDc("tiers",localDonation.tiers.filter((_,j)=>j!==i))}
                  style={{ background:T.redDim, border:"none", color:T.red, borderRadius:6, padding:"8px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>×</button>
              </div>
            ))}
            <button onClick={()=>setDc("tiers",[...(localDonation.tiers||[]),{qty:1,benefit:""}])}
              style={{ ...btnP(), background:T.surface3, color:T.text, width:"100%", marginTop:4 }}>
              + Adicionar tier
            </button>
          </div>
        </>)}
        <button onClick={()=>onSaveDonationConfig(localDonation)} style={{ ...btnP(), width:"100%", marginTop:localDonation.enabled?0:12 }}>
          Salvar funcionalidades
        </button>
      </>)}

      {card(<>
        {sectionTitle("Seguranca")}
        {[
          { k:"newPwd",  label:"Nova senha",           ph:"Minimo 6 caracteres" },
          { k:"confirm", label:"Confirmar nova senha", ph:"Repita a senha" },
        ].map(f=>(
          <div key={f.k} style={{ marginBottom:12 }}>
            <label style={lbl}>{f.label}</label>
            <PwdInput value={pwdForm[f.k]} placeholder={f.ph}
              onChange={e=>{ setPwdForm(p=>({...p,[f.k]:e.target.value})); setPwdErr("") }} />
          </div>
        ))}
        {pwdErr && <div style={{ fontSize:12, color:T.red, marginBottom:10 }}>{pwdErr}</div>}
        <button onClick={handleChangePwd} style={{ ...btnP(), width:"100%" }}>Alterar senha</button>
      </>)}

    </div>
  )
}
