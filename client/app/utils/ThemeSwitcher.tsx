'use client'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { BiMoon,BiSun } from 'react-icons/bi'

type Props = {}

const ThemeSwitcher = (props: Props) => {
  const [mounted,setMounted] = useState(false);
  const {theme,setTheme} = useTheme();

  useEffect(()=>setMounted(true),[]);
  return (
    <div className='flex item-center justify-center mx-4'>
      {theme==='light'?(
        <BiMoon
        size={25}
        fill='black'
        className='cursor-pointer'
        onClick={()=>setTheme('dark')}
        />
      ):(
        <BiSun
        size={25}
        className='cursor-pointer'
        onClick={()=>setTheme('light')}
        />
      )}
    </div>
  )
}

export default ThemeSwitcher