import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const FeeReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/fee-receipts/generate/${id}`);
        if (res.data.success) {
          setFee(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch fee data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeData();
  }, [id]);

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

  const generatePDF = () => {
    setGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add school logo and header
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 128); // Dark blue
      doc.text('SCHOOL MANAGEMENT SYSTEM', 105, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.text('FEE RECEIPT', 105, 30, { align: 'center' });

      // Add receipt details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black

      // Receipt number and date
      doc.text(`Receipt No: ${fee.receiptNumber}`, 20, 45);
      doc.text(`Date: ${formatDate(fee.paymentDate || new Date())}`, 150, 45, { align: 'right' });

      // Student details
      doc.text('Student Details:', 20, 60);
      doc.text(`Name: ${fee.student.user.name}`, 25, 70);
      doc.text(`Email: ${fee.student.user.email}`, 25, 80);

      // Fee details
      doc.text('Fee Details:', 20, 100);
      doc.text(`Fee Type: ${fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}`, 25, 110);
      let linePosition = 120;

      // Add fee breakdown
      if (fee.monthlyFee > 0) {
        doc.text(`Monthly Fee: ${formatCurrency(fee.monthlyFee)}`, 25, linePosition);
        linePosition += 10;
      }

      if (fee.absenceFine > 0) {
        doc.setTextColor(255, 140, 0); // Orange color for absence fine
        doc.text(`Absence Fine: ${formatCurrency(fee.absenceFine)}`, 25, linePosition);
        linePosition += 10;
        doc.setTextColor(0, 0, 0); // Reset to black
      }

      if (fee.otherAdjustments > 0) {
        doc.setTextColor(0, 0, 255); // Blue color for adjustments
        doc.text(`Other Adjustments: ${formatCurrency(fee.otherAdjustments)}`, 25, linePosition);
        linePosition += 10;
        doc.setTextColor(0, 0, 0); // Reset to black
      }

      // Fallback for fees without breakdown
      if (!fee.monthlyFee && !fee.absenceFine && !fee.otherAdjustments) {
        doc.text(`Monthly Fee: ${formatCurrency(fee.amount)}`, 25, linePosition);
        linePosition += 10;
      }

      // Add arrears if present
      if (fee.arrears && fee.arrears > 0) {
        doc.setTextColor(255, 0, 0); // Red color for arrears
        doc.text(`Previous Arrears: ${formatCurrency(fee.arrears)}`, 25, linePosition);
        linePosition += 10;
        doc.setTextColor(0, 0, 0); // Reset to black
      }

      // Add total amount
      doc.setFontSize(14);
      doc.text(`Total Amount Due: ${formatCurrency(fee.amount + (fee.arrears || 0))}`, 25, linePosition);
      doc.setFontSize(12);
      linePosition += 10;

      doc.text(`Status: ${fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}`, 25, linePosition);
      linePosition += 10;

      doc.text(`Due Date: ${formatDate(fee.dueDate)}`, 25, linePosition);
      linePosition += 10;

      if (fee.paymentDate) {
        doc.text(`Payment Date: ${formatDate(fee.paymentDate)}`, 25, linePosition);
        linePosition += 10;
      }

      if (fee.paymentMethod) {
        doc.text(`Payment Method: ${fee.paymentMethod.charAt(0).toUpperCase() + fee.paymentMethod.slice(1)}`, 25, linePosition);
      }

      // Add signature line
      doc.line(20, 200, 80, 200);
      doc.text('Authorized Signature', 20, 210);

      // Add footer
      doc.setFontSize(10);
      doc.text('This is a computer-generated receipt and does not require a signature.', 105, 280, { align: 'center' });

      // Save the PDF
      doc.save(`Fee_Receipt_${fee.receiptNumber}.pdf`);

      return doc;
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

  if (!fee) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">No data!</strong>
        <span className="block sm:inline"> No fee record found.</span>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Fee Receipt</h1>
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
              {generating ? 'Generating...' : 'Download Receipt'}
            </button>
          </div>
        </div>

        {/* Receipt Preview */}
        <div ref={receiptRef} className="bg-white shadow overflow-hidden sm:rounded-lg p-6 border-2 border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">SCHOOL MANAGEMENT SYSTEM</h2>
            <p className="text-lg font-semibold mt-2">FEE RECEIPT</p>
          </div>

          <div className="flex justify-between mb-6">
            <p className="text-sm font-medium text-gray-700">Receipt No: {fee.receiptNumber || 'N/A'}</p>
            <p className="text-sm font-medium text-gray-700">Date: {formatDate(fee.paymentDate || new Date())}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student Details</h3>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-700 mb-1">Name: {fee.student.user.name}</p>
              <p className="text-sm text-gray-700">Email: {fee.student.user.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fee Details</h3>
            <div className="border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-700 mb-1">
                Fee Type: {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}
              </p>
              {fee.monthlyFee > 0 && (
                <p className="text-sm text-gray-700 mb-1">Monthly Fee: {formatCurrency(fee.monthlyFee)}</p>
              )}
              {fee.absenceFine > 0 && (
                <p className="text-sm text-gray-700 mb-1 text-orange-600 font-semibold">
                  Absence Fine: {formatCurrency(fee.absenceFine)}
                </p>
              )}
              {fee.otherAdjustments > 0 && (
                <p className="text-sm text-gray-700 mb-1 text-blue-600">
                  Other Adjustments: {formatCurrency(fee.otherAdjustments)}
                </p>
              )}
              {/* Fallback for fees without breakdown */}
              {(!fee.monthlyFee && !fee.absenceFine && !fee.otherAdjustments) && (
                <p className="text-sm text-gray-700 mb-1">Monthly Fee: {formatCurrency(fee.amount)}</p>
              )}
              {fee.arrears > 0 && (
                <p className="text-sm text-gray-700 mb-1 text-red-600 font-semibold">
                  Previous Arrears: {formatCurrency(fee.arrears)}
                </p>
              )}
              <p className="text-sm text-gray-700 mb-1 font-semibold border-t pt-1">
                Total Amount Due: {formatCurrency(fee.amount + (fee.arrears || 0))}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                Status: {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
              </p>
              <p className="text-sm text-gray-700 mb-1">Due Date: {formatDate(fee.dueDate)}</p>
              {fee.paymentDate && (
                <p className="text-sm text-gray-700 mb-1">Payment Date: {formatDate(fee.paymentDate)}</p>
              )}
              {fee.paymentMethod && (
                <p className="text-sm text-gray-700">
                  Payment Method: {fee.paymentMethod.charAt(0).toUpperCase() + fee.paymentMethod.slice(1)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="w-1/3">
              <div className="border-t-2 border-gray-400 pt-1">
                <p className="text-sm text-gray-700">Authorized Signature</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-gray-500">
            <p>This is a computer-generated receipt and does not require a signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;
