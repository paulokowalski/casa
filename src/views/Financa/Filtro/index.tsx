import { useState } from 'react';
import { Filter } from '../../../components/ui/Filter';

export function Filtro() {
  const [tipo, setTipo] = useState('todos');
  const [descricao, setDescricao] = useState('');
  const [fixa, setFixa] = useState('todos');

  function handleBuscar() {
    // Lógica de busca
  }

  const fields = [
    {
      id: 'tipo',
      label: 'Tipo',
      type: 'select',
      value: tipo,
      onChange: setTipo,
      options: [
        { value: 'todos', label: 'Todos' },
        { value: 'despesa', label: 'Despesa' },
        { value: 'receita', label: 'Receita' },
      ],
    },
    {
      id: 'descricao',
      label: 'Descrição',
      type: 'text',
      value: descricao,
      onChange: setDescricao,
    },
    {
      id: 'fixa',
      label: 'Fixa?',
      type: 'select',
      value: fixa,
      onChange: setFixa,
      options: [
        { value: 'todos', label: 'Todos' },
        { value: 'sim', label: 'Sim' },
        { value: 'nao', label: 'Não' },
      ],
    },
  ];

  return (
    <Filter fields={fields} onFilter={handleBuscar} filterLabel="Buscar" />
  );
} 