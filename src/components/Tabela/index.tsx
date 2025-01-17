import React from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Tag } from 'primereact/tag';
import { DateFormat, FormatNumber } from '../../functions/global';

interface TabelaProps {
    columns: any[];
    data: any[];
}

const Tabela: React.FC<TabelaProps> = ({ columns, data }) => {

    const renderizarColuna = (coluna: any, value: any, rowData: any) => {
        if (coluna.tipo === 'data') {
            return <span>{DateFormat(value)}</span>;
        } else if (coluna.tipo === 'ultimaParcela') {
            return <Tag value={rowData.ultimaParcela} severity={getSeverity(rowData.ultimaParcela)} />;
        } else if (coluna.tipo === 'numero') {
            return <span>{FormatNumber(value)}</span>;
        } else if (coluna.tipo === 'btnRemover') {
            return <Button onClick={() => coluna.onAction(rowData.id)} severity="danger" raised>Remover</Button>;
        } else {
            return <span>{value}</span>;
        }
    };

    const calcularSomaParcela = (data:any) => {
        return data.reduce((total:any, item:any) => total + item.valorParcela, 0);
    };

    const calcularSomaParcelaTotal = (data:any) => {
        return data.reduce((total:any, item:any) => total + item.valorFaltante, 0);
    };

    const calcularSomaTotal = (data:any) => {
        return data.reduce((total:any, item:any) => total + item.valorTotal, 0);
    };

    const getSeverity = (status:any) => {
        switch (status) {
            case 'NÃO':
                return 'danger';

            case 'SIM':
                return 'success';
        }
    };
    
    // Chamada da função para calcular a soma
    const somaTotalParcela = calcularSomaParcela(data);
    const somaTotalParcelaTotal = calcularSomaParcelaTotal(data);
    const somaTotalTotal = calcularSomaTotal(data);

    const footerGroup = (
        <ColumnGroup>
            <Row>
                <Column footer="Total:" colSpan={6} footerStyle={{ textAlign: 'right' }} />
                <Column footer={FormatNumber(somaTotalParcela)} />
                <Column footer={FormatNumber(somaTotalParcelaTotal)} />
                 <Column footer={FormatNumber(somaTotalTotal)} />
                <Column footer="" colSpan={1} footerStyle={{ textAlign: 'right' }} />
            </Row>
        </ColumnGroup>
    );

    return (
        <DataTable value={data} footerColumnGroup={footerGroup} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} showGridlines tableStyle={{ minWidth: '50rem' }}>
            {
                columns.map(coluna => (
                    <Column 
                        key={coluna.field} 
                        field={coluna.field} 
                        header={coluna.name} 
                        body={(rowData: any) => renderizarColuna(coluna, rowData[coluna.field], rowData)} />
                ))
            }            
        </DataTable>
    );
};

export default Tabela;