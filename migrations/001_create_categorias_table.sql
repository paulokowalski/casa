-- Migration: 001_create_categorias_table.sql
-- Descrição: Cria a tabela de categorias para o sistema de gestão de cartão
-- Data: 2024-12-19

-- Criação da tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7),
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);
CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias(ativo);

-- Inserção das categorias padrão com UUIDs fixos para compatibilidade
INSERT INTO categorias (id, nome, descricao, cor, icone) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Alimentação', 'Restaurantes, delivery, supermercados', '#ef4444', 'restaurant'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Transporte', 'Combustível, Uber, transporte público', '#3b82f6', 'directions_car'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Saúde', 'Farmácias, consultas médicas, exames', '#10b981', 'local_hospital'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Educação', 'Cursos, livros, material escolar', '#8b5cf6', 'school'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Lazer', 'Entretenimento, hobbies, diversão', '#f59e0b', 'sports_esports'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Vestuário', 'Roupas, calçados, acessórios', '#ec4899', 'checkroom'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Casa', 'Móveis, eletrodomésticos, decoração', '#06b6d4', 'home'),
    ('550e8400-e29b-41d4-a716-446655440008', 'Tecnologia', 'Eletrônicos, gadgets, software', '#6366f1', 'computer'),
    ('550e8400-e29b-41d4-a716-446655440009', 'Serviços', 'Assinaturas, serviços online', '#84cc16', 'support_agent'),
    ('550e8400-e29b-41d4-a716-446655440010', 'Viagem', 'Passagens, hospedagem, turismo', '#f97316', 'flight'),
    ('550e8400-e29b-41d4-a716-446655440011', 'Presentes', 'Presentes para familiares e amigos', '#e91e63', 'card_giftcard'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Investimentos', 'Aplicações financeiras', '#22c55e', 'trending_up'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Outros', 'Gastos não categorizados', '#6b7280', 'more_horiz')
ON CONFLICT (id) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE categorias IS 'Tabela de categorias para classificação de compras';
COMMENT ON COLUMN categorias.id IS 'Identificador único da categoria';
COMMENT ON COLUMN categorias.nome IS 'Nome da categoria';
COMMENT ON COLUMN categorias.descricao IS 'Descrição detalhada da categoria';
COMMENT ON COLUMN categorias.cor IS 'Código hexadecimal da cor para exibição';
COMMENT ON COLUMN categorias.icone IS 'Nome do ícone Material-UI';
COMMENT ON COLUMN categorias.ativo IS 'Indica se a categoria está ativa';
