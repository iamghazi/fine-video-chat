<template>
  <div class="h-screen overflow-hidden">
    <router-view />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from '@/components/ui/Toast.vue'
</script>
