import SerieForm from '@/components/admin-fomularios/SerieForm';

export default function AdminSeriePage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 border-l-4 border-orange-500 pl-4">
          <h1 className="text-3xl font-extrabold tracking-tight">
            ADMIN <span className="text-orange-500 uppercase">Série do Mês</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm italic">
            Configurações da landing page "Eu Sou"
          </p>
        </header>

        <main className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl p-6 md:p-8">
          <SerieForm />
        </main>
      </div>
    </div>
  );
}