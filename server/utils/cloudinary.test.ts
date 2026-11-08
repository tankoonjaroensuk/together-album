import { describe, expect, it } from 'vitest'
import { buildUploadParams, escapeContextValue, getTagForFolder, readGuestName, signCloudinaryParams } from './cloudinary'

describe('signCloudinaryParams', () => {
  it('matches the example in Cloudinary\'s signature documentation', () => {
    const params = { eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop', public_id: 'sample_image', timestamp: 1315060510 }
    expect(signCloudinaryParams(params, 'abcd')).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e')
  })

  it('does not depend on the order the parameters were written in', () => {
    expect(signCloudinaryParams({ b: 2, a: 1 }, 'secret')).toBe(signCloudinaryParams({ a: 1, b: 2 }, 'secret'))
  })
})

describe('buildUploadParams', () => {
  const baseInput = { folder: 'together-album/dev', tag: 'together-album-dev', publicId: 'id-1', guestName: '', timestampSeconds: 100 }

  it('ties the signature to one new photo, so a ticket cannot be reused', () => {
    expect(buildUploadParams(baseInput)).toMatchObject({ public_id: 'id-1', overwrite: 'false' })
  })

  it('only accepts photo formats', () => {
    expect(buildUploadParams(baseInput).allowed_formats).toBe('jpg,png,webp,heic,heif,avif')
  })

  it('leaves out context when the guest gave no name', () => {
    expect(buildUploadParams(baseInput)).not.toHaveProperty('context')
  })

  it('stores the escaped guest name as context', () => {
    expect(buildUploadParams({ ...baseInput, guestName: 'a=b' }).context).toBe('guest_name=a\\=b')
  })
})

describe('escapeContextValue', () => {
  it('escapes the separators Cloudinary uses in context strings', () => {
    expect(escapeContextValue('a=b|c')).toBe('a\\=b\\|c')
  })

  it('leaves Thai names untouched', () => {
    expect(escapeContextValue('น้องมายด์')).toBe('น้องมายด์')
  })
})

describe('readGuestName', () => {
  it('reads the Search API shape', () => {
    expect(readGuestName({ guest_name: 'มายด์' })).toBe('มายด์')
  })

  it('reads the Admin API shape', () => {
    expect(readGuestName({ custom: { guest_name: 'มายด์' } })).toBe('มายด์')
  })

  it('is empty when the guest gave no name', () => {
    expect(readGuestName(undefined)).toBe('')
  })
})

describe('getTagForFolder', () => {
  it('turns the folder path into a single tag', () => {
    expect(getTagForFolder('together-album/production')).toBe('together-album-production')
  })
})
