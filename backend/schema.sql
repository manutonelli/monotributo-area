-- AreaGo — Schema Supabase
-- Ejecutar este SQL en el SQL Editor de tu proyecto Supabase

-- Clientes (uno por CUIT)
create table if not exists clientes (
  id bigint generated always as identity primary key,
  cuit text unique not null,
  nombre text not null,
  email text,
  categoria text default 'C',
  estudio text,
  inicio_actividad text default '01/01/2020',
  actividad text default 'Servicios profesionales',
  domicilio text,
  obra_social text default 'OSDE — Plan 210',
  notif_email boolean default true,
  notif_push boolean default true,
  notif_bio boolean default false,
  updated_at timestamptz default now()
);

-- Facturas emitidas
create table if not exists facturas (
  id bigint generated always as identity primary key,
  cuit_emisor text not null,
  numero text not null,
  pto_vta integer default 1,
  tipo text not null,          -- 'C' | 'E'
  cliente_nombre text,
  cliente_cuit text,
  concepto text,
  monto numeric not null,
  fecha text not null,         -- DD/MM/YYYY
  cae text,
  vencimiento_cae text,        -- DD/MM/YYYY
  created_at timestamptz default now(),
  unique(cuit_emisor, numero)
);

create index if not exists facturas_cuit_idx on facturas(cuit_emisor);
create index if not exists facturas_fecha_idx on facturas(cuit_emisor, fecha);

-- VEPs generados
create table if not exists veps (
  id bigint generated always as identity primary key,
  cuit text not null,
  periodo text not null,       -- MM/YYYY
  numero text,
  monto numeric default 0,
  codigo text,
  estado text default 'pendiente',  -- 'pendiente' | 'pagado'
  vencimiento text,            -- DD/MM/YYYY
  created_at timestamptz default now()
);

create index if not exists veps_cuit_idx on veps(cuit);

-- Historial de pagos de cuota mensual
create table if not exists pagos_monotributo (
  id bigint generated always as identity primary key,
  cuit text not null,
  periodo text not null,       -- MM/YYYY
  monto numeric,
  estado text default 'pendiente',   -- 'pendiente' | 'pagado'
  fecha_pago text,
  unique(cuit, periodo)
);

-- Seed de demo (reemplazar CUIT con el real del cliente)
-- insert into clientes (cuit, nombre, categoria, estudio, email, domicilio)
-- values ('27345678901', 'María García', 'C', 'Estudio Contable XYZ', 'maria@email.com', 'Av. Corrientes 1234, CABA');
