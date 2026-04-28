import { useState } from "react";
import api from "../../api/axios";
import { FiDownload, FiBarChart2, FiUsers, FiCheckCircle } from "react-icons/fi";

const AdminReports = () => {
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(false);

  // Pure Native Javascript array-to-CSV Converter
  const convertToCSV = (objArray) => {
    const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
    let str = "";
    
    // Extract Headers
    if (array.length > 0) {
      const headers = Object.keys(array[0]).join(",");
      str += headers + "\r\n";
    }

    // Extract Data
    for (let i = 0; i < array.length; i++) {
      let line = "";
      for (let index in array[i]) {
        if (line !== "") line += ",";
        // Convert nulls/undefined to empty strings and wrap in quotes to escape commas natively
        let val = array[i][index] !== null && array[i][index] !== undefined ? array[i][index] : "";
        line += `"${String(val).replace(/"/g, '""')}"`;
      }
      str += line + "\r\n";
    }
    return str;
  };

  const triggerDownload = (filename, csvString) => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSales = async () => {
    setLoadingSales(true);
    try {
      // Inject real-time cache-busting timestamp guaranteeing fresh Node execution
      const res = await api.get(`/admin/reports/sales?timestamp=${new Date().getTime()}`);
      if (res.data && res.data.length > 0) {
        const csvData = convertToCSV(res.data);
        triggerDownload(`Sales_Report_${new Date().toISOString().split('T')[0]}.csv`, csvData);
      } else {
        alert("No sales data available to generate report.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate sales report. Please check server connection.");
    } finally {
      setLoadingSales(false);
    }
  };

  const handleDownloadSellers = async () => {
    setLoadingSellers(true);
    try {
      // Inject real-time cache-busting timestamp guaranteeing fresh Node execution
      const res = await api.get(`/admin/reports/sellers?timestamp=${new Date().getTime()}`);
      if (res.data && res.data.length > 0) {
        const csvData = convertToCSV(res.data);
        triggerDownload(`Sellers_Report_${new Date().toISOString().split('T')[0]}.csv`, csvData);
      } else {
        alert("No sellers data available to generate report.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate seller report. Please check server connection.");
    } finally {
      setLoadingSellers(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Reports</h1>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Generate and securely download isolated `.csv` data dumps for accounting and monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sales Report Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <FiBarChart2 size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Master Sales Ledger</h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Downloads a complete breakdown of every transaction processed through the system. Includes specific revenue distribution tracking showing exact Admin commision vs Seller payout.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-medium text-gray-600">
              <li className="flex gap-2 items-center"><FiCheckCircle className="text-green-500" /> Payment & Delivery Statuses</li>
              <li className="flex gap-2 items-center"><FiCheckCircle className="text-green-500" /> Revenue Split Mapping</li>
              <li className="flex gap-2 items-center"><FiCheckCircle className="text-green-500" /> Automated Returns Adjustments</li>
            </ul>
          </div>
          
          <button
            onClick={handleDownloadSales}
            disabled={loadingSales}
            className="w-full mt-8 bg-linear-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loadingSales ? (
              <span className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <><FiDownload size={20} /> Generate Sales Report (.csv)</>
            )}
          </button>
        </div>

        {/* Sellers Report Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <FiUsers size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sellers Performance</h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Downloads a complete overview of all registered sellers. Easily track platform dependencies, inventory capacities, and holistic revenue generated per seller footprint.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-medium text-gray-600">
              <li className="flex gap-2 items-center"><FiCheckCircle className="text-green-500" /> Total Active Products Counter</li>
              <li className="flex gap-2 items-center"><FiCheckCircle className="text-green-500" /> Gross Volume Mapping</li>
              <li className="flex gap-2 items-center"><FiCheckCircle className="text-green-500" /> Associated Account Statuses</li>
            </ul>
          </div>
          
          <button
            onClick={handleDownloadSellers}
            disabled={loadingSellers}
            className="w-full mt-8 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loadingSellers ? (
              <span className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <><FiDownload size={20} /> Generate Seller Report (.csv)</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
