<script setup lang="ts">const route = useRoute(); await navigateTo(`/posts/${route.params.id}`, { redirectCode: 301 })</script>
