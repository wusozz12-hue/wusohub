"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Report = {
id: string
reporter_id: string
target_type: "post" | "user"
target_post_id: string | null
target_user_id: string | null
reason: string
status: "open" | "reviewed" | "resolved"
created_at: string
}

export default function ReportsPage() {
const router = useRouter()
const [reports, setReports] = useState<Report[]>([])
const [loading, setLoading] = useState(true)
const [busy, setBusy] = useState<string | null>(null)

useEffect(() => {
loadReports()
}, [])

async function loadReports() {
const supabase = createClient()

```
const { data } = await supabase
  .from("reports")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(100)

setReports((data ?? []) as Report[])
setLoading(false)
```

}

async function updateStatus(
id: string,
status: "open" | "reviewed" | "resolved",
) {
setBusy(id)

```
const supabase = createClient()

const { error } = await supabase
  .from("reports")
  .update({ status })
  .eq("id", id)

if (!error) {
  setReports((current) =>
    current.map((report) =>
      report.id === id ? { ...report, status } : report,
    ),
  )
  router.refresh()
}

setBusy(null)
```

}

return ( <main className="mx-auto w-full max-w-5xl px-4 py-8"> <h1 className="text-3xl font-bold">Raporlar</h1>

```
  <p className="mt-2 text-muted-foreground">
    Kullanıcılar tarafından gönderilen raporlar.
  </p>

  <div className="mt-8 space-y-4">
    {loading ? (
      <div className="rounded-xl border border-border p-8 text-center">
        Yükleniyor...
      </div>
    ) : reports.length === 0 ? (
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

          <div className="mt-4 flex flex-wrap gap-2">
            {report.status === "open" && (
              <button
                onClick={() => updateStatus(report.id, "reviewed")}
                disabled={busy === report.id}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                {busy === report.id ? "İşleniyor..." : "İncelendi olarak işaretle"}
              </button>
            )}

            {report.status !== "resolved" && (
              <button
                onClick={() => updateStatus(report.id, "resolved")}
                disabled={busy === report.id}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {busy === report.id ? "İşleniyor..." : "Çözüldü"}
              </button>
            )}

            {report.status !== "open" && (
              <button
                onClick={() => updateStatus(report.id, "open")}
                disabled={busy === report.id}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Tekrar aç
              </button>
            )}
          </div>
        </div>
      ))
    )}
  </div>
</main>


)
}
