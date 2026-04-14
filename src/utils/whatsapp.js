export function sendReminderWhatsApp(booking, slot, event, donationConfig, fieldsConfig) {
  const phone = (booking.phone||"").replace(/\D/g,"")
  if (!phone) return
  const fc = { bodyPartLabel:"Info adicional", bodyPartEnabled:false, sessionLabel:"Atendimento", ...fieldsConfig }
  const eventDate = event.date
    ? new Date(event.date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})
    : ""
  const parts = [
    `Ola, ${booking.name}!`,
    "",
    `Lembramos que seu agendamento no ${event.name} e amanha!`,
    "",
    "Detalhes:",
    `Data: ${eventDate}`,
    `Horario: ${slot.time}`,
    `Local: ${event.location||""}`,
    (fc.bodyPartEnabled && booking.bodyPart) ? `${fc.bodyPartLabel}: ${booking.bodyPart}` : "",
    "",
    "Lembre-se de:",
    "- Chegar com 10 min de antecedencia",
    "- Estar bem alimentado(a)",
    (booking.quantidade > 0 && donationConfig?.enabled)
      ? `- Trazer ${booking.quantidade} ${booking.quantidade===1?(donationConfig.itemName||"item"):(donationConfig.itemNamePlural||"itens")} para o beneficio!`
      : "",
    "",
    "Te esperamos! Em caso de duvidas, estamos a disposicao.",
  ].filter(Boolean)
  window.open("https://wa.me/55"+phone+"?text="+encodeURIComponent(parts.join("\n")),"_blank","noopener")
}
