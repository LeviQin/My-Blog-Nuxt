interface LeviConsoleMenu {
  help: () => void
  menu: () => void
  lab: () => void
  garden: () => void
  archive: (year?: string | number) => void
  about: () => void
  theme: (mode?: 'light' | 'dark') => void
  eggs: () => void
  status: () => Promise<void>
  note: () => void
}

declare global {
  interface Window {
    levi?: LeviConsoleMenu
    __leviConsoleMenuInstalled?: boolean
  }
}

const notes = [
  '你发现了页面之外的页面。',
  '有些灵感，藏在打开控制台之后。',
  '愿每一次阅读，都像翻到一页刚刚好的手账。',
  '代码会运行，想法会留下。',
  '今天也给自己留一小块空白。',
]

export default defineNuxtPlugin(() => {
  if (window.__leviConsoleMenuInstalled) return
  window.__leviConsoleMenuInstalled = true

  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const easterEggs = useEasterEggSession()
  const readingRewards = useReadingRewards()

  const navigate = (path: string) => {
    void router.push(path)
  }

  const help = () => {
    console.log('%cLevi\'s Notebook · Developer Menu', 'color:#365643;font-size:16px;font-weight:700;')
    console.log('%c这里没有后台入口，只有一些藏在页面里的小机关。', 'color:#748078;font-style:italic;')
    console.table([
      { 命令: 'levi.lab()', 作用: '打开手账实验室' },
      { 命令: 'levi.garden()', 作用: '打开文章关系地图' },
      { 命令: 'levi.archive()', 作用: '打开文章归档' },
      { 命令: "levi.archive('2025')", 作用: '打开指定年份的时间胶囊' },
      { 命令: 'levi.about()', 作用: '打开关于页面' },
      { 命令: "levi.theme('dark')", 作用: '切换到暗色模式' },
      { 命令: 'levi.theme()', 作用: '切换当前主题' },
      { 命令: 'levi.eggs()', 作用: '查看彩蛋与阅读奖励进度' },
      { 命令: 'levi.status()', 作用: '检查博客服务状态' },
      { 命令: 'levi.note()', 作用: '获取一句随机手记' },
    ])
    console.log('%c提示：也可以直接输入 levi.menu() 再次打开这张菜单。', 'color:#a27b50;')
  }

  const menu: LeviConsoleMenu = {
    help,
    menu: help,
    lab: () => navigate('/lab'),
    garden: () => navigate('/lab#map-title'),
    archive: (year) => {
      const value = String(year ?? '').replace(/\D/g, '').slice(0, 4)
      navigate(value ? `/archive#year-${value}` : '/archive')
    },
    about: () => navigate('/about'),
    theme: (mode) => {
      if (mode === 'light' || mode === 'dark') theme.value = mode
      else toggleTheme()
      console.log(`%c当前主题：${theme.value}`, 'color:#365643;font-weight:700;')
    },
    eggs: () => {
      easterEggs.load()
      readingRewards.load()
      console.table({
        '猫咪探头': easterEggs.state.value.catShown ? '已发现' : '等待发现',
        '萤火虫': `${easterEggs.state.value.fireflyShownCount} 次`,
        '咖啡点击': `${easterEggs.state.value.coffeeClicks} 次`,
        '已读文章': `${readingRewards.state.value.completedArticleIds.length} 篇`,
        '已解锁奖励': `${readingRewards.state.value.unlockedRewardIds.length} 个`,
      })
    },
    status: async () => {
      try {
        const response = await $fetch<{ status?: string }>('/api/service-health', { timeout: 4_000 })
        console.log(response?.status === 'ok' ? '%c服务正常 ✓' : '%c服务状态异常', 'color:#365643;font-weight:700;')
      } catch {
        console.log('%c服务异常 · 请稍后再试', 'color:#b36b45;font-weight:700;')
      }
    },
    note: () => {
      const note = notes[Math.floor(Math.random() * notes.length)]
      console.log(`%c“${note}”`, 'color:#806f5e;font-size:14px;font-style:italic;')
    },
  }

  window.levi = menu

  let printed = false
  try {
    printed = sessionStorage.getItem('levi-console-menu-printed') === '1'
    if (!printed) sessionStorage.setItem('levi-console-menu-printed', '1')
  } catch {}

  if (!printed) help()
})
