-- Rollback: rollback_categorias.sql
-- Descrição: Reverte as mudanças do sistema de categorias
-- Data: 2024-12-19
-- ATENÇÃO: Execute apenas se necessário reverter as mudanças

-- Remove a foreign key da tabela compras
ALTER TABLE compras 
DROP CONSTRAINT IF EXISTS fk_compras_categoria;

-- Remove a coluna categoria_id da tabela compras
ALTER TABLE compras 
DROP COLUMN IF EXISTS categoria_id;

-- Remove os índices criados
DROP INDEX IF EXISTS idx_compras_categoria_id;
DROP INDEX IF EXISTS idx_categorias_nome;
DROP INDEX IF EXISTS idx_categorias_ativo;

-- Remove a tabela de categorias
DROP TABLE IF EXISTS categorias CASCADE;

-- Verifica se a remoção foi bem-sucedida
SELECT 'Rollback concluído com sucesso' as status;

