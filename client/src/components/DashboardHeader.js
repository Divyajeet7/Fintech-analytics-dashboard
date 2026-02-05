import React, { useEffect } from 'react';
import { url } from '../../../App';
import axios from 'axios';
// import { 
//   LOCATIONS, 
//   getSalesPeopleForLocation, 
//   getLendersForSalesPerson, 
//   getProductsForLender 
// } from '../services/mockData';
import { RefreshCw, Calendar, X } from 'lucide-react';

const DashboardHeader = ({ filters, onFilterChange, onRefresh, lastUpdated, isLoading }) => {

  const [locations,setLocations] = React.useState([]);
  const [agents,setAgents] = React.useState([]);
  const [lenders,setLenders] = React.useState([]);
  const [products,setProducts] = React.useState([]);

  useEffect(() => {
      // Setting dropdown data through API Calls
      setLocations(locationData);
      setAgents(agentData);
      setLenders(lenderData);
      setProducts(productData);
  }, []);
  
  // // Dependent Options Calculation
  // const salesPeopleOptions = useMemo(() => 
  //   getSalesPeopleForLocation(filters.location), 
  //   [filters.location]
  // );

  // const lenderOptions = useMemo(() => 
  //   getLendersForSalesPerson(filters.salesPerson), 
  //   [filters.salesPerson]
  // );

  // const productOptions = useMemo(() => 
  //   getProductsForLender(filters.lender), 
  //   [filters.lender]
  // );

  const handleLocationChange = (newLocation) => {
    // Reset all dependent filters when location changes
    onFilterChange({ 
      location: newLocation,
      salesPerson: 'All Sales People',
      lender: 'All Lenders',
      loanProduct: 'All Products'
    });
  };

  const handleSalesPersonChange = (newSalesPerson) => {
    // Reset dependent filters when sales person changes
    onFilterChange({ 
      salesPerson: newSalesPerson,
      lender: 'All Lenders',
      loanProduct: 'All Products'
    });
  };

  const handleLenderChange = (newLender) => {
    // Reset dependent filter when lender changes
    onFilterChange({ 
      lender: newLender,
      loanProduct: 'All Products'
    });
  };

  const handleProductChange = (newProduct) => {
    onFilterChange({ loanProduct: newProduct });
  };

  // const handleDateClick = (range) => {
  //   onFilterChange({ dateRange: range });
  // };

const handleDateClick = (range) => {
  const today = new Date();
  let startDate;
  let endDate;

  if (range === 'last-7') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
  }

  if (range === 'last-30') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 29);
  }

  if (range === 'this-month') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  if (range === 'custom') {
    onFilterChange({ dateRange: 'custom' });
    return;
  }

  // Normalize boundaries
  // console.log(startDate,"START DATE")
  startDate.setHours(0, 0, 0, 0);

  endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  onFilterChange({
    dateRange: range,
    customStartDate: startDate.toISOString().slice(0, 10),
    customEndDate: endDate.toISOString().slice(0, 10)
  });
};

  const handleCustomDateChange = (type, value) => {
    onFilterChange({ [type === 'start' ? 'customStartDate' : 'customEndDate']: value });
  };

  const clearCustomDate = () => {
    onFilterChange({ dateRange: 'this-month', customStartDate: undefined, customEndDate: undefined });
  };

  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = setInterval(() => {
      console.log(now);
      setNow(Date.now());
    }, 60 * 1000); // update every minute

    return () => clearInterval(id);
  }, [now]);

  // const timeAgo = (date) => {
  //   if (!date) return ''; // or '—'
  //   const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  //   if (seconds < 60) return 'just now';
  //   const minutes = Math.floor(seconds / 60);
  //   return `${minutes} min ago`;
  // };

  // const timeAgo = (date) => {
  //   if (!date) return '';

  //   const time = date instanceof Date ? date.getTime() : new Date(date).getTime();
  //   const seconds = Math.floor((now - time) / 1000);

  //   if (seconds < 60) return 'just now';

  //   const minutes = Math.floor(seconds / 60);
  //   if (minutes < 60) return `${minutes} min ago`;

  //   const hours = Math.floor(minutes / 60);
  //   return `${hours} hr ago`;
  // };

  const formatRelativeTime = (date) => {
    if (!date) return 'never';
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.round(hours / 24);
    return `${days}d ago`;
};

  const timeAgo = () => {
        // if (error) {
        //     return { color: 'bg-red-500', text: 'Update failed' };
        // }
        if (!lastUpdated) {
            return { color: 'bg-yellow-500', text: 'Updating...' };
        }
        const isFresh = (new Date().getTime() - lastUpdated.getTime()) < 6000;
        const relativeTime = formatRelativeTime(lastUpdated);
        if (isFresh) {
            return { color: 'bg-green-500', text: `Last updated: ${relativeTime}` };
        }
        return { color: 'bg-red-500', text: `Last updated: ${relativeTime}` };
    };
    const status = timeAgo();

  return (
    <div className="bg-white">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left Side: Status */}
        <div className="flex items-center space-x-3 min-w-fit">
          <div className="flex items-center text-sm font-medium text-slate-600">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              {/* <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span> */}
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.color} opacity-75`}></span>
              {/* <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span> */}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.color}`}></span>
            </span>
            {/* Updated {timeAgo(lastUpdated)} */}
            {status.text}
          </div>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-all ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Right Side: Filters */}
        {/* <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar"> */}
        <div className="flex items-center gap-3 flex-nowrap shrink-0 overflow-x-auto no-scrollbar">
          
          {/* Dropdowns Group */}
          <div className="flex items-center gap-2 flex-nowrap shrink-0">
            <select 
              className="w-[130px] min-w-[130px] max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm appearance-none cursor-pointer hover:border-slate-300 transition-colors"
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
            ><option value="All Locations">All Locations</option>
              {locations.map(opt => <option key={opt} value={opt.Branch_name}>{opt.Branch_name}</option>)}
            </select>

            <select 
              className="w-[130px] min-w-[130px] max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm appearance-none cursor-pointer hover:border-slate-300 transition-colors"
              value={filters.salesPerson}
              onChange={(e) => handleSalesPersonChange(e.target.value)}
            ><option value="All Sales People">All Agents</option>
              {agents.map(opt => <option key={opt} value={opt.FirstName}>{opt?.FirstName+" "+opt?.MiddleName+" "+opt?.LastName}</option>)}
            </select>

             <select 
              className="w-[130px] min-w-[130px] max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm appearance-none cursor-pointer hover:border-slate-300 transition-colors"
              value={filters.lender}
              onChange={(e) => handleLenderChange(e.target.value)}
            ><option value="All Lenders">All Lenders</option>
              {lenders.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <select 
              className="w-[130px] min-w-[130px] max-w-[160px] overflow-hidden whitespace-nowrap text-ellipsis bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 shadow-sm appearance-none cursor-pointer hover:border-slate-300 transition-colors"
              value={filters.loanProduct}
              onChange={(e) => handleProductChange(e.target.value)}
            ><option value="All Products">All Products</option>
              {products.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Date Picker Group */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 min-w-max">
            <div className="px-3 text-slate-400">
              <Calendar size={18} />
            </div>
            
            {filters.dateRange === 'custom' ? (
              <div className="flex items-center space-x-2 px-1 py-0.5">
                 <div className="flex flex-row sm:flex-row gap-1 sm:gap-2">
                    <input 
                        type="date" 
                        className="bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-8 w-32"
                        value={filters.customStartDate || ''}
                        onChange={(e) => handleCustomDateChange('start', e.target.value)}
                        placeholder="Start Date"
                    />
                    <span className="hidden sm:inline text-slate-400 self-center">-</span>
                    <input 
                        type="date" 
                        className="bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-8 w-32"
                        value={filters.customEndDate || ''}
                        onChange={(e) => handleCustomDateChange('end', e.target.value)}
                        placeholder="End Date"
                    />
                 </div>
                 <button 
                    onClick={clearCustomDate}
                    className="ml-1 p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    title="Close Custom Date"
                 >
                    <X size={16} />
                 </button>
              </div>
            ) : (
              <div className="flex space-x-1">
                {[
                  { id: 'last-7', label: '7D' },
                  { id: 'last-30', label: '30D' },
                  { id: 'this-month', label: 'Month' }
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => handleDateClick(range.id)}
                    className={`
                      px-3 py-1.5 text-sm font-medium rounded-md transition-all
                      ${filters.dateRange === range.id 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
                    `}
                  >
                    {range.label}
                  </button>
                ))}

                <button
                   onClick={() => handleDateClick('custom')}
                   className={`
                      px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap
                      ${filters.dateRange === 'custom' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
                    `}
                >
                  Custom
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
