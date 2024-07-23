"use client";
import React, { useState } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import Image from "next/image";
import ali from "../../public/ali.jpg";
import arthur from "../../public/arthur.jpg";
import kyle from "../../public/kyle.png";
import yasmin from "../../public/jasmin.png";

const data = [
  { name: "Group A", value: 400, fill: "#92B8FF" },
  { name: "Group B", value: 300, fill: "#001226" },
  { name: "Group C", value: 300, fill: "#2D4778" },
];
interface CustomShapeProps {
  midAngle: number;
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: {
    name: string;
  };
  percent: number;
  value: number;
}

const renderActiveShape = (props: CustomShapeProps) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`PV ${value}`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const testimonials = [
    {
      text: `I'm gonna be real. I had no clue what I was doing. Karki’s methodology got me from my middling
                  diagnostic to a 516 on my actual test, all within three months.`,
      name: "Yasmin Maurice",
      description: "516, Tulane",
      image:yasmin,
    },
    {
      text: `My first test was SO stressful and chaotic. I did poorly. On my retake, I needed a plan.
                  Karki developed one that got me a score I would’ve never imagined possible.`,
      name: "Ali Nassari",
      description: "517, UT Austin",
      image:ali,
    },
    {
      text: `Karki’s software created a personalized strategy to help me succeed, planning my days for me. On my
                  official retake, I scored a 518 — I owe much of that to him.
                `,
      name: "Kyle Peeples",
      description: "518, Tulane",
      image:kyle,
    },
    {
      text: `Brilliant, eager to help, hilarious, with an infectious energy that just inspired me to keep
                  pushing.
                  Couldn’t recommend Karki more.`,
      name: `Arthur Cowan`,
      description: "519, SDSU",
      image:arthur,
    },
    // Add more testimonials as needed
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#0E2247" }}
          >
            Testimonials
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="w-full mx-auto bg-white border shadow-md rounded-lg overflow-hidden"
              >
                <div className="px-6 py-3">
                  <p className="mt-4  text-sm  text-black font-medium mb-4 min-h-[110px]">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center">
                    <Image
                      className="w-10 h-10 rounded-full mr-2"
                      src={testimonial.image}
                      alt="Avatar"
                    />
                    <div className="text-sm">
                      <p className="text-black font-medium mb-0">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {testimonial.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6 md:mt-0">
            <ResponsiveContainer width={400} height={400}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape as any}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
