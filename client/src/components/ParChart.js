import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Users, Briefcase, TrendingDown } from 'lucide-react';

// Configurable color palette for PAR buckets based on risk level
const PAR_COLORS = {
  'On-time':   { bg: 'bg-emerald-50', bgColor: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', icon: ShieldCheck,   iconColor: 'text-emerald-500' },
  '1-30':      { bg: 'bg-lime-50',    bgColor: 'bg-lime-500',    text: 'text-lime-700',    border: 'border-lime-200',    icon: AlertTriangle, iconColor: 'text-lime-500' },
  '31-60':     { bg: 'bg-yellow-50',  bgColor: 'bg-yellow-500',  text: 'text-yellow-700',  border: 'border-yellow-200',  icon: AlertTriangle, iconColor: 'text-yellow-500' },
  '61-90':     { bg: 'bg-orange-50',  bgColor: 'bg-orange-500',  text: 'text-orange-700',  border: 'border-orange-200',  icon: AlertCircle,   iconColor: 'text-orange-500' },
  '91-120':    { bg: 'bg-red-50',     bgColor: 'bg-red-500',     text: 'text-red-700',     border: 'border-red-200',     icon: AlertCircle,   iconColor: 'text-red-500' },
  '121-150':   { bg: 'bg-red-50',     bgColor: 'bg-red-500',     text: 'text-red-800',     border: 'border-red-300',     icon: AlertCircle,   iconColor: 'text-red-600' },
  '151-180':   { bg: 'bg-red-50',     bgColor: 'bg-red-500',     text: 'text-red-900',     border: 'border-red-400',     icon: AlertCircle,   iconColor: 'text-red-700' },
  '180+':      { bg: 'bg-red-100',    bgColor: 'bg-red-500',     text: 'text-red-950',     border: 'border-red-500',     icon: AlertCircle,   iconColor: 'text-red-800' },
};

const DEFAULT_STYLE = { bg: 'bg-slate-50', bgColor: 'bg-slate-400', text: 'text-slate-700', border: 'border-slate-200', icon: AlertCircle, iconColor: 'text-slate-400' };

const ParChart = ({ data, onBarClick, totalAUMObj, delinquentAUMObj, onTimeAUMObj }) => {

    // console.log(data,"PAR DATA",totalAUMObj,delinquentAUMObj)
  
  const formatCompactCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

//   const totalAUM = data.reduce((sum, bucket) => sum + bucket.value, 0);
  const totalAUM = totalAUMObj?.value;
//   const totalLoans = data.reduce((sum, bucket) => sum + bucket.count, 0);
//   const totalLoans = totalAUMObj?.count;

  // Calculate Delinquent metrics (Everything except On-time)
  const onTimeBucket = data.find(b => b.range === 'On-time');
//   const delinquentAUM = totalAUM - (onTimeBucket?.value || 0);
  const delinquentAUM = delinquentAUMObj?.value - (onTimeBucket?.value || 0);
//   const delinquentLoans = totalLoans - (onTimeBucket?.count || 0);
  const delinquentPercentage = totalAUM > 0 ? (delinquentAUM / totalAUM) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Portfolio at Risk (PAR) Analysis</h2>
            <p className="text-sm text-slate-500">Distribution of portfolio by days past due</p>
          </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total AUM Card */}
        <div 
            // onClick={() => onBarClick('Total AUM')}
            className={`
                relative bg-white rounded-xl border border-blue-200 shadow-sm 
                hover:shadow-md transition-all cursor-pointer overflow-hidden group
                hover:-translate-y-1
            `}
        >
            {/* Top colored accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            Total AUM
                        </span>
                    </div>
                    <div className="p-1.5 rounded-full bg-blue-50">
                        <Briefcase size={16} className="text-blue-600" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                        {/* {formatCompactCurrency(totalAUM)} */}
                        {formatCompactCurrency(totalAUMObj?.value)}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <div className="flex items-center gap-1">
                            <Users size={12} />
                            {/* <span>{totalLoans} Loans</span> */}
                            <span>{totalAUMObj?.count} Loans</span>
                        </div>
                        <span className="font-semibold text-slate-700">
                            100%
                        </span>
                    </div>
                </div>

                 <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 opacity-80" 
                        style={{ width: '100%' }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Delinquent AUM Card */}
        <div 
            // onClick={() => onBarClick('Delinquent AUM')}
            className={`
                relative bg-white rounded-xl border border-orange-200 shadow-sm 
                hover:shadow-md transition-all cursor-pointer overflow-hidden group
                hover:-translate-y-1
            `}
        >
            {/* Top colored accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600"></div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700">
                            Delinquent AUM
                        </span>
                    </div>
                    <div className="p-1.5 rounded-full bg-orange-50">
                        <TrendingDown size={16} className="text-orange-600" />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                        {/* {formatCompactCurrency(delinquentAUM)} */}
                        {formatCompactCurrency(delinquentAUMObj?.value)}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <div className="flex items-center gap-1">
                            <Users size={12} />
                            {/* <span>{delinquentLoans} Loans</span> */}
                            <span>{delinquentAUMObj?.count} Loans</span>
                        </div>
                        <span className="font-semibold text-slate-700">
                            {delinquentPercentage.toFixed(2)}%
                        </span>
                    </div>
                </div>

                 <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-orange-600 opacity-80" 
                        style={{ width: `${Math.min(delinquentPercentage * 3, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* On-time Days Card */}
        <div
            // onClick={() => onBarClick('On-time')}
            className="
                relative bg-white rounded-xl border border-emerald-200 shadow-sm
                hover:shadow-md transition-all cursor-pointer overflow-hidden group
                hover:-translate-y-1
            "
            >
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                    On-time Days
                </span>

                <div className="p-1.5 rounded-full bg-emerald-50">
                    <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800">
                {formatCompactCurrency(onTimeAUMObj?.value || 0)}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{onTimeAUMObj?.count || 0} Loans</span>
                </div>

                <span className="font-semibold text-slate-700">
                    {totalAUMObj?.value
                    ? ((onTimeAUMObj.value / totalAUMObj.value) * 100).toFixed(2)
                    : 0}
                    %
                </span>
                </div>

                <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-600 opacity-80"
                    style={{
                    width: `${Math.min(
                        totalAUMObj?.value
                        ? (onTimeAUMObj.value / totalAUMObj.value) * 100
                        : 0,
                        100
                    )}%`
                    }}
                />
                </div>
            </div>
        </div>

        {data.map((bucket) => {
            const style = PAR_COLORS[bucket.range] || DEFAULT_STYLE;
            const Icon = style.icon;

            return (
                <div 
                    key={bucket.range}
                    // onClick={() => onBarClick(bucket.range)}
                    className={`
                        relative bg-white rounded-xl border ${style.border} shadow-sm 
                        hover:shadow-md transition-all cursor-pointer overflow-hidden group
                        hover:-translate-y-1
                    `}
                >
                    {/* Top colored accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${style.bgColor}`}></div>

                    <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
                                    {bucket.range} Days
                                </span>
                            </div>
                            <div className={`p-1.5 rounded-full ${style.bg}`}>
                                <Icon size={16} className={style.iconColor} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                {formatCompactCurrency(bucket.value)}
                            </h3>
                            
                            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                                <div className="flex items-center gap-1">
                                    <Users size={12} />
                                    <span>{bucket.count} Loans</span>
                                </div>
                                <span className="font-semibold text-slate-700">
                                    {bucket.percentage.toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress bar visual for percentage */}
                         <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${style.bgColor} opacity-80`} 
                                style={{ width: `${Math.min(bucket.percentage * 5, 100)}%` }} // Scaled up slightly for visual presence on small pcts
                            ></div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ParChart;
