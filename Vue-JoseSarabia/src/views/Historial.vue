
<template>
  <div class="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-amber-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header simple -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-800 mb-2">Mis Compras</h1>
        <p class="text-stone-600">Historial de tus pedidos</p>
      </div>
      
      <!-- Lista simple de compras -->
      <div v-if="cargando" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-stone-200 rounded-full flex items-center justify-center animate-spin">
          <i class="fas fa-coffee text-2xl text-stone-400"></i>
        </div>
        <h3 class="text-xl font-semibold text-stone-700 mb-2">Cargando historial...</h3>
        <p class="text-stone-500">Obteniendo tus compras anteriores</p>
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="compra in compras" :key="compra.id" class="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
          <!-- Información básica -->
          <div class="flex items-center justify-between mb-4">
          <div>
              <h3 class="text-lg font-semibold text-stone-800">{{ compra.numeroPedido }}</h3>
              <p class="text-stone-600 text-sm">{{ compra.fecha }}</p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-stone-800">${{ compra.total }}</p>
              <span :class="getStatusClass(compra.estado)" class="text-xs px-2 py-1 rounded-full">
                {{ compra.estado }}
              </span>
            </div>
          </div>

          <!-- Productos -->
          <div class="space-y-2 mb-4">
            <div v-for="producto in compra.productos" :key="producto.id" class="flex justify-between items-center py-2 border-b border-stone-100">
          <div>
                <p class="font-medium text-stone-800">{{ producto.nombre }}</p>
                <p class="text-sm text-stone-600">{{ producto.descripcion }}</p>
          </div>
              <div class="text-right">
                <p class="font-semibold text-stone-800">${{ producto.precio }}</p>
                <p class="text-xs text-stone-500">Cant: {{ producto.cantidad }}</p>
        </div>
            </div>
          </div>

          <!-- Botón de acción -->
          <div class="flex justify-end">
            <button 
              @click="toggleDetalles(compra.id)"
              class="px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2"
            >
              <i :class="detallesExpandidos.includes(compra.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-xs"></i>
              {{ detallesExpandidos.includes(compra.id) ? 'Ocultar Detalles' : 'Ver Detalles' }}
            </button>
          </div>

          <!-- Detalles expandidos -->
          <transition name="slide-fade">
            <div v-if="detallesExpandidos.includes(compra.id)" class="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h4 class="font-semibold text-stone-800 mb-3">Detalles del Pedido</h4>
            
            <!-- Información del pedido -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm text-stone-600">Número de Pedido:</p>
                <p class="font-medium text-stone-800">{{ compra.numeroPedido }}</p>
              </div>
              <div>
                <p class="text-sm text-stone-600">Estado:</p>
                <span :class="getStatusClass(compra.estado)" class="text-xs px-2 py-1 rounded-full">
                  {{ compra.estado }}
                </span>
              </div>
              <div>
                <p class="text-sm text-stone-600">Fecha:</p>
                <p class="font-medium text-stone-800">{{ compra.fecha }}</p>
              </div>
              <div>
                <p class="text-sm text-stone-600">Total:</p>
                <p class="font-bold text-stone-800">${{ compra.total.toFixed(2) }}</p>
              </div>
            </div>

            <!-- Lista detallada de productos -->
            <div class="border-t border-stone-200 pt-4">
              <h5 class="font-semibold text-stone-800 mb-3">Productos:</h5>
              <div class="space-y-3">
                <div v-for="producto in compra.productos" :key="producto.id" class="flex justify-between items-center p-3 bg-white rounded-lg border border-stone-100">
                  <div class="flex-1">
                    <p class="font-medium text-stone-800">{{ producto.nombre }}</p>
                    <p class="text-sm text-stone-600">{{ producto.descripcion }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-stone-800">${{ producto.precio.toFixed(2) }}</p>
                    <p class="text-xs text-stone-500">Cantidad: {{ producto.cantidad }}</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Mensaje cuando no hay compras -->
      <div v-if="!cargando && compras.length === 0" class="text-center py-12">
        <div class="w-16 h-16 mx-auto mb-4 bg-stone-200 rounded-full flex items-center justify-center">
          <i class="fas fa-shopping-bag text-2xl text-stone-400"></i>
        </div>
        <h3 class="text-xl font-semibold text-stone-700 mb-2">No tienes compras aún</h3>
        <p class="text-stone-500">Realiza tu primera compra para ver tu historial aquí</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { historialService } from '../services/historialService';
import { useRoute } from 'vue-router';

interface ProductoCompra {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
}

interface Compra {
  id: string;
  numeroPedido: string;
  fecha: string;
  estado: string;
  total: number;
  productos: ProductoCompra[];
}

const compras = ref<Compra[]>([]);
const cargando = ref(true);
const route = useRoute();
const detallesExpandidos = ref<string[]>([]);

const cargarHistorial = async () => {
  try {
    console.log('🔄 Iniciando carga de historial...');
    cargando.value = true;
    const historial = await historialService.obtenerHistorialPorUsuario();
    
    console.log('📋 Historial obtenido:', historial);
    
    // Transformar los datos para el formato esperado por el template
    compras.value = historial.map(compra => ({
      id: compra.id,
      numeroPedido: compra.numeroPedido || `#CF-${new Date(compra.fecha).getFullYear()}-${compra.id.slice(-3).toUpperCase()}`,
      fecha: new Date(compra.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      estado: compra.estado || 'Pendiente',
      total: compra.total,
      productos: compra.items.map(item => ({
        id: item.cafeId,
        nombre: item.nombre,
        descripcion: `${item.cantidad} unidad(es)`,
        precio: item.subtotal,
        cantidad: item.cantidad
      }))
    }));
    
    console.log('✅ Compras transformadas:', compras.value);
  } catch (error) {
    console.error('❌ Error cargando historial:', error);
  } finally {
    cargando.value = false;
  }
};

const toggleDetalles = (compraId: string) => {
  const index = detallesExpandidos.value.indexOf(compraId);
  if (index > -1) {
    // Si ya está expandido, lo ocultamos
    detallesExpandidos.value.splice(index, 1);
  } else {
    // Si no está expandido, lo mostramos
    detallesExpandidos.value.push(compraId);
  }
};

const getStatusClass = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'entregado':
    case 'completado':
      return 'bg-emerald-100 text-emerald-800';
    case 'pagado':
      return 'bg-green-100 text-green-800';
    case 'en proceso':
      return 'bg-amber-100 text-amber-800';
    case 'enviado':
      return 'bg-purple-100 text-purple-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-stone-100 text-stone-800';
  }
};

onMounted(() => {
  cargarHistorial();
});

// Recargar historial cuando se navegue a esta página
watch(() => route.path, (newPath) => {
  if (newPath === '/historial') {
    console.log('🔄 Navegación detectada, recargando historial...');
    cargarHistorial();
  }
});
</script>

<style scoped>
/* Transiciones para los detalles */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
