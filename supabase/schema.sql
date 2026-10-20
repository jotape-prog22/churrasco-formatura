-- Confirmações do churrasco. O público só pode INSERIR; ler é só via admin_rsvps(senha).

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null check (char_length(nome) between 2 and 80),
  vai boolean not null,
  acompanhantes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(acompanhantes) = 'object'),
  bebidas text[] not null default '{}'
    check (bebidas <@ array['cerveja','drinks','refri','suco','agua']::text[])
);

alter table public.rsvps enable row level security;

drop policy if exists "publico confirma" on public.rsvps;
create policy "publico confirma" on public.rsvps
  for insert to anon, authenticated
  with check (true);

revoke all on public.rsvps from anon, authenticated;
grant insert on public.rsvps to anon, authenticated;

-- Senha do painel (tabela sem nenhuma policy: ninguém lê pela API).
create table if not exists public.config_painel (
  chave text primary key,
  valor text not null
);
alter table public.config_painel enable row level security;
revoke all on public.config_painel from anon, authenticated;

create or replace function public.admin_rsvps(senha text)
returns setof public.rsvps
language plpgsql
security definer
set search_path = public
as $$
begin
  if senha is null or senha <> (select valor from public.config_painel where chave = 'senha') then
    raise exception 'senha errada' using errcode = '28P01';
  end if;
  return query select * from public.rsvps order by created_at desc;
end;
$$;

revoke all on function public.admin_rsvps(text) from public;
grant execute on function public.admin_rsvps(text) to anon, authenticated;

-- Defina a senha do painel (troque o valor):
-- insert into public.config_painel (chave, valor) values ('senha', 'TROQUE-AQUI')
--   on conflict (chave) do update set valor = excluded.valor;
