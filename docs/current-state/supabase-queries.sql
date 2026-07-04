-- 1. Get all tables and their columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 2. Get all views
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public';

-- 3. Get all functions (RPC functions)
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition,
    external_language
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- 4. Get all triggers
SELECT 
    tgname as trigger_name,
    pg_class.relname as table_name,
    pg_proc.proname as function_name,
    CASE tgenabled
        WHEN 'O' THEN 'Origin'
        WHEN 'D' THEN 'Disabled'
        WHEN 'R' THEN 'Replica'
        WHEN 'A' THEN 'Always'
    END as trigger_enabled
FROM pg_trigger
JOIN pg_class ON pg_class.oid = tgrelid
JOIN pg_proc ON pg_proc.oid = tgfoid
WHERE NOT tgisinternal
ORDER BY pg_class.relname, tgname;

-- 5. Get Row Level Security (RLS) policies
SELECT 
    polname as policy_name,
    relname as table_name,
    polcmd as command,
    polqual as qualifier,
    polwithcheck as with_check
FROM pg_policy
JOIN pg_class ON pg_class.oid = polrelid
ORDER BY relname, polname;

-- 6. Get foreign key relationships
SELECT 
    tc.table_name as referencing_table,
    kcu.column_name as referencing_column,
    ccu.table_name as referenced_table,
    ccu.column_name as referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';

-- 7. Get primary key information
SELECT 
    tc.table_name,
    kcu.column_name as primary_key_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;