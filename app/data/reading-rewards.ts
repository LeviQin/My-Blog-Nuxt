export interface ReadingReward {
  id: string
  threshold: number
  name: string
  description: string
  image: string
}

export const readingRewards: ReadingReward[] = [
  { id: 'leaf-first', threshold: 1, name: '初次落笔', description: '完成第一篇文章', image: '/images/ui/handmade/leaf.webp' },
  { id: 'bookmark-traveler', threshold: 3, name: '书页旅人', description: '完成 3 篇不同文章', image: '/images/ui/handmade/bookmark.webp' },
  { id: 'plant-specimen', threshold: 5, name: '植物标本', description: '完成 5 篇不同文章', image: '/images/ui/handmade/icon-leaf.webp' },
  { id: 'night-reader', threshold: 10, name: '夜读者', description: '完成 10 篇不同文章', image: '/images/ui/handmade/moon.webp' },
  { id: 'journal-collector', threshold: 20, name: '手账收藏家', description: '完成 20 篇不同文章', image: '/images/ui/handmade/paper-title.webp' },
]
