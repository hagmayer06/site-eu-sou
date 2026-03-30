import GruposNav from '@/components/admin/GruposNav'

export default function GruposLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GruposNav />
      <main className="md:pl-64 pt-24 pb-10 px-4 md:px-8">
        {children}
      </main>
    </div>
  )
}
