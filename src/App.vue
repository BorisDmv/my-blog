<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page-fade-slide" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<style>
/* Add this to prevent layout flickering during the 0.5s transition */
.page-fade-slide-leave-active {
  position: absolute;
  width: 100%;
}
</style>