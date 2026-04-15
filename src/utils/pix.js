function crc16(str) {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0")
}

function sanitizeKey(key, type) {
  const k = (key || "").trim()
  if (type === "cpf" || type === "cnpj") return k.replace(/\D/g, "")
  if (type === "phone") {
    const d = k.replace(/\D/g, "")
    if (d.length === 13 && d.startsWith("55")) return `+${d}`
    if (d.length === 11) return `+55${d}`
    if (d.length === 10) return `+550${d}`
    return k  // keep as-is if uncertain
  }
  if (type === "email") return k.toLowerCase()
  return k  // evp/random: keep as-is
}

function stripAccents(str) {
  return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function genPixPayload(pixConfig, valor, txid = "***") {
  if (!pixConfig?.key) return null
  const f = (id, val) => { const v = String(val); return id + v.length.toString().padStart(2, "0") + v }
  const key  = sanitizeKey(pixConfig.key, pixConfig.keyType || "evp")
  const name = stripAccents(pixConfig.holderName || "").substring(0, 25).trim() || "Sem nome"
  const safeTxid = txid.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***"
  const merchantInfo = f("00", "br.gov.bcb.pix") + f("01", key)
  const payload =
    f("00", "01") +
    f("26", merchantInfo) +
    f("52", "0000") +
    f("53", "986") +
    (valor ? f("54", Number(valor).toFixed(2)) : "") +
    f("58", "BR") +
    f("59", name) +
    f("60", "Brasil") +
    f("62", f("05", safeTxid)) +
    "6304"
  return payload + crc16(payload)
}
