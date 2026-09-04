'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLead } from '@/app/actions/admin'
import { type Lead } from '@/lib/lead-sink'
import { Button } from '@/components/ui/button'
import { AdminModal } from '../AdminModal'
import { Trash2, Eye, Mail, Clock } from 'lucide-react'

interface LeadManagerProps {
  initialLeads: Lead[]
}

export function LeadManager({ initialLeads }: LeadManagerProps) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [, startTransition] = useTransition()

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pesan masuk ini?')) {
      return
    }

    try {
      const res = await deleteLead(id)
      if (res.success) {
        setLeads(leads.filter((l) => l.id !== id))
        if (selectedLead?.id === id) {
          setSelectedLead(null)
        }
        startTransition(() => {
          router.refresh()
        })
      } else {
        alert(res.error || 'Gagal menghapus lead')
      }
    } catch {
      alert('Terjadi kesalahan koneksi')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Pesan Masuk (Leads)
        </h2>
        <p className="text-sm text-muted-foreground">
          Tinjau pesan, pertanyaan, dan prospek bisnis yang masuk dari formulir hubungi kami.
        </p>
      </div>

      {/* Leads list table */}
      <div className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Belum ada pesan masuk dari pengunjung website saat ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Pengirim</th>
                  <th className="px-6 py-4">Tanggal Masuk</th>
                  <th className="px-6 py-4">Produk Pilihan</th>
                  <th className="px-6 py-4 hidden md:table-cell">Isi Pesan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80 text-sm text-foreground">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {lead.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {new Date(lead.receivedAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.productSlug ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          {lead.productSlug}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          Umum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell max-w-xs truncate text-muted-foreground">
                      {lead.message}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLead(lead)
                          }}
                          aria-label={`Lihat detail pesan dari ${lead.name}`}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(lead.id, e)}
                          aria-label={`Hapus pesan dari ${lead.name}`}
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
      {selectedLead && (
        <AdminModal
          open={!!selectedLead}
          onOpenChange={(open) => {
            if (!open) setSelectedLead(null)
          }}
          title={
            <>
              <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
              Detail Pesan Masuk
            </>
          }
          footer={
            <>
              <Button
                variant="outline"
                className="text-destructive border-destructive/20 hover:bg-destructive/5"
                onClick={(e) => handleDelete(selectedLead.id, e)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Pesan
              </Button>
              <Button type="button" onClick={() => setSelectedLead(null)}>
                Tutup
              </Button>
            </>
          }
        >
            <div className="space-y-4 text-sm text-foreground">
              {/* Sender info */}
              <div className="grid grid-cols-3 gap-2 border-b border-border/80 pb-4">
                <span className="text-muted-foreground font-semibold">Nama Pengirim</span>
                <span className="col-span-2 font-bold">{selectedLead.name}</span>
                
                <span className="text-muted-foreground font-semibold">Alamat Email</span>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="col-span-2 text-primary hover:underline font-medium break-all"
                >
                  {selectedLead.email}
                </a>

                <span className="text-muted-foreground font-semibold">Topik/Produk</span>
                <span className="col-span-2">
                  {selectedLead.productSlug ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {selectedLead.productSlug}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-medium text-xs">Umum</span>
                  )}
                </span>

                <span className="text-muted-foreground font-semibold">Waktu Kirim</span>
                <span className="col-span-2 text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(selectedLead.receivedAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <span className="text-muted-foreground font-semibold block">Isi Pesan:</span>
                <p className="p-4 bg-muted/30 border border-border/60 rounded-xl leading-relaxed whitespace-pre-wrap text-foreground">
                  {selectedLead.message}
                </p>
              </div>
            </div>
        </AdminModal>
      )}
    </div>
  )
}
