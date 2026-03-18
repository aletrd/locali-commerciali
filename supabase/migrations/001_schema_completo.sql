-- ============================================================
-- MIGRATION COMPLETA — LocaliCommerciali.it
-- Esegui nel SQL Editor di Supabase (in ordine dall'alto in basso)
-- ============================================================

create extension if not exists "uuid-ossp";

-- -----------------------------------------------
-- PROFILI
-- -----------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  telefono text,
  role text not null default 'privato' check (role in ('privato','agenzia','admin')),
  piano text not null default 'gratuito' check (piano in ('gratuito','base','pro','agenzia')),
  nome_agenzia text,
  logo_url text,
  stripe_customer_id text unique,
  annunci_attivi int default 0,
  sospeso boolean default false,
  ragione_sociale text, piva text, codice_fiscale text,
  indirizzo_fatturazione text, cap_fatturazione text,
  citta_fatturazione text, pec text,
  codice_destinatario_sdi text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'privato'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
create policy "Profili pubblici" on public.profiles for select using (true);
create policy "Modifica proprio profilo" on public.profiles for update using (auth.uid() = id);

-- -----------------------------------------------
-- ANNUNCI
-- -----------------------------------------------
create table public.annunci (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  titolo text not null,
  descrizione text,
  tipo text not null check (tipo in ('vendita','affitto')),
  categoria text not null check (categoria in ('ufficio','negozio','bar','ristorante','magazzino','capannone','altro')),
  prezzo numeric not null,
  superficie_mq numeric,
  piano_edificio text,
  posti_auto int default 0,
  indirizzo text not null,
  citta text not null,
  cap text, provincia text,
  lat float, lng float,
  foto text[] default '{}',
  in_evidenza boolean default false,
  attivo boolean default true,
  moderato boolean default false,
  visualizzazioni int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_annunci_citta on public.annunci(citta);
create index idx_annunci_tipo on public.annunci(tipo);
create index idx_annunci_categoria on public.annunci(categoria);
create index idx_annunci_attivo on public.annunci(attivo);
create index idx_annunci_evidenza on public.annunci(in_evidenza);
create index idx_annunci_lat_lng on public.annunci(lat, lng) where lat is not null;
create index idx_annunci_fts on public.annunci
  using gin(to_tsvector('italian', titolo || ' ' || coalesce(descrizione,'')));

alter table public.annunci enable row level security;
create policy "Annunci pubblici" on public.annunci for select using (attivo = true and moderato = true);
create policy "Proprietario vede tutti" on public.annunci for select using (auth.uid() = user_id);
create policy "Crea annuncio" on public.annunci for insert with check (auth.uid() = user_id);
create policy "Modifica annuncio" on public.annunci for update using (auth.uid() = user_id);
create policy "Elimina annuncio" on public.annunci for delete using (auth.uid() = user_id);
create policy "Admin tutto" on public.annunci for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create or replace function public.incrementa_visualizzazioni(annuncio_id uuid)
returns void as $$
begin
  update public.annunci set visualizzazioni = visualizzazioni + 1 where id = annuncio_id;
  insert into public.visualizzazioni_log (annuncio_id, data, contatore) values (annuncio_id, current_date, 1)
    on conflict (annuncio_id, data) do update set contatore = visualizzazioni_log.contatore + 1;
end;
$$ language plpgsql security definer;

-- -----------------------------------------------
-- ABBONAMENTI E PAGAMENTI
-- -----------------------------------------------
create table public.abbonamenti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  piano text not null,
  stato text not null default 'attivo' check (stato in ('attivo','cancellato','scaduto','in_prova')),
  prossimo_rinnovo timestamptz,
  created_at timestamptz default now()
);

alter table public.abbonamenti enable row level security;
create policy "Abbonamento personale" on public.abbonamenti for select using (auth.uid() = user_id);

create table public.pagamenti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  importo numeric not null, valuta text default 'EUR',
  metodo text not null check (metodo in ('stripe','paypal','googlePay','applePay','bonifico')),
  stato text not null default 'in_attesa' check (stato in ('in_attesa','completato','fallito','rimborsato')),
  piano text, stripe_payment_intent_id text, paypal_order_id text,
  riferimento_bonifico text, created_at timestamptz default now()
);

alter table public.pagamenti enable row level security;
create policy "Pagamento personale" on public.pagamenti for select using (auth.uid() = user_id);
create policy "Inserisci pagamento" on public.pagamenti for insert with check (auth.uid() = user_id);
create policy "Admin pagamenti" on public.pagamenti for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- -----------------------------------------------
-- COMMISSIONI
-- -----------------------------------------------
create table public.commissioni (
  id uuid default uuid_generate_v4() primary key,
  annuncio_id uuid references public.annunci(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  importo numeric not null,
  tipo text not null check (tipo in ('vendita','affitto')),
  stato text default 'in_attesa' check (stato in ('in_attesa','pagato','rimborsato')),
  stripe_payment_intent_id text unique,
  pagata_il timestamptz, created_at timestamptz default now()
);

alter table public.commissioni enable row level security;
create policy "Utente vede proprie commissioni" on public.commissioni for select using (auth.uid() = user_id);
create policy "Admin commissioni" on public.commissioni for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- -----------------------------------------------
-- PREFERITI
-- -----------------------------------------------
create table public.preferiti (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  annuncio_id uuid references public.annunci(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, annuncio_id)
);

alter table public.preferiti enable row level security;
create policy "Preferiti personali" on public.preferiti for all using (auth.uid() = user_id);

-- -----------------------------------------------
-- CONTATTI
-- -----------------------------------------------
create table public.contatti (
  id uuid default uuid_generate_v4() primary key,
  annuncio_id uuid references public.annunci(id) on delete set null,
  nome text not null, email text not null,
  telefono text, messaggio text not null,
  letto boolean default false,
  created_at timestamptz default now()
);

alter table public.contatti enable row level security;
create policy "Proprietario vede i contatti" on public.contatti for select
  using (exists (select 1 from public.annunci where id = annuncio_id and user_id = auth.uid()));
create policy "Chiunque invia contatti" on public.contatti for insert with check (true);

-- -----------------------------------------------
-- CHAT
-- -----------------------------------------------
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  annuncio_id uuid references public.annunci(id) on delete cascade not null,
  proprietario_id uuid references public.profiles(id) on delete cascade not null,
  interessato_id uuid references public.profiles(id) on delete cascade not null,
  ultimo_messaggio text, ultima_attivita timestamptz default now(),
  created_at timestamptz default now(),
  unique(annuncio_id, interessato_id)
);

create table public.chat_messaggi (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  mittente uuid references public.profiles(id) on delete cascade not null,
  testo text not null, letto boolean default false,
  created_at timestamptz default now()
);

alter table public.chats enable row level security;
alter table public.chat_messaggi enable row level security;

create policy "Partecipanti chat" on public.chats for all
  using (auth.uid() = proprietario_id or auth.uid() = interessato_id);
create policy "Vedi messaggi" on public.chat_messaggi for select
  using (exists (select 1 from public.chats where id = chat_id
    and (proprietario_id = auth.uid() or interessato_id = auth.uid())));
create policy "Invia messaggi" on public.chat_messaggi for insert
  with check (auth.uid() = mittente and exists (
    select 1 from public.chats where id = chat_id
    and (proprietario_id = auth.uid() or interessato_id = auth.uid())));
create policy "Segna letti" on public.chat_messaggi for update
  using (exists (select 1 from public.chats where id = chat_id
    and (proprietario_id = auth.uid() or interessato_id = auth.uid())));

alter publication supabase_realtime add table public.chat_messaggi;

-- -----------------------------------------------
-- RECENSIONI
-- -----------------------------------------------
create table public.recensioni (
  id uuid default uuid_generate_v4() primary key,
  annuncio_id uuid references public.annunci(id) on delete cascade not null,
  autore_id uuid references public.profiles(id) on delete cascade not null,
  voto int not null check (voto between 1 and 5),
  commento text, created_at timestamptz default now(),
  unique(annuncio_id, autore_id)
);

alter table public.recensioni enable row level security;
create policy "Recensioni pubbliche" on public.recensioni for select using (true);
create policy "Aggiungi recensione" on public.recensioni for insert with check (auth.uid() = autore_id);
create policy "Elimina propria recensione" on public.recensioni for delete using (auth.uid() = autore_id);

-- -----------------------------------------------
-- BLOG
-- -----------------------------------------------
create table public.blog_articoli (
  id uuid default uuid_generate_v4() primary key,
  titolo text not null, slug text not null unique,
  contenuto text not null default '', estratto text not null default '',
  immagine_url text, autore text,
  tags text[] default '{}',
  pubblicato boolean default false, pubblicato_il timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create index idx_blog_slug on public.blog_articoli(slug);
create index idx_blog_tags on public.blog_articoli using gin(tags);

alter table public.blog_articoli enable row level security;
create policy "Articoli pubblicati" on public.blog_articoli for select using (pubblicato = true);
create policy "Admin blog" on public.blog_articoli for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- -----------------------------------------------
-- SPONSORIZZAZIONI
-- -----------------------------------------------
create table public.sponsorizzazioni (
  id uuid default uuid_generate_v4() primary key,
  annuncio_id uuid references public.annunci(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  importo_giornaliero numeric not null,
  inizio_il timestamptz not null, fine_il timestamptz not null,
  attiva boolean default true, click int default 0, impressioni int default 0,
  created_at timestamptz default now()
);

alter table public.sponsorizzazioni enable row level security;
create policy "Gestisci proprie sponsorizzazioni" on public.sponsorizzazioni for all using (auth.uid() = user_id);

create or replace function public.incrementa_click_sponsor(sponsor_id uuid)
returns void as $$
begin update public.sponsorizzazioni set click = click + 1 where id = sponsor_id; end;
$$ language plpgsql security definer;

-- -----------------------------------------------
-- FATTURE
-- -----------------------------------------------
create table public.fatture (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  numero text not null unique, importo numeric not null,
  piano text, metodo text,
  emessa_il timestamptz default now(),
  ragione_sociale text, piva text, indirizzo text, pdf_url text,
  created_at timestamptz default now()
);

alter table public.fatture enable row level security;
create policy "Vedi proprie fatture" on public.fatture for select using (auth.uid() = user_id);
create policy "Admin fatture" on public.fatture for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- -----------------------------------------------
-- LOG E NOTIFICHE
-- -----------------------------------------------
create table public.visualizzazioni_log (
  id uuid default uuid_generate_v4() primary key,
  annuncio_id uuid references public.annunci(id) on delete cascade not null,
  data date not null default current_date, contatore int default 1,
  unique(annuncio_id, data)
);

create table public.notifiche_inviate (
  id uuid default uuid_generate_v4() primary key,
  titolo text not null, messaggio text not null,
  target_piano text, target_user_id uuid,
  destinatari int default 0, created_at timestamptz default now()
);

create table public.fcm_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  token text not null unique, piattaforma text,
  created_at timestamptz default now()
);

alter table public.visualizzazioni_log enable row level security;
alter table public.notifiche_inviate enable row level security;
alter table public.fcm_tokens enable row level security;
create policy "Gestisci token FCM" on public.fcm_tokens for all using (auth.uid() = user_id);

-- -----------------------------------------------
-- STORAGE BUCKET FOTO
-- -----------------------------------------------
insert into storage.buckets (id, name, public) values ('foto-annunci', 'foto-annunci', true)
  on conflict (id) do nothing;

create policy "Foto pubbliche" on storage.objects for select using (bucket_id = 'foto-annunci');
create policy "Upload autenticati" on storage.objects for insert
  with check (bucket_id = 'foto-annunci' and auth.role() = 'authenticated');
create policy "Elimina proprie foto" on storage.objects for delete
  using (bucket_id = 'foto-annunci' and auth.uid()::text = (storage.foldername(name))[1]);

-- -----------------------------------------------
-- IMPOSTA ADMIN — esegui dopo esserti registrato
-- -----------------------------------------------
-- update public.profiles set role = 'admin' where email = 'tua@email.it';
