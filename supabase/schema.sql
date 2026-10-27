-- =============================================================================
-- Shoply · Esquema de la base de datos (Supabase / Postgres)
-- Crea las tablas, las restricciones, la seguridad por filas (RLS), el perfil
-- automático al registrarse y el borrado anual de compras antiguas.
-- Se ejecuta completo en Supabase → SQL Editor. Se puede volver a ejecutar sin errores.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tabla de perfiles
-- Guarda el nombre de usuario. Su id es el mismo del usuario de Supabase Auth;
-- si se borra el usuario, se borra su perfil (on delete cascade).
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_usuario text not null
);


-- -----------------------------------------------------------------------------
-- 2. Tabla de compras (shopping_trips)
-- Una fila por cada vez que el usuario va al supermercado.
-- -----------------------------------------------------------------------------
create table if not exists public.shopping_trips (
  id uuid primary key default gen_random_uuid(),

  -- Por defecto toma el usuario que hace la petición, así la app no tiene que enviarlo.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  tienda text not null check (char_length(trim(tienda)) between 1 and 60),

  -- Fecha del día en que se inicia la compra, en hora de Perú (no en UTC):
  -- una compra iniciada a las 9 p. m. en Lima no debe quedar con la fecha del día siguiente.
  fecha date not null default (now() at time zone 'America/Lima')::date,

  estado text not null default 'en_curso' check (estado in ('en_curso', 'finalizado')),
  iniciado_en timestamptz not null default now(),
  finalizado_en timestamptz,

  -- finalizado_en es nulo mientras la compra esté en curso y tiene valor al finalizarla.
  constraint finalizado_en_coherente check (
    (estado = 'en_curso' and finalizado_en is null)
    or (estado = 'finalizado' and finalizado_en is not null)
  )
);

-- Regla de negocio: una sola compra en curso por usuario.
-- Es un índice único «parcial»: solo cuenta las filas con estado = 'en_curso',
-- así el usuario puede tener muchas compras finalizadas pero nunca dos en curso.
create unique index if not exists una_compra_en_curso_por_usuario
  on public.shopping_trips (user_id)
  where estado = 'en_curso';

-- Acelera las consultas de Inicio e Historial (compras del usuario por estado y fecha).
create index if not exists compras_por_usuario_y_fecha
  on public.shopping_trips (user_id, estado, fecha desc);


-- -----------------------------------------------------------------------------
-- 3. Tabla de productos (trip_items)
-- Cada producto pertenece a una compra. Si se borra la compra, se borran
-- sus productos (on delete cascade). El total NO se guarda: lo calcula la app.
-- -----------------------------------------------------------------------------
create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.shopping_trips (id) on delete cascade,

  -- Los mismos límites que valida la app (src/utils/validaciones.js).
  nombre text not null check (char_length(nombre) between 1 and 60),
  cantidad int not null default 1 check (cantidad between 1 and 99),
  precio_unitario numeric(6, 2) not null check (precio_unitario > 0 and precio_unitario <= 9999.99),

  -- De dónde vino el producto: escrito a mano o leído de la etiqueta con la cámara.
  origen text not null default 'manual' check (origen in ('etiqueta', 'manual')),

  -- Sirve para el orden «lo último, arriba».
  creado_en timestamptz not null default now()
);

-- Acelera la lista de productos de una compra, ya ordenada por lo último agregado.
create index if not exists productos_por_compra
  on public.trip_items (trip_id, creado_en desc);


-- -----------------------------------------------------------------------------
-- 4. Seguridad por filas (Row Level Security)
-- Con RLS activo, Postgres filtra cada consulta: un usuario solo ve y modifica
-- sus propias filas, aunque la clave pública (anon) esté dentro de la app.
-- `(select auth.uid())` se escribe así para que Postgres lo calcule una sola vez por consulta.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.shopping_trips enable row level security;
alter table public.trip_items enable row level security;

-- Perfiles: cada usuario solo puede leer el suyo.
-- (La fila la crea el trigger del punto 5, por eso no hay política de inserción.)
drop policy if exists "Ver mi perfil" on public.profiles;
create policy "Ver mi perfil" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- Compras: leer, crear, editar y borrar solo las propias.
drop policy if exists "Gestionar mis compras" on public.shopping_trips;
create policy "Gestionar mis compras" on public.shopping_trips
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Productos: no tienen user_id, así que se comprueba que su compra (trip_id)
-- pertenezca al usuario.
drop policy if exists "Gestionar productos de mis compras" on public.trip_items;
create policy "Gestionar productos de mis compras" on public.trip_items
  for all to authenticated
  using (
    exists (
      select 1 from public.shopping_trips compra
      where compra.id = trip_items.trip_id
        and compra.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.shopping_trips compra
      where compra.id = trip_items.trip_id
        and compra.user_id = (select auth.uid())
    )
  );


-- -----------------------------------------------------------------------------
-- 5. Perfil automático al registrarse
-- Cuando Supabase Auth crea un usuario, este trigger crea su fila en profiles
-- leyendo `nombre_usuario` de los metadatos que la app envía en signUp.
-- `security definer` permite insertar aunque el usuario aún no tenga sesión.
-- -----------------------------------------------------------------------------
create or replace function public.crear_perfil_de_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre_usuario)
  values (
    new.id,
    -- Si por algún motivo no llega el nombre, se usa la parte del correo antes de la @.
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre_usuario'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_de_usuario();


-- -----------------------------------------------------------------------------
-- 6. Borrado anual de compras antiguas (pg_cron)
-- IMPORTANTE: antes de ejecutar esta parte, habilita la extensión pg_cron en
-- Supabase → Database → Extensions (buscar «pg_cron» y activarla).
--
-- La tarea corre cada 1 de enero a las 05:00 UTC (00:00 en Lima) y borra las
-- compras finalizadas de años anteriores. Sus productos se borran en cascada.
-- La compra en curso nunca se borra.
-- -----------------------------------------------------------------------------
create extension if not exists pg_cron;

-- cron.schedule con el mismo nombre reemplaza la tarea si ya existía.
select cron.schedule(
  'borrado-anual-compras',
  '0 5 1 1 *',
  $$
    delete from public.shopping_trips
    where estado = 'finalizado'
      and fecha < date_trunc('year', now() at time zone 'America/Lima')::date;
  $$
);
