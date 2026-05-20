
-- 1. Enable pgvector
create extension if not exists vector;

-- 2. documents table
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text not null,
  page_count int,
  chunk_count int not null default 0,
  status text not null default 'pending' check (status in ('pending','processing','ready','failed')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_user_id_idx on public.documents(user_id, created_at desc);

alter table public.documents enable row level security;

create policy "Users view own documents" on public.documents
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own documents" on public.documents
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own documents" on public.documents
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own documents" on public.documents
  for delete to authenticated using (auth.uid() = user_id);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- 3. document_chunks table
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null,
  chunk_index int not null,
  page int,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create index document_chunks_document_id_idx on public.document_chunks(document_id, chunk_index);
create index document_chunks_user_id_idx on public.document_chunks(user_id);
create index document_chunks_embedding_idx on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

alter table public.document_chunks enable row level security;

create policy "Users view own chunks" on public.document_chunks
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own chunks" on public.document_chunks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own chunks" on public.document_chunks
  for delete to authenticated using (auth.uid() = user_id);

-- 4. match function (scoped to a user's chosen documents)
create or replace function public.match_document_chunks(
  query_embedding vector(1536),
  doc_ids uuid[],
  match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index int,
  page int,
  content text,
  filename text,
  similarity float
)
language sql stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.page,
    c.content,
    d.filename,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where c.document_id = any(doc_ids)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Storage bucket (private, 50 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800,
  array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']
)
on conflict (id) do nothing;

create policy "Users read own document files"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own document files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own document files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
