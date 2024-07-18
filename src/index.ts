import { ComponentSettings, Manager, MCEvent } from '@managed-components/types'

// For future reference, see payload being sent here: https://reddit-test-2.pages.dev/
type RedditPayload = {
  id: string
  event: string
  ts: string
  click_id?: string
  uuid?: string
  integration?: string
  opt_out?: string
  v?: string
  sh?: string
  sw?: string
  'm.itemCount'?: string
  'm.value'?: string
  'm.valueDecimal'?: string
  'm.currency'?: string
  'm.transactionId'?: string
  'm.customEventName'?: string
  'm.products'?: string
  aaid?: string
  em?: string
  external_id?: string
  idfa?: string
}

export const eventHandler = async (
  eventType: string,
  event: MCEvent,
  settings: ComponentSettings
) => {
  const { client, payload } = event

  payload.event = eventType
  payload.id = settings.id
  payload.ts = new Date().valueOf().toString()
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

  const finalPayload: RedditPayload = {
    ...payload,
    integration: 'reddit',
    opt_out: 0,
    v: 'rdt_65e23bc4',
    sh: client.screenHeight?.toString(),
    sw: client.screenWidth?.toString(),
  }

  const params = new URLSearchParams(finalPayload)
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

export default async function (manager: Manager, settings: ComponentSettings) {
  manager.addEventListener('pageview', event => {
    eventHandler('PageVisit', event, settings)
  })
  manager.addEventListener('ViewContent', event => {
    eventHandler('ViewContent', event, settings)
  })
  manager.addEventListener('AddToCart', event => {
    eventHandler('AddToCart', event, settings)
  })
  manager.addEventListener('AddToWishlist', event => {
    eventHandler('AddToWishlist', event, settings)
  })
  manager.addEventListener('Search', event => {
    eventHandler('Search', event, settings)
  })
  manager.addEventListener('Purchase', event => {
    eventHandler('Purchase', event, settings)
  })
  manager.addEventListener('Lead', event => {
    eventHandler('Lead', event, settings)
  })
  manager.addEventListener('SignUp', event => {
    eventHandler('SignUp', event, settings)
  })
  manager.addEventListener('Custom', event => {
    eventHandler('Custom', event, settings)
  })
}
