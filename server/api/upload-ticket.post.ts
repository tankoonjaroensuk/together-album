import { randomUUID } from 'node:crypto'
import type { GuestPhotoUploadTicket } from '#shared/types/guest-photos'
import { buildUploadParams, getCloudinarySettings, signCloudinaryParams } from '../utils/cloudinary'
import { createRateLimiter } from '../utils/rate-limiter'

const UPLOADS_PER_IP_PER_HOUR = 100
const ONE_HOUR_MS = 60 * 60 * 1000
const MAX_GUEST_NAME_LENGTH = 60

const isWithinUploadLimit = createRateLimiter({ limit: UPLOADS_PER_IP_PER_HOUR, windowMs: ONE_HOUR_MS })

/** Signs one upload so the browser can send a photo straight to Cloudinary. Each ticket is good for exactly one photo. */
export default defineEventHandler(async (event): Promise<GuestPhotoUploadTicket> => {
  if (!useRuntimeConfig(event).uploadsEnabled) {
    throw createError({ statusCode: 403, statusMessage: 'Uploads are closed' })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!isWithinUploadLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many uploads, try again later' })
  }

  const body = await readBody<{ guestName?: unknown } | undefined>(event)
  const guestName = typeof body?.guestName === 'string' ? body.guestName.trim().slice(0, MAX_GUEST_NAME_LENGTH) : ''
  const settings = getCloudinarySettings(event)

  const params = buildUploadParams({
    folder: settings.folder,
    tag: settings.tag,
    publicId: randomUUID(),
    guestName,
    timestampSeconds: Math.round(Date.now() / 1000),
  })

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${settings.cloudName}/image/upload`,
    apiKey: settings.apiKey,
    signature: signCloudinaryParams(params, settings.apiSecret),
    params,
  }
})
