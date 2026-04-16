import { useEffect } from "react"
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.js"
import { useStudio } from "../hooks/useStudio.js"
import { PublicAgendaPage } from "./PublicAgendaPage.jsx"
import { AdminPage } from "./AdminPage.jsx"
import { LoginScreen } from "../components/public/LoginScreen.jsx"
import { SignupScreen } from "../components/public/SignupScreen.jsx"
import { VerifyEmailScreen } from "../components/public/VerifyEmailScreen.jsx"
import { useState } from "react"

// ── Auth pages ──────────────────────────────────────────────
function LoginPage() {
  const { user, login, loading } = useAuth()
  const { studio, loadStudio }   = useStudio(user)
  const navigate = useNavigate()
  const [checking, setChecking]  = useState(false)

  // If already logged in, redirect to admin
  useEffect(() => {
    if (!user || checking) return
    setChecking(true)
    loadStudio().then(s => {
      if (s?.slug) navigate(`/${s.slug}/admin`, { replace: true })
      else navigate("/onboarding", { replace: true })
    })
  }, [user])

  if (loading || checking) return <LoadingScreen />

  const handleLogin = async (email, pwd) => {
    const { error } = await login(email, pwd)
    return { error }
  }

  return (
    <FontLoader>
      <LoginScreen onLogin={handleLogin} onGoSignup={() => navigate("/signup")} />
    </FontLoader>
  )
}

function SignupPage() {
  const { user, signup, resendVerification, loading } = useAuth()
  const navigate = useNavigate()
  const [pendingEmail, setPendingEmail] = useState("")

  useEffect(() => {
    if (user) navigate("/onboarding", { replace: true })
  }, [user])

  if (loading) return <LoadingScreen />

  const handleSignup = async (email, pwd) => {
    const { data, error } = await signup(email, pwd)
    if (!error && !data?.session) setPendingEmail(email)
    return { error }
  }

  if (pendingEmail) return (
    <FontLoader>
      <VerifyEmailScreen
        email={pendingEmail}
        onResend={resendVerification}
        onBack={() => { setPendingEmail(""); navigate("/login") }}
      />
    </FontLoader>
  )

  return (
    <FontLoader>
      <SignupScreen onSignup={handleSignup} onGoLogin={() => navigate("/login")} />
    </FontLoader>
  )
}

// ── Route guard ─────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true })
  }, [user, loading])

  if (loading || !user) return <LoadingScreen />
  return children
}

// ── Root redirect ────────────────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth()
  const { loadStudio }    = useStudio(user)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) { navigate("/login", { replace: true }); return }
    loadStudio().then(s => {
      if (s?.slug) navigate(`/${s.slug}/admin`, { replace: true })
      else navigate("/onboarding", { replace: true })
    })
  }, [user, loading])

  return <LoadingScreen />
}

// ── Shared helpers ───────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080808" }}>
      <div style={{ color:"#555", fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>Carregando...</div>
    </div>
  )
}

function FontLoader({ children }) {
  useEffect(() => {
    if (document.querySelector('link[href*="Bebas+Neue"]')) return
    const l = document.createElement("link")
    l.rel = "stylesheet"
    l.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap"
    document.head.appendChild(l)
    document.body.style.fontFamily = "'DM Sans',sans-serif"
    document.body.style.margin = "0"
  }, [])
  return children
}

// ── Router ───────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/"               element={<RootRedirect />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/signup"         element={<SignupPage />} />
      <Route path="/onboarding"     element={<RequireAuth><AdminPage onboarding /></RequireAuth>} />
      <Route path="/:slug"          element={<PublicAgendaPage />} />
      <Route path="/:slug/admin"    element={<RequireAuth><AdminPage /></RequireAuth>} />
    </Routes>
  )
}
