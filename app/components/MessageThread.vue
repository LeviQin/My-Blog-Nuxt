<template>
  <div class="message-thread">
    <article v-for="message in messages" :key="message.id" class="message-card">
      <div class="message-avatar"><img v-if="message.user_avatar_url" :src="message.user_avatar_url" :alt="`${message.user_nickname}的头像`" width="38" height="38" loading="lazy" decoding="async"><span v-else>{{ (message.user_nickname || '友').slice(0, 1) }}</span></div>
      <div class="message-body">
        <div class="comment-meta"><strong>{{ message.user_nickname }}</strong><span v-if="message.is_admin" class="admin-badge">博主</span><span v-if="message.city">{{ message.city }}</span><span v-if="message.operating_system" class="message-device">{{ message.operating_system }}</span><span v-if="message.browser" class="message-device">{{ message.browser }}</span><time :datetime="message.created_at || undefined">{{ messageDate(message.created_at) }}</time></div>
        <p>{{ message.content }}</p>
        <MessageThread v-if="message.children?.length" class="message-replies" :messages="message.children" />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~/types/api'
import { messageDate } from '~/utils/blog'
defineProps<{ messages: Message[] }>()
</script>
