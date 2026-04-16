import { useState } from "react"
import { useParams } from "react-router-dom"
import { T } from "../utils/colors.js"
import { usePublicStudio } from "../hooks/usePublicStudio.js"
import { useBookings } from "../hooks/useBookings.js"
import { AgendaView } from "../components/public/AgendaView.jsx"
import { BookModal } from "../components/booking/BookModal.jsx"
import { Toast } from "../components/ui/Toast.jsx"

export function PublicAgendaPage() {
  const { slug } = useParams()
  const pub = usePublicStudio(slug)
  const bookingsHook = useBookings(pub.studio?.id, pub.event?.id)

  const [bookSlot,    setBookSlot]    = useState(null)
  const [isSubmitting,setIsSubmitting]= useState(false)
  const [toast,       setToast]       = useState("")

  // Load real-time bookings once event is known
  useState(() => {
    if (pub.event?.id) bookingsHook.loadBookings()
  }, [pub.event?.id])

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""), 2800) }

  const handleBook = async (form, slotId, sinalValor) => {
    setIsSubmitting(true)
    const result = await bookingsHook.addBooking(form, slotId, sinalValor)
    setIsSubmitting(false)
    if (!result.error) {
      showToast("Agendamento confirmado!")
      bookingsHook.loadBookings()
    }
    return result
  }

  // Load fonts
  useState(() => {
    const l = document.createElement("link")
    l.rel = "stylesheet"
    l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap"
    document.head.appendChild(l)
    document.body.style.fontFamily = "'DM Sans',sans-serif"
    document.body.style.margin = "0"
  }, [])

  if (pub.loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080808" }}>
      <div style={{ color:"#555", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Carregando...</div>
    </div>
  )

  if (pub.notFound) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080808" }}>
      <div style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>404</div>
        <div style={{ color:"#555", fontSize:14 }}>Evento não encontrado.</div>
      </div>
    </div>
  )

  // Merge public bookings with real-time bookings hook
  const allBookings = bookingsHook.bookings.length > 0 ? bookingsHook.bookings : pub.bookings

  return (
    <>
      <AgendaView
        event={pub.event}
        slots={pub.slots}
        bookings={allBookings}
        flashLink={pub.flashLink}
        studioName={pub.studioName || pub.studio?.name}
        onSelectSlot={slot => setBookSlot(slot)}
      />

      {bookSlot && (
        <BookModal
          slot={bookSlot}
          event={pub.event}
          onBook={handleBook}
          onClose={() => setBookSlot(null)}
          pixConfig={pub.pixConfig}
          donationConfig={pub.donationConfig}
          fieldsConfig={pub.fieldsConfig}
          isSubmitting={isSubmitting}
        />
      )}

      <Toast message={toast} />
    </>
  )
}
