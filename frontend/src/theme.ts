import { createContext, useEffect, useLayoutEffect, useState } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

// 차트처럼 테마가 바뀌면 다시 그려야 하는 컴포넌트가 구독한다.
export const ThemeContext = createContext<ResolvedTheme>('light')

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem('theme')
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref)
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // layout effect: 차트(자식)의 passive effect보다 먼저 data-theme이 바뀌어야 새 색을 읽는다
  useLayoutEffect(() => {
    const root = document.documentElement
    if (pref === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', pref)
    try {
      if (pref === 'system') localStorage.removeItem('theme')
      else localStorage.setItem('theme', pref)
    } catch {
      // 저장소를 쓸 수 없어도 테마 전환은 동작한다
    }
  }, [pref])

  const resolved: ResolvedTheme = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref
  const toggle = () => setPref(resolved === 'dark' ? 'light' : 'dark')
  return { resolved, toggle }
}
