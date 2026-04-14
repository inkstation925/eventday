import { T } from "../../utils/colors.js"

export function Overlay({ onClose, children }) {
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"#000000cc",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
      zIndex:1000, padding:"0 0 0 0",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background: T.surface, borderRadius:"16px 16px 0 0",
        padding: 24, width:"100%", maxWidth: 520,
        maxHeight:"90vh", overflowY:"auto",
        border:`1px solid ${T.border}`, borderBottom:"none",
      }}>
        {children}
      </div>
    </div>
  )
}
