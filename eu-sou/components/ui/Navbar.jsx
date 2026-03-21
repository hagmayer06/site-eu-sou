'use client'
import React, { useState, useEffect } from 'react';
import SocialButton from './SocialButton'
import { Instagram, MessageCircle } from 'lucide-react'

import Sidebar from './sidebar'

export default function Navbar() {
  const [Open, setOpen] = useState(false)
  const [showButton, setShowButton] = useState(true)

  useEffect(() => {
    if (!Open) {
      setTimeout(() => {
        setShowButton(true)
      }, 300)
    } else {
      setShowButton(false)
    }
  }, [Open])

  return (
    <div className='fixed top-0 left-0 w-full flex justify-between py-8 px-8 z-40 bg-transparent'>
      {showButton && (
        <button
          onClick={() => setOpen(!Open)}
          className='flex flex-col gap-[5px] p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm'
        >
          <div className="w-7 h-[3px] bg-white rounded-full"></div>
          <div className="w-7 h-[3px] bg-white rounded-full"></div>
          <div className="w-7 h-[3px] bg-white rounded-full"></div>
        </button>
      )}
      <Sidebar Open={Open} setOpen={setOpen} />
      <div className='flex gap-4'>
        <SocialButton icon={<Instagram size={32} />} href="..." />
        <SocialButton icon={<MessageCircle size={32} />} href="..." />
      </div>
    </div>
  )
}