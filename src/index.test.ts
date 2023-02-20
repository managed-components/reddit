import { MCEvent, ClientSetOptions } from '@managed-components/types'
import { eventHandler, redditHashKey } from '.'

const randomUUID = crypto.randomUUID()

describe('Reddit MC event handler works correctly', async () => {
  let fetchedRequests: any = []
  let setCookies: any = []

  const fakeEvent = new Event('pageview', {}) as MCEvent
  fakeEvent.name = 'Reddit Mock MC'
  fakeEvent.payload = {
    custom_payload: 'custom content',
  }
  fakeEvent.client = {
    emitter: 'browser',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    language: 'en-US',
    referer: '',
    ip: '127.0.0.1',
    url: new URL('http://127.0.0.1:1337'),
    fetch: (url, opts) => {
      fetchedRequests.push({ url, opts })
      return undefined
    },
    set: (key, value, opts) => {
      setCookies.push({ key, value, opts })
      return undefined
    },
    execute: () => undefined,
    return: () => {},
    get: key => {
      if (key === 'reddit_uuid') {
        // Simulate a day old cookie
        return Date.now() - 86400000 + '.' + randomUUID
      } else {
        return undefined
      }
    },
    attachEvent: () => {},
    detachEvent: () => {},
  }

  await eventHandler('pageview', fakeEvent)

  it('creates the Reddit pixel request correctly', async () => {
    const pixelRequest = fetchedRequests.find((x: any) =>
      x.url.startsWith('https://alb.reddit.com/rp.gif')
    )
    expect(pixelRequest).toBeTruthy()
    expect(pixelRequest?.opts?.mode).toEqual('no-cors')
    expect(pixelRequest?.opts?.keepalive).toEqual(true)
    expect(pixelRequest?.opts?.credentials).toEqual('include')

    const url = new URL(pixelRequest.url)

    expect(url.pathname).toEqual('/rp.gif')
    expect(url.searchParams.get('custom_payload')).toEqual('custom content')
    expect(url.searchParams.get('uuid')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
    expect(parseInt(url.searchParams.get('ts') as string, 10)).toBeGreaterThan(
      Date.now() - 86400000
    )
    expect(
      parseInt(url.searchParams.get('ts') as string, 10)
    ).toBeLessThanOrEqual(Date.now())
    expect(url.searchParams.get('s')).toBeTruthy()

    // Verify Hash
    const s = decodeURIComponent(url.searchParams.get('s') as string)
    const getUtf8Bytes = (str: string) =>
      new Uint8Array(
        [...unescape(encodeURIComponent(str))].map(c => c.charCodeAt(0))
      )

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      getUtf8Bytes(redditHashKey),
      { name: 'HMAC', hash: 'SHA-256' },
      true,
      ['verify']
    )

    let message =
      fakeEvent.payload.id + fakeEvent.payload.event + fakeEvent.payload.ts
    message += fakeEvent.payload.uuid

    let result = false
    try {
      result = await crypto.subtle.verify(
        'HMAC',
        cryptoKey,
        Buffer.from(s, 'base64'),
        getUtf8Bytes(message)
      )
    } catch (e) {
      console.error(e)
    }

    expect(result).toBeTruthy()
  })

  it('sets the UUID cookie correctly', () => {
    const uuidCookie = setCookies.find((x: any) => x.key === 'reddit_uuid')
    expect(uuidCookie).toBeTruthy()
    expect(uuidCookie.value.split('.').length).toBeGreaterThanOrEqual(2)
    expect(parseInt(uuidCookie.value.split('.')[0], 10)).toBeGreaterThan(
      Date.now() - 86400000
    )
    expect(uuidCookie.value.split('.')[1]).toEqual(randomUUID)
    expect(uuidCookie?.opts?.scope).toEqual('infinite')
  })
})
