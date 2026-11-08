import type { GuestPhoto } from '#shared/types/guest-photos'

const ANONYMOUS_GUEST_LABEL = 'แขกรับเชิญ'

/** The name to show for whoever sent `photo`, for guests who left the name field blank too. */
export function getGuestDisplayName(photo: Pick<GuestPhoto, 'guestName'>): string {
  return photo.guestName || ANONYMOUS_GUEST_LABEL
}
