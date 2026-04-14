import { T } from "../../utils/colors.js"

export function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      background:T.surface, border:`1px solid ${T.border}`,
      borderRadius:10, padding:"12px 20px", fontSize:13, color:T.text,
      zIndex:9999, boxShadow:"0 4px 24px #0008", whiteSpace:"nowrap",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      {message}
    </div>
  )
}
