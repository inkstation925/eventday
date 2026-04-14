import { useState, useEffect, useCallback } from "react"
import { applyTheme, T } from "../utils/colors.js"
import { useAuth }      from "../hooks/useAuth.js"
import { useStudio }    from "../hooks/useStudio.js"
import { useConfig }    from "../hooks/useConfig.js"
import { useEvent }     from "../hooks/useEvent.js"
import { useBookings }  from "../hooks/useBookings.js"
import { useDonations } from "../hooks/useDonations.js"
import { sendReminderWhatsApp } from "../utils/whatsapp.js"
import { genSlots } from "../utils/slots.js"

import { LoginScreen }       from "../components/public/LoginScreen.jsx"
import { SignupScreen }      from "../components/public/SignupScreen.jsx"
import { VerifyEmailScreen } from "../components/public/VerifyEmailScreen.jsx"
import { OnboardingWizard }  from "../components/public/OnboardingWizard.jsx"
import { AgendaView }        from "../components/public/AgendaView.jsx"
import { Toast }             from "../components/ui/Toast.jsx"
import { BookModal }         from "../components/booking/BookModal.jsx"
import { EditModal }         from "../components/booking/EditModal.jsx"
import { SessionModal }      from "../components/booking/SessionModal.jsx"
import { BookingsTab }       from "../components/admin/BookingsTab.jsx"
import { DonationsTab }      from "../components/admin/DonationsTab.jsx"
import { SummaryTab }        from "../components/admin/SummaryTab.jsx"
import { SlotsTab }          from "../components/admin/SlotsTab.jsx"
import { SettingsTab }       from "../components/admin/SettingsTab.jsx"

const ADMIN_TABS = ["bookings","doacoes","resumo","slots","settings"]
const ADMIN_TAB_LABELS = { bookings:"Agendamentos", doacoes:"Doacoes", resumo:"Resumo", slots:"Slots", settings:"Config" }

export default function App() {
  const { user, loading: authLoading, login, signup, logout, updatePassword, resendVerification } = useAuth()
  const { studio, loadStudio, createStudio, updateStudio } = useStudio(user)
  const config = useConfig(studio?.id)
  const eventHook = useEvent(studio?.id)
  const bookingsHook = useBookings(studio?.id, eventHook.event?.id)
  const donationsHook = useDonations(studio?.id, eventHook.event?.id)

  // UI state
  const [authScreen, setAuthScreen]   = useState("login") // "login" | "signup"
  const [pendingEmail, setPendingEmail] = useState("")
  const [view, setView]               = useState("agenda")  // "agenda" | "admin"
  const [adminTab, setAdminTab]       = useState("bookings")
  const [onboarding, setOnboarding]   = useState(false)
  const [bookSlot, setBookSlot]       = useState(null)
  const [editBooking, setEditBooking] = useState(null)
  const [sessionBooking, setSessionBooking] = useState(null)
  const [isEditSession, setIsEditSession]   = useState(false)
  const [isSubmitting, setIsSubmitting]     = useState(false)
  const [sortBy, setSortBy]           = useState("time")
  const [filterSt, setFilterSt]       = useState("all")
  const [search, setSearch]           = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toast, setToast]             = useState("")
  const [appReady, setAppReady]       = useState(false)

  const showToast = useCallback((msg, ms=2800) => {
    setToast(msg)
    setTimeout(() => setToast(""), ms)
  }, [])

  // Load fonts
  useEffect(() => {
    const l = document.createElement("link")
    l.rel="stylesheet"; l.href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap"
    document.head.appendChild(l)
  }, [])

  // Apply theme whenever colors change
  applyTheme(config.accentColor, config.bgColor)
  document.body.style.fontFamily = "'DM Sans',sans-serif"
  document.body.style.margin = "0"

  // Step 1: load studio when user is available
  useEffect(() => {
    if (!user) return
    loadStudio().then(s => {
      if (!s) setOnboarding(true)
    })
  }, [user])

  // Step 2: load config + event once studio is known (fires on refresh too)
  useEffect(() => {
    if (!studio?.id) return
    Promise.all([config.loadConfig(), eventHook.loadEvent()])
      .then(() => setAppReady(true))
  }, [studio?.id])

  // Step 3: load bookings & donations after event loads
  useEffect(() => {
    if (!eventHook.event?.id) return
    bookingsHook.loadBookings()
    donationsHook.loadDonations()
  }, [eventHook.event?.id])

  // Realtime
  useEffect(() => {
    return bookingsHook.subscribeRealtime(b => {
      showToast(`Novo agendamento: ${b.name}`)
    })
  }, [eventHook.event?.id])

  // Update title when studioName loads
  useEffect(() => {
    if (config.studioName) document.title = config.studioName
  }, [config.studioName])

  // ── Auth handlers ──
  const handleLogin = async (email, pwd) => {
    const { error } = await login(email, pwd)
    return { error }
  }

  const handleSignup = async (email, pwd) => {
    const { data, error } = await signup(email, pwd)
    if (!error && !data?.session) setPendingEmail(email)  // session = null means email confirmation required
    return { error }
  }

  const handleOnboardingFinish = async (form) => {
    const { data: s } = await createStudio(form.studioName)
    if (!s) return
    // studio?.id will update via re-render, trigger load manually here
    await config.loadConfig()
    await config.saveStudioName(form.studioName)
    await config.saveColors(form.accent, form.bg)
    if (form.pixKey) await config.savePix({ key:form.pixKey, keyType:form.pixKeyType, holderName:form.pixHolder, bank:"" })
    const evForm = { name:form.eventName||"Meu Evento", date:"", location:form.city, startTime:"10:00", endTime:"20:00", interval:30, capacity:3 }
    const { eventId } = await eventHook.saveEvent(evForm)
    if (eventId) {
      const initialSlots = genSlots(evForm.startTime, evForm.endTime, evForm.interval)
      await eventHook.saveSlots(initialSlots, eventId)
    }
    setOnboarding(false)
    setAppReady(true)
    showToast("Bem-vindo! Configure seu evento nas Configuracoes.")
  }

  // ── Booking handlers ──
  const handleBook = async (form, slotId, sinalValor) => {
    setIsSubmitting(true)
    const result = await bookingsHook.addBooking(form, slotId, sinalValor)
    setIsSubmitting(false)
    if (!result.error) donationsHook.loadDonations()
    return result
  }

  const handleConfirmSinal = async (id) => {
    await bookingsHook.confirmSinal(id)
    showToast("Sinal confirmado!")
  }

  const handleOpenSession = (booking, edit=false) => {
    setSessionBooking(booking)
    setIsEditSession(edit)
  }

  const handleSaveSession = async (id, sessao) => {
    await bookingsHook.closeSession(id, sessao)
    if (!isEditSession) {
      const b = bookingsHook.bookings.find(x=>x.id===id)
      if (b && b.quantidade > 0 && config.donationConfig?.enabled) {
        await donationsHook.addDonation({ bookingId:id, tipo:"cliente", nome:b.name, quantidade:b.quantidade, obs:"" })
        await donationsHook.loadDonations()
      }
    }
    setSessionBooking(null)
    showToast(isEditSession ? "Atendimento atualizado!" : "Atendimento concluido!")
  }

  const handleSaveEdit = async (id, updates) => {
    await bookingsHook.updateBooking(id, updates)
    setEditBooking(null)
    showToast("Agendamento atualizado!")
  }

  const handleDeleteBooking = async (id) => {
    await bookingsHook.deleteBooking(id)
    setConfirmDeleteId(null)
    showToast("Agendamento removido.")
  }

  const handleSendReminder = (booking) => {
    const slot = eventHook.slots.find(s=>s.id===booking.slotId)
    if (slot) sendReminderWhatsApp(booking, slot, eventHook.event, config.donationConfig, config.fieldsConfig)
  }

  // ── Loading ──
  if (authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080808" }}>
      <div style={{ color:"#555", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Carregando...</div>
    </div>
  )

  // ── Not logged in ──
  if (!user) {
    if (pendingEmail) return (
      <VerifyEmailScreen
        email={pendingEmail}
        onResend={resendVerification}
        onBack={() => { setPendingEmail(""); setAuthScreen("login") }}
      />
    )
    return authScreen==="signup"
      ? <SignupScreen onSignup={handleSignup} onGoLogin={()=>setAuthScreen("login")} />
      : <LoginScreen  onLogin={handleLogin}  onGoSignup={()=>setAuthScreen("signup")} studioName={config.studioName} />
  }

  // ── Onboarding ──
  if (onboarding) return <OnboardingWizard onFinish={handleOnboardingFinish} />

  // ── Public agenda ──
  if (view === "agenda") return (
    <>
      <AgendaView
        event={eventHook.event}
        slots={eventHook.slots}
        bookings={bookingsHook.bookings}
        flashLink={config.flashLink}
        studioName={config.studioName || studio?.name}
        onSelectSlot={slot => setBookSlot(slot)}
      />

      {/* Admin button */}
      <button
        onClick={() => setView("admin")}
        style={{
          position:"fixed", bottom:20, right:20,
          background:T.surface, border:`1px solid ${T.border}`,
          borderRadius:10, padding:"10px 16px", cursor:"pointer",
          fontSize:12, color:T.textMuted, fontFamily:"'DM Sans',sans-serif",
          zIndex:100,
        }}
      >
        Admin
      </button>

      {bookSlot && (
        <BookModal
          slot={bookSlot}
          event={eventHook.event}
          onBook={handleBook}
          onClose={() => setBookSlot(null)}
          pixConfig={config.pixConfig}
          donationConfig={config.donationConfig}
          fieldsConfig={config.fieldsConfig}
          isSubmitting={isSubmitting}
        />
      )}
      <Toast message={toast} />
    </>
  )

  // ── Admin panel ──
  return (
    <>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        {/* Header */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 16px", borderBottom:`1px solid ${T.border}`,
          position:"sticky", top:0, background:T.bg, zIndex:10,
        }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:"0.08em" }}>
            {(config.studioName||studio?.name||"EventDay").split(" ").map((w,i)=>(
              <span key={i} style={{ color:i===0?T.accent:T.text }}>{i>0?" ":""}{w}</span>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={()=>setView("agenda")} style={{ background:"transparent", border:"none", color:T.textMuted, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Ver site
            </button>
            <button onClick={logout} style={{ background:"transparent", border:"none", color:T.textDim, fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, overflowX:"auto" }}>
          {ADMIN_TABS.filter(t => t==="doacoes" ? config.donationConfig?.enabled : true).map(tab => (
            <button key={tab} onClick={()=>setAdminTab(tab)} style={{
              flex:"0 0 auto", background:"none", border:"none",
              borderBottom:`2px solid ${adminTab===tab?T.accent:"transparent"}`,
              color:adminTab===tab?T.accent:T.textMuted, padding:"12px 16px",
              fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              transition:"color 0.15s",
            }}>
              {ADMIN_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {adminTab==="bookings" && (
          <BookingsTab
            bookings={bookingsHook.bookings} slots={eventHook.slots}
            donationConfig={config.donationConfig} fieldsConfig={config.fieldsConfig}
            sortBy={sortBy} setSortBy={setSortBy}
            filterSt={filterSt} setFilterSt={setFilterSt}
            search={search} setSearch={setSearch}
            onEdit={b=>setEditBooking(b)}
            onConfirm={handleConfirmSinal}
            onConcluir={(b,edit)=>handleOpenSession(b,edit)}
            onReminder={handleSendReminder}
            onDelete={id=>setConfirmDeleteId(id)}
          />
        )}
        {adminTab==="doacoes" && config.donationConfig?.enabled && (
          <DonationsTab
            donations={donationsHook.donations}
            bookings={bookingsHook.bookings}
            donationConfig={config.donationConfig}
            onAddDonation={donationsHook.addDonation}
          />
        )}
        {adminTab==="resumo" && (
          <SummaryTab
            bookings={bookingsHook.bookings} slots={eventHook.slots}
            donations={donationsHook.donations} event={eventHook.event}
            donationConfig={config.donationConfig} fieldsConfig={config.fieldsConfig}
            accentColor={config.accentColor}
          />
        )}
        {adminTab==="slots" && (
          <SlotsTab
            slots={eventHook.slots} bookings={bookingsHook.bookings}
            event={eventHook.event}
            onToggleBlocked={eventHook.toggleSlotBlocked}
            onRegenerate={eventHook.regenerateSlots}
          />
        )}
        {adminTab==="settings" && (
          <SettingsTab
            event={eventHook.event}
            pixConfig={config.pixConfig}
            flashLink={config.flashLink}
            accentColor={config.accentColor}
            bgColor={config.bgColor}
            fieldsConfig={config.fieldsConfig}
            donationConfig={config.donationConfig}
            studioName={config.studioName}
            onSaveEvent={async (form) => { await eventHook.saveEvent(form); showToast("Evento salvo!") }}
            onSavePix={async (pix) => { await config.savePix(pix); showToast("PIX salvo!") }}
            onSaveFlashLink={async (link) => { await config.saveFlashLink(link); showToast("Link salvo!") }}
            onSaveColors={async (a,b) => { await config.saveColors(a,b); showToast("Cores salvas!") }}
            onSaveFieldsConfig={async (fc) => { await config.saveFieldsConfig(fc); showToast("Campos salvos!") }}
            onSaveDonationConfig={async (dc) => { await config.saveDonationConfig(dc); showToast("Configuracao salva!") }}
            onSaveStudioName={async (name) => { await config.saveStudioName(name); document.title=name; showToast("Nome salvo!") }}
            onChangePassword={updatePassword}
          />
        )}
      </div>

      {/* Modals */}
      {editBooking && (
        <EditModal
          booking={editBooking} slots={eventHook.slots}
          onSave={handleSaveEdit}
          onClose={() => setEditBooking(null)}
          onRequestCancel={() => setConfirmDeleteId(editBooking.id)}
          fieldsConfig={config.fieldsConfig}
        />
      )}
      {sessionBooking && (
        <SessionModal
          booking={sessionBooking} slots={eventHook.slots}
          onSave={handleSaveSession}
          onClose={() => setSessionBooking(null)}
          isEdit={isEditSession}
          donationConfig={config.donationConfig}
          fieldsConfig={config.fieldsConfig}
        />
      )}
      {confirmDeleteId && (
        <div onClick={()=>setConfirmDeleteId(null)} style={{ position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:28,maxWidth:340,width:"90%" }}>
            <div style={{ fontSize:16,fontWeight:600,color:T.text,marginBottom:8 }}>Confirmar exclusao</div>
            <div style={{ fontSize:13,color:T.textMuted,marginBottom:20 }}>Tem certeza que deseja excluir este agendamento? Esta acao nao pode ser desfeita.</div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirmDeleteId(null)} style={{ flex:1,background:T.surface3,border:"none",borderRadius:8,padding:"10px",color:T.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13 }}>Cancelar</button>
              <button onClick={()=>handleDeleteBooking(confirmDeleteId)} style={{ flex:2,background:T.redDim,border:`1px solid ${T.red}40`,borderRadius:8,padding:"10px",color:T.red,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600 }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} />
    </>
  )
}
