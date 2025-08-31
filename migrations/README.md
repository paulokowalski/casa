# Migração para Sistema de Categorias

Este diretório contém os scripts SQL para migrar o sistema de gestão de cartão para PostgreSQL com suporte a categorias.

## 📋 Pré-requisitos

- PostgreSQL 12 ou superior
- Acesso de administrador ao banco de dados
- Backup do banco de dados atual (recomendado)

## 🚀 Passos para Migração

### 1. Verificar Estrutura Atual
```bash
psql -d seu_banco -f migrations/check_database_structure.sql
```

### 2. Executar Migrações em Ordem

```bash
# 0. Verificar e habilitar extensão UUID
psql -d seu_banco -f migrations/000_check_uuid_extension.sql

# 1. Criar tabela de categorias
psql -d seu_banco -f migrations/001_create_categorias_table.sql

# 2. Adicionar coluna categoria_id na tabela compras
psql -d seu_banco -f migrations/002_add_categoria_to_compras.sql

# 3. Migrar dados existentes (se necessário)
psql -d seu_banco -f migrations/003_migrate_existing_data.sql
```

### 3. Verificar Migração
```bash
psql -d seu_banco -f migrations/check_database_structure.sql
```

## 📊 Estrutura Criada

### Tabela `categorias`
```sql
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(7),
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `compras` (modificada)
```sql
ALTER TABLE compras ADD COLUMN categoria_id UUID;
ALTER TABLE compras ADD CONSTRAINT fk_compras_categoria 
    FOREIGN KEY (categoria_id) REFERENCES categorias(id);
```

## 🎨 Categorias Padrão

O sistema inclui 13 categorias pré-definidas:

1. **Alimentação** - Restaurantes, delivery, supermercados
2. **Transporte** - Combustível, Uber, transporte público
3. **Saúde** - Farmácias, consultas médicas, exames
4. **Educação** - Cursos, livros, material escolar
5. **Lazer** - Entretenimento, hobbies, diversão
6. **Vestuário** - Roupas, calçados, acessórios
7. **Casa** - Móveis, eletrodomésticos, decoração
8. **Tecnologia** - Eletrônicos, gadgets, software
9. **Serviços** - Assinaturas, serviços online
10. **Viagem** - Passagens, hospedagem, turismo
11. **Presentes** - Presentes para familiares e amigos
12. **Investimentos** - Aplicações financeiras
13. **Outros** - Gastos não categorizados

## 🔧 Comandos Úteis

### Verificar categorias criadas
```sql
SELECT id, nome, descricao, cor FROM categorias WHERE ativo = true;
```

### Verificar compras com categorias
```sql
SELECT 
    c.nome_compra,
    c.valor_total,
    cat.nome as categoria
FROM compras c
LEFT JOIN categorias cat ON c.categoria_id = cat.id
LIMIT 10;
```

### Estatísticas por categoria
```sql
SELECT 
    cat.nome as categoria,
    COUNT(*) as total_compras,
    SUM(c.valor_total) as valor_total
FROM compras c
LEFT JOIN categorias cat ON c.categoria_id = cat.id
GROUP BY cat.id, cat.nome
ORDER BY valor_total DESC;
```

## ⚠️ Rollback

Se necessário reverter as mudanças:

```bash
psql -d seu_banco -f migrations/rollback_categorias.sql
```

**ATENÇÃO**: O rollback remove todos os dados de categorias e a coluna categoria_id.

## 🔍 Troubleshooting

### Erro: "relation 'compras' does not exist"
- Verifique se a tabela `compras` existe no seu banco
- Ajuste o nome da tabela no script se necessário

### Erro: "duplicate key value violates unique constraint"
- As categorias já existem, execute apenas os scripts 002 e 003

### Erro: "column 'categoria_id' already exists"
- A coluna já foi criada, execute apenas o script 003

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do PostgreSQL
2. Execute o script de verificação de estrutura
3. Consulte a documentação do PostgreSQL
4. Faça backup antes de tentar novamente
