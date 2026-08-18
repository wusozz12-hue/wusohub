import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/server-data"
import { CreatePostForm } from "@/components/create-post-form"

export default async function CreatePage() {
  const me = await getCurrentProfile()
  if (!me) redirect("/auth/login")

  return <CreatePostForm me={me} />
}
