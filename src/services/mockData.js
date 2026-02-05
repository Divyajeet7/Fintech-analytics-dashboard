export const LOCATIONS = ['All Locations', 'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad'];
export const SALES_PEOPLE = ['All Sales People', 'Amit Sharma', 'Priya Patel', 'Rahul Verma', 'Sneha Reddy', 'Vikram Singh', 'Anjali Gupta'];
export const LENDERS = ['All Lenders', 'NESFB', 'HDFC Bank', 'Bajaj Finance', 'Kotak Mahindra', 'SBI Cards', 'ICICI Bank', 'Axis Finance'];
export const LOAN_PRODUCTS = ['All Products', 'Personal Loan', 'Business Loan', 'Home Loan', 'Auto Loan', 'Two Wheeler Loan', 'Education Loan', 'Credit Card'];

// Simple hash function to create a seed from string inputs
const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper to filter list based on parent selection to simulate dependencies
const getDependentOptions = (sourceList, parentValue) => {
    // If parent is 'All ...', return everything
    if (!parentValue || parentValue.startsWith('All')) return sourceList;

    const seed = getHash(parentValue);
    // Always return the first element ("All ...")
    // Filter the rest based on deterministic logic to simulate a relationship
    return sourceList.filter((_, index) => {
        if (index === 0) return true;
        // Keep roughly 2/3rds of options to make it look realistic
        return ((seed + index) % 3) !== 0; 
    });
};

export const getSalesPeopleForLocation = (location) => getDependentOptions(SALES_PEOPLE, location);
export const getLendersForSalesPerson = (salesPerson) => getDependentOptions(LENDERS, salesPerson);
export const getProductsForLender = (lender) => getDependentOptions(LOAN_PRODUCTS, lender);

// Seeded random number generator (0 to 1)
const getSeededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// Helper to generate seeded random integer within range
const getSeededRange = (min, max, seed) => {
    const rnd = getSeededRandom(seed);
    return Math.floor(rnd * (max - min + 1)) + min;
};

export const fetchDashboardData = async (filters) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // 1. GENERATE SEEDS
  // 'Stock' seed: Depends ONLY on Location, SalesPerson, Lender, LoanProduct. (Ignores DateRange)
  const stockSeedStr = `${filters.location}-${filters.salesPerson}-${filters.lender}-${filters.loanProduct}`;
  const stockSeed = getHash(stockSeedStr);

  // 'Flow' seed logic is now integrated into the daily loop below
  
  // 2. DETERMINE DATE RANGE
  let startDate = new Date();
  let endDate = new Date();
  
  // Normalize end date to today
  endDate.setHours(23, 59, 59, 999);

  if (filters.dateRange === 'last-7') {
      startDate.setDate(endDate.getDate() - 6);
  } else if (filters.dateRange === 'last-30') {
      startDate.setDate(endDate.getDate() - 29);
  } else if (filters.dateRange === 'this-month') {
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  } else if (filters.dateRange === 'custom' && filters.customStartDate && filters.customEndDate) {
      startDate = new Date(filters.customStartDate);
      endDate = new Date(filters.customEndDate);
      endDate.setHours(23, 59, 59, 999);
  } else {
      // Default fallback
      startDate.setDate(endDate.getDate() - 29);
  }
  
  // Ensure start is before end
  if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
  }

  const daysDiff = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1);

  // 3. GENERATE DAILY DATA AND AGGREGATE
  const dailyTrend = [];
  
  // Monetary Totals
  let totalEmiDemand = 0;
  let totalPrincipalDemand = 0;
  let totalInterestDemand = 0;
  let totalEmiCollected = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;
  let totalCharges = 0;
  let totalPenalCharges = 0;

  // Count Totals
  let totalEmiDemandCount = 0;
  let totalEmiCollectedCount = 0;
  let totalChargesCount = 0;
  let totalPenalChargesCount = 0;

  // Base daily magnitude modifier based on filters (to make data look different for different filters)
  const magnitudeMod = 1 + (stockSeed % 10) / 10; 

  for (let i = 0; i < daysDiff; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const daySeed = stockSeed + i + currentDate.getTime();

    // Base daily volume (Approx 20-50 Lakhs per day * magnitude)
    const dailyBase = getSeededRange(2000000, 5000000, daySeed) * magnitudeMod;
    
    // Average Ticket Size varies slightly (12k - 18k)
    const avgTicketSize = 12000 + getSeededRange(0, 6000, daySeed);

    // Efficiency fluctuates daily (80% - 98%)
    const dailyEfficiency = 0.80 + (getSeededRandom(daySeed + 1) * 0.18);
    
    const demand = Math.round(dailyBase);
    const demandCount = Math.round(demand / avgTicketSize);

    // Split demand into principal and interest (approx 72% principal)
    const principalDem = Math.round(demand * 0.72);
    const interestDem = demand - principalDem;

    const collected = Math.round(demand * dailyEfficiency);
    const collectedCount = Math.round(demandCount * dailyEfficiency);
    
    const principalShare = 0.65 + (getSeededRandom(daySeed + 2) * 0.1); // 65-75% principal of collected
    const principal = Math.round(collected * principalShare);
    const interest = collected - principal;
    
    // Bounce Charges
    const charges = Math.round(collected * (0.01 + getSeededRandom(daySeed+3) * 0.02)); // 1-3% charges
    const chargesCount = Math.round(collectedCount * 0.15); // ~15% of payers paid charges
    
    // Penal Charges
    const penalCharges = Math.round(collected * (0.005 + getSeededRandom(daySeed+4) * 0.015)); // 0.5-2%
    const penalChargesCount = Math.round(collectedCount * 0.08); // ~8% of payers paid penal

    dailyTrend.push({
        date: currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        fullDate: currentDate.toISOString(),
        totalCollected: collected,
        principalCollected: principal,
        interestCollected: interest,
        chargesCollected: charges,
        demand: demand
    });

    totalEmiDemand += demand;
    totalEmiDemandCount += demandCount;
    
    totalPrincipalDemand += principalDem;
    totalInterestDemand += interestDem;
    
    totalEmiCollected += collected;
    totalEmiCollectedCount += collectedCount;
    
    totalPrincipal += principal;
    totalInterest += interest;
    
    totalCharges += charges;
    totalChargesCount += chargesCount;

    totalPenalCharges += penalCharges;
    totalPenalChargesCount += penalChargesCount;
  }

  // 4. CALCULATE OVERDUE (STOCK METRICS)
  // These are snapshots, so they don't sum up over days like collections.
  // They depend on the stockSeed.
  const baseOverdueStock = 25000000 + getSeededRange(-5000000, 10000000, stockSeed + 10); // ~2.5 - 3.5 Cr
  const avgOverdueTicket = 20000 + getSeededRange(0, 10000, stockSeed + 11); // Ticket size for overdue
  
  const emiOverdue = baseOverdueStock;
  const emiOverdueCount = Math.round(emiOverdue / avgOverdueTicket);
  
  const principalOverdue = Math.round(emiOverdue * 0.72);
  const principalOverdueCount = emiOverdueCount;

  const interestOverdue = emiOverdue - principalOverdue;
  const interestOverdueCount = emiOverdueCount;

  const chargesOverdue = Math.round(emiOverdue * (0.05 + getSeededRandom(stockSeed + 12) * 0.05)); // 5-10% of EMI overdue
  const chargesOverdueCount = Math.round(emiOverdueCount * (0.4 + getSeededRandom(stockSeed + 13) * 0.3)); // 40-70% of overdue loans have charges

  // 5. CALCULATE PAR (STOCK METRICS)
  const basePar = 450000000; // Total Portfolio Size (~45 Cr)
  
  const parBuckets = [
    { range: 'On-time', percentage: 82, color: '#10b981' },
    { range: '1-30', percentage: 8, color: '#3b82f6' },
    { range: '31-60', percentage: 4, color: '#f59e0b' },
    { range: '61-90', percentage: 2.5, color: '#f97316' },
    { range: '91-120', percentage: 1.5, color: '#ef4444' },
    { range: '121-150', percentage: 1, color: '#dc2626' },
    { range: '151-180', percentage: 0.6, color: '#b91c1c' },
    { range: '180+', percentage: 0.4, color: '#7f1d1d' },
  ];

  const parNoise = getSeededRandom(stockSeed + 5) * 2;

  const parData = parBuckets.map(bucket => {
    const bucketHash = getHash(bucket.range);
    const bucketVariance = getSeededRandom(stockSeed + bucketHash);
    
    let adjustedPercent = bucket.percentage;
    if (bucket.range === 'On-time') {
        adjustedPercent -= parNoise;
    } else {
        adjustedPercent += (parNoise * (bucketVariance / 4)); 
    }
    
    adjustedPercent = Math.max(0, adjustedPercent);

    const value = Math.round((basePar * adjustedPercent) / 100);
    return {
      range: bucket.range,
      value: value,
      percentage: adjustedPercent,
      count: Math.round(value / 15000) 
    };
  });

  return {
    collections: {
      emiDemand: totalEmiDemand,
      emiDemandCount: totalEmiDemandCount,
      principalDemand: totalPrincipalDemand,
      principalDemandCount: totalEmiDemandCount, // Principal demand count same as EMI demand count
      interestDemand: totalInterestDemand,
      interestDemandCount: totalEmiDemandCount, // Interest demand count same as EMI demand count
      
      emiCollected: totalEmiCollected,
      emiCollectedCount: totalEmiCollectedCount,
      principalCollected: totalPrincipal,
      principalCollectedCount: totalEmiCollectedCount, // Principal collected count same as EMI collected count
      interestCollected: totalInterest,
      interestCollectedCount: totalEmiCollectedCount, // Interest collected count same as EMI collected count
      
      chargesCollected: totalCharges,
      chargesCollectedCount: totalChargesCount,
      
      penalChargesCollected: totalPenalCharges,
      penalChargesCollectedCount: totalPenalChargesCount,

      emiOverdue,
      emiOverdueCount,
      principalOverdue,
      principalOverdueCount,
      interestOverdue,
      interestOverdueCount,
      chargesOverdue,
      chargesOverdueCount
    },
    dailyTrend: dailyTrend,
    par: parData,
    lastUpdated: new Date()
  };
};

// Drill Down Data Generation (Unchanged logic, just keeping export)
const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Saanvi', 'Myra', 'Aadhya', 'Kiara', 'Pari', 'Riya', 'Anvi', 'Aaradhya'];
const LAST_NAMES = ['Sharma', 'Patel', 'Verma', 'Reddy', 'Singh', 'Gupta', 'Kumar', 'Bhat', 'Rao', 'Mehta', 'Joshi', 'Nair', 'Malhotra', 'Kapoor', 'Khan'];

export const fetchDrillDownData = async (title, type, limit = 15) => {
    await new Promise(r => setTimeout(r, limit > 50 ? 800 : 400)); 

    const count = limit;
    const loans = [];
    const seed = getHash(title + type);

    for (let i = 0; i < count; i++) {
        const rowSeed = seed + i;
        const id = `LN-${getSeededRange(10000, 99999, rowSeed)}`;
        const firstName = FIRST_NAMES[getSeededRange(0, FIRST_NAMES.length - 1, rowSeed)];
        const lastName = LAST_NAMES[getSeededRange(0, LAST_NAMES.length - 1, rowSeed + 1)];
        
        let amount = getSeededRange(5000, 50000, rowSeed + 2);
        let dpd = 0;
        let status = 'Active';

        if (type === 'bucket') {
            if (title === 'Total AUM') {
                // Random mix for total
                const rand = getSeededRandom(rowSeed + 3);
                if (rand > 0.8) {
                    status = 'Overdue';
                    dpd = getSeededRange(1, 180, rowSeed + 4);
                } else {
                    status = 'Current';
                    dpd = 0;
                }
            } else if (title === 'Delinquent AUM') {
                 status = 'Overdue';
                 dpd = getSeededRange(1, 180, rowSeed + 4);
            } else {
                status = title === 'On-time' ? 'Current' : 'Overdue';
                if (title === 'On-time') dpd = 0;
                else if (title === '1-30') dpd = getSeededRange(1, 30, rowSeed);
                else if (title === '31-60') dpd = getSeededRange(31, 60, rowSeed);
                else if (title === '61-90') dpd = getSeededRange(61, 90, rowSeed);
                else if (title === '91-120') dpd = getSeededRange(91, 120, rowSeed);
                else if (title === '121-150') dpd = getSeededRange(121, 150, rowSeed);
                else if (title === '151-180') dpd = getSeededRange(151, 180, rowSeed);
                else if (title === '180+') dpd = getSeededRange(181, 400, rowSeed);
            }
        } else {
            if (title.toLowerCase().includes('overdue')) {
                dpd = getSeededRange(1, 90, rowSeed);
                status = 'Overdue';
            } else if (title.toLowerCase().includes('collected')) {
                dpd = 0;
                status = 'Paid';
            } else {
                dpd = 0;
                status = 'Pending';
            }
        }

        const now = new Date();
        let emiDateObj = new Date(now);
        let collectionDateObj = null;

        if (dpd > 0) {
             emiDateObj.setDate(now.getDate() - dpd);
        } else if (status === 'Paid') {
             const day = getSeededRange(1, 28, rowSeed + 5);
             emiDateObj = new Date(now.getFullYear(), now.getMonth(), day);
             
             collectionDateObj = new Date(emiDateObj);
             const diff = getSeededRange(-2, 5, rowSeed + 6);
             collectionDateObj.setDate(emiDateObj.getDate() + diff);
        } else {
             const day = getSeededRange(1, 28, rowSeed + 5);
             emiDateObj = new Date(now.getFullYear(), now.getMonth(), day);
        }

        const emiDate = emiDateObj.toLocaleDateString('en-IN');
        const collectionDate = collectionDateObj ? collectionDateObj.toLocaleDateString('en-IN') : undefined;

        loans.push({
            id,
            customerName: `${firstName} ${lastName}`,
            amount,
            dpd,
            status,
            date: emiDate,
            emiDate,
            collectionDate
        });
    }

    return loans;
};
