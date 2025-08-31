-- Script: test_connection.sql
-- Descrição: Testa a conexão com o banco de dados
-- Data: 2024-12-19

-- Testa a conexão
SELECT 'Conexão com PostgreSQL estabelecida com sucesso!' as status;

-- Verifica a versão do PostgreSQL
SELECT version() as postgresql_version;

-- Verifica o banco de dados atual
SELECT current_database() as current_database;

-- Verifica o usuário atual
SELECT current_user as current_user;

-- Lista todas as tabelas do schema público
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

