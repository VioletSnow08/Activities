const presence = new Presence({
  clientId: '1425506204607713441', // You must enter this yourself
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6VKQefJN4p3waOkncpkzqurSSzxv7blZJ_w&s',
}

presence.on('UpdateData', async () => {
  // Get the current URL
  const { pathname } = document.location

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo, // Direct URL to the logo image
    details: 'Looking at tickets... (DEV)',
    startTimestamp: browsingTimestamp, // Show elapsed time
  }

  // Update the state based on the current page
  if (pathname === '/') {
    presenceData.state = 'Homepage'
  }
  else if (pathname.includes('/about')) {
    presenceData.state = 'Reading about us'
  }
  else if (pathname.includes('/contact')) {
    presenceData.state = 'Contacting us'
  } // Check for /*/artist/*
  else if (pathname.match(/\/.*\/artist\/.*/)) {
    // Get artist name .sc-c358f15d-6 h1 & trim "Tickets" from the end
    const artistName = document.querySelector('h1.sc-c358f15d-6')?.textContent.replace(/\s*Tickets\s*$/, '').trim()
    presenceData.state = artistName ? `Viewing ${artistName}` : 'Viewing an artist'
  } // Check for /*/event/*
  else if (pathname.match(/\/.*\/event\/.*/)) {
    // Get full event name from .sc-43d02e8c-4 h1
    const event = document.querySelector('h1.sc-4ed02e8c-4')?.textContent.trim()
    const datetime = document.querySelector('span.sc-42f87f01-0')?.textContent.trim() || 'Unknown date'
    const cleanDateTimeString = datetime.replace(/•/g, '').replace(/\s+/g, ' ').trim()
    const cleanDateTime = new Date(cleanDateTimeString)
    const formattedDateTime = `${cleanDateTime.getMonth() + 1}/${cleanDateTime.getDate()}/${cleanDateTime.getFullYear()}`
    const venue = document.querySelector('span.sc-9e564310-0 a')?.textContent.trim() || 'Unknown venue'
    let artistName
    let eventName

    if (event && event.includes (' - ')) {
      // Split by "-" and take the first part
      artistName = event?.split(' - ')[0]?.trim()
      eventName = event?.trim()
    }
    presenceData.name = 'Looking at tickets [DEV]'
    presenceData.state = `${formattedDateTime} at ${venue}`
    presenceData.details = eventName || 'Unknown Event'
  }

  // Set the activity
  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
