

const ReceiptConfirmation = ({ receiptData, student, onConfirm, onCancel, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateBaseAmount = () => {
    const baseAmount = parseFloat(receiptData.amount) || 0;
    const absenceFine = parseFloat(receiptData.absenceFine) || 0;
    const otherAdjustments = parseFloat(receiptData.otherAdjustments) || 0;

    return baseAmount + absenceFine + otherAdjustments;
  };

  const calculateTotal = () => {
    const baseTotal = calculateBaseAmount();
    const arrears = parseFloat(receiptData.arrears) || 0;

    return baseTotal + arrears;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999] flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white z-[10000]">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">
            Confirm Fee Receipt
          </h3>

          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Student:</span>
              <span>{student?.user?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Class:</span>
              <span>Class {student?.class} {student?.section}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Roll Number:</span>
              <span>{student?.rollNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Fee Type:</span>
              <span>{receiptData.feeType.charAt(0).toUpperCase() + receiptData.feeType.slice(1)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Month:</span>
              <span>{new Date(receiptData.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
            <h4 className="text-md font-medium mb-2">Fee Breakdown</h4>
            <div className="flex justify-between mb-2">
              <span>Base Fee:</span>
              <span>{formatCurrency(receiptData.amount)}</span>
            </div>
            {receiptData.arrears > 0 && (
              <div className="flex justify-between mb-2 text-red-600 font-semibold">
                <span>Previous Arrears:</span>
                <span>{formatCurrency(receiptData.arrears)}</span>
              </div>
            )}
            {receiptData.absenceFine > 0 && (
              <div className="flex justify-between mb-2">
                <span>Absence Fine:</span>
                <span>{formatCurrency(receiptData.absenceFine)}</span>
              </div>
            )}
            {receiptData.otherAdjustments > 0 && (
              <div className="flex justify-between mb-2">
                <span>Other Adjustments:</span>
                <span>{formatCurrency(receiptData.otherAdjustments)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {receiptData.description && (
            <div className="mb-4">
              <span className="font-medium">Description:</span>
              <p className="text-sm text-gray-600 mt-1">{receiptData.description}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-5">
            <button
              type="button"
              className="px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={onCancel}
              disabled={loading}
            >
              Back
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm & Generate Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptConfirmation;
