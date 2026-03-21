'use client'
import { Home, PhoneCall, Calendar, Tv2, Users } from 'lucide-react'

const menuItems = [
  { label: 'Home', icon: <Home size={18} /> },
  { label: 'Chamado', icon: <PhoneCall size={18} /> },
  { label: 'Eventos', icon: <Calendar size={18} /> },
  { label: 'Série do mês', icon: <Tv2 size={18} /> },
  { label: 'Grupos Familiares', icon: <Users size={18} /> },
]

export default function Sidebar({ Open, setOpen }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          Open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Painel */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 z-50 bg-[#1c1c1e] text-white rounded-r-3xl shadow-2xl transition-transform duration-300 flex flex-col ${
          Open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo — logo + fechar */}
        <div className='flex items-center justify-between px-6 pt-6 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold border border-white/20'>
              ✦
            </div>
            <span className='text-base font-semibold tracking-wide'>Eu Sou</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white/70 hover:text-white text-sm'
          >
            ◀
          </button>
        </div>

        {/* Divider */}
        <div className='mx-6 h-px bg-white/10 mb-4' />

        {/* Label MENU */}
        <p className='px-6 text-xs font-semibold tracking-widest text-white/40 uppercase mb-2'>
          Menu
        </p>

        {/* Links */}
        <nav className='flex flex-col gap-1 px-3'>
          {menuItems.map((item) => (
            
             <a key={item.label}
              href='#'
              className='flex items-center gap-4 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group'
            >
              <span className='w-8 h-8 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition'>
                {item.icon}
              </span>
              <span className='text-sm font-medium'>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}