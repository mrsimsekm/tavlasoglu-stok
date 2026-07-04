# Supabase Database Schema Documentation

## Overview
This document provides detailed documentation of the Supabase database schema for the Tavlasoğlu Stok Takip system. The database consists of multiple interconnected tables that support various business functions including inventory management, customer relationships, work orders, financial tracking, and user management.

## Table Categories

### 1. Core Inventory Management Tables
These tables handle the fundamental inventory tracking functionality.

#### urunler (Products)
Primary table for all products/items in the system.
```sql
CREATE TABLE urunler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urun_kodu BIGINT NOT NULL,
    tur TEXT,
    aciklama TEXT,
    aciklama_2 TEXT,
    aciklama_3 TEXT,
    ana_birim TEXT,
    ozel_kod TEXT,
    grup_kodu TEXT,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    fiili_stok NUMERIC DEFAULT 0.00,
    gercek_stok NUMERIC DEFAULT 0.00,
    sevkedilebilir_stok NUMERIC DEFAULT 0.00
);
```

#### depolar (Warehouses)
Locations where inventory is stored.
```sql
CREATE TABLE depolar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad TEXT NOT NULL,
    adres TEXT,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

#### stok_seviyeleri (Stock Levels)
Tracks current stock quantities by product and warehouse.
```sql
CREATE TABLE stok_seviyeleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urun_id UUID NOT NULL REFERENCES urunler(id),
    depo_id UUID NOT NULL REFERENCES depolar(id),
    miktar INTEGER NOT NULL DEFAULT 0,
    rezerve_miktar NUMERIC DEFAULT 0.00
);
```

#### stok_hareketleri (Stock Movements)
Records all inventory transactions with audit trail.
```sql
CREATE TABLE stok_hareketleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urun_id UUID NOT NULL REFERENCES urunler(id),
    depo_id UUID NOT NULL REFERENCES depolar(id),
    hareket_tipi TEXT NOT NULL, -- Giris/Cikis/Transfer etc.
    miktar NUMERIC NOT NULL,
    onceki_miktar NUMERIC,
    sonraki_miktar NUMERIC,
    aciklama TEXT,
    is_emri_id UUID REFERENCES is_emirleri(id),
    kullanici_id UUID,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    anlasma_id UUID REFERENCES anlasmalar(id),
    tutar NUMERIC DEFAULT 0,
    grup_id UUID
);
```

#### emanetler (Deposits)
Special inventory items held for work orders.
```sql
CREATE TABLE emanetler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urun_id UUID NOT NULL REFERENCES urunler(id),
    is_emri_id UUID REFERENCES is_emirleri(id),
    tedarikci_adi_notu TEXT NOT NULL,
    miktar NUMERIC NOT NULL,
    kalan_miktar NUMERIC NOT NULL,
    birim_maliyet NUMERIC DEFAULT 0,
    durum TEXT DEFAULT 'Bekliyor',
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 2. Customer Management Tables

#### musteriler (Customers)
Customer/company information.
```sql
CREATE TABLE musteriler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unvan TEXT NOT NULL,
    ilgili_kisi TEXT,
    vergi_dairesi TEXT,
    vergi_no CHARACTER VARYING,
    tckn CHARACTER VARYING,
    adres TEXT,
    ilce TEXT,
    il TEXT,
    telefon CHARACTER VARYING,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 3. Work Order Management Tables

#### is_emirleri (Work Orders)
Main work order tracking table.
```sql
CREATE TABLE is_emirleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    musteri_id UUID NOT NULL REFERENCES musteriler(id),
    anlasma_id UUID REFERENCES anlasmalar(id),
    siparis_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
    durum TEXT NOT NULL DEFAULT 'Açık',
    toplam_tutar NUMERIC DEFAULT 0,
    odenen_tutar NUMERIC DEFAULT 0,
    notlar TEXT,
    olusturan_kullanici_id UUID,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    numara TEXT,
    satisci_id UUID,
    fatura_no TEXT,
    is_tamamlandi BOOLEAN DEFAULT false,
    maliyet NUMERIC DEFAULT 0,
    is_emri_tipi TEXT NOT NULL DEFAULT 'SİPARİŞ',
    sevk_adresi TEXT,
    para_birimi TEXT DEFAULT 'TRY',
    kdv_dahil BOOLEAN DEFAULT true,
    rezerve_edildi BOOLEAN DEFAULT false
);
```

#### is_emri_kalemleri (Work Order Items)
Individual items/resources in work orders.
```sql
CREATE TABLE is_emri_kalemleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_emri_id UUID NOT NULL REFERENCES is_emirleri(id),
    urun_id UUID REFERENCES urunler(id),
    miktar DOUBLE PRECISION NOT NULL,
    birim_fiyat NUMERIC NOT NULL,
    kaynak_depo_id UUID REFERENCES depolar(id),
    kaynak_tedarikci_id UUID,
    aciklama TEXT,
    anlasma_id UUID REFERENCES anlasmalar(id),
    birim TEXT DEFAULT 'Adet',
    emanet_id UUID REFERENCES emanetler(id)
);
```

#### is_emri_maliyetleri (Work Order Costs)
Additional costs associated with work orders.
```sql
CREATE TABLE is_emri_maliyetleri (
    id BIGINT PRIMARY KEY,
    is_emri_id UUID REFERENCES is_emirleri(id),
    aciklama TEXT NOT NULL,
    tutar NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### is_emri_sayac (Work Order Counter)
Counter for generating sequential work order numbers.
```sql
CREATE TABLE is_emri_sayac (
    yil INTEGER NOT NULL,
    son_numara INTEGER NOT NULL DEFAULT 5000
);
```

### 4. Supplier Management Tables

#### tedarikciler (Suppliers)
Supplier/manufacturer information.
```sql
CREATE TABLE tedarikciler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad TEXT NOT NULL,
    ilgili_kisi TEXT,
    telefon CHARACTER VARYING,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 5. Agreement Management Tables

#### anlasmalar (Agreements)
Customer-supplier agreements with terms.
```sql
CREATE TABLE anlasmalar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tedarikci_id UUID NOT NULL REFERENCES tedarikciler(id),
    ad TEXT NOT NULL,
    taahhut_tutari NUMERIC,
    iskonto_orani TEXT,
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    aktif_mi BOOLEAN DEFAULT true,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    tip USER-DEFINED NOT NULL DEFAULT 'Tutar Bazlı'
);
```

#### anlasma_kalemleri (Agreement Items)
Specific items covered by supplier agreements.
```sql
CREATE TABLE anlasma_kalemleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlasma_id UUID NOT NULL REFERENCES anlasmalar(id),
    urun_id UUID NOT NULL REFERENCES urunler(id),
    taahhut_edilen_miktar INTEGER NOT NULL,
    birim_fiyat NUMERIC
);
```

### 6. Financial Tracking Tables

#### alacaklar (Receivables)
Accounts receivable tracking.
```sql
CREATE TABLE alacaklar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    musteri_id UUID NOT NULL REFERENCES musteriler(id),
    is_emri_id UUID NOT NULL REFERENCES is_emirleri(id),
    tutar NUMERIC NOT NULL,
    kalan_tutar NUMERIC NOT NULL,
    durum TEXT NOT NULL DEFAULT 'Açık',
    vade_tarihi DATE,
    aciklama TEXT,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    kapanis_tarihi TIMESTAMP WITH TIME ZONE,
    para_birimi TEXT DEFAULT 'TRY'
);
```

#### alacak_odemeleri (Receivable Payments)
Payments received for accounts receivable.
```sql
CREATE TABLE alacak_odemeleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alacak_id UUID NOT NULL REFERENCES alacaklar(id),
    tutar NUMERIC NOT NULL,
    odeme_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
    yontem TEXT NOT NULL,
    notlar TEXT,
    islem_yapan_kullanici_id UUID,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

#### odemeler (Payments)
Direct payments for work orders.
```sql
CREATE TABLE odemeler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_emri_id UUID NOT NULL REFERENCES is_emirleri(id),
    tutar NUMERIC NOT NULL,
    odeme_tarihi DATE NOT NULL DEFAULT CURRENT_DATE,
    yontem USER-DEFINED NOT NULL,
    notlar TEXT,
    islem_yapan_kullanici_id UUID,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### 7. Proforma Invoice Tables

#### proformalar (Proforma Invoices)
Proforma invoices issued to customers.
```sql
CREATE TABLE proformalar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    proforma_no TEXT,
    musteri_id UUID REFERENCES musteriler(id),
    olusturma_tarihi DATE DEFAULT now(),
    gecerlilik_tarihi DATE,
    durum TEXT DEFAULT 'Taslak',
    toplam_tutar NUMERIC DEFAULT 0,
    notlar TEXT,
    donusturulen_is_emri_id UUID REFERENCES is_emirleri(id),
    para_birimi TEXT DEFAULT 'TRY',
    kdv_dahil BOOLEAN DEFAULT true,
    kategoriler ARRAY DEFAULT '{}',
    sartlar TEXT DEFAULT '',
    ilgili_kisi TEXT,
    proje_adi TEXT
);
```

#### proforma_kalemleri (Proforma Items)
Individual line items in proforma invoices.
```sql
CREATE TABLE proforma_kalemleri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proforma_id UUID REFERENCES proformalar(id),
    urun_id UUID REFERENCES urunler(id),
    aciklama TEXT,
    miktar NUMERIC,
    birim_fiyat NUMERIC,
    kdv_orani NUMERIC DEFAULT 0,
    kaynak_depo_id UUID REFERENCES depolar(id),
    kaynak_tedarikci_id UUID,
    anlasma_id UUID REFERENCES anlasmalar(id),
    birim TEXT DEFAULT 'Adet',
    grup_adi TEXT DEFAULT 'Genel'
);
```

#### proforma_ayarlari (Proforma Settings)
Configuration settings for proforma templates.
```sql
CREATE TABLE proforma_ayarlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kategori_adi TEXT NOT NULL,
    sart_metni TEXT,
    guncellenme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### 8. User Management Tables

#### profiller (Profiles)
User profile information linked to Supabase authentication.
```sql
CREATE TABLE profiller (
    id UUID PRIMARY KEY,
    tam_ad TEXT,
    rol USER-DEFINED NOT NULL DEFAULT 'satisci',
    email TEXT
);
```

#### satiscilar (Salespeople)
Salesperson records tracked separately from user profiles.
```sql
CREATE TABLE satiscilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_soyad TEXT NOT NULL,
    telefon TEXT,
    aktif_mi BOOLEAN DEFAULT true,
    olusturulma_tarihi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);
```

## Key Relationships and Business Logic

### Primary Entity Relationships
- **Products (urunler)** are stored in **Warehouses (depolar)** with quantities tracked in **Stock Levels (stok_seviyeleri)**
- **Stock Movements (stok_hareketleri)** record all inventory transactions
- **Customers (musteriler)** place **Work Orders (is_emirleri)** 
- **Work Orders** contain multiple **Work Order Items (is_emri_kalemleri)**
- **Work Orders** can generate **Receivables (alacaklar)** and receive **Payments (odemeler)**
- **Suppliers (tedarikciler)** enter into **Agreements (anlasmalar)** which cover specific **Products**
- **Agreements** can influence pricing in **Work Orders** and **Proforma Invoices**

### Special Fields and Defaults
- All tables have automatic timestamp fields (`olusturulma_tarihi`) with UTC timezone
- UUID primary keys with `gen_random_uuid()` defaults where applicable
- Special numeric tracking fields for stock quantities with decimal precision
- Status fields with sensible defaults (e.g., 'Açık' for open orders/accounts)
- Currency tracking with TRY as default
- Boolean flags for workflow states (e.g., `is_tamamlandi`, `aktif_mi`)
- Reference counters for sequential numbering

### Audit Trail Features
- Creation timestamps on most entities
- User tracking fields (`olusturan_kullanici_id`, `kullanici_id`)
- Descriptive fields (`aciklama`, `notlar`)
- Status change tracking through dedicated fields

## Functional Areas Mapping

1. **Inventory Management**: Products, Warehouses, Stock Levels, Stock Movements
2. **Customer Relations**: Customers, Suppliers, Agreements
3. **Order Processing**: Work Orders, Work Order Items, Deposits
4. **Financial Tracking**: Receivables, Payments, Costs
5. **Quoting**: Proforma Invoices and related settings
6. **User Management**: Profiles, Salespeople, Roles
7. **Reporting Base**: All tables serve as data sources for various reports

---

## Supabase Functions Documentation

### RPC (Remote Procedure Call) Functions

These functions can be called directly via Supabase client SDKs for complex business operations.

#### Stock Management Functions

##### `stok_arttir(urun_id UUID, depo_id UUID, miktar NUMERIC, aciklama TEXT, kullanici_id UUID)`
Increases stock quantity for a product in a specific warehouse.
- **Returns**: JSON with success status, previous and new quantities
- **Business Logic**: Creates stock level record if not exists, updates stock levels, creates stock movement record, updates product totals

##### `stok_azalt(urun_id UUID, depo_id UUID, miktar NUMERIC, aciklama TEXT, is_emri_id UUID, kullanici_id UUID)`
Decreases stock quantity for a product in a specific warehouse.
- **Returns**: JSON with success status, previous and new quantities
- **Business Logic**: Validates sufficient stock, updates quantities, creates stock movement record, handles errors gracefully

##### `stok_giris_grubu_sil(grup_id UUID)`
Deletes an entire stock entry group and reverses all affected stock levels.
- **Returns**: JSON with success status and message
- **Business Logic**: Loops through all movements in the group, reverses stock adjustments, removes movement records

##### `stok_giris_grubu_guncelle(grup_id UUID, yeni_veriler JSONB)`
Updates an existing stock entry group by deleting and recreating with same ID.
- **Returns**: JSON with success status and message
- **Business Logic**: Retrieves group metadata, deletes existing entries, inserts new entries maintaining same group ID, uses transaction to ensure consistency

#### Financial Functions

##### `alacak_tahsil_et(alacak_id UUID, tutar NUMERIC, yontem TEXT, notlar TEXT, kullanici_id UUID)`
Records payment against a receivable account.
- **Returns**: JSON with success status, new remaining amount, status, and message
- **Business Logic**: Validates remaining amount, calculates new remaining amount, creates payment record, updates receivable status and remaining amount

##### `alacak_olustur(is_emri_id UUID)`
Creates a receivable account based on work order totals.
- **Returns**: JSON with success status and receivable ID or error message
- **Business Logic**: Calculates remaining amount from work order, creates receivable if amount > 0, includes currency information

#### Work Order Functions

##### `is_emri_kalemleri_guncelle_atomic(is_emri_id UUID, kalemler JSONB)`
Atomically updates work order items in a single transaction.
- **Returns**: JSON with success status and message
- **Business Logic**: Handles new, updated, and deleted items, manages deposit relationships, cleans up orphaned deposits, ensures data consistency through transactions

##### `is_emri_sil(is_emri_id UUID)`
Completely removes a work order and all related records.
- **Returns**: VOID
- **Business Logic**: Deletes associated stock movements, receivables and payments, work order items and costs, updates related proformas, removes main work order record

#### Number Generation Functions

##### `bir_sonraki_is_emri_numarasi()`
Generates the next sequential work order number.
- **Returns**: TEXT (formatted number)
- **Business Logic**: Generates prefix with KHSEİ-YYYY prefix, maintains sequential numbers with 4-digit padding

##### `is_emri_numara_olustur()$
Helper function for automatic work order number generation.
- **Returns**: TEXT (formatted number)
- **Business Logic**: Maintains counter in is_emri_sayac table, generates formatted numbers

##### `bir_sonraki_proforma_numarasi()`
Generates the next sequential proforma invoice number.
- **Returns**: INTEGER
- **Business Logic**: Finds maximum existing number, adds 1

#### Data Retrieval Functions

##### `get_alacaklar_paginated(p_limit INTEGER, p_offset INTEGER, p_sort_by TEXT, p_sort_direction TEXT, p_musteri_arama TEXT, p_durum TEXT)`
Retrieves paginated receivables with filtering and sorting.
- **Returns**: RECORD set with receivables data and total count
- **Business Logic**: Joins with customers and work orders, filters by customer/search criteria, sorts by multiple fields

##### `get_alacaklar_ozet(p_musteri_arama TEXT, p_durum TEXT)`
Retrieves receivable summary grouped by currency.
- **Returns**: RECORD set with currency and total remaining amounts
- **Business Logic**: Excludes closed receivables, groups by currency

##### `get_anlasmalar_paginated(p_limit INTEGER, p_offset INTEGER, p_sort_by TEXT, p_sort_direction TEXT, p_arama_metni TEXT)`
Retrieves paginated agreements with usage statistics.
- **Returns**: RECORD set with agreements data and total count
- **Business Logic**: Calculates usage from work order items and stock movements, joins with suppliers, filtering and sorting

##### `get_depo_stoklari_paginated(p_limit INTEGER, p_offset INTEGER, p_sort_by TEXT, p_sort_direction TEXT, p_depo_id UUID, p_arama_metni TEXT, p_stok_durumu TEXT)`
Retrieves paginated warehouse stock levels.
- **Returns**: UUID set of product IDs
- **Business Logic**: Groups by product, calculates totals, filters by stock status, supports searching

##### `get_is_emirleri_listesi()`
Retrieves basic list of all work orders.
- **Returns**: RECORD set
- **Business Logic**: Simple join with customers, ordered by order date

##### `get_is_emirleri_paginated(...)`
Retrieves paginated work orders with extensive filtering options.
- **Returns**: RECORD set with work orders data and total count
- **Business Logic**: Complex filtering for status, invoice, payment, and cost status, multi-field sorting

##### `get_proformalar_paginated(...)`
Retrieves paginated proforma invoices with filtering.
- **Returns**: RECORD set with proformas data and total count
- **Business Logic**: Supports category filtering with array overlap, multi-field search, sorting

##### `get_satisci_is_emirleri_paginated(...)`
Retrieves paginated work orders for salesperson reporting.
- **Returns**: RECORD set with work orders data and total count
- **Business Logic**: Filters by salesperson, date ranges, status, includes performance calculations

##### `get_satisci_performans_ozet(p_satisci_id UUID, p_durum TEXT, p_baslangic_tarihi DATE, p_bitis_tarihi DATE)`
Retrieves sales performance summary.
- **Returns**: RECORD set with totals grouped by currency
- **Business Logic**: Calculates totals and costs, filters by criteria, groups currency

##### `get_stok_giris_gruplari_v2(...)`
Retrieves stock entry groups for display.
- **Returns**: RECORD set with group IDs and dates
- **Business Logic**: Groups movements by group_id, filters by dates and warehouse, supports searching

#### Utility Functions

##### `urun_ara(arama_metni TEXT, filtre_ids UUID[], limit_val INTEGER)`
Searches products with text search and filtering.
- **Returns**: RECORD set with product data
- **Business Logic**: Accent-insensitive search, ID filtering, limits results

##### `proforma_sil(proforma_id UUID)`
Removes a proforma invoice and related items.
- **Returns**: VOID
- **Business Logic**: Deletes items first, then header

#### Trigger Functions

These functions are executed automatically when table events occur (INSERT, UPDATE, DELETE).

##### Stock Movement Triggers

##### `stok_hareketi_stok_seviyesi_guncelle()`
Maintains stock levels based on stock movement records.
- **Triggers On**: INSERT, UPDATE, DELETE on stok_hareketleri
- **Business Logic**: Automatically adjusts stock levels when movements are created/modified/deleted

##### `kalem_eklenince_rezerve_et()`
Reserves stock when work order items are added.
- **Triggers On**: INSERT on is_emri_kalemleri
- **Business Logic**: Increases reservation count in stock levels

##### `kalem_silinince_rezervasyonu_iptal_et()`
Cancels reservations when work order items are removed.
- **Triggers On**: DELETE on is_emri_kalemleri
- **Business Logic**: Decreases reservation count in stock levels

##### `kalem_guncellenince_rezervasyonu_ayarla()`
Adjusts reservations when work order item quantities change.
- **Triggers On**: UPDATE on is_emri_kalemleri
- **Business Logic**: Adjusts reservation by quantity difference

##### Work Order Status Triggers

##### `stok_dus()`
Manages stock deductions when work orders are shipped.
- **Triggers On**: UPDATE on is_emirleri
- **Business Logic**: Deducts stock when sevk_edildi flag changes to true, restores stock when reverted

##### `stok_dus_ve_rezervasyon_kaldir()`
Advanced stock deduction and reservation management.
- **Triggers On**: UPDATE on is_emirleri
- **Business Logic**: Comprehensive stock and reservation adjustments based on shipping status

##### `trg_is_emri_kalemi_stok_isle()`
Handles stock operations for work order items with proper handling of reserved vs. immediate deduction based on work order status.
- **Triggers On**: INSERT, UPDATE, DELETE on is_emri_kalemleri
- **Business Logic**:
  - When work order is in reservation mode (`rezerve_edildi = true`):
    - INSERT: Reserves stock by increasing `rezerve_miktar` in `stok_seviyeleri`
    - UPDATE: Adjusts reservations based on quantity changes or warehouse changes
    - DELETE: Releases reservations by decreasing `rezerve_miktar`
  - When work order is NOT in reservation mode (`rezerve_edildi = false`):
    - INSERT: Immediately deducts stock using `stok_azalt` function
    - UPDATE: Adjusts stock levels based on quantity differences or warehouse changes
    - DELETE: Returns stock using `stok_arttir` function
  - Properly handles cases where `kaynak_depo_id` is NULL (no warehouse source)
  - Prevents negative reservations with `GREATEST(0, ...)` function

##### `trg_is_emirleri_durum_degisim()`
Handles status changes in work orders.
- **Triggers On**: UPDATE on is_emirleri
- **Business Logic**: Manages stock reservations/releases during cancellation or status changes

##### `stok_rezerve_et()`
Reserves stock for new work orders.
- **Triggers On**: INSERT on is_emirleri
- **Business Logic**: Batch reserves stock for all items in a new work order

##### Work Order Number Triggers

##### `is_emri_otomatik_numara()`
Automatically assigns numbers to new work orders.
- **Triggers On**: INSERT on is_emirleri
- **Business Logic**: Assigns next sequential number if not provided

##### User Management Triggers

##### `handle_new_user()`
Sets up profile for new users.
- **Triggers On**: INSERT on auth.users (via Supabase Auth)
- **Business Logic**: Creates corresponding profile record with default role

#### Helper Functions

##### `unaccent(text)`
Removes accents from text for search purposes.
- **Returns**: TEXT
- **Business Logic**: Text processing for accent-insensitive search

---

## Supabase Triggers Documentation

Triggers are database events that automatically execute functions when specific table operations occur. Below is the complete list of configured triggers in the system.

### Trigger Configuration Matrix

Trigger Name | Table | Function | Activation Condition |
|--------------|-------|----------|---------------------|
enforce_bucket_name_length_trigger | buckets | enforce_bucket_name_length | Origin |
protect_buckets_delete | buckets | protect_delete | Origin |
trg_is_emirleri_guncelleme | is_emirleri | trg_is_emirleri_durum_degisim | After UPDATE |
trigger_is_emri_numara | is_emirleri | is_emri_otomatik_numara | Before INSERT |
trg_is_emri_kalem_stok | is_emri_kalemleri | trg_is_emri_kalemi_stok_isle | After INSERT, UPDATE, DELETE |
protect_objects_delete | objects | protect_delete | Origin |
update_objects_updated_at | objects | update_updated_at_column | Origin |
trg_stok_hareketi_stok_seviyesi | stok_hareketleri | stok_hareketi_stok_seviyesi_guncelle | After INSERT, UPDATE, DELETE |
tr_check_filters | subscription | subscription_check_filters | Origin |
on_auth_user_created | users | handle_new_user | After INSERT |

### Detailed Trigger Descriptions

#### Storage Related Triggers

These triggers manage Supabase Storage functionality and protection:

- **enforce_bucket_name_length_trigger**: Ensures bucket names meet length requirements
- **protect_buckets_delete**: Prevents deletion of storage buckets
- **protect_objects_delete**: Prevents deletion of storage objects
- **update_objects_updated_at**: Automatically updates timestamp when objects are modified
- **tr_check_filters**: Validates subscription filters

#### Business Logic Triggers

These triggers handle core business processes and data integrity:

##### Work Order Triggers
- **trg_is_emirleri_guncelleme**: Executes `trg_is_emirleri_durum_degisim` function after work order updates to handle status changes, stock reservations, and cancellations
- **trigger_is_emri_numara**: Executes `is_emri_otomatik_numara` function before work order insertion to assign automatic sequential numbers

##### Work Order Item Triggers
- **trg_is_emri_kalem_stok**: Executes `trg_is_emri_kalemi_stok_isle` function after work order item insertions, updates, or deletions to manage stock reservations and deductions. Now correctly handles both reserved and immediate stock deduction modes based on the work order's `rezerve_edildi` flag, properly adjusting reservations or stock levels as appropriate.

##### Stock Management Triggers
- **trg_stok_hareketi_stok_seviyesi**: Executes `stok_hareketi_stok_seviyesi_guncelle` function after stock movement operations to maintain accurate stock level calculations

##### User Management Triggers
- **on_auth_user_created**: Executes `handle_new_user` function after new user authentication record creation to set up user profiles with default roles

### Trigger Execution Flow Examples

#### Work Order Creation Flow
1. New work order inserted into `is_emirleri` table
2. `trigger_is_emri_numara` fires → `is_emri_otomatik_numara` assigns sequential number
3. `stok_rezerve_et` function (called from application) reserves stock for items

#### Work Order Item Modification Flow
1. Work order item inserted/updated/deleted in `is_emri_kalemleri` table
2. `trg_is_emri_kalem_stok` fires → `trg_is_emri_kalemi_stok_isle` manages stock reservations/deductions based on the work order's `rezerve_edildi` flag
3. If work order is in reservation mode, stock is reserved in `stok_seviyeleri` by adjusting `rezerve_miktar`
4. If work order is not in reservation mode, stock is immediately adjusted using `stok_arttir`/`stok_azalt` functions
5. Stock levels in `stok_seviyeleri` automatically adjusted based on the operation type and work order status

#### Stock Movement Flow
1. Stock movement recorded in `stok_hareketleri` table
2. `trg_stok_hareketi_stok_seviyesi` fires → `stok_hareketi_stok_seviyesi_guncelle` updates stock levels
3. Product totals in `urunler` table updated accordingly

#### User Registration Flow
1. New user created in Supabase Auth system
2. `on_auth_user_created` fires → `handle_new_user` creates profile record
3. User receives default 'satisci' role in `profiller` table

---

## Supabase RLS (Row Level Security) Policies Documentation

RLS policies control access to table data at the row level, ensuring users can only access data they're authorized to see or modify. Below is the complete list of configured RLS policies in the system.

### Role-Based Access Control Overview

The system uses the following user roles:
- **yonetici** (Administrator) - Full access to all tables
- **satisci** (Salesperson) - Access to customer, order, and product data
- **muhasebeci** (Accountant) - Access to financial data
- **authenticated** - Basic authenticated user access
- **public** - Unauthenticated public access (limited)

### RLS Policies by Table

#### Financial Tables

##### `alacaklar` (Receivables)
- **SELECT**: Public access (everyone can view receivables)
- **INSERT**: Public access (everyone can create receivables)
- **UPDATE**: Public access (everyone can update receivables)

##### `alacak_odemeleri` (Receivable Payments)
- **SELECT**: Public access (everyone can view payment records)
- **INSERT**: Public access (everyone can add payment records)

##### `odemeler` (Payments)
- **SELECT**: Public access (everyone can view payments)
- **INSERT**: Authenticated users only

#### Work Order Tables

##### `is_emirleri` (Work Orders)
- **SELECT**: Public access (everyone can view work orders)
- **INSERT**: Administrators and Salespersons
- **UPDATE**: Administrators and Salespersons
- **ALL**: Administrators and Salespersons (full access)

##### `is_emri_kalemleri` (Work Order Items)
- **SELECT**: Public access (everyone can view work order items)
- **ALL**: Administrators and Salespersons (full access)

#### Customer Management Tables

##### `musteriler` (Customers)
- **SELECT**: Authenticated users and Public access
- **INSERT**: Authenticated users
- **UPDATE**: Authenticated users
- **DELETE**: Authenticated users

#### Product/Inventory Tables

##### `urunler` (Products)
- **SELECT**: Public access (everyone can view products)
- **INSERT**: Administrators
- **UPDATE**: Administrators
- **ALL**: Authenticated users (full access)

##### `depolar` (Warehouses)
- **SELECT**: Authenticated users (Administrators, Salespersons, Accountants)
- **INSERT**: Administrators
- **UPDATE**: Administrators
- **DELETE**: Administrators only

##### `stok_seviyeleri` (Stock Levels)
- **ALL**: Authenticated users (full access)

##### `stok_hareketleri` (Stock Movements)
- **SELECT**: Public access (everyone can view stock movements)
- **INSERT**: Authenticated users only

#### Supplier Tables

##### `tedarikciler` (Suppliers)
- **SELECT**: Authenticated users
- **INSERT**: Administrators
- **UPDATE**: Administrators
- **DELETE**: Administrators only

#### Agreement Tables

##### `anlasmalar` (Agreements)
- **SELECT**: Authenticated users
- **ALL**: Authenticated users (full access)

##### `anlasma_kalemleri` (Agreement Items)
- **ALL**: Authenticated users (full access)

#### User Management Tables

##### `profiller` (User Profiles)
- **SELECT**: Authenticated users (can view all profiles) and users can view their own
- **INSERT**: Users can create their own profile or Administrators
- **UPDATE**: Users can update their own profile or Administrators
- **DELETE**: Administrators only

##### `satiscilar` (Salespeople)
- **SELECT**: Authenticated users (Administrators, Salespersons, Accountants)
- **INSERT**: Administrators
- **UPDATE**: Administrators

#### Proforma Invoice Tables

##### `proformalar` (Proforma Invoices)
- **ALL**: Public access (everyone can perform all operations)

##### `proforma_kalemleri` (Proforma Items)
- **ALL**: Public access (everyone can perform all operations)

### Policy Conditions Explained

#### Role-Based Conditions
Most policies use role checks with the `auth.jwt()` function to extract user roles:
- `{auth.jwt() -> 'role'}` checks the user's assigned role
- Array-based role checks allow multiple roles access `[yonetici, satisci, muhasebeci]`
- User ID matching `{uid()}` allows users to access their own records

#### Authentication Status Conditions
- `{auth.role() = 'authenticated'}` ensures the user is logged in
- `{auth.role() = 'anon'}` allows public/unauthenticated access

#### Ownership Conditions
Several policies implement ownership-based access:
- Users can view all profiles but only update their own
- Profile creation is restricted to the user's own record or administrator action
- Work order access may be filtered by salesperson assignment

### Security Architecture

#### Public Access Tables
These tables allow public read access for transparency:
- Work orders and items
- Receivables and payments
- Stock movements
- Proforma invoices and items

#### Authenticated Access Tables
These tables require user authentication:
- Customer management
- Product/inventory management
- Supplier management
- User profile management

#### Administrator Restricted Tables
These tables are restricted to administrators for data integrity:
- Warehouse management
- Supplier management
- User profile deletion
- Role assignments

### Data Privacy and Compliance

#### Customer Data Protection
- Customer records are protected from public access
- Only authenticated users can view customer information
- CRUD operations on customers require authentication

#### Financial Data Access
- Receivables and payments have controlled access
- Payment creation is limited to authenticated users
- Financial records maintain public read access for transparency

#### User Profile Security
- Users can only modify their own profiles
- Profile viewing is restricted to authenticated users
- Administrator oversight maintained for user management

### Implementation Notes

#### Policy Enforcement
All tables with RLS policies have enforcement enabled:
- Policies are checked on every table access
- Row-level filtering applied automatically by PostgreSQL
- No application-level bypass possible when RLS is enabled

#### Performance Considerations
- Indexes recommended on policy-checked columns
- Complex policy expressions may impact query performance
- Policy conditions should be optimized for common access patterns

---

## Supabase Foreign Key Relationships Documentation

Foreign key constraints ensure referential integrity between related tables, maintaining data consistency and preventing orphaned records. Below is the complete list of foreign key relationships in the system.

### Foreign Key Relationship Matrix

Referencing Table | Referencing Column | Referenced Table | Referenced Column |
|-------------------|--------------------|------------------|-------------------|
stok_seviyeleri | urun_id | urunler | id |
stok_seviyeleri | depo_id | depolar | id |
anlasmalar | tedarikci_id | tedarikciler | id |
is_emirleri | musteri_id | musteriler | id |
is_emirleri | anlasma_id | anlasmalar | id |
is_emri_kalemleri | is_emri_id | is_emirleri | id |
is_emri_kalemleri | urun_id | urunler | id |
is_emri_kalemleri | kaynak_depo_id | depolar | id |
is_emri_kalemleri | kaynak_tedarikci_id | tedarikciler | id |
odemeler | is_emri_id | is_emirleri | id |
is_emri_kalemleri | anlasma_id | anlasmalar | id |
stok_hareketleri | anlasma_id | anlasmalar | id |
anlasma_kalemleri | anlasma_id | anlasmalar | id |
anlasma_kalemleri | urun_id | urunler | id |
stok_hareketleri | urun_id | urunler | id |
stok_hareketleri | depo_id | depolar | id |
stok_hareketleri | is_emri_id | is_emirleri | id |
alacaklar | musteri_id | musteriler | id |
alacaklar | is_emri_id | is_emirleri | id |
alacak_odemeleri | alacak_id | alacaklar | id |
is_emirleri | satisci_id | satiscilar | id |
proformalar | musteri_id | musteriler | id |
proforma_kalemleri | proforma_id | proformalar | id |
proforma_kalemleri | urun_id | urunler | id |
proforma_kalemleri | kaynak_depo_id | depolar | id |
proforma_kalemleri | kaynak_tedarikci_id | tedarikciler | id |
proforma_kalemleri | anlasma_id | anlasmalar | id |
proformalar | donusturulen_is_emri_id | is_emirleri | id |
is_emri_maliyetleri | is_emri_id | is_emirleri | id |
emanetler | urun_id | urunler | id |
emanetler | is_emri_id | is_emirleri | id |
is_emri_kalemleri | emanet_id | emanetler | id |

### Relationship Categories

#### Core Business Entity Relationships

##### Customer-Order Relationships
- **musteriler** ← **is_emirleri** (One-to-Many)
  - One customer can have multiple work orders
  - Each work order belongs to exactly one customer
- **musteriler** ← **proformalar** (One-to-Many)
  - One customer can have multiple proforma invoices
  - Each proforma invoice belongs to exactly one customer
- **musteriler** ← **alacaklar** (One-to-Many)
  - One customer can have multiple receivables
  - Each receivable belongs to exactly one customer

##### Work Order Hierarchy
- **is_emirleri** ← **is_emri_kalemleri** (One-to-Many)
  - One work order can have multiple items
  - Each work order item belongs to exactly one work order
- **is_emirleri** ← **odemeler** (One-to-Many)
  - One work order can have multiple payments
  - Each payment is associated with exactly one work order
- **is_emirleri** ← **alacaklar** (One-to-Many)
  - One work order can generate multiple receivables (in some business scenarios)
  - Each receivable is typically associated with one work order
- **is_emirleri** ← **is_emri_maliyetleri** (One-to-Many)
  - One work order can have multiple cost entries
  - Each cost entry belongs to exactly one work order
- **is_emirleri** ← **emanetler** (One-to-Many)
  - One work order can have multiple deposits
  - Each deposit can be associated with one work order
- **is_emirleri** ← **stok_hareketleri** (One-to-Many)
  - One work order can generate multiple stock movements
  - Each stock movement can be linked to one work order

##### Product-Inventory Relationships
- **urunler** ← **stok_seviyeleri** (One-to-Many)
  - One product can have stock levels in multiple warehouses
  - Each stock level entry is for exactly one product in one warehouse
- **urunler** ← **is_emri_kalemleri** (One-to-Many)
  - One product can be used in multiple work order items
  - Each work order item can reference exactly one product
- **urunler** ← **anlasma_kalemleri** (One-to-Many)
  - One product can be part of multiple agreement items
  - Each agreement item specifies exactly one product
- **urunler** ← **stok_hareketleri** (One-to-Many)
  - One product can have multiple stock movement records
  - Each stock movement is for exactly one product
- **urunler** ← **proforma_kalemleri** (One-to-Many)
  - One product can appear in multiple proforma invoice items
  - Each proforma item references exactly one product
- **urunler** ← **emanetler** (One-to-Many)
  - One product can be part of multiple deposits
  - Each deposit is for exactly one product

##### Warehouse-Inventory Relationships
- **depolar** ← **stok_seviyeleri** (One-to-Many)
  - One warehouse can store multiple products
  - Each stock level entry is for one product in exactly one warehouse
- **depolar** ← **is_emri_kalemleri** (One-to-Many)
  - One warehouse can be a source for multiple work order items
  - Each work order item can have exactly one warehouse as source
- **depolar** ← **stok_hareketleri** (One-to-Many)
  - One warehouse can have multiple stock movements
  - Each stock movement occurs in exactly one warehouse
- **depolar** ← **proforma_kalemleri** (One-to-Many)
  - One warehouse can be a source for multiple proforma items
  - Each proforma item can have exactly one warehouse as source

##### Supplier-Relationships
- **tedarikciler** ← **anlasmalar** (One-to-Many)
  - One supplier can have multiple agreements
  - Each agreement is with exactly one supplier
- **tedarikciler** ← **is_emri_kalemleri** (One-to-Many)
  - One supplier can be a source for multiple work order items
  - Each work order item can have exactly one supplier as source
- **tedarikciler** ← **proforma_kalemleri** (One-to-Many)
  - One supplier can be a source for multiple proforma items
  - Each proforma item can have exactly one supplier as source

##### Agreement-Customer Relationships
- **anlasmalar** ← **is_emirleri** (One-to-Many)
  - One agreement can be associated with multiple work orders
  - Each work order can be linked to exactly one agreement
- **anlasmalar** ← **is_emri_kalemleri** (One-to-Many)
  - One agreement can influence multiple work order items
  - Each work order item can be linked to exactly one agreement
- **anlasmalar** ← **anlasma_kalemleri** (One-to-Many)
  - One agreement can have multiple agreement items
  - Each agreement item belongs to exactly one agreement
- **anlasmalar** ← **stok_hareketleri** (One-to-Many)
  - One agreement can be associated with multiple stock movements
  - Each stock movement can be linked to exactly one agreement
- **anlasmalar** ← **proforma_kalemleri** (One-to-Many)
  - One agreement can influence multiple proforma items
  - Each proforma item can be linked to exactly one agreement

##### Receivables-Payments Relationships
- **alacaklar** ← **alacak_odemeleri** (One-to-Many)
  - One receivable can have multiple payment records
  - Each payment is applied to exactly one receivable

##### Work Orders-Salesperson Relationships
- **satiscilar** ← **is_emirleri** (One-to-Many)
  - One salesperson can handle multiple work orders
  - Each work order is assigned to exactly one salesperson

##### Proforma Invoices-Work Orders Relationships
- **proformalar** ← **proforma_kalemleri** (One-to-Many)
  - One proforma invoice can have multiple items
  - Each proforma item belongs to exactly one proforma invoice
- **is_emirleri** ← **proformalar** (One-to-One/Optional)
  - One work order can be converted from exactly one proforma invoice
  - One proforma invoice can be converted to exactly one work order

##### Deposit-Work Order Item Relationships
- **emanetler** ← **is_emri_kalemleri** (One-to-One)
  - One deposit can be associated with exactly one work order item
  - One work order item can reference exactly one deposit

### Referential Integrity Constraints

#### Cascade Delete Behaviors
- Most foreign key relationships do NOT have cascade delete enabled
- Deletion of parent records requires explicit handling of child records
- This prevents accidental data loss and ensures proper business process cleanup

#### Nullable Foreign Keys
Several foreign key columns allow NULL values to support flexible business scenarios:
- **is_emri_kalemleri.kaynak_depo_id** - Items may not always source from warehouse
- **is_emri_kalemleri.kaynak_tedarikci_id** - Items may not always source from supplier
- **is_emri_kalemleri.anlasma_id** - Items may not always be linked to agreements
- **is_emri_kalemleri.emanet_id** - Items may not always be deposits
- **is_emirleri.anlasma_id** - Work orders may not always be linked to agreements
- **is_emirleri.satisci_id** - Work orders may not always be assigned to salesperson
- **proformalar.donusturulen_is_emri_id** - Proformas may not be converted to work orders
- **proforma_kalemleri.anlasma_id** - Proforma items may not always be linked to agreements
- **proforma_kalemleri.kaynak_depo_id** - Proforma items may not always source from warehouse
- **proforma_kalemleri.kaynak_tedarikci_id** - Proforma items may not always source from supplier

#### Unique Constraint Relationships
- **proformalar.donusturulen_is_emri_id** - Enforces one-to-one relationship between converted proformas and work orders
- **emanetler.urun_id + emanetler.is_emri_id** - Combination ensures unique deposits per product and work order

### Business Logic Implications

#### Inventory Management Dependencies
- Stock levels depend on products and warehouses
- Stock movements track product flow between operations
- Work order items consume inventory from specific sources

#### Financial Dependencies
- Receivables link customers to work orders
- Payments link directly to work orders or receivables
- Agreements may influence pricing in work orders and proformas

#### Operational Dependencies
- Work orders aggregate customer requests with product needs
- Salesperson assignments track performance metrics
- Deposit management tracks special inventory items

---

## Supabase Primary Key Documentation

Primary keys uniquely identify each row in a table and are essential for data integrity and relationship management. Below is the complete list of primary key definitions in the system.

### Primary Key Matrix

Table Name | Primary Key Column |
|------------|-------------------|
alacak_odemeleri | id |
alacaklar | id |
anlasma_kalemleri | id |
anlasmalar | id |
depolar | id |
emanetler | id |
is_emirleri | id |
is_emri_kalemleri | id |
is_emri_maliyetleri | id |
is_emri_sayac | yil |
musteriler | id |
odemeler | id |
profiller | id |
proforma_ayarlari | id |
proforma_kalemleri | id |
proformalar | id |
satiscilar | id |
stok_hareketleri | id |
stok_seviyeleri | id |
tedarikciler | id |
urunler | id |

### Primary Key Patterns and Conventions

#### UUID Primary Keys (20 tables)
Most tables use UUID (Universally Unique Identifier) as their primary key strategy:
- **Column Name**: `id` (consistent across all tables)
- **Data Type**: `uuid`
- **Default Value**: `gen_random_uuid()`
- **Benefits**:
  - Globally unique identifiers prevent conflicts
  - Secure random values prevent enumeration attacks
  - Works well in distributed systems
  - No sequential numbering that reveals business information

Tables using UUID primary keys:
- alacak_odemeleri
- alacaklar
- anlasma_kalemleri
- anlasmalar
- depolar
- emanetler
- is_emirleri
- is_emri_kalemleri
- is_emri_maliyetleri
- musteriler
- odemeler
- profiller
- proforma_ayarlari
- proforma_kalemleri
- proformalar
- satiscilar
- stok_hareketleri
- stok_seviyeleri
- tedarikciler
- urunler

#### Composite/Natural Primary Key (1 table)
One table uses a natural primary key based on business logic:

##### `is_emri_sayac` Table
- **Primary Key Column**: `yil` (year)
- **Data Type**: `integer`
- **Purpose**: Tracks sequential work order numbers by year
- **Business Logic**: Ensures unique sequential numbering within each calendar year
- **Default Behavior**: Work order numbers follow format `KHSEİ-YYYYNNNN` where YYYY is year and NNNN is sequence number

### Primary Key Design Benefits

#### Consistency Across Tables
- Uniform naming convention (`id` column) simplifies development
- Consistent data types reduce complexity in joins and queries
- Predictable default value generation reduces maintenance overhead

#### Performance Considerations
- UUID primary keys provide good distribution for indexing
- Natural primary key in `is_emri_sayac` optimizes year-based queries
- All primary keys are indexed automatically by PostgreSQL

#### Security Advantages
- Random UUIDs prevent URL manipulation and data enumeration
- No predictable sequences that could reveal business information
- Work order numbers are generated separately from primary keys for business visibility

### Relationship to Foreign Keys

Primary keys in parent tables are referenced by foreign key columns in child tables:
- All foreign key relationships point to `id` columns (except for `is_emri_sayac`)
- Referencing columns typically follow pattern `{table_name}_id` or `{table_singular}_id`
- Foreign key constraints ensure data integrity across relationships

### Migration and Maintenance

#### Primary Key Stability
- UUID primary keys remain stable during data migration
- No need to resequence or regenerate identifiers when moving data
- Cross-database compatibility for replication or backup scenarios

#### Indexing Strategy
- Primary keys are automatically indexed by PostgreSQL
- Additional indexes may be added on frequently queried foreign key columns
- Unique constraints enforced at database level prevent duplicates