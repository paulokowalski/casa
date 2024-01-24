interface InputTextProps {
    label: string;
    value: string;
    type: 'text' | 'date'; // Adicionando a propriedade 'type'
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<InputTextProps> = ({ label, value, type, onChange }) => {
    return (
        <div className="input-container">
        <label className="label">{label}</label>
        <input
            type={type}
            className="input-text"
            value={value}
            onChange={onChange}
        />
        </div>
    );
};

export default InputText;