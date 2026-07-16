/// <reference types="vite/client" />

declare module '@voidborn-cards' {
  const data: {
    cards: Array<{
      title: string
      slug: string
      domain: string
      role?: string
      stats: { mana: number; attack: number; health: number }
      path: string
      keywords?: string[]
      ability?: { name: string; text: string }
    }>
  }
  export default data
}
