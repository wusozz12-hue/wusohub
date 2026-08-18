import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/server-data"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const me = await getCurrentProfile()
  if (!me) redirect("/auth/login")
  return <SettingsForm me={me} />
}
