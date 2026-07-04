# Stock Management Debugging Summary

## Issues Identified

### 1. Double Deduction Issue
When adding a product to a work order, stock is being deducted twice due to conflicting trigger functions.

### 2. Warehouse Change Issue  
When changing warehouse of a product in work order, stock is deducted from new warehouse but not returned to old warehouse.

### 3. Missing Operations
Stock operations are not happening at all in many cases.

## Root Causes

### Conflicting Trigger Logic
Multiple trigger functions are trying to handle the same stock operations:
- `trg_is_emirleri_guncelleme` on `is_emirleri` → calls `stok_dus_ve_rezervasyon_kaldir`
- `trg_is_emri_kalem_stok` on `is_emri_kalemleri` → calls `trg_is_emri_kalemi_stok_isle`

### Misaligned Business Logic
The UI uses `rezerve_edildi` field but some trigger functions are looking at `sevk_edildi`.

### Incomplete Trigger Implementation
The `trg_is_emri_kalemi_stok_isle` function has logic gaps that prevent proper stock management.

## Fixes Applied

### Frontend Fix
Updated the RPC call in `src/views/IsEmriDetayView.vue` to send JSON string instead of object (minor optimization).

### Backend Fix
Created fixed version of `is_emri_kalemleri_guncelle_atomic` function in `sql/supabase_function_fix.sql` that properly handles:
- New item creation with emanet support
- Existing item updates
- Item deletion
- Orphaned emanet cleanup
- Transaction safety

## Database Changes Needed

The following trigger functions need to be updated in the Supabase database:

### 1. `trg_is_emri_kalemi_stok_isle` Function
Should implement the logic described in the plan:

```
On INSERT:
  Get work order's rezerve_edildi status
  If rezerve_edildi = true AND source is warehouse:
    Add to stok_seviyeleri.rezerve_miktar
  If rezerve_edildi = false AND source is warehouse:
    Call stok_azalt to deduct from stock

On UPDATE:
  If warehouse changed:
    If rezerve_edildi = true:
      Remove reservation from old warehouse
      Add reservation to new warehouse
  If quantity changed:
    If rezerve_edildi = true:
      Adjust reservation by difference

On DELETE:
  Get work order's rezerve_edildi status
  If rezerve_edildi = true AND source was warehouse:
    Subtract from stok_seviyeleri.rezerve_miktar
  If rezerve_edildi = false AND source was warehouse:
    Call stok_arttir to return to stock
```

### 2. `stok_dus_ve_rezervasyon_kaldir` Function
Should implement the logic described in the plan:

```
On reserve_edildi: true → false:
  For each item with warehouse source:
    Call stok_azalt to deduct stock
    Set reservation to 0

On reserve_edildi: false → true:
  For each item with warehouse source:
    Call stok_arttir to return stock
```

## Expected Results After Implementation

1. ✅ Adding product to work order with `rezerve_edildi = true` → Reserves stock (no deduction)
2. ✅ Adding product to work order with `rezerve_edildi = false` → Deducts stock immediately
3. ✅ Changing warehouse → Releases old reservation, creates new reservation (if reserved)
4. ✅ Changing warehouse → Deducts from new, returns to old (if deducted)
5. ✅ Deleting product → Returns stock/releases reservation appropriately
6. ✅ Toggling `rezerve_edildi` flag → Bulk stock operations as needed

## Deployment Instructions

1. Deploy the updated trigger functions to Supabase
2. Test all stock operations thoroughly
3. Monitor for any regressions in existing functionality