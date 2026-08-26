-- ============================================================
-- FITROOM Supabase 스키마 (dbprompt.txt 명세 그대로 구현)
-- Supabase SQL 에디터에 그대로 붙여넣어 실행 가능합니다.
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('TOP','BOTTOM','OUTER','SHOES','ACCESSORIES')),
  price integer not null,
  description text,
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.looks (
  id uuid primary key default gen_random_uuid(),
  look_number text not null,
  name text not null,
  situation text not null check (situation in ('DAILY','CAFE','DATE','CAMPUS','STREET','TRAVEL')),
  mood text not null check (mood in ('MINIMAL','CASUAL','SOFT','VINTAGE','STREET','MONO')),
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.look_products (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references public.looks(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  size text,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.saved_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  look_id uuid not null references public.looks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, look_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null,
  total_price integer not null,
  status text not null default '결제완료',
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  size text,
  quantity integer not null,
  price integer not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

alter table public.products enable row level security;
create policy "products_select_all" on public.products for select using (true);

alter table public.looks enable row level security;
create policy "looks_select_all" on public.looks for select using (true);

alter table public.look_products enable row level security;
create policy "look_products_select_all" on public.look_products for select using (true);

alter table public.cart_items enable row level security;
create policy "cart_items_select_own" on public.cart_items for select using (auth.uid() = user_id);
create policy "cart_items_insert_own" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart_items_update_own" on public.cart_items for update using (auth.uid() = user_id);
create policy "cart_items_delete_own" on public.cart_items for delete using (auth.uid() = user_id);

alter table public.wishlist_items enable row level security;
create policy "wishlist_items_select_own" on public.wishlist_items for select using (auth.uid() = user_id);
create policy "wishlist_items_insert_own" on public.wishlist_items for insert with check (auth.uid() = user_id);
create policy "wishlist_items_delete_own" on public.wishlist_items for delete using (auth.uid() = user_id);

alter table public.saved_looks enable row level security;
create policy "saved_looks_select_own" on public.saved_looks for select using (auth.uid() = user_id);
create policy "saved_looks_insert_own" on public.saved_looks for insert with check (auth.uid() = user_id);
create policy "saved_looks_delete_own" on public.saved_looks for delete using (auth.uid() = user_id);

alter table public.orders enable row level security;
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);

alter table public.order_items enable row level security;
create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order_items_insert_own" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- ------------------------------------------------------------
-- 3. SAMPLE DATA (products 20, looks 10, look_products 각 3개 이상)
-- ------------------------------------------------------------

insert into public.products (id, name, category, price, description, colors, sizes, image_urls) values
('00000000-0000-4000-a000-000000000001','미니멀 크루넥 니트','TOP',39000,'부드러운 촉감의 울 혼방 니트로, 어떤 하의와도 자연스럽게 어울리는 데일리 아이템입니다.',ARRAY['BLACK','BEIGE','GRAY'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,top,shirt?lock=100','https://loremflickr.com/700/900/fashion,top,shirt?lock=101']),
('00000000-0000-4000-a000-000000000002','오버사이즈 코튼 셔츠','TOP',45000,'여유로운 실루엣의 코튼 셔츠. 하나만 걸쳐도 스타일이 완성됩니다.',ARRAY['WHITE','BEIGE'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,top,shirt?lock=102','https://loremflickr.com/700/900/fashion,top,shirt?lock=103']),
('00000000-0000-4000-a000-000000000003','스트라이프 반팔티','TOP',25000,'캐주얼한 무드를 더해주는 스트라이프 반팔 티셔츠입니다.',ARRAY['NAVY','WHITE'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,top,shirt?lock=104','https://loremflickr.com/700/900/fashion,top,shirt?lock=105']),
('00000000-0000-4000-a000-000000000004','실크 블라우스','TOP',52000,'은은한 광택의 실크 블라우스로 데이트 룩에 포인트를 더합니다.',ARRAY['BLACK','WHITE'],ARRAY['S','M'],ARRAY['https://loremflickr.com/700/900/fashion,top,shirt?lock=106','https://loremflickr.com/700/900/fashion,top,shirt?lock=107']),
('00000000-0000-4000-a000-000000000005','헤비코튼 후드티','TOP',42000,'두툼한 헤비코튼 소재로 캐주얼한 스트릿 무드를 완성합니다.',ARRAY['GRAY','BLACK'],ARRAY['M','L'],ARRAY['https://loremflickr.com/700/900/fashion,top,shirt?lock=108','https://loremflickr.com/700/900/fashion,top,shirt?lock=109']),
('00000000-0000-4000-a000-000000000006','와이드 슬랙스','BOTTOM',48000,'허리 라인은 슬림하게, 밑단은 넉넉하게 떨어지는 와이드 슬랙스입니다.',ARRAY['BEIGE','BLACK'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,pants,denim?lock=110','https://loremflickr.com/700/900/fashion,pants,denim?lock=111']),
('00000000-0000-4000-a000-000000000007','스트레이트 데님 팬츠','BOTTOM',55000,'부담 없이 매치하기 좋은 스트레이트 핏 데님입니다.',ARRAY['NAVY','GRAY'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,pants,denim?lock=112','https://loremflickr.com/700/900/fashion,pants,denim?lock=113']),
('00000000-0000-4000-a000-000000000008','코튼 카고 팬츠','BOTTOM',46000,'넉넉한 포켓 디테일이 돋보이는 스트릿 무드의 카고 팬츠입니다.',ARRAY['BEIGE','BLACK'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,pants,denim?lock=114','https://loremflickr.com/700/900/fashion,pants,denim?lock=115']),
('00000000-0000-4000-a000-000000000009','플리츠 롱스커트','BOTTOM',44000,'걸을 때마다 자연스러운 주름이 살아나는 플리츠 롱스커트입니다.',ARRAY['BLACK','BEIGE'],ARRAY['S','M'],ARRAY['https://loremflickr.com/700/900/fashion,pants,denim?lock=116','https://loremflickr.com/700/900/fashion,pants,denim?lock=117']),
('00000000-0000-4000-a000-000000000010','울 블렌드 코트','OUTER',128000,'클래식한 실루엣의 울 혼방 코트로 어떤 룩에도 무게감을 더합니다.',ARRAY['BLACK','BEIGE'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,coat,jacket?lock=120','https://loremflickr.com/700/900/fashion,coat,jacket?lock=121']),
('00000000-0000-4000-a000-000000000011','마 자켓','OUTER',89000,'가벼운 마 소재로 계절감 있는 캐주얼 룩을 완성합니다.',ARRAY['BEIGE','GRAY'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,coat,jacket?lock=122','https://loremflickr.com/700/900/fashion,coat,jacket?lock=123']),
('00000000-0000-4000-a000-000000000012','나일론 바람막이','OUTER',68000,'가볍게 걸치기 좋은 나일론 바람막이 자켓입니다.',ARRAY['BLACK','NAVY'],ARRAY['M','L'],ARRAY['https://loremflickr.com/700/900/fashion,coat,jacket?lock=124','https://loremflickr.com/700/900/fashion,coat,jacket?lock=125']),
('00000000-0000-4000-a000-000000000013','데님 자켓','OUTER',72000,'빈티지한 워싱감이 매력적인 데님 자켓입니다.',ARRAY['NAVY','GRAY'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/fashion,coat,jacket?lock=126','https://loremflickr.com/700/900/fashion,coat,jacket?lock=127']),
('00000000-0000-4000-a000-000000000014','캔버스 스니커즈','SHOES',59000,'가볍고 편안한 착화감의 데일리 캔버스 스니커즈입니다.',ARRAY['WHITE','BLACK'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/shoes,fashion?lock=130','https://loremflickr.com/700/900/shoes,fashion?lock=131']),
('00000000-0000-4000-a000-000000000015','첼시 부츠','SHOES',98000,'깔끔한 라인의 첼시 부츠로 룩의 완성도를 높여줍니다.',ARRAY['BLACK','BROWN'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/shoes,fashion?lock=132','https://loremflickr.com/700/900/shoes,fashion?lock=133']),
('00000000-0000-4000-a000-000000000016','스웨이드 로퍼','SHOES',76000,'부드러운 스웨이드 소재의 클래식 로퍼입니다.',ARRAY['BROWN','BLACK'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/shoes,fashion?lock=134','https://loremflickr.com/700/900/shoes,fashion?lock=135']),
('00000000-0000-4000-a000-000000000017','러닝화','SHOES',62000,'가벼운 쿠셔닝으로 활동적인 하루에 어울리는 러닝화입니다.',ARRAY['WHITE','GRAY'],ARRAY['S','M','L'],ARRAY['https://loremflickr.com/700/900/shoes,fashion?lock=136','https://loremflickr.com/700/900/shoes,fashion?lock=137']),
('00000000-0000-4000-a000-000000000018','미니 크로스백','ACCESSORIES',39000,'데일리로 메기 좋은 실용적인 사이즈의 미니 크로스백입니다.',ARRAY['BEIGE','BLACK'],ARRAY['FREE'],ARRAY['https://loremflickr.com/700/900/accessory,fashion?lock=140','https://loremflickr.com/700/900/accessory,fashion?lock=141']),
('00000000-0000-4000-a000-000000000019','니트 비니','ACCESSORIES',18000,'가볍게 포인트를 줄 수 있는 니트 비니입니다.',ARRAY['GRAY','BLACK'],ARRAY['FREE'],ARRAY['https://loremflickr.com/700/900/accessory,fashion?lock=142','https://loremflickr.com/700/900/accessory,fashion?lock=143']),
('00000000-0000-4000-a000-000000000020','레더 벨트','ACCESSORIES',22000,'심플한 버클 디자인의 레더 벨트로 룩을 정돈해줍니다.',ARRAY['BLACK','BROWN'],ARRAY['FREE'],ARRAY['https://loremflickr.com/700/900/accessory,fashion?lock=144','https://loremflickr.com/700/900/accessory,fashion?lock=145']);

insert into public.looks (id, look_number, name, situation, mood, description, image_url) values
('00000000-0000-4000-b000-000000000001','LOOK 01','SOFT MORNING','CAFE','SOFT','부드러운 컬러와 편안한 실루엣으로 완성한 카페 데일리 룩.','https://loremflickr.com/900/1100/fashion,soft,model?lock=201'),
('00000000-0000-4000-b000-000000000002','LOOK 02','CITY MINIMAL','DAILY','MINIMAL','군더더기 없는 미니멀 아이템으로 완성한 도심 데일리 룩.','https://loremflickr.com/900/1100/fashion,minimal,model?lock=202'),
('00000000-0000-4000-b000-000000000003','LOOK 03','WEEKEND CASUAL','CAMPUS','CASUAL','편안하게 걸치기 좋은 캐주얼 캠퍼스 룩.','https://loremflickr.com/900/1100/fashion,casual,model?lock=203'),
('00000000-0000-4000-b000-000000000004','LOOK 04','DATE NIGHT MONO','DATE','MONO','블랙 톤으로 통일해 완성한 세련된 데이트 룩.','https://loremflickr.com/900/1100/fashion,monochrome,model?lock=204'),
('00000000-0000-4000-b000-000000000005','LOOK 05','URBAN STREET','STREET','STREET','카고 팬츠와 후드티로 완성한 힘있는 스트릿 룩.','https://loremflickr.com/900/1100/fashion,streetwear,model?lock=205'),
('00000000-0000-4000-b000-000000000006','LOOK 06','VINTAGE WALK','TRAVEL','VINTAGE','빈티지한 무드의 데님 자켓으로 완성한 여행 룩.','https://loremflickr.com/900/1100/fashion,vintage,model?lock=206'),
('00000000-0000-4000-b000-000000000007','LOOK 07','CLEAN CAMPUS','CAMPUS','MINIMAL','니트와 스니커즈로 완성한 깔끔한 캠퍼스 룩.','https://loremflickr.com/900/1100/fashion,minimal,model?lock=207'),
('00000000-0000-4000-b000-000000000008','LOOK 08','COZY CAFE','CAFE','CASUAL','후드티와 슬랙스로 완성한 편안한 카페 룩.','https://loremflickr.com/900/1100/fashion,casual,model?lock=208'),
('00000000-0000-4000-b000-000000000009','LOOK 09','TRAVEL LIGHT','TRAVEL','SOFT','가볍게 걸치기 좋은 아이템으로 완성한 여행 룩.','https://loremflickr.com/900/1100/fashion,soft,model?lock=209'),
('00000000-0000-4000-b000-000000000010','LOOK 10','MONO STREET','STREET','MONO','블랙 톤 자켓과 데님으로 완성한 모노톤 스트릿 룩.','https://loremflickr.com/900/1100/fashion,monochrome,model?lock=210');

insert into public.look_products (look_id, product_id) values
('00000000-0000-4000-b000-000000000001','00000000-0000-4000-a000-000000000001'),
('00000000-0000-4000-b000-000000000001','00000000-0000-4000-a000-000000000006'),
('00000000-0000-4000-b000-000000000001','00000000-0000-4000-a000-000000000016'),
('00000000-0000-4000-b000-000000000001','00000000-0000-4000-a000-000000000018'),
('00000000-0000-4000-b000-000000000002','00000000-0000-4000-a000-000000000002'),
('00000000-0000-4000-b000-000000000002','00000000-0000-4000-a000-000000000007'),
('00000000-0000-4000-b000-000000000002','00000000-0000-4000-a000-000000000014'),
('00000000-0000-4000-b000-000000000003','00000000-0000-4000-a000-000000000003'),
('00000000-0000-4000-b000-000000000003','00000000-0000-4000-a000-000000000008'),
('00000000-0000-4000-b000-000000000003','00000000-0000-4000-a000-000000000014'),
('00000000-0000-4000-b000-000000000003','00000000-0000-4000-a000-000000000019'),
('00000000-0000-4000-b000-000000000004','00000000-0000-4000-a000-000000000004'),
('00000000-0000-4000-b000-000000000004','00000000-0000-4000-a000-000000000009'),
('00000000-0000-4000-b000-000000000004','00000000-0000-4000-a000-000000000015'),
('00000000-0000-4000-b000-000000000005','00000000-0000-4000-a000-000000000005'),
('00000000-0000-4000-b000-000000000005','00000000-0000-4000-a000-000000000008'),
('00000000-0000-4000-b000-000000000005','00000000-0000-4000-a000-000000000017'),
('00000000-0000-4000-b000-000000000005','00000000-0000-4000-a000-000000000020'),
('00000000-0000-4000-b000-000000000006','00000000-0000-4000-a000-000000000013'),
('00000000-0000-4000-b000-000000000006','00000000-0000-4000-a000-000000000007'),
('00000000-0000-4000-b000-000000000006','00000000-0000-4000-a000-000000000016'),
('00000000-0000-4000-b000-000000000007','00000000-0000-4000-a000-000000000001'),
('00000000-0000-4000-b000-000000000007','00000000-0000-4000-a000-000000000009'),
('00000000-0000-4000-b000-000000000007','00000000-0000-4000-a000-000000000014'),
('00000000-0000-4000-b000-000000000008','00000000-0000-4000-a000-000000000005'),
('00000000-0000-4000-b000-000000000008','00000000-0000-4000-a000-000000000006'),
('00000000-0000-4000-b000-000000000008','00000000-0000-4000-a000-000000000017'),
('00000000-0000-4000-b000-000000000009','00000000-0000-4000-a000-000000000002'),
('00000000-0000-4000-b000-000000000009','00000000-0000-4000-a000-000000000008'),
('00000000-0000-4000-b000-000000000009','00000000-0000-4000-a000-000000000015'),
('00000000-0000-4000-b000-000000000009','00000000-0000-4000-a000-000000000018'),
('00000000-0000-4000-b000-000000000010','00000000-0000-4000-a000-000000000011'),
('00000000-0000-4000-b000-000000000010','00000000-0000-4000-a000-000000000007'),
('00000000-0000-4000-b000-000000000010','00000000-0000-4000-a000-000000000014'),
('00000000-0000-4000-b000-000000000010','00000000-0000-4000-a000-000000000020');
