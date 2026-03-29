export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center bg-black py-12 px-6">
      {children}
    </main>
  )
}
