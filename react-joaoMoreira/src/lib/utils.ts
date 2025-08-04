/**
 * Genera un UUID v4 válido
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Genera o recupera un ID de usuario temporal desde localStorage
 */
export function getUserTempId(): string {
  const storageKey = 'coffecraft-temp-user-id';
  
  // Intentar obtener ID existente del localStorage
  const existingId = localStorage.getItem(storageKey);
  
  if (existingId) {
    return existingId;
  }
  
  // Generar nuevo ID y guardarlo
  const newId = generateUUID();
  localStorage.setItem(storageKey, newId);
  
  return newId;
}

/**
 * Formatea un precio en dólares
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Valida si una cadena es un UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 