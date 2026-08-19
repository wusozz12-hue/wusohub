import { redirect } from "next/navigation"
import { getCurrentProfile } from "@/lib/server-data"
import { createClient } from "@/lib/supabase/server"

export default async function ReportsPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (!profile.is_founder) {
    redirect("/")
  }

  const supabase = await createClient()

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">Raporlar</h1>

      <p className="mt-2 text-muted-foreground">
        Kullanıcılar tarafından gönderilen raporlar.
      </p>

      <div className="mt-8 space-y-4">
        {!reports || reports.length === 0 ? (
          <div className="rounded-xl border border-border p-8 text-center">
            <p className="font-medium">Henüz rapor yok.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Yeni raporlar burada görünecek.
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">
                  {report.target_type === "user"
                    ? "Kullanıcı bildirimi"
                    : "Gönderi bildirimi"}
                </h2>

                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  {report.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Sebep: {report.reason}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(report.created_at).toLocaleString("tr-TR")}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

