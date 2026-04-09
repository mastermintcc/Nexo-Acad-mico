-- NEXO ACADÊMICO - SUPABASE MIGRATION SCRIPT
-- Este script prepara o banco de dados PostgreSQL do Supabase para receber a aplicação.

-- ==========================================
-- 1. TABELA DE PERFIS (PROFILES)
-- ==========================================
-- Vinculada à tabela interna auth.users do Supabase
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null,
  role text default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  status text default 'Ativo' check (status in ('Ativo', 'Pendente', 'Inativo')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Políticas de Segurança (RLS)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Perfis são visíveis por usuários autenticados.') then
    create policy "Perfis são visíveis por usuários autenticados."
      on public.profiles for select
      using ( auth.role() = 'authenticated' );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Usuários podem atualizar o próprio perfil.') then
    create policy "Usuários podem atualizar o próprio perfil."
      on public.profiles for update
      using ( auth.uid() = id );
  end if;
end $$;

-- ==========================================
-- 2. TABELA DE ANÁLISES (ANALYSES)
-- ==========================================
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_type text not null,
  result text not null,
  type text not null check (type in ('fichamento', 'resenha')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.analyses enable row level security;

-- Políticas de Segurança (RLS)
do $$ 
begin
  if not exists (select 1 from pg_policies where policyname = 'Usuários veem apenas suas próprias análises.') then
    create policy "Usuários veem apenas suas próprias análises."
      on public.analyses for select
      using ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Usuários podem inserir suas próprias análises.') then
    create policy "Usuários podem inserir suas próprias análises."
      on public.analyses for insert
      with check ( auth.uid() = user_id );
  end if;

  if not exists (select 1 from pg_policies where policyname = 'Usuários podem deletar suas próprias análises.') then
    create policy "Usuários podem deletar suas próprias análises."
      on public.analyses for delete
      using ( auth.uid() = user_id );
  end if;
end $$;

-- ==========================================
-- 3. AUTOMAÇÃO: TRIGGER DE NOVO USUÁRIO
-- ==========================================
-- Cria automaticamente um perfil na tabela public.profiles quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuário'), 
    new.email,
    case when new.email = 'mastermintcc@gmail.com' then 'admin' else 'viewer' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger disparado após o insert em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 4. STORAGE (BUCKETS PARA PDF/DOCX)
-- ==========================================
-- Instruções para o Dashboard do Supabase:
-- 1. Vá em 'Storage' -> 'New Bucket'
-- 2. Nome: 'academic-documents'
-- 3. Public: OFF (Privado)
-- 4. Rode as políticas abaixo no SQL Editor para garantir privacidade:

/*
-- Política para Upload (Pasta organizada por ID do usuário)
create policy "Upload de documentos próprios"
on storage.objects for insert
with check (
  bucket_id = 'academic-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para Leitura
create policy "Leitura de documentos próprios"
on storage.objects for select
using (
  bucket_id = 'academic-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
*/
