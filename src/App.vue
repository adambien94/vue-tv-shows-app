<template>
  <OfflineBanner />
  <RouterView />
  <SyncStatus />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import SyncStatus from '@/components/feedback/SyncStatus.vue'
import OfflineBanner from '@/components/feedback/OfflineBanner.vue'
</script>

<style scoped></style>
