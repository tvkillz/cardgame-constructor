import nicknames from './bot-nicknames.json' with { type: 'json' }

const BOT_NICKNAMES: string[] = Array.isArray(nicknames) ? nicknames : []

export function listBotNicknames(): string[] {
  return BOT_NICKNAMES
}

export function pickBotNickname(rng?: () => number): string {
  if (!BOT_NICKNAMES.length) return 'LZQWQ'
  const random = rng ?? Math.random
  const index = Math.floor(random() * BOT_NICKNAMES.length)
  return BOT_NICKNAMES[index] ?? BOT_NICKNAMES[0]
}
