const presence = new Presence({
  clientId: '1425506204607713441', // You must enter this yourself
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
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
  } // Check for /*/venue/*

  // Set the activity
  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
