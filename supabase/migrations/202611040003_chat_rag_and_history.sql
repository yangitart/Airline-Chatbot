create extension if not exists vector with schema extensions;

create table if not exists public.faq_corpus_versions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'staging' check (status in ('staging', 'published', 'superseded')),
  expected_documents integer not null check (expected_documents > 0),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create unique index if not exists faq_one_published_corpus_idx
  on public.faq_corpus_versions (status) where status = 'published';

create table if not exists public.faq_documents (
  version_id uuid not null references public.faq_corpus_versions(id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  title text not null,
  source_url text not null,
  source_category text not null,
  source_type text not null,
  language text not null default 'en',
  content_hash text not null,
  fetched_at timestamptz not null default now(),
  reviewed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (version_id, id),
  unique (version_id, source_url)
);

create table if not exists public.faq_chunks (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null,
  document_id text not null,
  chunk_index integer not null check (chunk_index >= 0),
  section_title text not null default '',
  content text not null check (char_length(content) between 1 and 6000),
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  unique (version_id, document_id, chunk_index),
  foreign key (version_id, document_id) references public.faq_documents(version_id, id) on delete cascade
);

create index if not exists faq_chunks_embedding_hnsw_idx
  on public.faq_chunks using hnsw (embedding extensions.vector_cosine_ops);
create index if not exists faq_chunks_document_idx on public.faq_chunks (version_id, document_id, chunk_index);

alter table public.faq_documents enable row level security;
alter table public.faq_chunks enable row level security;
alter table public.faq_corpus_versions enable row level security;

revoke all on public.faq_corpus_versions, public.faq_documents, public.faq_chunks from anon, authenticated;
grant all on public.faq_corpus_versions, public.faq_documents, public.faq_chunks to service_role;
grant usage on schema extensions to authenticated, service_role;

create or replace function public.match_faq_chunks(
  p_query_embedding extensions.vector(1536),
  p_match_count integer default 6
)
returns table (
  document_id text,
  title text,
  source_category text,
  section_title text,
  content text,
  similarity real
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  return query
    select d.id,
      d.title,
      d.source_category,
      c.section_title,
      c.content,
      (1 - (c.embedding OPERATOR(extensions.<=>) p_query_embedding))::real
    from public.faq_chunks as c
    join public.faq_documents as d on d.id = c.document_id and d.version_id = c.version_id
    join public.faq_corpus_versions as v on v.id = d.version_id and v.status = 'published'
      and v.published_at >= now() - interval '90 days'
    order by c.embedding OPERATOR(extensions.<=>) p_query_embedding
    limit greatest(1, least(coalesce(p_match_count, 6), 8));
end;
$$;

revoke all on function public.match_faq_chunks(extensions.vector, integer) from public, anon;
grant execute on function public.match_faq_chunks(extensions.vector, integer) to authenticated;

create or replace function public.publish_faq_corpus_version(p_version_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected integer;
  v_document_count integer;
  v_chunk_count integer;
begin
  select expected_documents into v_expected
    from public.faq_corpus_versions
    where id = p_version_id and status = 'staging'
    for update;
  if not found then
    raise exception using errcode = '22023', message = 'faq_corpus_version_not_staging';
  end if;

  select count(*) into v_document_count from public.faq_documents where version_id = p_version_id;
  select count(*) into v_chunk_count from public.faq_chunks where version_id = p_version_id;
  if v_document_count <> v_expected or v_chunk_count = 0
    or exists (
      select 1 from public.faq_documents d
      where d.version_id = p_version_id
        and not exists (select 1 from public.faq_chunks c where c.version_id = d.version_id and c.document_id = d.id)
    ) then
    raise exception using errcode = '22023', message = 'faq_corpus_coverage_incomplete';
  end if;

  update public.faq_corpus_versions set status = 'superseded' where status = 'published';
  update public.faq_corpus_versions set status = 'published', published_at = now() where id = p_version_id;
end;
$$;

revoke all on function public.publish_faq_corpus_version(uuid) from public, anon, authenticated;
grant execute on function public.publish_faq_corpus_version(uuid) to service_role;

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null default 'New conversation' check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  sources jsonb not null default '[]'::jsonb check (jsonb_typeof(sources) = 'array'),
  action jsonb check (action is null or jsonb_typeof(action) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists chat_conversations_owner_updated_idx
  on public.chat_conversations (owner_id, updated_at desc);
create index if not exists chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Travelers manage their own chat conversations" on public.chat_conversations;
create policy "Travelers manage their own chat conversations" on public.chat_conversations
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Travelers read their own chat messages" on public.chat_messages;
create policy "Travelers read their own chat messages" on public.chat_messages
  for select to authenticated
  using (exists (
    select 1 from public.chat_conversations c
    where c.id = conversation_id and c.owner_id = (select auth.uid())
  ));

grant select, insert, update, delete on public.chat_conversations to authenticated;
grant select on public.chat_messages to authenticated;

create or replace function public.save_chat_turn(
  p_conversation_id uuid,
  p_title text,
  p_user_message text,
  p_assistant_message text,
  p_sources jsonb default '[]'::jsonb,
  p_action jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_conversation_id uuid := p_conversation_id;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_user_message is null or char_length(btrim(p_user_message)) not between 1 and 2000
    or p_assistant_message is null or char_length(btrim(p_assistant_message)) not between 1 and 12000
    or jsonb_typeof(coalesce(p_sources, '[]'::jsonb)) <> 'array'
    or pg_column_size(coalesce(p_sources, '[]'::jsonb)) > 16000
    or (p_action is not null and (jsonb_typeof(p_action) <> 'object' or pg_column_size(p_action) > 100000)) then
    raise exception using errcode = '22023', message = 'invalid_chat_turn';
  end if;

  if v_conversation_id is null then
    insert into public.chat_conversations (owner_id, title)
    values (v_user_id, left(regexp_replace(btrim(coalesce(p_title, 'New conversation')), '[[:space:]]+', ' ', 'g'), 120))
    returning id into v_conversation_id;
  else
    perform 1 from public.chat_conversations c
      where c.id = v_conversation_id and c.owner_id = v_user_id
      for update;
    if not found then
      raise exception using errcode = '42501', message = 'conversation_not_found';
    end if;
  end if;

  insert into public.chat_messages (conversation_id, role, content)
  values (v_conversation_id, 'user', btrim(p_user_message));
  insert into public.chat_messages (conversation_id, role, content, sources, action)
  values (v_conversation_id, 'assistant', btrim(p_assistant_message), coalesce(p_sources, '[]'::jsonb), p_action);
  update public.chat_conversations set updated_at = now() where id = v_conversation_id;
  return v_conversation_id;
end;
$$;

revoke all on function public.save_chat_turn(uuid, text, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.save_chat_turn(uuid, text, text, text, jsonb, jsonb) to authenticated;
