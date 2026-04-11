'use client'
import React, { useState, useEffect, useRef } from 'react'
import SocialButton from './SocialButton'
import Sidebar from './sidebar'
import { Instagram, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const menuItems = [
  { label: 'Home', href: '#hero' },
  { label: 'Chamado', href: '#chamado' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Série', href: '#serie' },
  { label: 'Grupos', href: '#grupos' },
   { label: 'Localização', href: '#localizacao' },
]

export default function Navbar() {
  const [Open, setOpen] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!Open) {
      setTimeout(() => setShowButton(true), 300)
    } else {
      setShowButton(false)
    }
  }, [Open])

  const navigate = (dir) => {
    if (timerRef.current) return
    setVisible(false)
    timerRef.current = setTimeout(() => {
      setActiveIndex((i) =>
        dir === 'right'
          ? (i + 1) % menuItems.length
          : (i - 1 + menuItems.length) % menuItems.length
      )
      setVisible(true)
      timerRef.current = null
    }, 250)
  }

  const len = menuItems.length
  const left   = menuItems[(activeIndex - 1 + len) % len]
  const center = menuItems[activeIndex]
  const right  = menuItems[(activeIndex + 1) % len]

  const handleNavigation = (href) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
     <div className='fixed top-0 left-0 w-full flex justify-between items-center py-8 px-8 z-40 bg-transparent'>

      {/* Sidebar fora do md:hidden */}
      <Sidebar Open={Open} setOpen={setOpen} />

      {/* MOBILE — hambúrguer */}
      <div className='flex md:hidden items-center'>
        {showButton && (
          <button
            onClick={() => setOpen(!Open)}
            className='flex flex-col gap-[5px] p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm'
          >
            <div className="w-7 h-[3px] bg-[#ff6b00] rounded-full" />
            <div className="w-7 h-[3px] bg-[#ff6b00] rounded-full" />
            <div className="w-7 h-[3px] bg-[#ff6b00] rounded-full" />
          </button>
        )}
      </div>

      {/* DESKTOP — carrossel centralizado */}
      <div className='hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8'>

        <button
          onClick={() => navigate('left')}
          className='text-white/50 hover:text-white transition-colors duration-200'
        >
          <ChevronLeft size={28} />
        </button>

        <div
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 250ms ease-in-out',
          }}
          className='flex items-center gap-10'
        >
          <button onClick={() => handleNavigation(left.href)} className='text-white/10 text-xl font-light tracking-widest cursor-pointer hover:text-white/70 transition-colors duration-200'>
            {left.label}
          </button>

          <button onClick={() => handleNavigation(center.href)} className='text-[#ff6b00] text-2xl font-semibold tracking-widest cursor-pointer hover:text-[#ff8833] transition-colors duration-200'>
            {center.label}
          </button>

          <button onClick={() => handleNavigation(right.href)} className='text-white/10 text-xl font-light tracking-widest cursor-pointer hover:text-white/70 transition-colors duration-200'>
            {right.label}
          </button>
        </div>

        <button
          onClick={() => navigate('right')}
          className='text-white/50 hover:text-white transition-colors duration-200'
        >
          <ChevronRight size={28} />
        </button>

      </div>

    </div>
  )
}