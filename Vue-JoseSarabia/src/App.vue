<template>
  <div id="vue-app" class="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-amber-50">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'

// Función para enviar altura al shell
function sendHeightToShell() {
  const appElement = document.getElementById('vue-app')
  if (appElement) {
    const height = appElement.scrollHeight
    console.log('📏 Altura detectada:', height)
    
    // Enviar mensaje al shell
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'VUE_HEIGHT',
        height: height
      }, '*')
    }
  }
}

// Escuchar mensajes del shell
function handleShellMessage(event: MessageEvent) {
  if (event.data && event.data.type === 'GET_HEIGHT') {
    console.log('📏 Solicitando altura del contenido Vue')
    nextTick(() => {
      sendHeightToShell()
    })
  }
}

onMounted(() => {
  // Escuchar mensajes del shell
  window.addEventListener('message', handleShellMessage)
  
  // Enviar altura inicial después de que se renderice
  nextTick(() => {
    setTimeout(() => {
      sendHeightToShell()
    }, 500)
  })
  
  // Enviar altura cuando cambie la ruta
  const router = useRouter()
  router.afterEach(() => {
    nextTick(() => {
      setTimeout(() => {
        sendHeightToShell()
      }, 300)
    })
  })
})
</script>
