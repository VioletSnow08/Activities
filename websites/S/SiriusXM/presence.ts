import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SiriusXM/assets/logo.jpg',
    name: 'SiriusXM',
    type: ActivityType.Listening,
  }

  switch (document.location.pathname) {
    case '/player/home':
      presenceData.details = 'Listening to SiriusXM'
      break
    case document.location.pathname.match(/^\/player\/curated-grouping/)?.input: // startswith /player/curated-grouping
      presenceData.details = 'Browsing Channels'
      break
    case '/player/search':
      presenceData.details = 'Searching'
      break
    case '/player/my-library':
      presenceData.details = 'Browsing My Library'
      break
    case document.location.pathname.match(/^\/player\/channel-linear/)?.input: // startswith /player/channel-linear
      presenceData.details = 'Browsing Channel'
      // Get div .entity-header-title then span inside it
      const channelTitle = document.querySelector('[data-qa="entity-header-title"] span')?.textContent
      // Get data-qa=entity-header-subtitle span textContent
      const channelNumber = document.querySelector('[data-qa="entity-header-subtitle"] span')?.textContent
      presenceData.state = channelNumber
      presenceData.details = channelTitle ? `Browsing ${channelTitle}` : 'Browing Channel'
      break
  }

  // Get footer
  const footer = document.getElementsByTagName('footer')[0]

  // Find controls container (class changes hashes)
  const controlsModule = footer?.querySelector('div[class*="controlsContainer"]')

  // --- inside presence.on('UpdateData', async () => { ... }) ---

  // Footer / controls / playbar code above remains the same ...

  if (footer && controlsModule) {
    const playbarInfo = footer.querySelector('div[class*="textWrapper"]')

    if (playbarInfo) {
      const trackRaw = playbarInfo.querySelector('[class*="title"] span')?.textContent?.trim() || ''
      const channelRaw = playbarInfo.querySelector('div[class*="text"] span')?.textContent?.trim() || ''

      // Split "Artist - Song"
      const [artist, song] = trackRaw.split(/\s*-\s*/)

      // Split "SiriusXM K-Pop · SiriusXM K-Pop" → ["SiriusXM K-Pop", "SiriusXM K-Pop"]
      const [channelLine1, channelLine2] = channelRaw.split(/\s*·\s*/) //

      // Keep details/state the same
      presenceData.name = channelLine2 ? `${channelLine2} on SiriusXM` : 'SiriusXM'
      presenceData.details = `${artist} - ${song}`
      presenceData.state = channelRaw
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
