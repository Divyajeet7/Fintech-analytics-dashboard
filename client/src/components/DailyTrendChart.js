import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DailyTrendChart = ({ data }) => {
  
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${amount}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 shadow-xl rounded-lg p-3 text-sm">
          <p className="font-semibold text-slate-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
             <div key={index} className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-slate-500 capitalize">{entry.name}</span>
                </div>
                <span className="font-medium text-slate-800">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(entry.value)}
                </span>
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
       <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Daily Collection Trend</h2>
            <p className="text-sm text-slate-500">Breakdown of collections by day</p>
       </div>
       
       <div className="h-[350px] w-full">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    minTickGap={30}
                    dy={10}
                />
                <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={formatCurrency}
                    width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                <Area 
                    type="monotone" 
                    dataKey="totalCollected" 
                    name="Total Collected" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    strokeWidth={2}
                />
                <Area 
                    type="monotone" 
                    dataKey="principalCollected" 
                    name="Principal" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorPrincipal)" 
                    strokeWidth={2}
                />
                <Area 
                    type="monotone" 
                    dataKey="interestCollected" 
                    name="Interest" 
                    stroke="#8b5cf6" 
                    fillOpacity={0} 
                    fill="transparent" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                />
                <Area 
                    type="monotone" 
                    dataKey="chargesCollected" 
                    name="Charges" 
                    stroke="#f43f5e" 
                    fillOpacity={0} 
                    fill="transparent" 
                    strokeWidth={2}
                />
            </AreaChart>
         </ResponsiveContainer>
       </div>
    </div>
  );
};

export default DailyTrendChart;
