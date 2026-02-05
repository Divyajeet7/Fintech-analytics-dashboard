import axios from 'axios';
import { url } from '../../../App';

export const fetchDashboardData = async (filters) => {
const headers = {
  token: token,
  email: email
};

const [parRes, trendRes, collectionRes] = await Promise.all([
  axios.get(`${url}/api/dashboard/par`, {
    headers,
    params: {
      location: filters.location,
      salesPerson: filters.salesPerson,
      lender: filters.lender,
      loanProduct: filters.loanProduct,
      dateRange: filters.dateRange,
      fromDate: filters.customStartDate,
      toDate: filters.customEndDate
    }
  }),
  axios.get(`${url}/api/dashboard/daily-trend`, {
    headers,
    params: {
      location: filters.location,
      salesPerson: filters.salesPerson,
      lender: filters.lender,
      loanProduct: filters.loanProduct,
      fromDate: filters.customStartDate,
      toDate: filters.customEndDate
    }
  }),
  axios.get(`${url}/api/dashboard/collections`, {
    headers,
    params: {
      location: filters.location,
      salesPerson: filters.salesPerson,
      lender: filters.lender,
      loanProduct: filters.loanProduct,
      dateRange: filters.dateRange,
      fromDate: filters.customStartDate,
      toDate: filters.customEndDate
    }
  }),
]);

const api = parRes.data;
const collectionsApi = collectionRes.data;

  const totalAUM = api.totalAUM?.value || 0;
  // const delinquentAUM = api.delinquentAUM?.value || 0;
  const overdueCollections = api.overdueCollections || 0;

  const onTimeAUM = api.onTimeAUM || { value: 0, count: 0 };

  const onTimeDays = {
    title: 'On-time Days',
    value: onTimeAUM.value,
    count: onTimeAUM.count,
    percentage: totalAUM
      ? (onTimeAUM.value / totalAUM) * 100
      : 0
  };

  // ---------- COLLECTIONS (Stock + Flow snapshot) ----------
  // const collections = {
  //   // Demand (mock equivalent)
  //   emiDemand: totalAUM,
  //   emiDemandCount: api.totalAUM?.count || 0,

  //   principalDemand: Math.round(totalAUM * 0.72),
  //   principalDemandCount: api.totalAUM?.count || 0,

  //   interestDemand: Math.round(totalAUM * 0.28),
  //   interestDemandCount: api.totalAUM?.count || 0,

  //   // Collected (placeholder until you add API)
  //   emiCollected: Math.round(totalAUM * 0.85),
  //   emiCollectedCount: Math.round((api.totalAUM?.count || 0) * 0.85),

  //   principalCollected: Math.round(totalAUM * 0.55),
  //   principalCollectedCount: Math.round((api.totalAUM?.count || 0) * 0.85),

  //   interestCollected: Math.round(totalAUM * 0.30),
  //   interestCollectedCount: Math.round((api.totalAUM?.count || 0) * 0.85),

  //   // Overdue
  //   emiOverdue: delinquentAUM,
  //   emiOverdueCount: api.delinquentAUM?.count || 0,

  //   principalOverdue: Math.round(delinquentAUM * 0.72),
  //   principalOverdueCount: api.delinquentAUM?.count || 0,

  //   interestOverdue: Math.round(delinquentAUM * 0.28),
  //   interestOverdueCount: api.delinquentAUM?.count || 0,

  //   chargesOverdue: Math.round(delinquentAUM * 0.07),
  //   chargesOverdueCount: Math.round((api.delinquentAUM?.count || 0) * 0.6)
  // };

  // console.log(collectionRes,"COLLECTIONS RES")

    const collections = {
    
    emiDemand: collectionsApi?.emiDemand || 0,
    emiDemandCount: collectionsApi?.emiDemandCount || 0,

    principalDemand: collectionsApi?.principalDemand || 0,
    principalDemandCount: collectionsApi?.emiDemandCount || 0,

    interestDemand: collectionsApi?.interestDemand || 0,
    interestDemandCount: collectionsApi?.emiDemandCount || 0,

    emiCollected: collectionsApi?.emiCollected || 0,
    emiCollectedCount: collectionsApi?.emiCollectedCount || 0,

    principalCollected:  collectionsApi?.principalCollected || 0,
    principalCollectedCount: collectionsApi?.principalCollectedCount || 0,

    interestCollected: collectionsApi?.interestCollected || 0,
    interestCollectedCount: collectionsApi?.interestCollectedCount || 0,

    chargesCollected: collectionsApi?.chargesCollected || 0,
    chargesCollectedCount: collectionsApi?.emiCollectedCount || 0,

    bounceChargesCollected: collectionsApi?.lpcNbcChargesCollected || 0,
    bounceChargesCollectedCount: collectionsApi?.lpcNbcCollectedCount || 0,

    penalInterestCollected: collectionsApi?.rocChargesCollected || 0,
    penalInterestCollectedCount: collectionsApi?.rocCollectedCount || 0,

    // Overdue
    emiOverdue: overdueCollections?.overdueEMI || 0,
    emiOverdueCount: overdueCollections?.overdueEmiCount || 0,

    principalOverdue: overdueCollections?.overduePrincipal || 0,
    principalOverdueCount: overdueCollections?.overduePrincipalCount || 0,

    interestOverdue: overdueCollections?.overdueInterest || 0,
    interestOverdueCount: overdueCollections?.overdueInterestCount || 0,

    chargesOverdue: overdueCollections?.overdueCharges || 0,
    chargesOverdueCount: overdueCollections?.overdueChargesCount || 0,
  };

  // const summary = trendRes.data.summary || {};

  // const collections = {
  //   emiCollected: summary.totalCollected || 0,
  //   principalCollected: summary.principalCollected || 0,
  //   interestCollected: summary.interestCollected || 0,
  //   chargesCollected: summary.chargesCollected || 0,

  //   emiCollectedCount: api.totalAUM?.count || 0, // optional
  //   principalCollectedCount: api.totalAUM?.count || 0,
  //   interestCollectedCount: api.totalAUM?.count || 0,
  //   chargesCollectedCount: api.totalAUM?.count || 0,

  //   // overdue remains from PAR
  //   emiOverdue: delinquentAUM,
  //   emiOverdueCount: api.delinquentAUM?.count || 0
  // };

const bucketLabelMap = {
  1: '1-30',
  31: '31-60',
  61: '61-90',
  91: '91-120',
  121: '121-150',
  151: '151-180',
  181: '180+',
  '180+': '180+'
};

const par = (api.buckets || []).map(b => ({
  range: bucketLabelMap[b._id] || String(b._id),
  value: b.value,
  count: b.count,
  percentage: totalAUM ? (b.value / totalAUM) * 100 : 0
}));

  return {
    collections,
    par,
    onTimeDays,
    dailyTrend: trendRes.data || [],
    lastUpdated: new Date(),
    totalAUMObj : api.totalAUM,
    delinquentAUMObj : api.delinquentAUM,
  };
};

export const fetchDrillDownData = async (name, type, limit = 50) => {
  const res = await axios.get(`${url}/api/dashboard/par/drill`, {
    params: { name, type, limit },
    headers: {
        token: token,
        email: email
    }
  });
  return res.data;
};

