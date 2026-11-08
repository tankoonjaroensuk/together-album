import type { GuestPhoto, GuestPhotoUploadTicket } from '#shared/types/guest-photos'

/** The server would not hand out an upload: 403 when uploads are closed, 429 when one guest sent too many. */
export class UploadRefusedError extends Error {
  constructor(public readonly statusCode: number) {
    super(`Upload refused with status ${statusCode}`)
  }
}

interface CloudinaryUploadResponse {
  public_id: string
  version: number
  width: number
  height: number
  created_at: string
}

/** Sends one photo straight to Cloudinary, using a signed ticket from our server so the API secret never reaches the browser. */
export async function sendGuestPhoto(photo: Blob, guestName: string, onProgress: (progress: number) => void): Promise<GuestPhoto> {
  const ticket = await requestUploadTicket(guestName)

  const form = new FormData()
  form.append('file', photo)
  form.append('api_key', ticket.apiKey)
  form.append('signature', ticket.signature)
  for (const [name, value] of Object.entries(ticket.params)) form.append(name, String(value))

  const uploaded = await postWithProgress<CloudinaryUploadResponse>(ticket.uploadUrl, form, onProgress)
  return {
    publicId: uploaded.public_id,
    version: uploaded.version,
    width: uploaded.width,
    height: uploaded.height,
    guestName,
    uploadedAt: uploaded.created_at,
  }
}

async function requestUploadTicket(guestName: string): Promise<GuestPhotoUploadTicket> {
  try {
    return await $fetch<GuestPhotoUploadTicket>('/api/upload-ticket', { method: 'POST', body: { guestName } })
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 403 || statusCode === 429) throw new UploadRefusedError(statusCode)
    throw error
  }
}

// fetch cannot report upload progress; XMLHttpRequest can
function postWithProgress<T>(url: string, form: FormData, onProgress: (progress: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', url)
    request.responseType = 'json'
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(request.response as T)
      else reject(new Error(`Cloudinary responded ${request.status}: ${JSON.stringify(request.response)}`))
    }
    request.onerror = () => reject(new Error('Network error while uploading'))
    request.send(form)
  })
}
