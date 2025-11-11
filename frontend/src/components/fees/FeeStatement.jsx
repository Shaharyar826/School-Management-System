import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const FeeStatement = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchStatementData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/fees/statement/${studentId}`);
        if (res.data.success) {
          setStatementData(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch fee statement. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatementData();
  }, [studentId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePDF = () => {
    setGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text('SCHOOL MANAGEMENT SYSTEM', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('FEE STATEMENT', 105, 30, { align: 'center' });

      // Student details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Student Details:', 20, 45);
      doc.text(`Name: ${statementData.student.name}`, 25, 55);
      doc.text(`Roll Number: ${statementData.student.rollNumber}`, 25, 65);
      doc.text(`Class: ${statementData.student.class} ${statementData.student.section}`, 25, 75);

      // Fee records table header
      let yPos = 90;
      doc.text('Fee History:', 20, yPos);
      yPos += 10;

      // Table headers
      doc.setFontSize(10);
      doc.text('Month/Year', 20, yPos);
      doc.text('Assigned', 60, yPos);
      doc.text('Paid', 90, yPos);
      doc.text('Arrears', 110, yPos);
      doc.text('Fines', 135, yPos);
      doc.text('Status', 160, yPos);
      
      yPos += 5;
      doc.line(20, yPos, 190, yPos); // Header line
      yPos += 5;

      // Fee records
      statementData.fees.forEach(fee => {
        if (yPos > 250) { // New page if needed
          doc.addPage();
          yPos = 20;
        }

        const month = new Date(fee.dueDate).toLocaleDateString('default', { month: 'short', year: 'numeric' });
        const assignedFee = fee.monthlyFee || fee.amount || 0;
        const paidAmount = fee.paidAmount || 0;
        const arrears = fee.remainingAmount || 0;
        const fines = (fee.absenceFine || 0) + (fee.otherAdjustments || 0);

        doc.text(month, 20, yPos);
        doc.text(formatCurrency(assignedFee), 60, yPos);
        doc.text(formatCurrency(paidAmount), 90, yPos);
        doc.text(formatCurrency(arrears), 110, yPos);
        doc.text(formatCurrency(fines), 135, yPos);
        doc.text(fee.status.toUpperCase(), 160, yPos);
        
        yPos += 8;
      });

      // Summary section
      yPos += 10;
      doc.line(20, yPos, 190, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.text('SUMMARY', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Fee Assigned: ${formatCurrency(statementData.summary.totalAssigned)}`, 25, yPos);
      yPos += 8;
      doc.text(`Total Paid: ${formatCurrency(statementData.summary.totalPaid)}`, 25, yPos);
      yPos += 8;
      doc.text(`Total Arrears: ${formatCurrency(statementData.summary.totalArrears)}`, 25, yPos);
      yPos += 8;
      doc.text(`Total Fines: ${formatCurrency(statementData.summary.totalFines)}`, 25, yPos);
      yPos += 8;
      doc.setFontSize(12);
      doc.text(`Remaining Balance: ${formatCurrency(statementData.summary.remainingBalance)}`, 25, yPos);

      // Footer
      doc.setFontSize(8);
      doc.text('Generated on: ' + new Date().toLocaleDateString(), 105, 280, { align: 'center' });

      doc.save(`Fee_Statement_${statementData.student.rollNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again later.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!statementData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">No data!</strong>
        <span className="block sm:inline"> No fee statement found.</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Fee Statement</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/fees')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Fees
            </button>
            <button
              onClick={generatePDF}
              disabled={generating}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Download Statement (PDF)'}
            </button>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Student Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{statementData.student.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Roll Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{statementData.student.rollNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Class</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Class {statementData.student.class} {statementData.student.section}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Fee History Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Fee History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month/Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrears
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fines
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statementData.fees.map((fee) => {
                  const assignedFee = fee.monthlyFee || fee.amount || 0;
                  const paidAmount = fee.paidAmount || 0;
                  const arrears = fee.remainingAmount || 0;
                  const fines = (fee.absenceFine || 0) + (fee.otherAdjustments || 0);

                  return (
                    <tr key={fee._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(fee.dueDate).toLocaleDateString('default', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(assignedFee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(paidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {arrears > 0 ? (
                          <span className="text-red-600 font-semibold">
                            {formatCurrency(arrears)}
                          </span>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fines > 0 ? (
                          <span className="text-orange-600 font-semibold">
                            {formatCurrency(fines)}
                          </span>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(fee.status)}`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Summary</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Fee Assigned</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(statementData.summary.totalAssigned)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Paid</dt>
                <dd className="mt-1 text-lg font-semibold text-green-600">
                  {formatCurrency(statementData.summary.totalPaid)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Arrears</dt>
                <dd className="mt-1 text-lg font-semibold text-red-600">
                  {formatCurrency(statementData.summary.totalArrears)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Fines</dt>
                <dd className="mt-1 text-lg font-semibold text-orange-600">
                  {formatCurrency(statementData.summary.totalFines)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Remaining Balance</dt>
                <dd className="mt-1 text-lg font-semibold text-blue-600">
                  {formatCurrency(statementData.summary.remainingBalance)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeStatement;