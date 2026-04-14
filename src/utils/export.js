import { toMin } from "./slots.js"

const STATUS_LABELS = { pending:"Aguardando sinal", confirmed:"Confirmado", done:"Realizado", cancelled:"Cancelado" }

function esc(v) {
  return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}

function buildData(bookings, slots, donations, donationConfig, fieldsConfig, sinalValor) {
  const sorted = [...bookings].sort((a,b) => {
    const sa = slots.find(s=>s.id===a.slotId)
    const sb = slots.find(s=>s.id===b.slotId)
    return toMin(sa?.time) - toMin(sb?.time)
  })
  const confirmed = bookings.filter(b => b.status==="confirmed"||b.status==="done")
  const done      = bookings.filter(b => b.status==="done")
  const totalSinais  = confirmed.length * (sinalValor||50)
  const totalSessoes = done.reduce((a,b) => a+Number(b.sessao?.valorCobrado||0), 0)
  const totalDuracao = done.reduce((a,b) => a+Number(b.sessao?.duracao||0), 0)
  const totalItens   = donations.reduce((a,d) => a+Number(d.quantidade||0), 0)
  const itemName     = donationConfig?.itemName   || "item"
  const itemPlural   = donationConfig?.itemNamePlural || "itens"
  return { sorted, confirmed, done, totalSinais, totalSessoes, totalDuracao, totalItens, itemName, itemPlural }
}

export function exportXLS(bookings, slots, donations, event, donationConfig, fieldsConfig, sinalValor) {
  const { sorted, confirmed, done, totalSinais, totalSessoes, totalItens, itemPlural } =
    buildData(bookings, slots, donations, donationConfig, fieldsConfig, sinalValor)
  const fc = { bodyPartEnabled:true, bodyPartLabel:"Info adicional", field1Enabled:true, field1Label:"Campo 1", field2Enabled:true, field2Label:"Campo 2", sessionLabel:"Atendimento", ...fieldsConfig }
  const th = v => `<td style="border:1px solid #999;padding:5px 8px;background:#222;color:#fff;font-weight:bold;white-space:nowrap;">${esc(v)}</td>`
  const td = (v,bold) => `<td style="border:1px solid #ddd;padding:5px 8px;${bold?"font-weight:bold;background:#f5f5f5;":""}">${esc(v)}</td>`
  const sHdr = [
    "Nome","Telefone","Horário","Status",
    ...(fc.bodyPartEnabled ? [fc.bodyPartLabel] : []),
    "Sinal (R$)", `Valor ${fc.sessionLabel} (R$)`, "Duração (min)",
    ...(fc.field1Enabled ? [fc.field1Label] : []),
    ...(fc.field2Enabled ? [fc.field2Label] : []),
    ...(donationConfig?.enabled ? [`${itemPlural} prometidos`, `${itemPlural} recebidos`] : []),
    "Observações",
  ]
  const sRows = sorted.map(b => {
    const slot = slots.find(s=>s.id===b.slotId)
    const sinal = (b.status==="confirmed"||b.status==="done") ? (sinalValor||50) : 0
    return [
      b.name, b.phone, slot?.time||"", STATUS_LABELS[b.status]||b.status,
      ...(fc.bodyPartEnabled ? [b.bodyPart||""] : []),
      sinal, b.sessao?.valorCobrado||"", b.sessao?.duracao||"",
      ...(fc.field1Enabled ? [b.sessao?.field1||""] : []),
      ...(fc.field2Enabled ? [b.sessao?.field2||""] : []),
      ...(donationConfig?.enabled ? [b.quantidade||0, b.sessao?.itenRecebidos||0] : []),
      b.notes||(b.sessao?.obs||""),
    ]
  })
  let h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12px;}table{border-collapse:collapse;margin-bottom:20px;}h2{margin:16px 0 6px;font-size:14px;}</style></head><body>`
  h += `<h1 style="font-size:18px;margin-bottom:4px;">${esc(event.name)}</h1>`
  h += `<p style="color:#555;margin:0 0 20px;">Data: ${event.date} | Local: ${esc(event.location||"")} | Exportado em: ${new Date().toLocaleString("pt-BR")}</p>`
  h += `<h2>AGENDAMENTOS E ${fc.sessionLabel.toUpperCase()}S</h2><table><tr>${sHdr.map(th).join("")}</tr>`
  sRows.forEach(r => { h += `<tr>${r.map(v=>td(v)).join("")}</tr>` })
  h += `</table>`
  if (donationConfig?.enabled && donations.length > 0) {
    h += `<h2>${itemPlural.toUpperCase()}</h2><table><tr>${["Tipo","Nome","Quantidade","Observações","Data"].map(th).join("")}</tr>`
    donations.forEach(d => {
      h += `<tr>${[d.tipo==="cliente"?"Cliente":"Direta", d.nome, d.quantidade, d.obs||"", d.created_at?new Date(d.created_at).toLocaleString("pt-BR"):""].map(v=>td(v)).join("")}</tr>`
    })
    h += `</table>`
  }
  const sumRows = [
    ["Sinais arrecadados", `R$ ${totalSinais.toFixed(2)}`],
    [`Faturado em ${fc.sessionLabel.toLowerCase()}s`, `R$ ${totalSessoes.toFixed(2)}`],
    ["Total geral", `R$ ${(totalSinais+totalSessoes).toFixed(2)}`],
    ...(donationConfig?.enabled ? [[`Total de ${itemPlural}`, totalItens]] : []),
    [`${fc.sessionLabel}s realizados`, done.length],
    ["Agendamentos confirmados", confirmed.length],
  ]
  h += `<h2>RESUMO FINANCEIRO</h2><table>`
  sumRows.forEach(([k,v]) => { h += `<tr>${td(k,true)}${td(v)}</tr>` })
  h += `</table></body></html>`
  const blob = new Blob(["\uFEFF"+h], {type:"application/vnd.ms-excel;charset=utf-8"})
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
  a.download = `${(event.name||"evento").replace(/\s+/g,"-")}-${event.date}.xls`
  a.click(); URL.revokeObjectURL(a.href)
}

export function exportPDF(bookings, slots, donations, event, donationConfig, fieldsConfig, sinalValor, accent) {
  const { sorted, confirmed, done, totalSinais, totalSessoes, totalItens, totalDuracao, itemPlural } =
    buildData(bookings, slots, donations, donationConfig, fieldsConfig, sinalValor)
  const fc = { bodyPartEnabled:true, bodyPartLabel:"Info adicional", field1Enabled:true, field1Label:"Campo 1", field2Enabled:true, field2Label:"Campo 2", sessionLabel:"Atendimento", ...fieldsConfig }
  const sessionRows = sorted.map(b => {
    const slot = slots.find(s=>s.id===b.slotId)
    const sinal = (b.status==="confirmed"||b.status==="done") ? `R$ ${sinalValor||50}` : "—"
    return `<tr>
      <td>${b.name}</td><td>${b.phone}</td><td>${slot?.time||"—"}</td>
      <td>${STATUS_LABELS[b.status]||b.status}</td>
      ${fc.bodyPartEnabled?`<td>${b.bodyPart||"—"}</td>`:""}
      <td>${sinal}</td><td>${b.sessao?.valorCobrado?`R$ ${b.sessao.valorCobrado}`:"—"}</td>
      <td>${b.sessao?.duracao?b.sessao.duracao+" min":"—"}</td>
      ${fc.field1Enabled?`<td>${b.sessao?.field1||"—"}</td>`:""}
      ${fc.field2Enabled?`<td>${b.sessao?.field2||"—"}</td>`:""}
      ${donationConfig?.enabled?`<td>${b.quantidade||0}</td><td>${b.sessao?.itensRecebidos||0}</td>`:""}
      <td>${b.notes||b.sessao?.obs||"—"}</td>
    </tr>`
  }).join("")
  const donRows = donations.map(d => `<tr>
    <td>${d.tipo==="cliente"?"Cliente":"Direta"}</td><td>${d.nome}</td>
    <td>${d.quantidade}</td><td>${d.obs||"—"}</td>
    <td>${d.created_at?new Date(d.created_at).toLocaleString("pt-BR"):"—"}</td>
  </tr>`).join("")
  const ac = accent || "#e63946"
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${event.name}</title><style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:24px}
    h1{font-size:22px;color:${ac};letter-spacing:2px;margin-bottom:4px}
    h2{font-size:13px;color:${ac};margin:20px 0 8px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${ac};padding-bottom:4px}
    .sub{font-size:11px;color:#555;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:10px}
    th{background:${ac};color:#fff;padding:5px 7px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:0.5px}
    td{padding:5px 7px;border-bottom:1px solid #ddd}tr:nth-child(even) td{background:#f9f9f9}
    .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:8px 0 20px}
    .card{border:1px solid #ddd;border-radius:6px;padding:12px;text-align:center}
    .card-val{font-size:22px;font-weight:700;color:${ac}}
    .card-lbl{font-size:9px;color:#777;text-transform:uppercase;margin-top:3px}
    .print-btn{position:fixed;top:16px;right:16px;background:${ac};color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600}
    @media print{.print-btn{display:none}}
  </style></head><body>
  <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
  <h1>${event.name}</h1>
  <p class="sub">Data: ${event.date} | Local: ${event.location||""} | Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
  <div class="summary">
    <div class="card"><div class="card-val">R$ ${totalSinais.toFixed(2)}</div><div class="card-lbl">Sinais</div></div>
    <div class="card"><div class="card-val">R$ ${totalSessoes.toFixed(2)}</div><div class="card-lbl">${fc.sessionLabel}s</div></div>
    <div class="card"><div class="card-val">R$ ${(totalSinais+totalSessoes).toFixed(2)}</div><div class="card-lbl">Total</div></div>
    <div class="card"><div class="card-val">${done.length}</div><div class="card-lbl">Realizados</div></div>
    <div class="card"><div class="card-val">${confirmed.length}</div><div class="card-lbl">Confirmados</div></div>
    <div class="card"><div class="card-val">${totalDuracao} min</div><div class="card-lbl">Duração total</div></div>
    ${donationConfig?.enabled?`<div class="card"><div class="card-val">${totalItens}</div><div class="card-lbl">${itemPlural}</div></div>`:""}
  </div>
  <h2>Agendamentos e ${fc.sessionLabel}s</h2>
  <table><thead><tr>
    <th>Nome</th><th>Telefone</th><th>Horário</th><th>Status</th>
    ${fc.bodyPartEnabled?`<th>${fc.bodyPartLabel}</th>`:""}
    <th>Sinal</th><th>${fc.sessionLabel}</th><th>Duração</th>
    ${fc.field1Enabled?`<th>${fc.field1Label}</th>`:""}
    ${fc.field2Enabled?`<th>${fc.field2Label}</th>`:""}
    ${donationConfig?.enabled?`<th>Prom.</th><th>Rec.</th>`:""}
    <th>Obs.</th>
  </tr></thead><tbody>${sessionRows}</tbody></table>
  ${donationConfig?.enabled&&donations.length>0?`
  <h2>${itemPlural}</h2>
  <table><thead><tr><th>Tipo</th><th>Nome</th><th>Qtd</th><th>Obs.</th><th>Data</th></tr></thead>
  <tbody>${donRows}</tbody></table>`:""}
  </body></html>`
  const w = window.open("","_blank","width=1100,height=800")
  w.document.write(html); w.document.close()
}
