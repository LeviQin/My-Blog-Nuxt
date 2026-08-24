<template>
  <div class="container page-section">
    <SectionHeading eyebrow="write to levi" :level="1">联系站长</SectionHeading>
    <p class="page-lead">这里是一封只写给站长的信，不会公开显示，也不会形成访客之间的留言墙。</p>
    <div class="guestbook-layout">
      <section class="paper-card contact-note">
        <p class="eyebrow">private inbox</p>
        <h2>把想说的话交给我</h2>
        <p>可以反馈文章、申请友链、报告页面问题，也可以只是打个招呼。留言会进入后台收件箱，由我单独处理。</p>
        <ul>
          <li>不会在网站公开展示</li>
          <li>邮箱只用于必要时回复</li>
          <li>请不要提交密码、身份证号等敏感信息</li>
        </ul>
      </section>
      <aside class="paper-card form-card"><h2>给站长留言</h2><MessageForm /></aside>
    </div>
  </div>
</template>

<script setup lang="ts">
useBlogSeo({ title: '联系站长', description: '通过私密表单联系 Levi Blog 站长。' })
</script>
