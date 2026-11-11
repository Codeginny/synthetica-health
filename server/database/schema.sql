-- =============================================
-- Sistema de TurnosAR - Estructura de Base de Datos
-- Single Source of Truth - Version 1.0
-- =============================================
-- Este script define la estructura completa de la base de datos.
-- Es idempotente: puede ejecutarse múltiples veces sin causar errores.
-- =============================================

-- 1. Limpieza (Opcional, útil para entornos de desarrollo)
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS pacientes;
DROP TABLE IF EXISTS profesionales;

-- 2. Tabla de Pacientes (La base del sistema)
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL, -- UNIQUE asegura que el DNI no se repita
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hash de bcrypt
    telefono VARCHAR(20), -- 20 caracteres para soportar formato internacional (+54...)
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Profesionales (Con lógica de especialidades)
CREATE TABLE profesionales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    clinica VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hash de bcrypt
    telefono VARCHAR(20), -- 20 caracteres para soportar formato internacional
    cuit VARCHAR(20), -- CUIT para facturación AFIP
    precio_consulta DECIMAL(10, 2) DEFAULT 30000.00 -- Regla de negocio: costo fijo
);

-- 4. Tabla de Turnos (La tabla intermedia / El puente)
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    paciente_dni VARCHAR(20),
    paciente_nombre VARCHAR(100),
    paciente_email VARCHAR(150),
    paciente_telefono VARCHAR(20),
    profesional VARCHAR(100) NOT NULL, -- Nombre del profesional (para compatibilidad)
    provincia VARCHAR(100),
    clinica VARCHAR(100),
    especialidad VARCHAR(100),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmado', -- confirmado, completado, cancelado
    precio_consulta DECIMAL(10, 2) DEFAULT 5000.00,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Nombre corregido para compatibilidad
    fecha_cancelacion TIMESTAMP,
    
    -- Columnas de cobertura y pagos
    tipo_cobertura VARCHAR(20) DEFAULT 'particular', -- particular, obra_social, prepaga
    nro_afiliado VARCHAR(50),
    estado_validacion VARCHAR(20),
    monto_sena DECIMAL(10, 2),
    status_sena VARCHAR(20),
    mercado_pago_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Columnas de facturación (AFIP-Ready)
    cae_number VARCHAR(14),
    cae_vencimiento DATE,
    factura_url TEXT,
    tipo_comprobante VARCHAR(50),
    monto_facturado DECIMAL(10, 2),
    fecha_facturacion TIMESTAMP
);

-- 5. Índices para optimizar consultas
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_profesional ON turnos(profesional);
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_turnos_paciente_id ON turnos(paciente_id);

-- 6. Comentarios de documentación
COMMENT ON TABLE pacientes IS 'Tabla de pacientes del sistema de turnos médicos';
COMMENT ON TABLE profesionales IS 'Tabla de profesionales médicos con especialidades';
COMMENT ON TABLE turnos IS 'Tabla de turnos/agendamientos médicos con facturación integrada';

COMMENT ON COLUMN pacientes.dni IS 'DNI único del paciente (índice UNIQUE)';
COMMENT ON COLUMN pacientes.password IS 'Contraseña hasheada con bcrypt';
COMMENT ON COLUMN profesionales.precio_consulta IS 'Costo fijo por consulta (regla de negocio: $30,000)';
COMMENT ON COLUMN turnos.cae_number IS 'Código de Autorización Electrónico de AFIP';
COMMENT ON COLUMN turnos.estado IS 'Estado del turno: confirmado, completado, cancelado';

-- =============================================
-- Estructura completada exitosamente
-- =============================================
