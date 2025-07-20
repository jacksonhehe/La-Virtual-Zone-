import { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

// Registrar los componentes necesarios de Chart.js
Chart.register(...registerables);

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface StatsChartProps {
  title: string;
  data: DataPoint[];
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  height?: number;
  showLegend?: boolean;
  className?: string;
}

/**
 * Componente para visualizar estadísticas con gráficos interactivos
 */
const StatsChart = ({
  title,
  data,
  type,
  height = 250,
  showLegend = true,
  className = ''
}: StatsChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Colores predeterminados para los gráficos
  const defaultColors = [
    'rgba(59, 130, 246, 0.8)',   // Azul
    'rgba(139, 92, 246, 0.8)',    // Púrpura
    'rgba(16, 185, 129, 0.8)',    // Verde
    'rgba(245, 158, 11, 0.8)',    // Ámbar
    'rgba(239, 68, 68, 0.8)',     // Rojo
    'rgba(236, 72, 153, 0.8)'     // Rosa
  ];
  
  // Crear o actualizar el gráfico
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Preparar los datos para el gráfico
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const colors = data.map((item, index) => item.color || defaultColors[index % defaultColors.length]);
    
    // Crear el nuevo gráfico
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{
            label: title,
            data: values,
            backgroundColor: colors,
            borderColor: type === 'line' ? colors[0] : colors,
            borderWidth: 1,
            tension: 0.3,
            fill: type === 'line' ? 'origin' : undefined,
            pointBackgroundColor: type === 'line' ? colors[0] : undefined,
            pointBorderColor: type === 'line' ? '#fff' : undefined,
            pointRadius: type === 'line' ? 4 : undefined,
            pointHoverRadius: type === 'line' ? 6 : undefined,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: showLegend,
              position: 'bottom',
              labels: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                  family: "'Inter', sans-serif",
                  size: 12
                },
                padding: 20
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              titleColor: 'rgba(255, 255, 255, 0.9)',
              bodyColor: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(75, 85, 99, 0.3)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              titleFont: {
                family: "'Inter', sans-serif",
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                family: "'Inter', sans-serif",
                size: 13
              },
              displayColors: true,
              boxPadding: 6
            }
          },
          scales: type !== 'pie' && type !== 'doughnut' ? {
            x: {
              grid: {
                color: 'rgba(75, 85, 99, 0.2)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                  family: "'Inter', sans-serif",
                  size: 11
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(75, 85, 99, 0.2)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                font: {
                  family: "'Inter', sans-serif",
                  size: 11
                }
              },
              beginAtZero: true
            }
          } : undefined
        }
      });
    }
    
    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, title, showLegend]);

  return (
    <div className={`bg-dark-lighter/30 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default StatsChart;