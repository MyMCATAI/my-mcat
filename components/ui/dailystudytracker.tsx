import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const data = [
  { day: 'Mon', studyHours: 2 },
  { day: 'Tue', studyHours: 5 },
  { day: 'Wed', studyHours: 4 },
  { day: 'Thu', studyHours: 6 },
  { day: 'Fri', studyHours: 2 },
  { day: 'Sat', studyHours: 2 },
  { day: 'Sun', studyHours: 4 },
];

const DailyStudyTracker = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.day),
          datasets: [{
            data: data.map(item => item.studyHours),
            backgroundColor: data.map(item => item.studyHours >= 4 ? '#558ece' : '#a65c67'),
            borderColor: 'transparent',
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 20,
              right: 20,
              bottom: 0,
              left: 0
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#fff',
              },
            },
            y: {
              position: 'right',
              grid: {
                display: false,
              },
              ticks: {
                color: '#fff',
                stepSize: 2,
                padding: 10,
              },
              beginAtZero: true,
              max: 8,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff',
              displayColors: false,
            },
          },
        },
        plugins: [{
          id: 'dashedLine',
          beforeDraw: (chart) => {
            const { ctx, chartArea, scales } = chart;
            const yScale = scales.y;
            const yPosition = yScale.getPixelForValue(4);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(chartArea.left, yPosition);
            ctx.lineTo(chartArea.right, yPosition);
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            ctx.restore();
          }
        }],
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-transparent flex items-end">
      <canvas ref={chartRef} style={{ height: '100%' }} />
    </div>
  );
};

export default DailyStudyTracker;
