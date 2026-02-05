import React from 'react';
import { X, User, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';

const DrillDownModal = ({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  isLoading, 
  onDownload, 
  isDownloading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Details for {title}</h2>
            <p className="text-sm text-slate-500">Showing list of associated loans</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto min-h-[300px] p-0">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm">Loading details...</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan ID</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount (₹)</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">DPD</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length > 0 ? (
                        data.map((loan) => (
                            <tr key={loan.id} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium text-blue-600 group-hover:underline cursor-pointer">{loan.id}</td>
                                <td className="px-6 py-4 text-sm text-slate-700 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={14} />
                                    </div>
                                    {loan.customerName}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 text-right font-medium">
                                    {new Intl.NumberFormat('en-IN').format(loan.amount)}
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        loan.dpd === 0 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : loan.dpd < 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {loan.dpd > 0 ? `${loan.dpd} Days` : 'On Time'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        {loan.status === 'Paid' ? (
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        ) : loan.status === 'Overdue' ? (
                                            <AlertCircle size={16} className="text-rose-500" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                        <span className={`text-sm ${
                                            loan.status === 'Paid' ? 'text-emerald-600' :
                                            loan.status === 'Overdue' ? 'text-rose-600' : 'text-slate-600'
                                        }`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                No records found for this category.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-500">Showing snapshot of top 15 records</span>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={onDownload}
                disabled={isDownloading || isLoading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm ${isDownloading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                 {isDownloading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     <span>Generating...</span>
                   </>
                 ) : (
                   <>
                     <FileSpreadsheet size={16} />
                     <span>Download Excel</span>
                   </>
                 )}
              </button>
              
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
              >
                  Close
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;
