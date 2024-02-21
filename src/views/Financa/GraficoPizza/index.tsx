import React, { useState, useEffect, useContext } from 'react';
import { Chart } from 'primereact/chart';
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

    const documentStyle = getComputedStyle(document.documentElement);

    // Montagem dos dados do gráfico e definição das cores
    const data = {
        labels: chartData.labels,
        datasets: chartData.datasets.map((dataset:any, index:any) => ({
            ...dataset,
            backgroundColor: [
                documentStyle.getPropertyValue('--blue-500'), 
                documentStyle.getPropertyValue('--yellow-500'), 
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--bluegray-500'),
                documentStyle.getPropertyValue('--orange-500'),
                documentStyle.getPropertyValue('--red-500')
            ],
            hoverBackgroundColor: [
                documentStyle.getPropertyValue('--blue-400'), 
                documentStyle.getPropertyValue('--yellow-400'), 
                documentStyle.getPropertyValue('--green-400'),
                documentStyle.getPropertyValue('--bluegray-400'),
                documentStyle.getPropertyValue('--orange-400'),
                documentStyle.getPropertyValue('--red-400')
            ]
        }))
    };

    return (
        <div className="card flex justify-content-center">
            <Chart type="pie" data={data} options={chartOptions} />
        </div>
    );
}