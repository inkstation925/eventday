import { useEffect, useRef } from "react"

export function QRCodeCanvas({ text, size = 180 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!text) return
    const render = () => {
      if (!window.QRCode || !ref.current) return
      ref.current.innerHTML = ""
      new window.QRCode(ref.current, {
        text, width: size, height: size,
        colorDark: "#000000", colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M,
      })
    }
    if (!window.QRCode) {
      const s = document.createElement("script")
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"
      s.onload = render
      document.head.appendChild(s)
    } else {
      render()
    }
  }, [text, size])

  if (!text) return null
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"12px 0" }}>
      <div ref={ref} style={{
        background:"#fff", padding:8, borderRadius:8,
        display:"inline-block", lineHeight:0,
      }} />
    </div>
  )
}
