import type { GuestPhoto } from '#shared/types/guest-photos'
import type { CloudinarySettings } from '../utils/cloudinary'
import { getCloudinarySettings, listGuestPhotos } from '../utils/cloudinary'

// Every open page polls this. Cloudinary's Search API allows 500 calls an hour on the free plan and each server instance
// calls it at most once per window, so 20 seconds leaves room for two instances (360 calls an hour)
const CACHE_SECONDS = 20

const listGuestPhotosCached = defineCachedFunction(
  (settings: CloudinarySettings) => listGuestPhotos(settings),
  // Fresh data or nothing: serving a stale list while refreshing would add one more window of delay
  { name: 'guest-photos', maxAge: CACHE_SECONDS, swr: false, getKey: settings => settings.tag },
)

// Kept so a failed Search API call (e.g. rate limited) shows the last list instead of an empty gallery
let lastListedPhotos: GuestPhoto[] | null = null

export default defineEventHandler(async (event) => {
  // The server-side cache above is the only one: a browser cache on top would delay new photos by another window
  setResponseHeader(event, 'cache-control', 'no-store')

  try {
    lastListedPhotos = await listGuestPhotosCached(getCloudinarySettings(event))
  } catch (error) {
    if (!lastListedPhotos) throw error
    console.error('Listing guest photos failed, serving the last list', error)
  }
  return lastListedPhotos
})
