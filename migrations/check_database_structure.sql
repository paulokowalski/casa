-- Script: check_database_structure.sql
-- Descrição: Verifica a estrutura atual do banco de dados
-- Data: 2024-12-19

-- Verifica se a tabela compras existe
SELECT 
    'Tabela compras existe' as check_item,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'compras'
    ) as result;

-- Verifica as colunas da tabela compras
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'compras'
ORDER BY ordinal_position;

-- Verifica se a tabela categorias existe
SELECT 
    'Tabela categorias existe' as check_item,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'categorias'
    ) as result;

-- Verifica as colunas da tabela categorias (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categorias'
ORDER BY ordinal_position;

-- Verifica foreign keys relacionadas
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'compras';

