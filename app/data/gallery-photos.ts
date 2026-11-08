export interface GalleryPhoto {
  /** Full-size image for the lightbox */
  src: string
  /** Smaller image for the grid; `src` is used when there is none */
  thumbnailSrc?: string
  alt: string
}

export const leftColumnPhotos: GalleryPhoto[] = [
  {
    src: '/couple-lakeside-evening.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวยืนชิดกันริมทะเลสาบยามเย็น',
  },
  {
    src: '/couple-holding-hands-sunset.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวจับมือกันริมทะเลสาบตอนพระอาทิตย์ตก',
  },
  {
    src: '/bride-hugging-groom-from-behind.jpg',
    alt: 'เจ้าสาวกอดเจ้าบ่าวจากด้านหลังริมทะเลสาบ',
  },
]

export const featuredPhoto: GalleryPhoto = {
  src: '/bride-red-roses-lawn.jpg',
  alt: 'เจ้าสาวถือช่อกุหลาบแดงยิ้มให้เจ้าบ่าวบนสนามหญ้า',
}

export const rightColumnPhotos: GalleryPhoto[] = [
  {
    src: '/couple-holding-hands-lawn.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวจับมือกันบนสนามหญ้าริมทะเลสาบ',
  },
  {
    src: '/couple-walking-black-and-white.jpg',
    alt: 'ภาพขาวดำเจ้าบ่าวเจ้าสาวจูงมือกันเดินบนสนามหญ้า',
  },
  {
    src: '/couple-lakeside-veil.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวยืนคู่กันริมทะเลสาบ เจ้าสาวสวมผ้าคลุมหน้า',
  },
]

// Featured first because it is the first photo phones show; arrows in the lightbox follow this order
export const lightboxPhotos: GalleryPhoto[] = [featuredPhoto, ...leftColumnPhotos, ...rightColumnPhotos]

// The landscape sunset shot heads the page on every screen size
export const heroPhotoSrc = leftColumnPhotos[1]!.src
