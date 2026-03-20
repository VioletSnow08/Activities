import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1247668968395903030',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/LiveATC/assets/logo.png',
}

const weatherCodes: Record<string, string> = {
  RA: 'RAIN',
  SN: 'SNOW',
  DZ: 'DRIZZLE',
  FG: 'FOG',
  BR: 'MIST',
  HZ: 'HAZE',
  TS: 'THUNDERSTORM',
  FZ: 'FREEZING',
}

const phoneticLetters: Record<string, string> = {
  A: 'ALPHA',
  B: 'BRAVO',
  C: 'CHARLIE',
  D: 'DELTA',
  E: 'ECHO',
  F: 'FOXTROT',
  G: 'GOLF',
  H: 'HOTEL',
  I: 'INDIA',
  J: 'JULIETT',
  K: 'KILO',
  L: 'LIMA',
  M: 'MIKE',
  N: 'NOVEMBER',
  O: 'OSCAR',
  P: 'PAPA',
  Q: 'QUEBEC',
  R: 'ROMEO',
  S: 'SIERRA',
  T: 'TANGO',
  U: 'UNIFORM',
  V: 'VICTOR',
  W: 'WHISKEY',
  X: 'X-RAY',
  Y: 'YANKEE',
  Z: 'ZULU',
}

const airportNames: Record<string, string> = {
  KBOS: "BOSTON LOGAN INTL' AIRPORT",
}

function decodeSignedTemperature(value: string): string {
  return value.startsWith('M') ? `-${value.slice(1)}` : value
}

function decodeWeatherToken(token: string): string {
  const intensity = token.startsWith('+')
    ? 'HEAVY '
    : token.startsWith('-')
      ? 'LIGHT '
      : ''
  const cleanToken = token.replace(/^[-+]/, '')
  const chunks = cleanToken.match(/[A-Z]{2}/g) || [cleanToken]
  const decoded = chunks.map(chunk => weatherCodes[chunk] || chunk).join(' ')
  return `${intensity}${decoded}`.trim()
}

function decodeCloudToken(token: string): string | undefined {
  const match = token.match(/^(FEW|SCT|BKN|OVC)(\d{3})$/)
  if (!match)
    return undefined

  const amountMap: Record<string, string> = {
    FEW: 'FEW CLOUDS',
    SCT: 'SCATTERED CLOUDS',
    BKN: 'BROKEN CLOUDS',
    OVC: 'OVERCAST',
  }
  const amount = match[1]
  const height = match[2]

  if (!amount || !height || !amountMap[amount])
    return undefined

  return `${amountMap[amount]} AT ${Number.parseInt(height, 10) * 100} FEET`
}

function decodeAtisText(rawText?: string | null): string | undefined {
  if (!rawText)
    return undefined

  const normalizedText = rawText.trim().replace(/\s+/g, ' ')
  const tokens = normalizedText.toUpperCase().split(' ')

  const station = tokens.find(token => /^[A-Z]{4}$/.test(token))
  const observed = tokens.find(token => /^\d{6}Z$/.test(token))
  const wind = tokens.find(token => /^(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT$/.test(token))
  const visibility = tokens.find(token => /^\d{1,2}SM$/.test(token) || /^\d\/\dSM$/.test(token))
  const weather = tokens.find(token => /^[-+]?[A-Z]{2,6}$/.test(token) && /RA|SN|DZ|FG|BR|HZ|TS|FZ/.test(token))
  const cloudLayers = tokens
    .filter(token => /^(FEW|SCT|BKN|OVC)\d{3}$/.test(token))
    .map(decodeCloudToken)
    .filter((layer): layer is string => Boolean(layer))
  const tempDew = tokens.find(token => /^M?\d{2}\/M?\d{2}$/.test(token))
  const altimeter = tokens.find(token => /^A\d{4}$/.test(token) || /^Q\d{4}$/.test(token))

  const infoMatch = normalizedText.toUpperCase().match(/\b(?:INFO|INFORMATION)\s+([A-Z])\b/)
  const infoLetter = infoMatch?.[1]
  const airportPhrase = station
    ? airportNames[station] || `${station} AIRPORT`
    : 'AIRPORT'

  const parts: string[] = [
    `${airportPhrase} ATIS${infoLetter ? ` INFORMATION ${phoneticLetters[infoLetter] || infoLetter}` : ''}`,
  ]

  if (observed) {
    const timeMatch = observed.match(/^(\d{2})(\d{2})(\d{2})Z$/)
    if (timeMatch && timeMatch[2] && timeMatch[3])
      parts.push(`TIME ${timeMatch[2]}${timeMatch[3]} ZULU`)
  }

  if (wind) {
    const match = wind.match(/^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT$/)
    if (match && match[1] && match[2]) {
      const direction = match[1]
      const speed = match[2]
      const gust = match[3]
      if (direction === 'VRB')
        parts.push(`WIND VARIABLE AT ${speed}${gust ? ` GUSTING ${gust}` : ''} KNOTS`)
      else
        parts.push(`WIND ${direction} AT ${speed}${gust ? ` GUSTING ${gust}` : ''} KNOTS`)
    }
  }

  if (visibility)
    parts.push(`VISIBILITY ${visibility.replace('SM', ' STATUTE MILES')}`)

  if (weather)
    parts.push(decodeWeatherToken(weather))

  if (cloudLayers.length > 0)
    parts.push(cloudLayers.join(', '))

  if (tempDew) {
    const split = tempDew.split('/')
    const temp = split[0]
    const dew = split[1]

    if (temp && dew)
      parts.push(`TEMPERATURE ${decodeSignedTemperature(temp)} CELSIUS. DEW POINT ${decodeSignedTemperature(dew)} CELSIUS`)
  }

  if (altimeter) {
    if (altimeter.startsWith('A')) {
      const value = altimeter.slice(1)
      parts.push(`ALTIMETER ${value.slice(0, 2)}.${value.slice(2)}`)
    }
    else {
      parts.push(`QNH ${altimeter.slice(1)} hPa`)
    }
  }

  return `${parts.join('. ')}.`
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = document.location

  switch (hostname.split('.')[0]) {
    case 'www': {
      switch (pathname.split('/')[1]?.replace('.php', '')) {
        case '': {
          presenceData.details = 'Viewing homepage'
          break
        }
        case 'index': {
          presenceData.details = 'Viewing homepage'
          break
        }
        case 'search': {
          const params = new URL(href).searchParams

          presenceData.details = 'Searching'
          presenceData.state = `${
            params.get('freq')
              ? 'Frequency: '
              : params.get('icao')
                ? 'ICAO: '
                : ''
          }${params.get('freq') || params.get('icao')?.toUpperCase() || ''}`
          break
        }
        case 'hlisten': {
          const radioInfo = document
            .querySelector('h1')
            ?.childNodes
            .item(2)
            .textContent
            ?.split(' - ')
          const rawAtisText = document
            .querySelector('font')
            ?.textContent
            ?.trim()

          presenceData.name = "LiveATC | " + radioInfo?.[0]
          presenceData.details = radioInfo?.[0]
          presenceData.state = radioInfo?.[1]
          presenceData.largeImageText = decodeAtisText(rawAtisText)
          presenceData.smallImageKey = Assets.Live
          presenceData.buttons = [
            {
              url: href,
              label: 'Listen to Feed',
            },
          ]
          break
        }
        case 'archive': {
          if (document.querySelector('audio')) {
            const audio = document.querySelector('audio')!

            presenceData.details = 'Listening to archive'
            presenceData.state = audio
              .querySelector('source')
              ?.src
              ?.split('/')[4]
              ?.split('.')[0]
            presenceData.smallImageKey = audio.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = audio.paused ? 'Paused' : 'Playing'
            if (!audio.paused) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(audio)
            }
          }
          else {
            presenceData.details = 'Searching archive'
          }
          break
        }
        case 'recordings': {
          presenceData.details = 'Browsing recordings'
          break
        }
        case 'feedindex': {
          presenceData.details = 'Browsing feeds'
          presenceData.state = document.querySelector('h1 > font')
          break
        }
        case 'topfeeds': {
          presenceData.details = 'Browsing top 50 feeds'
          break
        }
        case 'map': {
          presenceData.details = 'Viewing feed map'
          break
        }
        case 'badwxfeeds': {
          presenceData.details = 'Viewing bad weather airports'
          break
        }
        case 'coverage': {
          presenceData.details = 'Viewing coverage guide'
          break
        }
        default: {
          presenceData.details = pathname.split('/')[1]?.replace('.php', '')
          break
        }
      }
      break
    }
    case 'forums': {
      const pageURL = document.querySelector<HTMLAnchorElement>(
        '.navigate_section .last a',
      )?.href

      presenceData.details = 'Browsing the forums'
      presenceData.state = document.querySelector(
        '.navigate_section .last span',
      )
      if (pageURL && new URL(pageURL).pathname.split('/')[1] !== 'index.php') {
        presenceData.buttons = [
          {
            url: pageURL,
            label: 'View page',
          },
        ]
      }
    }
  }

  presence.setActivity(presenceData)
})
