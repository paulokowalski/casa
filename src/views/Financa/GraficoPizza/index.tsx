import React, { useState, useEffect, useContext } from 'react';
// import { Chart } from 'primereact/chart';
import { FinancaContext } from '../../../contexts/FinancaContext';

export default function GraficoPizza() {
    const { chartData } = useContext(FinancaContext);
    const [ chartOptions, setChartOptions ] = useState({});

    // Criação das opções do gráfico
    useEffect(() => {
        const options = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true
                    }
                }
            }
        };
        setChartOptions(options);
    }, []);

    // Verificação de nulidade de chartData antes de acessar suas propriedades
    if (!chartData || !chartData.labels || !chartData.datasets) {
        return <div>Carregando...</div>;
    }

    // const documentStyle = getComputedStyle(document.documentElement);
    // const data = { ... } // manter código, mas comentar o uso do Chart

    return (
        <div className="card flex justify-content-center">
            {/* <Chart type="pie" data={data} options={chartOptions} /> */}
            <div>Gráfico removido temporariamente</div>
        </div>
    );
}