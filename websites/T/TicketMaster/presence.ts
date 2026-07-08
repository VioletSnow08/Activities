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
    startTimestamp: browsingTimestamp, // Show elapsed time
    name: 'TicketMaster',
  }

  if (document.location.hostname === 'www.ticketmaster.com') {
  // Update the state based on the current page
    if (pathname === '/') {
      presenceData.state = 'Homepage'
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
      presenceData.name = 'Looking at tickets'
      presenceData.state = `${venue}`
      presenceData.details = eventName || event || 'Unknown event'
    }
    else if // /discover/concerts*
    (pathname.startsWith('/discover/concerts')) {
      presenceData.name = 'Browsing concerts'
      const genre = document.querySelector('h1.sc-7b709fac-2')?.textContent.trim() || 'Unknown genre'
      presenceData.state = `Genre: ${genre}`
    }
    else if // /*/venue/*
    (pathname.match(/\/.*\/venue\/.*/)) {
    // Remove "Tickets" from the end of the venue name
      const venueName = document.querySelector('h1.sc-172c0ccf-0')?.textContent.replace(/\s*Tickets\s*$/, '').trim()
      const venueAddress = document.querySelector('p.sc-880cecb5-8')?.textContent.trim() || 'Unknown address'
      presenceData.name = venueName ? `Viewing ${venueName}` : 'Viewing a venue'
      presenceData.state = venueAddress
    }
    else if // /user/orders
    (pathname === '/user/orders') {
      presenceData.state = 'Viewing upcoming events'
    }
    else if // /user/orders/past-events
    (pathname === '/user/orders/past-events') {
      presenceData.state = 'Viewing past events'
    }
    else if // /user/*
    (pathname.match(/\/user\/.*/)) {
      presenceData.state = 'Managing account'
    }
    else if // my.ticketmaster.com/order/* {
    (pathname.match(/\/order\/.*/)) {
      const eventName = document.querySelector('h1.styles__eventOverview--Zvv9_')?.textContent.trim()
      presenceData.state = 'Viewing an order'
      presenceData.details = eventName ? `${eventName}` : 'Unknown event'
    }
  }
  else if (document.location.hostname === 'queue.ticketmaster.com') { // Check if subdomain is queue.ticketmaster.com/*
    const eventName = document.querySelector('h1.sc-t1dlzj-1')?.textContent.trim()
    const venueName = document.querySelector('h4.c-t1dlzj-2')?.textContent.trim()
    const timeRemaining = document.querySelector('sc-1146cv6-2 > span')?.textContent.trim()
    presenceData.name = eventName ? `In queue for ${eventName}` : 'In the queue'
    presenceData.details = `Venue: ${venueName}`
    presenceData.state = `Time remaining: ${timeRemaining}`
  }
  // Set the activity
  if (presenceData.state) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
