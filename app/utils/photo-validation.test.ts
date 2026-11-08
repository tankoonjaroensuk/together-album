import { describe, expect, it } from 'vitest'
import { canSendUnshrunkPhoto, describeRejections, getPhotoIdentity, getPhotoRejectionReason } from './photo-validation'

const MB = 1024 * 1024

describe('getPhotoRejectionReason', () => {
  it('accepts an ordinary photo', () => {
    expect(getPhotoRejectionReason({ type: 'image/jpeg', size: 4 * MB }, false)).toBeNull()
  })

  it('rejects a file that is not an image', () => {
    expect(getPhotoRejectionReason({ type: 'application/pdf', size: MB }, false)).toBe('not-image')
  })

  it('rejects a photo over the size limit', () => {
    expect(getPhotoRejectionReason({ type: 'image/jpeg', size: 60 * MB }, false)).toBe('too-large')
  })

  it('accepts a 200MP phone photo, since it is shrunk before sending', () => {
    expect(getPhotoRejectionReason({ type: 'image/jpeg', size: 35 * MB }, false)).toBeNull()
  })

  it('rejects a photo that was already added', () => {
    expect(getPhotoRejectionReason({ type: 'image/jpeg', size: MB }, true)).toBe('duplicate')
  })

  it('reports the file type before the size', () => {
    expect(getPhotoRejectionReason({ type: 'video/mp4', size: 90 * MB }, false)).toBe('not-image')
  })
})

describe('canSendUnshrunkPhoto', () => {
  it('sends a file up to Cloudinary\'s 10 MB free-plan limit', () => {
    expect(canSendUnshrunkPhoto(10 * MB)).toBe(true)
  })

  it('refuses a file over that limit', () => {
    expect(canSendUnshrunkPhoto(10 * MB + 1)).toBe(false)
  })
})

describe('getPhotoIdentity', () => {
  it('matches the same file picked twice', () => {
    const file = { name: 'a.jpg', size: 10, lastModified: 5 }
    expect(getPhotoIdentity(file)).toBe(getPhotoIdentity({ ...file }))
  })

  it('tells apart files with the same name but different content', () => {
    expect(getPhotoIdentity({ name: 'a.jpg', size: 10, lastModified: 5 }))
      .not.toBe(getPhotoIdentity({ name: 'a.jpg', size: 11, lastModified: 5 }))
  })
})

describe('describeRejections', () => {
  it('counts every skipped file and names each reason once', () => {
    expect(describeRejections(['duplicate', 'not-image', 'duplicate'])).toBe('ข้าม 3 ไฟล์ (เลือกซ้ำ, ไม่ใช่รูปภาพ)')
  })
})
