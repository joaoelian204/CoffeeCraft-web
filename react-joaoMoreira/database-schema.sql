-- ==========================================
-- ESQUEMA DE BASE DE DATOS PARA COFFEECRAFT
-- ==========================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLA: productos
-- ==========================================
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    precio_original DECIMAL(10,2) CHECK (precio_original >= 0),
    descuento INTEGER CHECK (descuento >= 0 AND descuento <= 100),
    origen VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    nivel_tostado VARCHAR(20) NOT NULL CHECK (nivel_tostado IN ('ligero', 'medio', 'oscuro')),
    notas_sabor TEXT[] DEFAULT '{}',
    imagen_url TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('origen-unico', 'mezcla', 'especial', 'organico', 'arabica', 'robusta', 'comercial')),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    peso INTEGER NOT NULL CHECK (peso > 0), -- en gramos
    calificacion DECIMAL(3,2) DEFAULT 0.0 CHECK (calificacion >= 0 AND calificacion <= 5),
    cantidad_resenas INTEGER DEFAULT 0 CHECK (cantidad_resenas >= 0),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: usuarios
-- ==========================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: categorias
-- ==========================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    cantidad_productos INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: reseñas
-- ==========================================
CREATE TABLE resenas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_producto UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nombre_usuario VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: promociones
-- ==========================================
CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    descuento INTEGER NOT NULL CHECK (descuento >= 0 AND descuento <= 100),
    productos_aplicables UUID[] DEFAULT '{}',
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    codigo_promo VARCHAR(50) UNIQUE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: cancelaciones_pedidos
-- ==========================================
CREATE TABLE cancelaciones_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_pedido UUID NOT NULL, -- Referencia a tabla de pedidos (no creada aquí)
    id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    motivo VARCHAR(50) NOT NULL CHECK (motivo IN ('cambio-opinion', 'producto-defectuoso', 'entrega-tardia', 'error-pedido', 'precio-mejor', 'problema-pago', 'otros')),
    descripcion TEXT,
    fecha_cancelacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado_reembolso VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_reembolso IN ('pendiente', 'procesando', 'completado', 'rechazado')),
    monto_reembolso DECIMAL(10,2),
    fecha_reembolso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: cuestionarios
-- ==========================================
CREATE TABLE cuestionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    tiempo_estimado INTEGER DEFAULT 5, -- en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: preguntas_cuestionario
-- ==========================================
CREATE TABLE preguntas_cuestionario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cuestionario_id UUID NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'opcion_unica' CHECK (tipo IN ('opcion_unica', 'multiple_choice', 'escala')),
    categoria VARCHAR(50), -- para agrupar preguntas (intensidad, sabor, etc.)
    orden INTEGER NOT NULL,
    obligatoria BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: opciones_pregunta
-- ==========================================
CREATE TABLE opciones_pregunta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregunta_id UUID NOT NULL REFERENCES preguntas_cuestionario(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    valor INTEGER NOT NULL, -- para calcular recomendación
    categoria VARCHAR(50), -- para agrupar opciones (afrutado, chocolate, etc.)
    orden INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: respuestas_cuestionario
-- ==========================================
CREATE TABLE respuestas_cuestionario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cuestionario_id UUID NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
    respuestas JSONB NOT NULL, -- Array de objetos {idPregunta, idOpcion}
    fecha_completado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: perfiles_sabor
-- ==========================================
CREATE TABLE perfiles_sabor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    preferencias JSONB NOT NULL, -- Objeto con intensidad, acidez, dulzura, amargor, saboresFavoritos, nivelesTostadoPreferidos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: recomendaciones_ia
-- ==========================================
CREATE TABLE recomendaciones_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    productos_recomendados JSONB NOT NULL, -- Array de productos recomendados
    fecha_generada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activa BOOLEAN DEFAULT true,
    calificacion_usuario INTEGER CHECK (calificacion_usuario >= 1 AND calificacion_usuario <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ==========================================

-- Índices para productos
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_nivel_tostado ON productos(nivel_tostado);
CREATE INDEX idx_productos_origen ON productos(origen);
CREATE INDEX idx_productos_region ON productos(region);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_calificacion ON productos(calificacion);
CREATE INDEX idx_productos_stock ON productos(stock);
CREATE INDEX idx_productos_descuento ON productos(descuento) WHERE descuento > 0;

-- Índices para reseñas
CREATE INDEX idx_resenas_id_producto ON resenas(id_producto);
CREATE INDEX idx_resenas_id_usuario ON resenas(id_usuario);
CREATE INDEX idx_resenas_fecha ON resenas(fecha);
CREATE INDEX idx_resenas_calificacion ON resenas(calificacion);

-- Índices para promociones
CREATE INDEX idx_promociones_activo ON promociones(activo);
CREATE INDEX idx_promociones_fecha_inicio ON promociones(fecha_inicio);
CREATE INDEX idx_promociones_fecha_fin ON promociones(fecha_fin);
CREATE INDEX idx_promociones_codigo ON promociones(codigo_promo) WHERE codigo_promo IS NOT NULL;

-- Índices para cancelaciones
CREATE INDEX idx_cancelaciones_id_pedido ON cancelaciones_pedidos(id_pedido);
CREATE INDEX idx_cancelaciones_id_usuario ON cancelaciones_pedidos(id_usuario);
CREATE INDEX idx_cancelaciones_estado ON cancelaciones_pedidos(estado_reembolso);
CREATE INDEX idx_cancelaciones_fecha ON cancelaciones_pedidos(fecha_cancelacion);

-- Índices para cuestionarios
CREATE INDEX idx_cuestionarios_activo ON cuestionarios(activo);
CREATE INDEX idx_preguntas_cuestionario_id ON preguntas_cuestionario(cuestionario_id);
CREATE INDEX idx_preguntas_orden ON preguntas_cuestionario(orden);
CREATE INDEX idx_opciones_pregunta_id ON opciones_pregunta(pregunta_id);
CREATE INDEX idx_opciones_orden ON opciones_pregunta(orden);

-- Índices para respuestas y recomendaciones
CREATE INDEX idx_respuestas_usuario_id ON respuestas_cuestionario(usuario_id);
CREATE INDEX idx_respuestas_cuestionario_id ON respuestas_cuestionario(cuestionario_id);
CREATE INDEX idx_respuestas_fecha ON respuestas_cuestionario(fecha_completado);
CREATE INDEX idx_perfiles_usuario_id ON perfiles_sabor(usuario_id);
CREATE INDEX idx_recomendaciones_usuario_id ON recomendaciones_ia(usuario_id);
CREATE INDEX idx_recomendaciones_activa ON recomendaciones_ia(activa);
CREATE INDEX idx_recomendaciones_fecha ON recomendaciones_ia(fecha_generada);

-- ==========================================
-- FUNCIONES Y TRIGGERS
-- ==========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON resenas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promociones_updated_at BEFORE UPDATE ON promociones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cancelaciones_updated_at BEFORE UPDATE ON cancelaciones_pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cuestionarios_updated_at BEFORE UPDATE ON cuestionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_preguntas_updated_at BEFORE UPDATE ON preguntas_cuestionario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opciones_updated_at BEFORE UPDATE ON opciones_pregunta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_respuestas_updated_at BEFORE UPDATE ON respuestas_cuestionario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles_sabor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recomendaciones_updated_at BEFORE UPDATE ON recomendaciones_ia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar calificación promedio de productos
CREATE OR REPLACE FUNCTION update_producto_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar calificación promedio y cantidad de reseñas
    UPDATE productos 
    SET 
        calificacion = (
            SELECT COALESCE(AVG(calificacion), 0)
            FROM resenas 
            WHERE id_producto = COALESCE(NEW.id_producto, OLD.id_producto)
        ),
        cantidad_resenas = (
            SELECT COUNT(*)
            FROM resenas 
            WHERE id_producto = COALESCE(NEW.id_producto, OLD.id_producto)
        )
    WHERE id = COALESCE(NEW.id_producto, OLD.id_producto);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para actualizar calificación de productos
CREATE TRIGGER update_producto_rating_insert AFTER INSERT ON resenas FOR EACH ROW EXECUTE FUNCTION update_producto_rating();
CREATE TRIGGER update_producto_rating_update AFTER UPDATE ON resenas FOR EACH ROW EXECUTE FUNCTION update_producto_rating();
CREATE TRIGGER update_producto_rating_delete AFTER DELETE ON resenas FOR EACH ROW EXECUTE FUNCTION update_producto_rating();

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, imagen_url) VALUES
('Origen Único', 'Cafés de origen único con características distintivas', '/images/categorias/origen-unico.jpg'),
('Mezcla', 'Mezclas cuidadosamente balanceadas', '/images/categorias/mezcla.jpg'),
('Especial', 'Cafés especiales de alta calidad', '/images/categorias/especial.jpg'),
('Orgánico', 'Cafés cultivados sin pesticidas', '/images/categorias/organico.jpg'),
('Arábica', 'Cafés 100% Arábica', '/images/categorias/arabica.jpg'),
('Robusta', 'Cafés Robusta con alto contenido de cafeína', '/images/categorias/robusta.jpg'),
('Comercial', 'Cafés comerciales de uso diario', '/images/categorias/comercial.jpg');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, precio_original, descuento, origen, region, nivel_tostado, notas_sabor, imagen_url, categoria, stock, peso, calificacion, cantidad_resenas) VALUES
('Colombia Huila', 'Café de altura con notas dulces y cuerpo medio', 25.99, 29.99, 13, 'Colombia', 'Huila', 'medio', ARRAY['chocolate', 'caramelo', 'naranja'], '/images/productos/colombia-huila.jpg', 'origen-unico', 50, 250, 4.5, 12),
('Ethiopia Yirgacheffe', 'Café floral con notas cítricas y té', 32.99, NULL, NULL, 'Etiopía', 'Yirgacheffe', 'ligero', ARRAY['bergamota', 'jazmín', 'limón'], '/images/productos/ethiopia-yirgacheffe.jpg', 'especial', 30, 250, 4.8, 8),
('Brazil Santos', 'Café suave con notas de nueces', 18.99, 22.99, 17, 'Brasil', 'Santos', 'medio', ARRAY['nuez', 'chocolate', 'caramelo'], '/images/productos/brazil-santos.jpg', 'comercial', 100, 500, 4.2, 25),
('Guatemala Antigua', 'Café complejo con notas especiadas', 28.99, NULL, NULL, 'Guatemala', 'Antigua', 'medio', ARRAY['canela', 'chocolate', 'tabaco'], '/images/productos/guatemala-antigua.jpg', 'origen-unico', 40, 250, 4.6, 15),
('Costa Rica Tarrazú', 'Café brillante con acidez cítrica', 26.99, 31.99, 16, 'Costa Rica', 'Tarrazú', 'medio', ARRAY['limón', 'miel', 'manzana'], '/images/productos/costa-rica-tarrazu.jpg', 'especial', 35, 250, 4.7, 10),
('Mezcla House', 'Nuestra mezcla signature balanceada', 22.99, NULL, NULL, 'Múltiples', 'Varias', 'medio', ARRAY['chocolate', 'caramelo', 'nuez'], '/images/productos/mezcla-house.jpg', 'mezcla', 75, 500, 4.4, 30),
('Peru Orgánico', 'Café orgánico certificado', 24.99, 27.99, 11, 'Perú', 'Cusco', 'medio', ARRAY['chocolate', 'frutos rojos', 'nuez'], '/images/productos/peru-organico.jpg', 'organico', 45, 250, 4.3, 18),
('Sumatra Mandheling', 'Café de cuerpo completo y baja acidez', 29.99, NULL, NULL, 'Indonesia', 'Sumatra', 'oscuro', ARRAY['tierra', 'especias', 'tabaco'], '/images/productos/sumatra-mandheling.jpg', 'origen-unico', 25, 250, 4.5, 12);

-- Actualizar cantidad de productos en categorías
UPDATE categorias SET cantidad_productos = (
    SELECT COUNT(*) FROM productos WHERE categoria = categorias.nombre
); 