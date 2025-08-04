<template>
  <div class="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-amber-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header del perfil -->
      <div class="backdrop-blur-xl bg-white/30 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-black bg-gradient-to-r from-stone-800 via-amber-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Mi Perfil
            </h1>
            <p class="text-stone-600 text-lg">Gestiona tu información personal y preferencias</p>
          </div>
          <button 
            @click="modoEdicion ? guardarCambios() : (modoEdicion = true)" 
            :disabled="cargando"
            class="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative flex items-center">
              <i :class="modoEdicion ? 'fas fa-save' : 'fas fa-edit'" class="mr-2"></i>
              {{ cargando ? 'Cargando...' : (modoEdicion ? 'Guardar Cambios' : 'Editar Perfil') }}
            </div>
          </button>
        </div>
      </div>

      <!-- Información del perfil -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Tarjeta de información personal -->
        <div class="lg:col-span-2">
          <div class="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl p-8 shadow-xl">
            <h2 class="text-2xl font-bold text-stone-800 mb-6 flex items-center">
              <i class="fas fa-user-circle mr-3 text-amber-600"></i>
              Información Personal
            </h2>
            
            <div class="space-y-6">
              <!-- Avatar y nombre -->
              <div class="flex items-center space-x-6">
                <div class="relative">
                  <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                    {{ perfil.nombre.charAt(0).toUpperCase() }}
                  </div>
                  <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <i class="fas fa-check text-white text-xs"></i>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-2xl font-bold text-stone-800">{{ perfil.nombre }} {{ perfil.apellido }}</h3>
                  <p class="text-stone-600">{{ perfil.email }}</p>
                  <div class="flex items-center mt-2 space-x-2">
                    <span class="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {{ perfil.rol === 'admin' ? '👑 Administrador' : '👤 Cliente' }}
                    </span>
                    <!-- Estado de suscripción -->
                    <span v-if="suscripcionActual" 
                          class="px-3 py-1 rounded-full text-sm font-semibold"
                          :class="{
                            'bg-green-100 text-green-800': suscripcionActual.estado === 'activa',
                            'bg-yellow-100 text-yellow-800': suscripcionActual.estado === 'pausada',
                            'bg-red-100 text-red-800': suscripcionActual.estado === 'cancelada'
                          }">
                      ☕ {{ suscripcionActual.plan?.nombre || 'Plan' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Formulario de datos -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-stone-700 font-medium text-sm">Nombre</label>
                  <input 
                    v-model="perfil.nombre" 
                    :disabled="!modoEdicion"
                    type="text" 
                    class="w-full px-4 py-3 border-2 border-stone-200 rounded-2xl bg-stone-50/50 focus:border-amber-500 focus:bg-white transition-all duration-200" 
                    :class="modoEdicion ? 'focus:ring-4 focus:ring-amber-100' : 'bg-stone-100'"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-stone-700 font-medium text-sm">Apellido</label>
                  <input 
                    v-model="perfil.apellido" 
                    :disabled="!modoEdicion"
                    type="text" 
                    class="w-full px-4 py-3 border-2 border-stone-200 rounded-2xl bg-stone-50/50 focus:border-amber-500 focus:bg-white transition-all duration-200" 
                    :class="modoEdicion ? 'focus:ring-4 focus:ring-amber-100' : 'bg-stone-100'"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-stone-700 font-medium text-sm">Correo electrónico</label>
                  <input 
                    v-model="perfil.email" 
                    :disabled="!modoEdicion"
                    type="email" 
                    class="w-full px-4 py-3 border-2 border-stone-200 rounded-2xl bg-stone-50/50 focus:border-amber-500 focus:bg-white transition-all duration-200" 
                    :class="modoEdicion ? 'focus:ring-4 focus:ring-amber-100' : 'bg-stone-100'"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-stone-700 font-medium text-sm">Teléfono</label>
                  <input 
                    v-model="perfil.telefono" 
                    :disabled="!modoEdicion"
                    type="tel" 
                    class="w-full px-4 py-3 border-2 border-stone-200 rounded-2xl bg-stone-50/50 focus:border-amber-500 focus:bg-white transition-all duration-200" 
                    :class="modoEdicion ? 'focus:ring-4 focus:ring-amber-100' : 'bg-stone-100'"
                    placeholder="+593 99 123 4567"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-stone-700 font-medium text-sm">Fecha de nacimiento</label>
                  <input 
                    v-model="perfil.fecha_nacimiento" 
                    :disabled="!modoEdicion"
                    type="date" 
                    class="w-full px-4 py-3 border-2 border-stone-200 rounded-2xl bg-stone-50/50 focus:border-amber-500 focus:bg-white transition-all duration-200" 
                    :class="modoEdicion ? 'focus:ring-4 focus:ring-amber-100' : 'bg-stone-100'"
                  />
                </div>
                
                <div class="space-y-2 md:col-span-2">
                  <label class="block text-stone-700 font-medium text-sm">Dirección</label>
                  <textarea 
                    v-model="perfil.direccion" 
                    :disabled="!modoEdicion"
                    rows="3"
                    class="w-full px-4 py-3 border-2 border-stone-200 rounded-2xl bg-stone-50/50 focus:border-amber-500 focus:bg-white transition-all duration-200" 
                    :class="modoEdicion ? 'focus:ring-4 focus:ring-amber-100' : 'bg-stone-100'"
                    placeholder="Ingresa tu dirección completa"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Información de Suscripción -->
          <div v-if="suscripcionActual" class="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl p-8 shadow-xl mt-8">
            <h2 class="text-2xl font-bold text-stone-800 mb-6 flex items-center">
              <i class="fas fa-coffee mr-3 text-amber-600"></i>
              Mi Suscripción
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Plan Actual -->
              <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
                <h3 class="font-bold text-gray-900 mb-2">{{ suscripcionActual.plan?.nombre }}</h3>
                <p class="text-gray-600 text-sm mb-4">{{ suscripcionActual.plan?.descripcion }}</p>
                <div class="text-2xl font-bold text-amber-600">${{ suscripcionActual.plan?.precio_mensual }}/mes</div>
                <div class="mt-2">
                  <span class="px-3 py-1 rounded-full text-sm font-semibold"
                        :class="{
                          'bg-green-100 text-green-800': suscripcionActual.estado === 'activa',
                          'bg-yellow-100 text-yellow-800': suscripcionActual.estado === 'pausada',
                          'bg-red-100 text-red-800': suscripcionActual.estado === 'cancelada'
                        }">
                    {{ titleCase(suscripcionActual.estado) }}
                  </span>
                </div>
              </div>
              
              <!-- Próxima Entrega -->
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 class="font-bold text-gray-900 mb-2">Próxima Entrega</h3>
                <p class="text-gray-600 text-sm mb-2">{{ formatDate(suscripcionActual.fecha_proxima_entrega) }}</p>
                <div class="text-lg font-semibold text-blue-600">{{ suscripcionActual.plan?.cantidad_cafe }} kg de café</div>
              </div>
              
              <!-- Frecuencia -->
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 class="font-bold text-gray-900 mb-2">Frecuencia</h3>
                <p class="text-gray-600 text-sm mb-2">{{ suscripcionActual.plan?.frecuencia_entrega }}</p>
                <div class="text-lg font-semibold text-green-600">Desde {{ formatDate(suscripcionActual.fecha_inicio) }}</div>
              </div>
            </div>

            <!-- Beneficios del Plan -->
            <div class="mt-6">
              <h4 class="text-lg font-bold text-gray-900 mb-3">Beneficios incluidos:</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div v-for="beneficio in suscripcionActual.plan?.beneficios" :key="beneficio" 
                     class="flex items-center bg-white/50 rounded-lg p-3">
                  <span class="text-green-500 font-bold mr-3">✓</span>
                  <span class="text-gray-700">{{ beneficio }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de cuenta -->
        <div class="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl p-6 shadow-xl">
          <h3 class="text-lg font-bold text-stone-800 mb-4 flex items-center">
            <i class="fas fa-cog mr-2 text-amber-600"></i>
            Configuración
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div class="flex items-center">
                <i class="fas fa-bell text-stone-600 mr-3"></i>
                <span class="text-sm text-stone-700">Notificaciones</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="configuracion.notificaciones" :disabled="!modoEdicion" class="sr-only peer">
                <div class="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div class="flex items-center">
                <i class="fas fa-envelope text-stone-600 mr-3"></i>
                <span class="text-sm text-stone-700">Newsletter</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="configuracion.newsletter" :disabled="!modoEdicion" class="sr-only peer">
                <div class="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div class="flex items-center">
                <i class="fas fa-shield-alt text-stone-600 mr-3"></i>
                <span class="text-sm text-stone-700">Verificación 2FA</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="configuracion.dos_fa" :disabled="!modoEdicion" class="sr-only peer">
                <div class="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { perfilService, type PerfilUsuario, type ConfiguracionUsuario } from '../services/perfilService';
import { suscripcionService, type SuscripcionUsuario } from '../services/suscripcionService';

const route = useRoute();
const modoEdicion = ref(false);
const cargando = ref(true);
const suscripcionActual = ref<SuscripcionUsuario | null>(null);

const perfil = ref<PerfilUsuario>({
  id: '',
  email: '',
  nombre: 'Usuario',
  apellido: 'Demo',
  telefono: '',
  fecha_nacimiento: '',
  direccion: '',
  rol: 'cliente',
  activo: true,
  creado_en: '',
  actualizado_en: ''
});

const configuracion = ref<ConfiguracionUsuario>({
  id: '',
  usuario_id: '',
  notificaciones: true,
  newsletter: false,
  dos_fa: false,
  tema_oscuro: false,
  idioma: 'es',
  creado_en: '',
  actualizado_en: ''
});

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para convertir a title case
const titleCase = (str: string | undefined): string => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const cargarDatos = async () => {
  try {
    cargando.value = true;
    console.log('🔄 Cargando datos del perfil...');
    
    // Cargar perfil del usuario
    const perfilData = await perfilService.obtenerPerfil();
    console.log('📋 Datos del perfil obtenidos:', perfilData);
    if (perfilData) {
      perfil.value = perfilData;
      console.log('✅ Perfil actualizado:', perfil.value);
    } else {
      console.log('⚠️ No se pudieron obtener los datos del perfil');
    }
    
    // Cargar configuración del usuario
    const configData = await perfilService.obtenerConfiguracion();
    console.log('⚙️ Datos de configuración obtenidos:', configData);
    if (configData) {
      configuracion.value = configData;
      console.log('✅ Configuración actualizada:', configuracion.value);
    } else {
      console.log('⚠️ No se pudieron obtener los datos de configuración');
    }

    // Cargar información de suscripción
    const suscripcionData = await suscripcionService.obtenerSuscripcionActual();
    console.log('☕ Datos de suscripción obtenidos:', suscripcionData);
    if (suscripcionData) {
      suscripcionActual.value = suscripcionData;
      console.log('✅ Suscripción actualizada:', suscripcionActual.value);
    } else {
      console.log('⚠️ No se encontró suscripción activa');
    }
  } catch (error) {
    console.error('❌ Error cargando datos del usuario:', error);
  } finally {
    cargando.value = false;
    console.log('🏁 Carga de datos completada');
  }
};

const guardarCambios = async () => {
  try {
    const exitoPerfil = await perfilService.actualizarPerfil({
      nombre: perfil.value.nombre,
      apellido: perfil.value.apellido,
      telefono: perfil.value.telefono,
      fecha_nacimiento: perfil.value.fecha_nacimiento,
      direccion: perfil.value.direccion
    });

    const exitoConfig = await perfilService.actualizarConfiguracion({
      notificaciones: configuracion.value.notificaciones,
      newsletter: configuracion.value.newsletter,
      dos_fa: configuracion.value.dos_fa,
      tema_oscuro: configuracion.value.tema_oscuro,
      idioma: configuracion.value.idioma
    });

    if (exitoPerfil && exitoConfig) {
      modoEdicion.value = false;
      console.log('Datos guardados exitosamente');
    } else {
      console.error('Error guardando datos');
    }
  } catch (error) {
    console.error('Error guardando cambios:', error);
  }
};

// Watcher para detectar cambios en la ruta y refrescar datos
watch(() => route.path, (newPath) => {
  if (newPath === '/perfil') {
    console.log('🔄 Navegación detectada a /perfil, refrescando datos...');
    cargarDatos();
  }
}, { immediate: true });

onMounted(() => {
  cargarDatos();
});
</script> 