import React, { useState } from 'react';
import { Ticket, DollarSign, Award, X, Search, Gift, Share2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {autoTable} from 'jspdf-autotable';

export const getTransactionIcon = (type, size = 20) => {
  const baseClasses = "p-2 rounded-full";
  switch (type) {
    case 'Ticket Purchase':
      return <div className={`bg-blue-500/20 text-blue-500 ${baseClasses}`}><Ticket size={size} /></div>;
    case 'Winner':
      return <div className={`bg-green-500/20 text-green-500 ${baseClasses}`}><Award size={size} /></div>;
    case 'Referral Commission':
      return <div className={`bg-purple-500/20 text-purple-500 ${baseClasses}`}><Share2 size={size} /></div>;
    case 'Payout':
      return <div className={`bg-yellow-500/20 text-yellow-500 ${baseClasses}`}><DollarSign size={size} /></div>;
    case 'Pair Matching Reward':
      return <div className={`bg-green-500/20 text-green-500 ${baseClasses}`}><Gift size={size} /></div>;
    case 'Reward Claimed':
      return <div className={`bg-yellow-500/20 text-yellow-500 ${baseClasses}`}><Award size={size} /></div>;
    default:
      return <div className={`bg-gray-500/20 text-gray-500 ${baseClasses}`}><Gift size={size} /></div>;
  }
};

export const TransactionTable = ({ transactions, onSelectTransaction, filterType='All', setFilterType, isAdmin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const [showExportOptions, setShowExportOptions] = useState(false);


  const exportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const fileName = 'transactions';

    const formattedTransactions = transactions.map(tx => ({
      ...tx,
      details: Object.entries(tx.details).map(([key, value]) => `${key}: ${value},`).join('\n')
    }));

    const ws = XLSX.utils.json_to_sheet(formattedTransactions);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName + fileExtension;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Transaction History', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    autoTable(doc,{
      startY: 30,
      head: [['Type', 'User', 'Amount', 'Time', 'Details']],
      body: transactions.map(tx => [
        tx.type,
        tx.user,
        tx.amount,
        tx.time,
        Object.entries(tx.details).map(([key, value]) => `${key}: ${value}`).join('\n')
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'middle',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' },
      }
    });

    doc.save('transactions.pdf');
  }


  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'All') return true;
    return tx.type === filterType;
  });

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const filters= [
    'All',
    'Ticket Purchase',
    'Winner',
    'Referral Commission',
    'Payout',
    'Pair Matching Reward',
    'Reward Claimed'
  ];
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                <Download size={20} />
                <span>Export</span>
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      exportToExcel();
                      setShowExportOptions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    Export to Excel
                  </button>
                  <button
                    onClick={() => {
                      exportToPdf();
                      setShowExportOptions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    Export to PDF
                  </button>
                </div>
              )}
            </div>
          )}
          {setFilterType && ( // Only show filter if setFilterType is provided (i.e., in Admin page)
            <select className="bg-gray-700 text-white p-2 rounded-lg" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {filters.map((filter) => (
                <option key={filter} value={filter}>{filter} </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3">Type</th>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Time</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((tx, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3 flex items-center space-x-2">
                    {getTransactionIcon(tx.type)}
                    <span>{tx.type}</span>
                  </td>
                  <td className="p-3 font-mono group relative">
                    <p className="cursor-pointer">{tx.user.substring(0, 6)}...{tx.user.substring(tx.user.length - 4)}</p>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                      {tx.user}
                    </div>
                  </td>
                  <td className="p-3">{tx.amount}</td>
                  <td className="p-3">{tx.time}</td>
                  <td className="p-3">
                    <button onClick={() => onSelectTransaction(tx)} className="p-2 rounded-lg hover:bg-gray-700">
                      <Search size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-400">No transactions available.</td>
              </tr>
            ) }
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(pageNumber => {
            if (totalPages <= 3) return true;
            if (currentPage <= 2) return pageNumber <= 3;
            if (currentPage >= totalPages - 1) return pageNumber >= totalPages - 2;
            return pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1;
          })
          .map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => paginate(pageNumber)}
              className={`mx-1 px-3 py-1 rounded-lg ${ 
                currentPage === pageNumber ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {pageNumber}
            </button>
          ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};


export const TransactionModal = ({ transaction, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="relative bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700">
        <X size={24} />
      </button>
      <div className="flex justify-center mb-4">
        {getTransactionIcon(transaction.type, 40)}
      </div>
      <h2 className="text-2xl font-bold mb-2 text-white">{transaction.type}</h2>
      <p className="text-gray-400 mb-4">{transaction.time}</p>
      <div className="text-left space-y-1">
        <div className="py-2 border-b border-gray-700 flex justify-between items-center">
          <p className="text-gray-400">User</p>
          <div className="group relative">
            <p className="font-mono cursor-pointer">{transaction.user.substring(0, 6)}...{transaction.user.substring(transaction.user.length - 4)}</p>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
              {transaction.user}
            </div>
          </div>
        </div>
        <div className="py-2 border-b border-gray-700 flex justify-between items-center">
          <p className="text-gray-400">Amount</p>
          <p>{transaction.amount}</p>
        </div>
        {transaction.details && Object.entries(transaction.details).map(([key, value]) => (
          <div key={key} className="py-2 border-b border-gray-700 flex justify-between items-center last:border-b-0">
            <p className="text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
            <div className="group relative">
              {String(value).length > 15 ? (
                <>
                  <p className="font-mono cursor-pointer">{String(value).substring(0, 6)}...{String(value).substring(String(value).length - 4)}</p>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                    {value}
                  </div>
                </>
              ) : (
                <p className="font-mono break-all">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);