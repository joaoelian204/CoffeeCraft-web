<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Nuestra Ubicación</h1>
      <p class="text-gray-600">Visítanos en nuestra cafetería</p>
    </div>

    <!-- Información de contacto -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-lg border border-amber-100">
        <div class="flex items-center mb-4">
          <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-full mr-4">
            <i class="fas fa-map-marker-alt text-white text-lg"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Información de Contacto</h2>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-start">
            <i class="fas fa-map-marker-alt text-amber-500 mt-1 mr-3"></i>
            <div>
              <h3 class="font-semibold text-gray-800">Dirección</h3>
              <p class="text-gray-600">Guatemala, Guatemala</p>
              <p class="text-sm text-gray-500">Coordenadas: 14.5343, -90.7484</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <i class="fas fa-clock text-amber-500 mt-1 mr-3"></i>
            <div>
              <h3 class="font-semibold text-gray-800">Horarios de Atención</h3>
              <p class="text-gray-600">Lunes a Viernes: 7:00 AM - 8:00 PM</p>
              <p class="text-gray-600">Sábados: 8:00 AM - 9:00 PM</p>
              <p class="text-gray-600">Domingos: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <i class="fas fa-phone text-amber-500 mt-1 mr-3"></i>
            <div>
              <h3 class="font-semibold text-gray-800">Teléfono</h3>
              <p class="text-gray-600">+502 1234-5678</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <i class="fas fa-envelope text-amber-500 mt-1 mr-3"></i>
            <div>
              <h3 class="font-semibold text-gray-800">Email</h3>
              <p class="text-gray-600">info@coffecraft.com</p>
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-6 border-t border-gray-200">
          <button 
            @click="abrirEnGoogleMaps"
            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <i class="fas fa-external-link-alt mr-2"></i>Abrir en Google Maps
          </button>
        </div>
      </div>

      <!-- Servicios disponibles -->
      <div class="bg-white p-6 rounded-xl shadow-lg border border-amber-100">
        <div class="flex items-center mb-4">
          <div class="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full mr-4">
            <i class="fas fa-coffee text-white text-lg"></i>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Nuestros Servicios</h2>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center p-3 bg-green-50 rounded-lg">
            <i class="fas fa-wifi text-green-500 mr-3"></i>
            <span class="text-gray-700">WiFi Gratis</span>
          </div>
          
          <div class="flex items-center p-3 bg-blue-50 rounded-lg">
            <i class="fas fa-car text-blue-500 mr-3"></i>
            <span class="text-gray-700">Estacionamiento</span>
          </div>
          
          <div class="flex items-center p-3 bg-purple-50 rounded-lg">
            <i class="fas fa-credit-card text-purple-500 mr-3"></i>
            <span class="text-gray-700">Tarjetas</span>
          </div>
          
          <div class="flex items-center p-3 bg-orange-50 rounded-lg">
            <i class="fas fa-shopping-bag text-orange-500 mr-3"></i>
            <span class="text-gray-700">Para Llevar</span>
          </div>
          
          <div class="flex items-center p-3 bg-red-50 rounded-lg">
            <i class="fas fa-chair text-red-500 mr-3"></i>
            <span class="text-gray-700">Área de Estudio</span>
          </div>
          
          <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
            <i class="fas fa-users text-yellow-500 mr-3"></i>
            <span class="text-gray-700">Eventos</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mapa -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-100">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-full mr-4">
              <i class="fas fa-map text-white text-lg"></i>
            </div>
            <h2 class="text-xl font-semibold text-gray-800">Ubicación en el Mapa</h2>
          </div>
          
          <div class="flex space-x-2">
            <button 
              @click="tipoMapa = 'interactivo'"
              :class="tipoMapa === 'interactivo' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <i class="fas fa-mouse mr-2"></i>Interactivo
            </button>
            <button 
              @click="tipoMapa = 'street'"
              :class="tipoMapa === 'street' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              <i class="fas fa-street-view mr-2"></i>Street View
            </button>
          </div>
        </div>
      </div>
      
      <div class="relative">
        <!-- Mapa Interactivo (Google Maps estándar) -->
        <div v-if="tipoMapa === 'interactivo'" class="w-full">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.7899!2d-90.7484!3d14.5343!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDMyJzAzLjUiTiA5MMKwNDQnNTQuMiJX!5e0!3m2!1ses!2sgt!4v1753366994685!5m2!1ses!2sgt"
            width="100%" 
            height="500" 
            style="border:0;" 
            allowfullscreen
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="rounded-none"
          ></iframe>
        </div>
        
        <!-- Street View (el que ya tienes) -->
        <div v-if="tipoMapa === 'street'" class="w-full">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!4v1753366994685!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRDQ4dFNDc3dF!2m2!1d14.53436283121125!2d-90.74839018111709!3f113.78308908479029!4f7.115266944751625!5f0.7820865974627469" 
            width="100%" 
            height="500" 
            style="border:0;" 
            allowfullscreen
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="rounded-none"
          ></iframe>
        </div>
        
        <!-- Overlay con información -->
        <div class="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
          <div class="flex items-center mb-2">
            <i class="fas fa-store text-amber-500 mr-2"></i>
            <h3 class="font-semibold text-gray-800">CoffeCraft</h3>
          </div>
          <p class="text-sm text-gray-600 mb-2">Tu cafetería de especialidad en Guatemala</p>
          <div class="flex items-center text-xs text-gray-500">
            <i class="fas fa-star text-yellow-400 mr-1"></i>
            <span>4.8/5</span>
            <span class="mx-2">•</span>
            <span>Abierto ahora</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Cómo llegar -->
    <div class="mt-8 bg-white p-6 rounded-xl shadow-lg border border-amber-100">
      <div class="flex items-center mb-4">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full mr-4">
          <i class="fas fa-route text-white text-lg"></i>
        </div>
        <h2 class="text-xl font-semibold text-gray-800">Cómo Llegar</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <i class="fas fa-car text-blue-500 text-2xl mb-3"></i>
          <h3 class="font-semibold text-gray-800 mb-2">En Auto</h3>
          <p class="text-sm text-gray-600">Estacionamiento disponible en el lugar</p>
        </div>
        
        <div class="text-center p-4 bg-green-50 rounded-lg">
          <i class="fas fa-bus text-green-500 text-2xl mb-3"></i>
          <h3 class="font-semibold text-gray-800 mb-2">Transporte Público</h3>
          <p class="text-sm text-gray-600">Líneas 15, 23 y 45 paran cerca</p>
        </div>
        
        <div class="text-center p-4 bg-purple-50 rounded-lg">
          <i class="fas fa-walking text-purple-500 text-2xl mb-3"></i>
          <h3 class="font-semibold text-gray-800 mb-2">A Pie</h3>
          <p class="text-sm text-gray-600">Zona peatonal segura y accesible</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tipoMapa = ref<'interactivo' | 'street'>('street');

const abrirEnGoogleMaps = () => {
  const url = 'https://www.google.com/maps/search/?api=1&query=14.53436283121125,-90.74839018111709';
  window.open(url, '_blank');
};
</script>
