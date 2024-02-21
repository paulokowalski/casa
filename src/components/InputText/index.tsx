import { InputText } from "primereact/inputtext";

interface InputTextProps {
    label: string;
    value: string;
    type: 'text' | 'date'; // Adicionando a propriedade 'type'
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTextPersonalizado: React.FC<InputTextProps> = ({ label, value, type, onChange }) => {
    return (
        <span className="p-float-label">
            <InputText id="username" value={value} onChange={onChange}/>
            <label htmlFor="username">{label}</label>
        </span>
    );
};

export default InputTextPersonalizado;