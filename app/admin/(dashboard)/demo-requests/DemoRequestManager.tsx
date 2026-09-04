'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDemoRequest } from '@/app/actions/admin'
import { type DemoRequest } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { AdminModal } from '../AdminModal'
import { Trash2, Eye, Mail, Clock, Phone, Building2, CalendarDays } from 'lucide-react'

interface DemoRequestManagerProps {
  initialDemoRequests: DemoRequest[]
}

export function DemoRequestManager({ initialDemoRequests }: DemoRequestManagerProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<DemoRequest[]>(initialDemoRequests)
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null)
  const [, startTransition] = useTransition()

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Apakah Anda yakin ingin menghapus data permintaan demo ini?')) {
      return
    }

    try {
      const res = await deleteDemoRequest(id)
      if (res.success) {
        setRequests(requests.filter((r) => r.id !== id))
        if (selectedRequest?.id === id) {
          setSelectedRequest(null)
        }
        startTransition(() => {
          router.refresh()
        })
      } else {
        alert(res.error || 'Gagal menghapus permintaan demo')
      }
    } catch {
      alert('Terjadi kesalahan koneksi')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Permintaan Demo
        </h2>
        <p className="text-sm text-muted-foreground">
          Tinjau permintaan demo produk, jadwal pilihan, dan prospek bisnis yang masuk dari halaman demo.
        </p>
      </div>

      {/* Demo requests list table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Belum ada permintaan demo yang masuk saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Pemohon</th>
                  <th className="px-6 py-4">Perusahaan / Kontak</th>
                  <th className="px-6 py-4">Produk Pilihan</th>
                  <th className="px-6 py-4">Waktu Pilihan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 text-sm text-foreground">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {req.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {req.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {req.company ? (
                          <span className="font-medium text-foreground text-sm flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {req.company}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Personal</span>
                        )}
                        {req.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {req.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {req.productInterest ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {req.productInterest}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">Umum</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {req.preferredTime && (
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-primary" />
                            {req.preferredTime}
                          </span>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(req.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRequest(req)
                          }}
                          aria-label={`Lihat detail permintaan demo dari ${req.name}`}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(req.id, e)}
                          aria-label={`Hapus permintaan demo dari ${req.name}`}
                          className="h-8 w-8 text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <AdminModal
          open={!!selectedRequest}
          onOpenChange={(open) => {
            if (!open) setSelectedRequest(null)
          }}
          title={
            <>
              <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
              Detail Permintaan Demo
            </>
          }
          footer={
            <>
              <Button
                variant="outline"
                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                onClick={(e) => handleDelete(selectedRequest.id, e)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Permintaan
              </Button>
              <Button type="button" onClick={() => setSelectedRequest(null)}>
                Tutup
              </Button>
            </>
          }
        >
            <div className="space-y-4 text-sm text-foreground">
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 border-b border-border/80 pb-4">
                <span className="text-muted-foreground font-semibold">Nama Pemohon</span>
                <span className="col-span-2 font-bold">{selectedRequest.name}</span>

                <span className="text-muted-foreground font-semibold">Alamat Email</span>
                <a
                  href={`mailto:${selectedRequest.email}`}
                  className="col-span-2 text-primary hover:underline font-medium break-all"
                >
                  {selectedRequest.email}
                </a>

                <span className="text-muted-foreground font-semibold">Nomor Telepon</span>
                {selectedRequest.phone ? (
                  <a
                    href={`tel:${selectedRequest.phone}`}
                    className="col-span-2 text-primary hover:underline font-medium"
                  >
                    {selectedRequest.phone}
                  </a>
                ) : (
                  <span className="col-span-2 text-muted-foreground italic">Tidak dicantumkan</span>
                )}

                <span className="text-muted-foreground font-semibold">Perusahaan</span>
                <span className="col-span-2">
                  {selectedRequest.company || <span className="text-muted-foreground italic">Personal / Tidak dicantumkan</span>}
                </span>

                <span className="text-muted-foreground font-semibold">Produk Pilihan</span>
                <span className="col-span-2">
                  {selectedRequest.productInterest ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {selectedRequest.productInterest}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-medium text-xs">Umum</span>
                  )}
                </span>

                <span className="text-muted-foreground font-semibold">Waktu Pilihan</span>
                <span className="col-span-2 font-medium">
                  {selectedRequest.preferredTime || <span className="text-muted-foreground italic">Tidak ditentukan</span>}
                </span>

                <span className="text-muted-foreground font-semibold">Tanggal Kirim</span>
                <span className="col-span-2 text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(selectedRequest.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>
              </div>
            </div>
        </AdminModal>
      )}
    </div>
  )
}
