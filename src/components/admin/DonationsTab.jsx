import { useState } from "react"
import { T, btnP, inp, lbl } from "../../utils/colors.js"
import { Overlay } from "../ui/Overlay.jsx"

export function DonationsTab({ donations, bookings, donationConfig, onAddDonation }) {
  const dc = { itemName:"item", itemNamePlural:"itens", ...donationConfig }
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ nome:"", quantidade:1, obs:"" })

  const totalItens = donations.reduce((a,d) => a+Number(d.quantidade||0), 0)
  const deDireto   = donations.filter(d=>d.tipo==="doacao").reduce((a,d)=>a+Number(d.quantidade||0),0)
  const deClientes = donations.filter(d=>d.tipo==="cliente").reduce((a,d)=>a+Number(d.quantidade||0),0)

  const save = async () => {
    if (!form.nome.trim()) return
    await onAddDonation({ ...form, tipo:"doacao" })
    setModal(false)
    setForm({ nome:"", quantidade:1, obs:"" })
  }

  return (
    <div style={{ padding:"20px 16px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          [`Total de ${dc.itemNamePlural}`, totalItens, T.accent],
          ["De clientes", deClientes, T.green],
          ["Doacoes diretas", deDireto, "#f97316"],
        ].map(([l,v,c])=>(
          <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:c, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:10, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={()=>setModal(true)} style={{ ...btnP(), width:"100%", marginBottom:16 }}>
        + Registrar doacao direta
      </button>

      {donations.length === 0 && (
        <div style={{ textAlign:"center", color:T.textMuted, fontSize:13, padding:"32px 0" }}>
          Nenhuma doacao registrada ainda.
        </div>
      )}
      {donations.map(d => (
        <div key={d.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14, color:T.text }}>{d.nome}</div>
            <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>
              {d.tipo==="cliente" ? "Via agendamento" : "Doacao direta"}
              {d.obs && <span style={{ marginLeft:8, color:T.textDim }}>— {d.obs}</span>}
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"#f97316", lineHeight:1 }}>{d.quantidade}</div>
            <div style={{ fontSize:10, color:T.textMuted, textTransform:"uppercase" }}>{dc.itemName}{d.quantidade!==1?"s":""}</div>
          </div>
        </div>
      ))}

      {modal && (
        <Overlay onClose={()=>setModal(false)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, color:"#f97316", letterSpacing:"0.18em", marginBottom:4, textTransform:"uppercase" }}>Registrar doacao</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28 }}>Nova Doacao</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Nome do doador</label>
            <input type="text" value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))} style={inp} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Quantidade de {dc.itemNamePlural}</label>
            <input type="number" min="1" value={form.quantidade}
              onChange={e=>setForm(p=>({...p,quantidade:e.target.value}))}
              onKeyDown={e=>{ if(e.key==="ArrowUp"||e.key==="ArrowDown")e.preventDefault() }}
              style={{ ...inp, textAlign:"right" }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Observacoes</label>
            <input type="text" value={form.obs} onChange={e=>setForm(p=>({...p,obs:e.target.value}))} style={inp} />
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setModal(false)} style={{ ...btnP(), background:T.surface3, color:T.text, flex:1 }}>Cancelar</button>
            <button onClick={save} style={{ ...btnP(), flex:2 }}>Registrar</button>
          </div>
        </Overlay>
      )}
    </div>
  )
}
