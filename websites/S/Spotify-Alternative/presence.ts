import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1426317236846465196',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = '',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    type: ActivityType.Listening,

  }

  if (document.location.pathname === '/') { // On the logged in homepage
    // Check if there's a currently playing track
    const state = document.querySelector('[data-testid="control-button-playpause"]')?.ariaLabel
    if (state === 'Pause') { // If there's a pause button, something is playing
      const widget = document.querySelector('[data-testid="now-playing-widget"]')

      const song = widget?.querySelector('[data-testid="context-item-info-title"] a')?.textContent.trim()
      const artist = widget?.querySelector('[data-testid="context-item-info-artist"]')?.textContent.trim()
      const cover = (widget?.querySelector('[data-testid="cover-art-image"]') as HTMLImageElement | null)?.src ?? ''

      presenceData.name = song && artist ? `${song} - ${artist}` : 'music'
      presenceData.state = artist || 'Unknown artist'
      presenceData.details = song || 'Unknown track'
      presenceData.largeImageKey = cover || ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Play
    }
  }

  presence.setActivity(presenceData)
})
