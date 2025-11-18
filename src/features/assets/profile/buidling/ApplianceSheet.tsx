"use client"

import React from "react"
import Button from "@/components/ui/Button"

type Item = {
  id: string
  name: string
  count: number
}

type Props = {
  open: boolean
  initial?: Item[]
  onClose: () => void
  onApply: (items: Item[]) => void
}

export default function ApplianceSheet({ open, initial, onClose, onApply }: Props) {
  const [items, setItems] = React.useState<Item[]>(initial ?? [])
  const inputRefs = React.useRef<Record<string, HTMLInputElement | null>>({})
  const numberRefs = React.useRef<Record<string, HTMLInputElement | null>>({})

  React.useEffect(() => {
    setItems(initial ?? [])
    inputRefs.current = {}
    numberRefs.current = {}
  }, [initial, open])

  const addItem = () => {
    const id = String(Date.now())
    const newItem: Item = { id, name: "", count: 0 } // default 0
    setItems((s) => {
      const next = [...s, newItem]
      setTimeout(() => {
        inputRefs.current[id]?.focus()
        // also select (in case browser doesn't auto-select)
        inputRefs.current[id]?.select()
      }, 0)
      return next
    })
  }

  const handleApply = () => {
    // nama tidak boleh kosong
    const emptyName = items.find(it => (it.name || "").trim() === "")
    if (emptyName) {
      inputRefs.current[emptyName.id]?.focus()
      window.alert("Nama peralatan tidak boleh kosong. Silakan isi nama peralatan terlebih dahulu.")
      return
    }

    // jumlah harus >= 1
    const invalidQty = items.find(it => !Number.isFinite(it.count) || Number(it.count) < 1)
    if (invalidQty) {
      numberRefs.current[invalidQty.id]?.focus()
      window.alert(`Jumlah untuk "${invalidQty.name || "peralatan"}" harus minimal 1.`)
      return
    }

    onApply(items)
  }

  const updateItem = (id: string, patch: Partial<Item>) => {
    setItems((s) => s.map(it => it.id === id ? { ...it, ...patch } : it))
  }

  const removeItem = (id: string) => {
    setItems((s) => s.filter(it => it.id !== id))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={onClose} />
      
      {/* Bottom Sheet */}
      <div
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-3">
          <div className="text-center text-lg font-semibold text-black">Peralatan Listrik</div>
          <p className="mt-1 text-center text-sm text-black/60">
            Tambahkan jenis peralatan beserta jumlahnya
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-3 pb-4">
          <div className="space-y-3">
            {items.length === 0 && (
              <div className="text-sm text-black/60">Belum ada peralatan. Tambah melalui tombol di bawah.</div>
            )}

            <div className="space-y-3"> 
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-3 bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    ref={(el) => { inputRefs.current[item.id] = el }}
                    className="flex-1 min-w-0 rounded-lg border border-transparent px-3 py-2 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Nama peralatan (mis. Server)"
                    aria-label={`Nama peralatan ${item.name || ""}`}
                  />
 
                  <input
                    type="number"
                    value={String(item.count)}
                    onChange={(e) => {
                      // allow user to clear input while typing; treat empty as 0
                      const raw = e.target.value
                      const parsed = raw === "" ? 0 : Number(raw)
                      updateItem(item.id, { count: Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0 })
                    }}
                    onFocus={(e) => {
                      // select current value so typing replaces "0" automatically
                      try { e.currentTarget.select() } catch {}
                    }}
                    onBlur={(e) => {
                      // if user leaves it empty, ensure it becomes 0
                      if (e.currentTarget.value === "") updateItem(item.id, { count: 0 })
                    }}
                    ref={(el) => { numberRefs.current[item.id] = el }}
                    className="w-16 flex-shrink-0 text-right rounded-lg border border-gray-200 px-2 py-2 text-base text-black box-border"
                    aria-label={`Jumlah untuk ${item.name}`}
                    min={0}
                  />
 
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                    aria-label={`Hapus ${item.name}`}
                    title="Hapus"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
 
          {/* Add new */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 text-sm text-black/60">Klik &quot;Tambah&quot; untuk membuat input baru, lalu isi nama dan jumlah.</div>
            <button
              onClick={addItem}
              className="rounded-lg bg-[var(--color-primary)] p-3 text-white flex items-center justify-center"
              aria-label="Tambah peralatan"
              title="Tambah"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4" style={{ paddingBottom: "env(safe-area-inset-bottom,16px)" }}>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleApply}>Selesai</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
