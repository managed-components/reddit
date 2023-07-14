import { MCEvent, ClientSetOptions } from '@managed-components/types'
import { eventHandler } from '.'

const randomUUID = crypto.randomUUID()

describe('Reddit MC event handler works correctly', async () => {
  const fetchedRequests: any = []
  const setCookies: any = []

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

  await eventHandler('pageview', fakeEvent, { id: '123' })

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
