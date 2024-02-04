import React, { useState } from 'react';


interface Item {
  codigo: string;
  descricao: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items?: Item[];
  required?: boolean;
  options?: string[];
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, items, required, options }) => {
  return (
    <label className="select-label">
      {label}:{' '}
      <select
        className="select-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option>SELECIONE</option>
        {items?.map((item) => (
          <option key={item.codigo} value={item.codigo}>
            {item.descricao}
          </option>
        ))}
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default Select;