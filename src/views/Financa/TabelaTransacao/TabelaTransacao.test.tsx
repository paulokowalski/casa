import { render, screen, fireEvent, within } from '@testing-library/react';
import { TabelaTransacao } from './index';
import { FinancaContext } from '../../../contexts/FinancaContext';

const mockCompras = [
    {
        id: '1',
        nomeCompra: 'Teste Compra 1',
        dataCompra: '2024-03-14',
        dataParcela: '2024-03-14',
        numeroParcela: 1,
        numeroTotalParcela: 12,
        ultimaParcela: 'NAO',
        nomeCartao: 'Cartão Teste',
        nomePessoa: 'João',
        valorParcela: 100.00,
        valorFaltante: 1100.00,
        valorTotal: 1200.00,
        comprasCartao: []
    },
    {
        id: '2',
        nomeCompra: 'Teste Compra 2',
        dataCompra: '2024-03-15',
        dataParcela: '2024-03-15',
        numeroParcela: 1,
        numeroTotalParcela: 6,
        ultimaParcela: 'NAO',
        nomeCartao: 'Cartão Teste 2',
        nomePessoa: 'Maria',
        valorParcela: 200.00,
        valorFaltante: 1000.00,
        valorTotal: 1200.00,
        comprasCartao: []
    }
];

const mockContextValue = {
    compras: mockCompras,
    chartData: null,
    ultimosFiltros: {
        ano: '',
        mes: '',
        pessoa: 'TODOS',
        cartao: 'TODOS',
        ultimaParcela: 'TODOS'
    },
    buscarFinancas: jest.fn(),
    cadastrarCompra: jest.fn(),
    removerCompra: jest.fn(),
    consultar: jest.fn(),
    excluirCompra: jest.fn()
};

describe('TabelaTransacao', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar a tabela com os dados corretamente', () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <TabelaTransacao />
            </FinancaContext.Provider>
        );

        // Verifica se os cabeçalhos estão presentes
        expect(screen.getByText('Nome')).toBeInTheDocument();
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText('Parcela')).toBeInTheDocument();
        expect(screen.getByText('Cartão')).toBeInTheDocument();
        expect(screen.getByText('Valor Parcela')).toBeInTheDocument();
        expect(screen.getByText('Valor Total')).toBeInTheDocument();

        // Verifica se os dados estão presentes
        expect(screen.getByText('Teste Compra 1')).toBeInTheDocument();
        expect(screen.getByText('Teste Compra 2')).toBeInTheDocument();
        expect(screen.getByText('Cartão Teste')).toBeInTheDocument();
        expect(screen.getByText('Cartão Teste 2')).toBeInTheDocument();
    });

    it('deve abrir o modal de exclusão ao clicar no botão excluir', () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <TabelaTransacao />
            </FinancaContext.Provider>
        );

        // Encontra o botão de excluir na primeira linha
        const deleteButtons = screen.getAllByRole('button');
        fireEvent.click(deleteButtons[0]);

        // Verifica se o modal de exclusão foi aberto
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    });

    it('deve chamar a função de exclusão ao confirmar no modal', async () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <TabelaTransacao />
            </FinancaContext.Provider>
        );

        // Encontra e clica no botão de excluir
        const deleteButtons = screen.getAllByRole('button');
        fireEvent.click(deleteButtons[0]);

        // Encontra e clica no botão de confirmar exclusão
        const confirmButton = screen.getByText('Excluir');
        fireEvent.click(confirmButton);

        // Verifica se a função de exclusão foi chamada
        expect(mockContextValue.excluirCompra).toHaveBeenCalledWith('1');
    });

    it('deve mostrar o total correto no rodapé', () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <TabelaTransacao />
            </FinancaContext.Provider>
        );

        // Verifica se os totais estão corretos
        expect(screen.getByText('Total: R$ 2.400,00')).toBeInTheDocument();
        expect(screen.getByText('Total Parcelas: R$ 300,00')).toBeInTheDocument();
    });

    it('deve permitir a paginação', () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <TabelaTransacao />
            </FinancaContext.Provider>
        );

        // Verifica se os controles de paginação estão presentes
        expect(screen.getByLabelText('Rows per page:')).toBeInTheDocument();
        
        // Muda o tamanho da página
        const select = screen.getByLabelText('Rows per page:');
        fireEvent.mouseDown(select);
        const listbox = within(screen.getByRole('listbox'));
        fireEvent.click(listbox.getByText('25'));

        // Verifica se a mudança foi aplicada
        expect(select).toHaveTextContent('25');
    });
}); 