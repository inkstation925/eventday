function crc16(str) {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, "0")
}

export function genPixPayload(pixConfig, valor, txid = "***") {
  if (!pixConfig?.key) return null
  const f = (id, val) => { const v = String(val); return id + v.length.toString().padStart(2,"0") + v }
  const merchantInfo = f("00","br.gov.bcb.pix") + f("01", pixConfig.key)
  const safeTxid = txid.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***"
  const payload =
    f("00","01") +
    f("26", merchantInfo) +
    f("52","0000") +
    f("53","986") +
    (valor ? f("54", Number(valor).toFixed(2)) : "") +
    f("58","BR") +
    f("59", (pixConfig.holderName||"").substring(0,25).trim()) +
    f("60","Brasil") +
    f("62", f("05", safeTxid)) +
    "6304"
  return payload + crc16(payload)
}
