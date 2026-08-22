import type { LanguageDefinition } from './types';

export const zh: LanguageDefinition = {
  code: 'zh',
  name: '中文',
  shortName: '中文',
  locale: 'zh',
  periodOptions: [
    { label: '24 小时', value: 24 },
    { label: '48 小时', value: 48 },
    { label: '72 小时', value: 72 },
    { label: '7 天', value: 168 },
    { label: '30 天' },
  ],
  sessionLabels: {
    Qualifying: '排位赛',
    Race: '正赛',
    Sprint: '冲刺赛',
  },
  texts: {
    heroTitle: 'My race weekend',
    heroSubtitle: '掌握赛周节奏：筛选系列、调整查看窗口，并在本地时区追踪各场次开始时间。',
    seriesLabel: '系列',
    activeSelection: names => `已选择：${names.join(' · ')}`,
    allSeriesHidden: '所有系列已隐藏',
    reviewPeriodLabel: '查看窗口',
    eventsInWindowLabel: '窗口内的赛事',
    nextStartLabel: '下一场次',
    noEvents: '暂无赛事',
    extendPeriodHint: '试着延长查看窗口',
    countdownStart: relative => `将于 ${relative} 开始`,
    countdownLive: relative => (relative ? `正在进行 • 开始于 ${relative}` : '正在进行'),
    countdownFinish: relative => `已于 ${relative} 结束`,
    countdownScheduled: '按计划进行',
    trackLayoutLabel: parts => (parts.length ? `赛道布局：${parts.join(' — ')}` : '赛道布局'),
    theme: {
      toggleToDark: '切换到深色主题',
      toggleToLight: '切换到浅色主题',
    },
    upcomingEventDescriptorFallback: '暂无赛事',
    brandName: 'RaceSync',
    navFeatures: '功能',
    navFaq: '常见问题',
    heroCta: '查看赛程',
    scheduleTitle: '周末赛程流',
    scheduleSubtitle: '开赛时间实时更新并匹配你的时区。',
    scheduleLoadingLabel: '正在加载赛程…',
    scheduleErrorTitle: '无法加载赛程',
    scheduleErrorDescription: '请重试。如果问题持续，请直接打开赛程文件。',
    scheduleRetryButton: '重试',
    scheduleErrorFallbackPrefix: '诊断文件：',
    scheduleIcsLinkLabel: '打开 schedule.ics',
    featuresTitle: '为什么选择 RaceSync',
    featuresSubtitle: '为赛车周末而生的实用功能。',
    features: [
      {
        title: '自动换算本地时间',
        description: '所有赛程都会自动转换到你的设备时区，无需再手动换算。',
      },
      {
        title: '多系列一键切换',
        description: '自由切换 F1、F2、F3 或 MotoGP，只保留你真正关心的比赛。',
      },
      {
        title: '赛道示意随时可见',
        description: '每一站都附带赛道轮廓与关键信息，帮助你迅速了解赛况。',
      },
    ],
    insightsTitle: '如何使用',
    insightsSubtitle: '三步即可掌握整个赛道周末。',
    insightsSteps: [
      {
        title: '选择关注的系列',
        description: '只保留你追随的锦标赛，其他全部隐藏。',
      },
      {
        title: '调整查看窗口',
        description: '最长可延展至 30 天，也可以聚焦未来 24 小时。',
      },
      {
        title: '关注倒计时提示',
        description: '动态倒计时会提醒你距离起跑或结束还有多久。',
      },
    ],
    faqTitle: '常见问题',
    faqSubtitle: '快速解答社区里最常提到的疑问。',
    faqItems: [
      {
        question: '数据来源是什么？',
        answer: '我们同步各系列的官方日历，并在更新后自动刷新页面内容。',
      },
      {
        question: '手机上体验如何？',
        answer: '界面针对移动端优化，并会在本地保存语言和筛选设置。',
      },
      {
        question: '为什么找不到某个赛事？',
        answer: '请确认对应系列已启用，并适当延长查看窗口即可找到。',
      },
    ],
    ctaTitle: '准备好出发了吗？',
    ctaSubtitle: '打开实时日历，设定你的偏好，抢先锁定每一次灯灭。',
    ctaButton: '立即打开',
    footer: {
      tagline: 'RaceSync 让全球车迷在同一节奏下迎接每个赛道周末。',
      productHeading: '产品',
      resourcesHeading: '资源',
      supportHeading: '支持',
      contactEmailLabel: '团队邮箱',
      contactEmail: 'hello@racesync.app',
      legal: '© {year} RaceSync。保留所有权利。',
      productLinks: [
        { label: '赛程', href: '#schedule' },
        { label: '功能', href: '#features' },
        { label: '如何使用', href: '#insights' },
      ],
      resourcesLinks: [
        { label: '常见问题', href: '#faq' },
        { label: '下载 .ics', href: './schedule.ics' },
      ],
      supportLinks: [
        { label: '邮件联系', href: 'mailto:hello@racesync.app' },
        { label: '隐私政策', href: '#privacy' },
      ],
    },
    privacyPolicy: {
      title: '隐私政策',
      lastUpdated: '最后更新：2024 年 3 月 20 日',
      intro: [
        'RaceSync 致力于帮助车迷跟踪赛车日程，并尽可能少地收集个人数据。本政策说明当你访问我们的网站或订阅日历时会处理哪些信息。',
      ],
      sections: [
        {
          title: '我们收集哪些数据',
          paragraphs: ['我们仅收集维持和改进服务所必需的信息。'],
          list: [
            '你主动发送至 hello@racesync.app 的联系信息。',
            '关于页面访问和功能使用情况的匿名分析数据。',
            '为保障网站安全稳定而自动生成的技术日志。',
          ],
        },
        {
          title: '我们如何使用这些信息',
          paragraphs: ['这些数据帮助我们不断优化 RaceSync，并为所有用户保持稳定体验。'],
          list: [
            '回复你通过电子邮件提交的问题或反馈。',
            '了解车迷最常使用的版块和功能。',
            '排查技术问题并防止对基础设施的滥用。',
          ],
        },
        {
          title: '数据保留与安全',
          paragraphs: [
            '只有少量 RaceSync 团队成员可以访问这些数据。分析数据以聚合方式保存，不会识别个人访客。',
            '你的邮件仅会在处理需求所需的时间内保留，之后会从活跃系统中删除。',
          ],
        },
        {
          title: '你的选择',
          paragraphs: [
            '你可以通过浏览器或拦截扩展限制匿名分析。如果希望删除之前提供的信息，请与我们联系，我们会尽快处理。',
          ],
        },
      ],
      conclusion: '若对 RaceSync 的隐私保护有任何疑问，请发送邮件至 hello@racesync.app，我们会尽快回复。',
      closeLabel: '关闭',
    },
  },
};
