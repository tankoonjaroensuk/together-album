/** A photo a guest uploaded, as the gallery needs it. */
export interface GuestPhoto {
  publicId: string
  /** Changes when the file is replaced, so it is part of the URL to bust caches */
  version: number
  width: number
  height: number
  /** Empty when the guest left the name field blank */
  guestName: string
  /** ISO 8601 time the photo reached Cloudinary */
  uploadedAt: string
}

/** Everything the browser needs to send one photo straight to Cloudinary without seeing the API secret. */
export interface GuestPhotoUploadTicket {
  uploadUrl: string
  apiKey: string
  signature: string
  /** The signed form fields; each one must be sent unchanged or the signature no longer matches */
  params: Record<string, string | number>
}
