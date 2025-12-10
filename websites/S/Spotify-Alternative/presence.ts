import { ActivityType, Assets } from 'premid'

declare const Presence: any

const presence = new Presence({
  clientId: '1426317236846465196',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = '',
}

const UPDATE_INTERVAL = 1200
let lastUpdate = 0

presence.on('UpdateData', async () => {
  if (Date.now() - lastUpdate < UPDATE_INTERVAL)
    return
  lastUpdate = Date.now()

  const state = document.querySelector('[data-testid="control-button-playpause"]')?.ariaLabel
  if (state !== 'Pause') {
    presence.clearActivity() // nothing is playing
    return
  }

  const widget = document.querySelector('[data-testid="now-playing-widget"]')
  if (!widget) {
    presence.clearActivity() // widget not found
    return
  }

  const song = widget?.querySelector('[data-testid="context-item-info-title"] a')?.textContent?.trim()
    || widget?.querySelector('.track-info__name a')?.textContent?.trim()
  const artist = widget?.querySelector('[data-testid="context-item-info-artist"]')?.textContent?.trim()
    || widget?.querySelector('.track-info__artists a')?.textContent?.trim()
  const cover = (widget?.querySelector('[data-testid="cover-art-image"]') as HTMLImageElement | null)?.src ?? ''

  if (!song && !artist) {
    presence.clearActivity() // no valid track info
    return
  }

  const presenceData: any = {
    type: ActivityType.Listening,
    largeImageKey: cover || ActivityAssets.Logo,
    smallImageKey: Assets.Play,
    startTimestamp: browsingTimestamp,
    name: song && artist ? `${song} - ${artist}` : 'music',
    details: song || 'Unknown track',
    state: artist || 'Unknown artist',
  }

  presence.setActivity(presenceData)
})
