-- Migration: 000_check_uuid_extension.sql
-- Descrição: Verifica e habilita a extensão UUID se necessário
-- Data: 2024-12-19

-- Verifica se a extensão uuid-ossp está disponível
SELECT 
    'Extensão uuid-ossp disponível' as check_item,
    EXISTS (
        SELECT 1 FROM pg_available_extensions 
        WHERE name = 'uuid-ossp'
    ) as result;

-- Habilita a extensão uuid-ossp se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verifica se a extensão foi habilitada com sucesso
SELECT 
    'Extensão uuid-ossp habilitada' as check_item,
    EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname = 'uuid-ossp'
    ) as result;

-- Testa a função gen_random_uuid()
SELECT 
    'Função gen_random_uuid() funcionando' as check_item,
    gen_random_uuid() IS NOT NULL as result;

