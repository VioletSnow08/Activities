import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1426317236846465196',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.brandfetch.io/id4hdoIs3P/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1760765872712',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    name: 'Sephora',
  }

  // Name = Discord status // bold line
  // Details = First line
  // State = Second line

  // Check if the user is at the home page (/)

  if (window.location.pathname === '/') {
    presenceData.details = 'Browsing the home page'
  } // Look if the user is shopping for a category (url contains /shop/[category-name])
  else if (window.location.pathname.startsWith('/shop/') || window.location.pathname.startsWith('/beauty/')) {
    const categoryName = window.location.pathname.split('/')[2] ?? 'Products'
    // Capitalize each first letter and replace hyphens with spaces
    presenceData.details = `Shopping for ${decodeURIComponent(categoryName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}`
  }
  else if (window.location.pathname.startsWith('/brand/')) {
    const brandName = window.location.pathname.split('/')[2] ?? 'Brand'
    presenceData.details = `Exploring ${decodeURIComponent(brandName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))} Products`
  }
  else if (window.location.pathname.startsWith('/product/')) {
    // <a class data-at="brand_name" ...>name</a>>
    // <span class data-at="product_name" ...>name</span>>
    const productNameElement = document.querySelector('[data-at="product_name"]')
    const brandNameElement = document.querySelector('[data-at="brand_name"]')
    const productName = productNameElement ? productNameElement.textContent?.trim() : 'a Product'
    const brandName = brandNameElement ? brandNameElement.textContent?.trim() : 'a Brand'
    presenceData.details = `Viewing ${productName}`
    presenceData.state = `By: ${brandName}`
  }

  // Miscellaneous

  if (window.location.pathname.startsWith('/BeautyInsider')) {
    presenceData.details = 'Checking Beauty Insider account'
  }
  else if (window.location.pathname.startsWith('/rewards')) {
    presenceData.details = 'Viewing their Rewards'
  }

  // Account Information, Orders, etc.

  else if (window.location.pathname.startsWith('/profile/MyAccount/Orders')) {
    presenceData.details = 'Viewing their Orders'
  }

  else if (window.location.pathname.startsWith('/profile/MyAccount')) {
    presenceData.details = 'Viewing their Account'
  }

  else if (window.location.pathname.startsWith('/happening/reservations')) {
    presenceData.details = 'Viewing their Reservations'
  }

  // Profile

  else if (window.location.pathname.startsWith('/profile/Lists')) {
    presenceData.details = 'Viewing their Lists'
  }
  else if (window.location.pathname.startsWith('/profile/')) {
    presenceData.details = 'Viewing their Profile'
  }

  else if (window.location.pathname.startsWith('/basket')) {
    presenceData.details = 'Viewing their Basket'
    presenceData.state = 'Maybe they\'ll buy something?'
  }
  else if (window.location.pathname.startsWith('/purchase-history')) {
    presenceData.details = 'Viewing their Purchase History'
  }

  presence.setActivity(presenceData)
})
