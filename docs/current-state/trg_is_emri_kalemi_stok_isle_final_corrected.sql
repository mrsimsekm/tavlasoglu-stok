-- Final corrected version of the trg_is_emri_kalemi_stok_isle function
-- With explicit numeric casting and complete business logic
-- Key changes:
-- 1. Explicit ::numeric casting for miktar field
-- 2. Complete handling of INSERT, UPDATE, DELETE operations
-- 3. Proper stock adjustments for warehouse changes

DROP TRIGGER IF EXISTS trg_is_emri_kalem_stok ON is_emri_kalemleri;
DROP FUNCTION IF EXISTS trg_is_emri_kalemi_stok_isle();

CREATE OR REPLACE FUNCTION trg_is_emri_kalemi_stok_isle()
RETURNS TRIGGER AS $$
DECLARE
    v_is_emri_rezerve_edildi BOOLEAN;
    v_old_depo_id UUID;
    v_old_miktar NUMERIC;
    v_old_urun_id UUID;
BEGIN
    -- Get the work order's reserve status
    IF TG_OP = 'DELETE' THEN
        SELECT rezerve_edildi INTO v_is_emri_rezerve_edildi 
        FROM is_emirleri 
        WHERE id = OLD.is_emri_id;
        
        -- Store old values for use in DELETE operation
        v_old_depo_id := OLD.kaynak_depo_id;
        v_old_miktar := OLD.miktar;
        v_old_urun_id := OLD.urun_id;
    ELSE
        SELECT rezerve_edildi INTO v_is_emri_rezerve_edildi 
        FROM is_emirleri 
        WHERE id = NEW.is_emri_id;
    END IF;

    -- Handle DELETE operation
    IF TG_OP = 'DELETE' THEN
        -- If work order was in reserve mode and source was warehouse, release reservation
        IF v_is_emri_rezerve_edildi = true AND v_old_depo_id IS NOT NULL AND v_old_urun_id IS NOT NULL THEN
            UPDATE stok_seviyeleri 
            SET rezerve_miktar = GREATEST(0, rezerve_miktar - v_old_miktar)
            WHERE urun_id = v_old_urun_id AND depo_id = v_old_depo_id;
        -- If work order was NOT in reserve mode and source was warehouse, return stock
        ELSIF v_is_emri_rezerve_edildi = false AND v_old_depo_id IS NOT NULL AND v_old_urun_id IS NOT NULL THEN
            PERFORM public.stok_arttir(
                v_old_urun_id,
                v_old_depo_id,
                v_old_miktar::numeric,
                'İş emri kalemi silindi: ' || OLD.aciklama,
                NULL::uuid
            );
        END IF;
        RETURN OLD;
    END IF;

    -- Handle INSERT operation
    IF TG_OP = 'INSERT' THEN
        -- If work order is in reserve mode and source is warehouse, reserve stock
        IF v_is_emri_rezerve_edildi = true AND NEW.kaynak_depo_id IS NOT NULL AND NEW.urun_id IS NOT NULL THEN
            INSERT INTO stok_seviyeleri (urun_id, depo_id, miktar, rezerve_miktar)
            VALUES (NEW.urun_id, NEW.kaynak_depo_id, 0, NEW.miktar)
            ON CONFLICT (urun_id, depo_id) 
            DO UPDATE SET rezerve_miktar = stok_seviyeleri.rezerve_miktar + NEW.miktar;
        -- If work order is NOT in reserve mode and source is warehouse, deduct stock immediately
        ELSIF v_is_emri_rezerve_edildi = false AND NEW.kaynak_depo_id IS NOT NULL AND NEW.urun_id IS NOT NULL THEN
            PERFORM public.stok_azalt(
                NEW.urun_id,
                NEW.kaynak_depo_id,
                NEW.miktar::numeric,
                NEW.is_emri_id,
                'İş emri kalemi eklendi: ' || NEW.aciklama,
                NULL::uuid
            );
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE operation
    IF TG_OP = 'UPDATE' THEN
        -- Case 1: Warehouse changed (source changed)
        IF OLD.kaynak_depo_id IS DISTINCT FROM NEW.kaynak_depo_id THEN
            -- Handle old warehouse
            IF OLD.kaynak_depo_id IS NOT NULL AND OLD.urun_id IS NOT NULL THEN
                IF v_is_emri_rezerve_edildi = true THEN
                    -- Release reservation from old warehouse
                    UPDATE stok_seviyeleri 
                    SET rezerve_miktar = GREATEST(0, rezerve_miktar - OLD.miktar)
                    WHERE urun_id = OLD.urun_id AND depo_id = OLD.kaynak_depo_id;
                ELSE
                    -- Return stock to old warehouse
                    PERFORM public.stok_arttir(
                        OLD.urun_id,
                        OLD.kaynak_depo_id,
                        OLD.miktar::numeric,
                        'İş emri kalemi depo değiştirildi (eski): ' || OLD.aciklama,
                        NULL::uuid
                    );
                END IF;
            END IF;
            
            -- Handle new warehouse
            IF NEW.kaynak_depo_id IS NOT NULL AND NEW.urun_id IS NOT NULL THEN
                IF v_is_emri_rezerve_edildi = true THEN
                    -- Reserve stock in new warehouse
                    INSERT INTO stok_seviyeleri (urun_id, depo_id, miktar, rezerve_miktar)
                    VALUES (NEW.urun_id, NEW.kaynak_depo_id, 0, NEW.miktar)
                    ON CONFLICT (urun_id, depo_id) 
                    DO UPDATE SET rezerve_miktar = stok_seviyeleri.rezerve_miktar + NEW.miktar;
                ELSE
                    -- Deduct stock from new warehouse
                    PERFORM public.stok_azalt(
                        NEW.urun_id,
                        NEW.kaynak_depo_id,
                        NEW.miktar::numeric,
                        NEW.is_emri_id,
                        'İş emri kalemi depo değiştirildi (yeni): ' || NEW.aciklama,
                        NULL::uuid
                    );
                END IF;
            END IF;
        -- Case 2: Quantity changed but warehouse is same
        ELSIF OLD.miktar <> NEW.miktar AND OLD.kaynak_depo_id = NEW.kaynak_depo_id AND OLD.urun_id = NEW.urun_id THEN
            -- Adjust by the difference
            IF v_is_emri_rezerve_edildi = true AND NEW.kaynak_depo_id IS NOT NULL THEN
                UPDATE stok_seviyeleri 
                SET rezerve_miktar = GREATEST(0, rezerve_miktar + (NEW.miktar - OLD.miktar))
                WHERE urun_id = NEW.urun_id AND depo_id = NEW.kaynak_depo_id;
            ELSIF v_is_emri_rezerve_edildi = false AND NEW.kaynak_depo_id IS NOT NULL THEN
                -- Handle quantity change when not reserved (deduct/return difference)
                IF NEW.miktar > OLD.miktar THEN
                    -- Need to deduct more
                    PERFORM public.stok_azalt(
                        NEW.urun_id,
                        NEW.kaynak_depo_id,
                        (NEW.miktar - OLD.miktar)::numeric,
                        NEW.is_emri_id,
                        'İş emri kalemi miktar artırıldı: ' || NEW.aciklama,
                        NULL::uuid
                    );
                ELSE
                    -- Need to return some
                    PERFORM public.stok_arttir(
                        NEW.urun_id,
                        NEW.kaynak_depo_id,
                        (OLD.miktar - NEW.miktar)::numeric,
                        'İş emri kalemi miktar azaltıldı: ' || NEW.aciklama,
                        NULL::uuid
                    );
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trg_is_emri_kalem_stok
    AFTER INSERT OR UPDATE OR DELETE ON is_emri_kalemleri
    FOR EACH ROW EXECUTE FUNCTION trg_is_emri_kalemi_stok_isle();