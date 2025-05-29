import { render, screen, fireEvent } from '@testing-library/react';
import { ExclusaoModal } from './index';
import { FinancaContext } from '../../../contexts/FinancaContext';

const mockItem = {
    id: '1',
    nomeCompra: 'Teste Compra',
    valorTotal: 1200.00,
    dataCompra: '2024-03-14',
    numeroTotalParcela: 12,
    nomeCartao: 'Cartão Teste'
};

const mockContextValue = {
    compras: [],
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

describe('ExclusaoModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve renderizar o modal corretamente quando aberto', () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <ExclusaoModal 
                    open={true}
                    onClose={mockOnClose}
                    onSuccess={mockOnSuccess}
                    item={mockItem}
                />
            </FinancaContext.Provider>
        );

        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
        expect(screen.getByText('Teste Compra')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.200,00')).toBeInTheDocument();
        expect(screen.getByText('14/03/2024')).toBeInTheDocument();
        expect(screen.getByText('12x')).toBeInTheDocument();
        expect(screen.getByText('Cartão Teste')).toBeInTheDocument();
    });

    it('deve chamar onClose ao clicar no botão cancelar', () => {
        render(
            <FinancaContext.Provider value={mockContextValue}>
                <ExclusaoModal 
                    open={true}
                    onClose={mockOnClose}
                    onSuccess={mockOnSuccess}
                    item={mockItem}
                />
            </FinancaContext.Provider>
        );

        const cancelButton = screen.getByText('Cancelar');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('deve chamar excluirCompra e onSuccess ao confirmar exclusão', async () => {
        mockContextValue.excluirCompra.mockResolvedValueOnce(undefined);

        render(
            <FinancaContext.Provider value={mockContextValue}>
                <ExclusaoModal 
                    open={true}
                    onClose={mockOnClose}
                    onSuccess={mockOnSuccess}
                    item={mockItem}
                />
            </FinancaContext.Provider>
        );

        const excluirButton = screen.getByText('Excluir');
        fireEvent.click(excluirButton);

        await screen.findByText('Transação excluída com sucesso!');

        expect(mockContextValue.excluirCompra).toHaveBeenCalledWith('1');
        expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('não deve renderizar nada quando item é null', () => {
        const { container } = render(
            <FinancaContext.Provider value={mockContextValue}>
                <ExclusaoModal 
                    open={true}
                    onClose={mockOnClose}
                    onSuccess={mockOnSuccess}
                    item={null}
                />
            </FinancaContext.Provider>
        );

        expect(container).toBeEmptyDOMElement();
    });
}); 