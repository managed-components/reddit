import { ComponentSettings, Manager, MCEvent } from '@managed-components/types'

interface RedditPayload {
  id: string
  event: object
  ts: number
  click_id?: string
  uuid?: string
}

export const redditHashKey = 'm4sxh0fc5dnb' // Hardcoded Reddit key

const redditHash = async (data: RedditPayload) => {
  let message = data.id + data.event + data.ts

  if (data.click_id) message += data.click_id
  if (data.uuid) message += data.uuid

  const getUtf8Bytes = (str: string) =>
    new Uint8Array(
      [...unescape(encodeURIComponent(str))].map(c => c.charCodeAt(0))
    )

  const keyBytes = getUtf8Bytes(redditHashKey)
  const messageBytes = getUtf8Bytes(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    true,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes)

  // to lowercase hexits
  ;[...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')

  // to base64
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export const eventHandler = async (eventType: string, event: MCEvent) => {
  const { client, payload } = event

  payload.event = eventType
  payload.ts = new Date().valueOf()
  const uuidCookie = client.get('reddit_uuid')
  if (uuidCookie && uuidCookie.split('.').length > 1) {
    payload.uuid = uuidCookie.split('.')[1]
  } else {
    payload.uuid = crypto.randomUUID()
  }

  const rdt_cid = client.url.searchParams.get('rdt_cid')
  if (rdt_cid) {
    payload.click_id = rdt_cid
  }

  payload.s = await redditHash(payload)

  const params = new URLSearchParams(payload)
  params.delete('timestamp')

  client.fetch(`https://alb.reddit.com/rp.gif?${params.toString()}`, {
    mode: 'no-cors',
    keepalive: true,
    credentials: 'include',
  })

  const cookieValue = `${payload.ts}.${payload.uuid}`
  client.set('reddit_uuid', cookieValue, {
    scope: 'infinite',
  })
}

export default async function (manager: Manager, _settings: ComponentSettings) {
  manager.addEventListener('pageview', event => {
    eventHandler('PageVisit', event)
  })
  manager.addEventListener('ViewContent', event => {
    eventHandler('ViewContent', event)
  })
  manager.addEventListener('AddToCart', event => {
    eventHandler('AddToCart', event)
  })
  manager.addEventListener('AddToWishlist', event => {
    eventHandler('AddToWishlist', event)
  })
  manager.addEventListener('Search', event => {
    eventHandler('Search', event)
  })
  manager.addEventListener('Purchase', event => {
    eventHandler('Purchase', event)
  })
  manager.addEventListener('Lead', event => {
    eventHandler('Lead', event)
  })
  manager.addEventListener('SignUp', event => {
    eventHandler('SignUp', event)
  })
}
