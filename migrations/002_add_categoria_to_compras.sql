-- Migration: 002_add_categoria_to_compras.sql
-- Descrição: Adiciona coluna categoria_id na tabela de compras
-- Data: 2024-12-19

-- Adiciona a coluna categoria_id na tabela de compras
ALTER TABLE compras 
ADD COLUMN IF NOT EXISTS categoria_id UUID;

-- Adiciona a foreign key para a tabela de categorias
ALTER TABLE compras 
ADD CONSTRAINT fk_compras_categoria 
FOREIGN KEY (categoria_id) 
REFERENCES categorias(id) 
ON DELETE SET NULL;

-- Cria índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_compras_categoria_id ON compras(categoria_id);

-- Comentário para documentação
COMMENT ON COLUMN compras.categoria_id IS 'Referência para a categoria da compra';
