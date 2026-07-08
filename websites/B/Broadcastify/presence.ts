import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '463151177836658699',
})

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = location.pathname


presence.on('UpdateData', async () => {
  if (lastPath !== location.pathname) {
    lastPath = location.pathname
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  const feedTitle
    = document.querySelector('main h1')?.textContent?.trim()
      || document.querySelector('h1')?.textContent?.trim()
      || document.title.replace(/\s*\|\s*Broadcastify.*$/u, '').trim()

  const listenerCount = document.querySelector('#lp-hero-listeners')?.textContent?.trim()

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    startTimestamp: browsingTimestamp,
  }

  if (location.pathname.startsWith('/listen/feed/')) {
    presenceData.details = feedTitle || 'Unknown Feed'
    presenceData.state = 'Listeners: ' + listenerCount
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Listening Live'
  }
  else {
    presenceData.details = 'Browsing Broadcastify'
    presenceData.state = feedTitle || 'Audio Feeds'
  }
  if (feedTitle) {
    presenceData.name = feedTitle
  } else {
    presenceData.name = 'Broadcastify'
  }
  presence.setActivity(presenceData)
})