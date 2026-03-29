import MembroNav from '@/components/membros/MembroNav'

export default function MembroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <MembroNav />
      {/* md:pl-56 para compensar a sidebar fixa; pb-20 para o bottom nav mobile */}
      <main className="md:pl-56 pt-20 pb-20 md:pb-0 px-4 md:px-8">
        {children}
      </main>
    </div>
  )
}
