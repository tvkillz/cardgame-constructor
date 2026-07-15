import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

import {
  hookSecretRaw,
  relayForSite,
  siteIdFromHookPayload,
  type SendEmailHookPayload,
} from '../_shared/sendmailRelay.ts'

const WEBHOOK_HEADER_NAMES = ['webhook-id', 'webhook-signature', 'webhook-timestamp'] as const

function forwardWebhookHeaders(req: Request): Headers {
  const headers = new Headers()
  headers.set('content-type', req.headers.get('content-type') || 'application/json')
  for (const name of WEBHOOK_HEADER_NAMES) {
    const value = req.headers.get(name)
    if (value) headers.set(name, value)
  }
  return headers
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const secret = hookSecretRaw()
  if (!secret) {
    return new Response(JSON.stringify({ error: { message: 'SEND_EMAIL_HOOK_SECRET not configured' } }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await req.text()
  const wh = new Webhook(secret)
  const headerMap = Object.fromEntries(
    [...req.headers.entries()].map(([key, value]) => [key.toLowerCase(), value]),
  )

  let payload: SendEmailHookPayload
  try {
    payload = wh.verify(rawBody, headerMap) as SendEmailHookPayload
  } catch (err) {
    console.error('[send-email-hook] signature verification failed:', err)
    return new Response(JSON.stringify({ error: { message: 'Invalid webhook signature' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const siteId = siteIdFromHookPayload(payload)
  const relay = relayForSite(siteId)
  if (!relay) {
    console.error(`[send-email-hook] no relay configured for site=${siteId}`)
    return new Response(JSON.stringify({ error: { message: `No sendmail relay for site ${siteId}` } }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const targetUrl = `${relay.url.replace(/\/$/, '')}/hook`
  const forwardRes = await fetch(targetUrl, {
    method: 'POST',
    headers: forwardWebhookHeaders(req),
    body: rawBody,
  })

  const responseBody = await forwardRes.text()
  if (!forwardRes.ok) {
    console.error(
      `[send-email-hook] relay failed site=${siteId} status=${forwardRes.status} body=${responseBody.slice(0, 300)}`,
    )
  } else {
    console.log(`[send-email-hook] forwarded site=${siteId} → ${targetUrl}`)
  }

  return new Response(responseBody || '{}', {
    status: forwardRes.status,
    headers: { 'Content-Type': 'application/json' },
  })
})
