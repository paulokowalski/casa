-- Migration: 003_migrate_existing_data.sql
-- Descrição: Migra dados existentes para o novo sistema de categorias
-- Data: 2024-12-19

-- Função para migrar categorias existentes (se houver coluna categoria antiga)
-- Descomente e ajuste conforme necessário se você tiver dados existentes

/*
-- Exemplo de migração se você tinha uma coluna 'categoria' com nomes
UPDATE compras 
SET categoria_id = (
    SELECT id 
    FROM categorias 
    WHERE LOWER(nome) = LOWER(compras.categoria)
    LIMIT 1
)
WHERE categoria_id IS NULL 
AND categoria IS NOT NULL;

-- Remove a coluna antiga após migração (descomente quando confirmar)
-- ALTER TABLE compras DROP COLUMN IF EXISTS categoria;
*/

-- Atualiza registros sem categoria para 'Outros'
UPDATE compras 
SET categoria_id = '550e8400-e29b-41d4-a716-446655440013'
WHERE categoria_id IS NULL;

-- Verifica se a migração foi bem-sucedida
SELECT 
    'Registros com categoria definida' as status,
    COUNT(*) as total
FROM compras 
WHERE categoria_id IS NOT NULL

UNION ALL

SELECT 
    'Registros sem categoria' as status,
    COUNT(*) as total
FROM compras 
WHERE categoria_id IS NULL;
