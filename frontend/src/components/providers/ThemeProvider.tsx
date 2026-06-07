'use client'

import { useEffect, type ReactNode } from 'react'
import { applyTheme } from '@/config'

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme()
  }, [])

  return children
}
