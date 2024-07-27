import React from 'react';

interface DataPoint {
  name: string;
  value: number;
}

interface SimplePieChartProps {
  data: DataPoint[];
}

const COLORS: string[] = ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384'];

const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
  const total = data.reduce((sum, { value }) => sum + value, 0);
  let startAngle = 0;

  return (
    <svg width="300" height="300" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
      {data.map(({ value }, index) => {
        const angle = (value / total) * 360;
        const largeArcFlag = angle > 180 ? 1 : 0;
        const endAngle = startAngle + angle;
        const x1 = Math.cos((startAngle * Math.PI) / 180);
        const y1 = Math.sin((startAngle * Math.PI) / 180);
        const x2 = Math.cos((endAngle * Math.PI) / 180);
        const y2 = Math.sin((endAngle * Math.PI) / 180);
        const pathData = `M ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0`;
        startAngle = endAngle;
        return <path key={index} d={pathData} fill={COLORS[index % COLORS.length]} />;
      })}
    </svg>
  );
};

export default SimplePieChart;
