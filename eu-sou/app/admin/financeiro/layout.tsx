import FinanceiroNav from '@/components/admin/FinanceiroNav'

export default function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <FinanceiroNav />
      <main className="md:pl-64 pt-24 pb-10 px-4 md:px-8">
        {children}
      </main>
    </div>
  )
}
