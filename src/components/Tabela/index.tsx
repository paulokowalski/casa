import React from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { DateFormat, FormatNumber } from '../../functions/global';

interface TabelaProps {
    columns: any[];
    data: any[];
}

const Tabela: React.FC<TabelaProps> = ({ columns, data }) => {

    const renderizarColuna = (coluna: any, value: any) => {
        if (coluna.tipo === 'data') {
            return <span>{DateFormat(value)}</span>;
        } else if (coluna.tipo === 'numero') {
            return <span>{FormatNumber(value)}</span>;
        } else {
            return <span>{value}</span>;
        }
    };

    return (
        <DataTable value={data} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} showGridlines tableStyle={{ minWidth: '50rem' }}>
            {
                columns.map(coluna => (
                    <Column 
                        key={coluna.field} 
                        field={coluna.field} 
                        header={coluna.name} 
                        body={(rowData: any) => renderizarColuna(coluna, rowData[coluna.field])} />
                ))
            }            
        </DataTable>
    );
};

export default Tabela;