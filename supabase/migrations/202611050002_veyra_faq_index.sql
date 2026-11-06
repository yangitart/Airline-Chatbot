-- The Veyra JSON FAQ catalog is the source of truth. Only explicitly authored
-- Veyra records are eligible for retrieval; archived research corpora stay out.
alter table public.faq_chunks drop column search_terms;
alter table public.faq_chunks
  add column search_terms tsvector generated always as (
    setweight(to_tsvector('simple'::regconfig, section_title), 'A')
    || setweight(to_tsvector('simple'::regconfig, content), 'B')
  ) stored;

create index faq_chunks_search_terms_idx on public.faq_chunks using gin (search_terms);

drop function if exists public.match_faq_evidence(text, extensions.vector, text, integer, uuid);
drop function if exists public.match_faq_chunks(extensions.vector, integer);

create function public.match_faq_evidence(
  p_query text,
  p_query_embedding extensions.vector(1536),
  p_embedding_model text,
  p_match_count integer default 6,
  p_version_id uuid default null,
  p_language text default 'en'
)
returns table (
  document_id text,
  title text,
  source_category text,
  section_title text,
  content text,
  page_number integer,
  similarity real
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_model text;
  v_service boolean := (select auth.role()) is not distinct from 'service_role';
  v_query tsquery;
  v_limit integer := greatest(1, least(coalesce(p_match_count, 6), 8));
begin
  if not v_service and (select auth.uid()) is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_version_id is not null and not v_service then
    raise exception using errcode = '42501', message = 'staging_access_forbidden';
  end if;
  if coalesce(p_language, '') not in ('en', 'es') then
    raise exception using errcode = '22023', message = 'unsupported_faq_language';
  end if;

  select v.id, v.embedding_model into v_id, v_model
  from public.faq_corpus_versions as v
  where (p_version_id is null and v.status = 'published')
    or (v_service and v.id = p_version_id and v.status in ('staging', 'published'));

  if v_id is null then return; end if;
  if v_model is null or v_model is distinct from p_embedding_model then
    raise exception using errcode = '22023', message = 'faq_embedding_model_mismatch';
  end if;

  v_query := websearch_to_tsquery('simple'::regconfig, left(coalesce(p_query, ''), 2000));

  return query
    with distances as materialized (
      select c.id, c.document_id,
        (1 - (c.embedding OPERATOR(extensions.<=>) p_query_embedding))::real as sim
      from public.faq_chunks c
      join public.faq_documents d on d.id = c.document_id and d.version_id = c.version_id
      where c.version_id = v_id
        and d.source_type = 'authored_faq'
        and d.language = p_language
    ), semantic_candidates as (
      select x.id, row_number() over (order by x.sim desc, x.id) as position
      from distances x
      where x.sim >= 0.25
      order by x.sim desc, x.id
      limit 24
    ), keyword_candidates as (
      select c.id, row_number() over (order by ts_rank_cd(c.search_terms, v_query) desc, c.id) as position
      from public.faq_chunks c
      join distances x on x.id = c.id
      where numnode(v_query) > 0 and c.search_terms @@ v_query
      order by ts_rank_cd(c.search_terms, v_query) desc, c.id
      limit 24
    ), ranked as (
      select x.id, x.sim,
        coalesce(1.0 / (40 + s.position), 0) + coalesce(1.0 / (40 + k.position), 0) as score,
        row_number() over (
          partition by x.document_id
          order by coalesce(1.0 / (40 + s.position), 0) + coalesce(1.0 / (40 + k.position), 0) desc,
            x.sim desc, x.id
        ) as source_rank
      from distances x
      left join semantic_candidates s on s.id = x.id
      left join keyword_candidates k on k.id = x.id
      where s.id is not null or k.id is not null
    )
    select d.id, d.title, d.source_category, c.section_title, c.content, c.page_number, r.sim
    from ranked r
    join public.faq_chunks c on c.id = r.id
    join public.faq_documents d on d.id = c.document_id and d.version_id = c.version_id
    where r.source_rank <= 3
    order by r.score desc, r.sim desc, r.id
    limit v_limit;
end;
$$;

revoke all on function public.match_faq_evidence(text, extensions.vector, text, integer, uuid, text) from public, anon;
grant execute on function public.match_faq_evidence(text, extensions.vector, text, integer, uuid, text) to authenticated, service_role;

create or replace function public.publish_faq_corpus_version(p_version_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version public.faq_corpus_versions%rowtype;
begin
  perform pg_advisory_xact_lock(611050001);
  select * into v_version
  from public.faq_corpus_versions
  where id = p_version_id and status = 'staging'
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'faq_corpus_version_not_staging';
  end if;

  if nullif(btrim(v_version.embedding_model), '') is null or v_version.expected_chunks is null
    or (select count(*) from public.faq_documents where version_id = p_version_id) <> v_version.expected_documents
    or (select count(*) from public.faq_chunks where version_id = p_version_id) <> v_version.expected_chunks
    or exists (
      select 1 from public.faq_documents d
      where d.version_id = p_version_id
        and (d.source_type <> 'authored_faq' or d.language not in ('en', 'es')
          or not exists (
            select 1 from public.faq_chunks c
            where c.version_id = d.version_id and c.document_id = d.id
          ))
    ) then
    raise exception using errcode = '22023', message = 'faq_corpus_coverage_incomplete';
  end if;

  update public.faq_corpus_versions set status = 'superseded' where status = 'published';
  update public.faq_corpus_versions set status = 'published', published_at = now() where id = p_version_id;
end;
$$;

revoke all on function public.publish_faq_corpus_version(uuid) from public, anon, authenticated;
grant execute on function public.publish_faq_corpus_version(uuid) to service_role;
