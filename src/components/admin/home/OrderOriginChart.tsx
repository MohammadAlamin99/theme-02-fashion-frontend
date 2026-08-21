"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaGoogle,
  FaWhatsapp,
  FaGlobe,
} from "react-icons/fa";

interface OrderOriginData {
  source: string;
  count: number;
}

interface OrderOriginChartProps {
  data: OrderOriginData[];
  isLoading?: boolean;
}

const COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "url(#instagramGradient)",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  google: "#4285F4",
  whatsapp: "#25D366",
  direct: "#FF6A00",
  other: "#A08BFF",
};

const CustomXAxisTick = (props: {
  x: number;
  y: number;
  payload: {
    value: string;
  };
}) => {
  const { x, y, payload } = props;
  const source = payload.value.toLowerCase();
  
  let Icon = FaGlobe;
  let color = COLORS.other;

  if (source === "facebook" || source === "fb") {
    Icon = FaFacebook;
    color = "#1877F2";
  } else if (source === "instagram" || source === "ig") {
    Icon = FaInstagram;
    color = "#E1306C"; // Instagram base color for icon
  } else if (source === "youtube" || source === "yt") {
    Icon = FaYoutube;
    color = "#FF0000";
  } else if (source === "linkedin" || source === "li") {
    Icon = FaLinkedin;
    color = "#0A66C2";
  } else if (source === "google") {
    Icon = FaGoogle;
    color = "#4285F4";
  } else if (source === "whatsapp" || source === "wa") {
    Icon = FaWhatsapp;
    color = "#25D366";
  } else if (source === "direct") {
    Icon = FaGlobe;
    color = "#FF6A00";
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-12} y={5} width={24} height={24}>
        <div className="flex items-center justify-center h-full w-full">
          <Icon size={18} color={color} />
        </div>
      </foreignObject>
    </g>
  );
};

const PREDEFINED_SOURCES = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "google", label: "Google" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "direct", label: "Direct" },
];

const OrderOriginChart: React.FC<OrderOriginChartProps> = ({
  data = [],
  isLoading,
}) => {
  // Map predefined sources to always show the icons, even if count is 0
  const chartData = PREDEFINED_SOURCES.map((sourceDef) => {
    let count = 0;
    
    for (const d of data) {
      let sourceKey = d.source?.toLowerCase() || "direct";
      if (sourceKey === "fb") sourceKey = "facebook";
      if (sourceKey === "ig") sourceKey = "instagram";
      if (sourceKey === "yt") sourceKey = "youtube";
      if (sourceKey === "wa") sourceKey = "whatsapp";
      if (sourceKey === "li") sourceKey = "linkedin";
      
      if (sourceKey === sourceDef.id) {
        count += d.count;
      }
    }
    
    return {
      name: sourceDef.id,
      originalName: sourceDef.label,
      count: count,
    };
  });

  return (
    <div className="bg-white p-6 rounded-[8px] border border-gray-50 h-full flex flex-col font-poppins">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-lato font-bold text-black">
          Order origin
        </h2>
      </div>

      <div className="flex-grow min-h-[250px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <defs>
                <linearGradient
                  id="instagramGradient"
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="25%" stopColor="#e6683c" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="75%" stopColor="#cc2366" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={(props: any) => <CustomXAxisTick {...props} />}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A7A7A7", fontSize: 12 }}
                label={{
                  value: "Sell",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#333", fontSize: 14 },
                }}
              />
              <Tooltip
                cursor={{ fill: "#F8FAFC" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: any, name: any, props: any) => [
                  value,
                  props.payload.originalName,
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || COLORS.other}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OrderOriginChart;
