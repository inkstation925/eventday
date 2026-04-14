import { useMemo } from "react"
import { T, inp } from "../../utils/colors.js"
import { BChip } from "../ui/Chips.jsx"
import { toMin } from "../../utils/slots.js"

const STATUS_LABELS = { pending:"Aguardando sinal", confirmed:"Confirmado", done:"Realizado", cancelled:"Cancelado" }
const STATUS_FILTERS = ["all","pending","confirmed","done","cancelled"]
const STATUS_FILTER_LABELS = { all:"Todos", pending:"Aguardando", confirmed:"Confirmados", done:"Realizados", cancelled:"Cancelados" }

export function BookingsTab({ bookings, slots, donationConfig, fieldsConfig, sortBy, setSortBy, filterSt, setFilterSt, search, setSearch, onEdit, onConfirm, onConcluir, onReminder, onDelete }) {
  const fc = { bodyPartEnabled:false, bodyPartLabel:"Info", field1Enabled:false, field1Label:"Campo 1", field2Enabled:false, field2Label:"Campo 2", sessionLabel:"Atendimento", ...fieldsConfig }
  const dc = { enabled:false, itemNamePlural:"itens", ...donationConfig }

  const filtered = useMemo(() => {
    let list = [...bookings]
    if (filterSt !== "all") list = list.filter(b => b.status===filterSt)
    if (search.trim()) list = list.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    if (sortBy==="time") list.sort((a,b) => {
      const sa=slots.find(s=>s.id===a.slotId), sb=slots.find(s=>s.id===b.slotId)
      return toMin(sa?.time||"0:0") - toMin(sb?.time||"0:0")
    })
    else if (sortBy==="newest") list.sort((a,b) => new Date(b.createdAt).getTime()||0 - new Date(a.createdAt).getTime()||0)
    else if (sortBy==="oldest") list.sort((a,b) => new Date(a.createdAt).getTime()||0 - new Date(b.createdAt).getTime()||0)
    return list
  }, [bookings, filterSt, search, sortBy, slots])

  const total    = bookings.length
  const confirmed = bookings.filter(b=>b.status==="confirmed"||b.status==="done").length
  const done     = bookings.filter(b=>b.status==="done").length

  return (
    <div style={{ padding:"20px 16px" }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[["Total",total,"#888"],["Confirmados",confirmed,T.green],["Realizados",done,"#60a5fa"]].map(([l,v,c])=>(
          <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:c, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:10, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <input type="text" placeholder="Buscar por nome..." value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{ ...inp, flex:1, minWidth:160 }} />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ ...inp, width:"auto" }}>
          <option value="time">Por horario</option>
          <option value="newest">Mais recente</option>
          <option value="oldest">Mais antigo</option>
        </select>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={()=>setFilterSt(s)} style={{
            background:filterSt===s?T.accentDim:T.surface3,
            border:`1px solid ${filterSt===s?T.accent:T.border2}`,
            borderRadius:100, padding:"4px 14px", fontSize:11, fontWeight:600,
            color:filterSt===s?T.accent:T.textMuted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
          }}>
            {STATUS_FILTER_LABELS[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 && (
        <div style={{ textAlign:"center", color:T.textMuted, fontSize:13, padding:"40px 0" }}>
          Nenhum agendamento encontrado.
        </div>
      )}
      {filtered.map(b => {
        const slot = slots.find(s=>s.id===b.slotId)
        return (
          <div key={b.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:15, color:T.text }}>{b.name}</div>
                <div style={{ fontSize:12, color:T.textMuted, display:"flex", gap:12, flexWrap:"wrap", marginTop:2 }}>
                  <span>{b.phone}</span>
                  {slot && <span style={{ color:T.accent }}>Hora: {slot.time}</span>}
                  {fc.bodyPartEnabled && b.bodyPart && <span>{fc.bodyPartLabel}: {b.bodyPart}</span>}
                  {dc.enabled && b.quantidade>0 && <span style={{ color:T.accent }}>{dc.itemNamePlural}: {b.quantidade}</span>}
                </div>
                {b.notes && <div style={{ fontSize:12, color:T.textDim, marginTop:3, fontStyle:"italic" }}>"{b.notes}"</div>}
                {b.sessao && (
                  <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
                    {b.sessao.valorCobrado && <span style={{ fontSize:11, background:"#0d2618", color:T.green, borderRadius:100, padding:"2px 8px" }}>R$ {b.sessao.valorCobrado}</span>}
                    {b.sessao.duracao && <span style={{ fontSize:11, background:T.surface3, color:T.textMuted, borderRadius:100, padding:"2px 8px" }}>{b.sessao.duracao} min</span>}
                    {fc.field1Enabled && b.sessao.field1 && <span style={{ fontSize:11, background:T.surface3, color:T.textMuted, borderRadius:100, padding:"2px 8px" }}>{fc.field1Label}: {b.sessao.field1}</span>}
                    {fc.field2Enabled && b.sessao.field2 && <span style={{ fontSize:11, background:T.surface3, color:T.textMuted, borderRadius:100, padding:"2px 8px" }}>{fc.field2Label}: {b.sessao.field2}</span>}
                  </div>
                )}
              </div>
              <BChip status={b.status} />
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
              {b.status==="pending" && (
                <button onClick={()=>onConfirm(b.id)} style={{ fontSize:11, background:"#0d2618", border:`1px solid ${T.green}40`, color:T.green, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                  Confirmar sinal
                </button>
              )}
              {(b.status==="confirmed"||b.status==="done") && (
                <button onClick={()=>onConcluir(b, b.status==="done")} style={{ fontSize:11, background:"#0d1826", border:"1px solid #60a5fa40", color:"#60a5fa", borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                  {b.status==="done" ? `Editar ${fc.sessionLabel}` : `Concluir ${fc.sessionLabel}`}
                </button>
              )}
              <button onClick={()=>onReminder(b)} style={{ fontSize:11, background:T.surface3, border:`1px solid ${T.border2}`, color:T.textMuted, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Lembrete
              </button>
              <button onClick={()=>onEdit(b)} style={{ fontSize:11, background:T.surface3, border:`1px solid ${T.border2}`, color:T.textMuted, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Editar
              </button>
              <button onClick={()=>onDelete(b.id)} style={{ fontSize:11, background:T.redDim, border:`1px solid ${T.red}40`, color:T.red, borderRadius:6, padding:"4px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Excluir
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
