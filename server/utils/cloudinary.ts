import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import type { GuestPhoto } from '#shared/types/guest-photos'

export const GUEST_NAME_CONTEXT_KEY = 'guest_name'

const SEARCH_PAGE_SIZE = 500
// A cap so a flood of uploads cannot make one gallery request page through Cloudinary forever
const MAX_LISTED_PHOTOS = 2000

export interface CloudinarySettings {
  cloudName: string
  apiKey: string
  apiSecret: string
  folder: string
  tag: string
}

export function getCloudinarySettings(event: H3Event): CloudinarySettings {
  const config = useRuntimeConfig(event)
  const cloudName = config.public.cloudinaryCloudName
  const { cloudinaryApiKey: apiKey, cloudinaryApiSecret: apiSecret, cloudinaryFolder: folder } = config

  if (!cloudName || !apiKey || !apiSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Cloudinary is not configured, see .env.example' })
  }
  return { cloudName, apiKey, apiSecret, folder, tag: getTagForFolder(folder) }
}

/** The tag every guest photo in `folder` carries. One tag per folder keeps development uploads off the live site. */
export function getTagForFolder(folder: string): string {
  return folder.replaceAll('/', '-')
}

/** Cloudinary's upload signature: SHA-1 of the parameters sorted by name and joined as `name=value&...`, followed by the API secret. */
export function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string): string {
  const serializedParams = Object.keys(params)
    .sort()
    .map(name => `${name}=${params[name]}`)
    .join('&')
  return createHash('sha1').update(serializedParams + apiSecret).digest('hex')
}

// Formats a phone camera or our in-browser shrinking produce; anything else (SVG, GIF, PDF...) is refused by Cloudinary
const ALLOWED_UPLOAD_FORMATS = 'jpg,png,webp,heic,heif,avif'

/**
 * The fields signed for one upload. A fresh `publicId` per ticket plus `overwrite=false` makes each signature good for one photo:
 * Cloudinary accepts a signature for an hour, so without them one ticket could upload endlessly past the per-IP limit.
 */
export function buildUploadParams(
  { folder, tag, publicId, guestName, timestampSeconds }: { folder: string, tag: string, publicId: string, guestName: string, timestampSeconds: number },
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    allowed_formats: ALLOWED_UPLOAD_FORMATS,
    folder,
    overwrite: 'false',
    public_id: publicId,
    tags: tag,
    timestamp: timestampSeconds,
  }
  if (guestName) params.context = `${GUEST_NAME_CONTEXT_KEY}=${escapeContextValue(guestName)}`
  return params
}

/** Context values are written as `key=value|key=value`, so `=` and `|` inside a value must be escaped with a backslash. */
export function escapeContextValue(value: string): string {
  return value.replace(/[=|]/g, '\\$&')
}

/** The Search API returns context as `{ key: value }`, the Admin API as `{ custom: { key: value } }`; this reads either. */
export function readGuestName(context: unknown): string {
  if (!context || typeof context !== 'object') return ''
  const fields = 'custom' in context && context.custom && typeof context.custom === 'object' ? context.custom : context
  const guestName = (fields as Record<string, unknown>)[GUEST_NAME_CONTEXT_KEY]
  return typeof guestName === 'string' ? guestName : ''
}

interface SearchResource {
  public_id: string
  version: number
  width: number
  height: number
  created_at: string
  context?: unknown
}

interface SearchResponse {
  resources: SearchResource[]
  next_cursor?: string
}

/** Every guest photo in the configured folder, newest first. */
export async function listGuestPhotos(settings: CloudinarySettings): Promise<GuestPhoto[]> {
  const photos: GuestPhoto[] = []
  const credentials = Buffer.from(`${settings.apiKey}:${settings.apiSecret}`).toString('base64')
  let nextCursor: string | undefined

  do {
    const page: SearchResponse = await $fetch<SearchResponse>(`https://api.cloudinary.com/v1_1/${settings.cloudName}/resources/search`, {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}` },
      body: {
        expression: `resource_type:image AND tags="${settings.tag}"`,
        sort_by: [{ created_at: 'desc' }],
        with_field: ['context'],
        max_results: SEARCH_PAGE_SIZE,
        next_cursor: nextCursor,
      },
    })
    photos.push(...page.resources.map(resource => ({
      publicId: resource.public_id,
      version: resource.version,
      width: resource.width,
      height: resource.height,
      guestName: readGuestName(resource.context),
      uploadedAt: resource.created_at,
    })))
    nextCursor = page.next_cursor
  } while (nextCursor && photos.length < MAX_LISTED_PHOTOS)

  return photos
}
