import React from 'react';
import { Wallet, CheckCircle2, AlertCircle, Banknote, Percent, Receipt, TrendingUp, CircleDollarSign, Gavel } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return formatCurrency(amount);
};

const StatCard = ({ 
    label, 
    value,
    count,
    icon: Icon, 
    colorTheme, 
    onClick, 
    subText,
    progress,
    progressLabel
}) => {
    
    const themeClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', border: 'border-blue-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100', border: 'border-emerald-100' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-700', iconBg: 'bg-violet-100', border: 'border-violet-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-700', iconBg: 'bg-rose-100', border: 'border-rose-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100', border: 'border-amber-100' }
    };

    const theme = themeClasses[colorTheme];

    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-2xl font-bold text-slate-800 mt-1 tracking-tight">{formatCompactCurrency(value)}</h3>
                        {count !== undefined && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {count.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-2.5 rounded-lg ${theme.iconBg} ${theme.text} transition-colors`}>
                    <Icon size={20} />
                </div>
            </div>
            
            {progress !== undefined ? (
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">{progressLabel || 'Efficiency'}</span>
                        <span className={theme.text}>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${colorTheme === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex items-center text-xs">
                     {subText && (
                        <span className="text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                            {subText}
                        </span>
                     )}
                </div>
            )}
        </div>
    );
};

export const CollectionPerformance = ({ data, onDrillDown }) => {
    // console.log(data,"YO")
  // Calculated Efficiency
  const efficiency = data.emiDemand > 0 ? (data.emiCollected / data.emiDemand) * 100 : 0;
  
//   Calculate specific efficiencies
  const principalEfficiency = data.principalDemand > 0 ? (data.principalCollected / data.principalDemand) * 100 : 0;
  const interestEfficiency = data.interestDemand > 0 ? (data.interestCollected / data.interestDemand) * 100 : 0;

//   const efficiency =
//   data?.collections?.emiDemand > 0
//     ? (data?.collections?.emiCollected / data?.collections?.emiDemand) * 100
//     : 0;

//   const principalEfficiency =
//   data?.collections?.principalDemand > 0
//     ? (data?.collections?.principalCollected / data?.collections?.principalDemand) * 100
//     : 0;

//   const interestEfficiency =
//   data?.collections?.interestDemand > 0
//     ? (data?.collections?.interestCollected / data?.collections?.interestDemand) * 100
//     : 0;

  return (
    <div>
         <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Collection Performance</h2>
         </div>
         
         <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total EMI Demand */}
            <StatCard 
                label="Total EMI Demand"
                value={data.emiDemand}
                count={data.emiDemandCount}
                icon={Wallet}
                colorTheme="blue"
                // onClick={() => onDrillDown('EMI Demand')}
                subText="Principal + Interest Demand"
            />

            {/* 2. Total Principal Demand */}
            <StatCard 
                label="Total Principal Demand"
                value={data.principalDemand}
                count={data.principalDemandCount}
                icon={Banknote}
                colorTheme="blue"
                // onClick={() => onDrillDown('Principal Demand')}
                subText="Principal Component"
            />

            {/* 3. Total Interest Demand */}
            <StatCard 
                label="Total Interest Demand"
                value={data.interestDemand}
                count={data.interestDemandCount}
                icon={Percent}
                colorTheme="blue"
                // onClick={() => onDrillDown('Interest Demand')}
                subText="Interest Component"
            />
            
            {/* 4. Total Collected */}
            <StatCard 
                label="Total Collected"
                value={data.emiCollected}
                count={data.emiCollectedCount}
                icon={CheckCircle2}
                colorTheme="emerald"
                // onClick={() => onDrillDown('EMI Collected')}
                progress={efficiency}
                progressLabel="Overall Efficiency"
            />

            {/* 5. Principal Collected */}
            <StatCard 
                label="Principal Collected"
                value={data.principalCollected}
                count={data.principalCollectedCount}
                icon={Banknote}
                colorTheme="emerald"
                // onClick={() => onDrillDown('Principal Collected')}
                progress={principalEfficiency}
                progressLabel="Principal Efficiency"
            />

            {/* 6. Interest Collected */}
             <StatCard 
                label="Interest Collected"
                value={data.interestCollected}
                count={data.interestCollectedCount}
                icon={Percent}
                colorTheme="emerald"
                // onClick={() => onDrillDown('Interest Collected')}
                progress={interestEfficiency}
                progressLabel="Interest Efficiency"
            />

            {/* 7. Bounce Charges Collected */}
             <StatCard 
                label="Bounce Charges Collected (LPC+NBC)"
                value={data.bounceChargesCollected}
                count={data.bounceChargesCollectedCount}
                icon={CircleDollarSign}
                colorTheme="violet"
                // onClick={() => onDrillDown('Bounce Charges Collected')}
                subText="Penalties Recovered"
            />

            {/* 8. Penal Interest/Charge Collected */}
             <StatCard 
                label="Penal Interest Collected (ROC)"
                value={data.penalInterestCollected}
                count={data.penalInterestCollectedCount}
                icon={Gavel}
                colorTheme="amber"
                // onClick={() => onDrillDown('Penal Interest Collected')}
                subText="Late Payment Charges"
            />
         </div>
    </div>
  );
};

export const OverdueStock = ({ data, onDrillDown }) => {
  // Overdue Percentages
  const totalOverdue = data.emiOverdue || 1;
  const principalOverduePct = (data.principalOverdue / totalOverdue) * 100;
  
  // Total including charges
  const totalOverdueIncCharges = data.emiOverdue + (data.chargesOverdue || 0);

  return (
      <div>
         <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={20} className="text-rose-600" />
            <h2 className="text-lg font-semibold text-slate-800">Overdue Collections</h2>
         </div>

         <div className="grid grid-cols-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard 
                label="Overdue EMI"
                value={data.emiOverdue}
                count={data.emiOverdueCount}
                icon={AlertCircle}
                colorTheme="rose"
                // onClick={() => onDrillDown('Overdue EMI')}
                subText="Principal + Interest"
            />

            <StatCard 
                label="Principal Overdue"
                value={data.principalOverdue}
                count={data.principalOverdueCount}
                icon={Banknote}
                colorTheme="rose"
                // onClick={() => onDrillDown('Principal Overdue')}
                progress={principalOverduePct}
                progressLabel="% of Overdue EMI"
            />

            <StatCard 
                label="Interest Overdue"
                value={data.interestOverdue}
                count={data.interestOverdueCount}
                icon={Percent}
                colorTheme="rose"
                // onClick={() => onDrillDown('Interest Overdue')}
                progress={100 - principalOverduePct}
                progressLabel="% of Overdue EMI"
            />

            <StatCard 
                label="Overdue Charges"
                value={data.chargesOverdue}
                count={data.chargesOverdueCount}
                icon={Receipt}
                colorTheme="rose"
                // onClick={() => onDrillDown('Overdue Charges')}
                subText="Unpaid Penalties"
            />

            <StatCard 
                label="Total Overdue"
                value={totalOverdueIncCharges}
                count={data.emiOverdueCount}
                icon={Wallet}
                colorTheme="rose"
                // onClick={() => onDrillDown('Total Overdue')}
                subText="EMI + Charges"
            />
         </div>
      </div>
  );
};
