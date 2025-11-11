# Fee Save Logic Fix - Process Payment Issue

## Problem Description

The issue was in the process payment page where:
1. Total due was shown correctly (e.g., 3100 for 2600 fee + 500 fine)
2. But when saving, the system overwrote the monthly fee with 500 and saved fine as 500 separately
3. Result: Paid fee = 500 instead of 2600, and fine = 500

## Root Cause Analysis

The problem was in the Fee model's pre-save hook and the `processAggregatedPayment` function:

1. **Missing monthlyFee field**: The Fee model had breakdown fields (`monthlyFee`, `absenceFine`, `otherAdjustments`) but existing records didn't have `monthlyFee` set
2. **Pre-save hook logic**: When fines were added, the pre-save hook recalculated `amount` as `monthlyFee + absenceFine + otherAdjustments`, but since `monthlyFee` was 0 or undefined, it resulted in `amount = 0 + 500 + 0 = 500`
3. **Payment processing**: The system was overwriting the original monthly fee amount with just the fine amount

## Solution Implemented

### 1. Fixed Fee Model Pre-save Hook (`backend/models/Fee.js`)

```javascript
// Before: Overwrote amount with just breakdown fields
if (this.isModified('monthlyFee') || this.isModified('absenceFine') || this.isModified('otherAdjustments')) {
  this.amount = (this.monthlyFee || 0) + (this.absenceFine || 0) + (this.otherAdjustments || 0);
}

// After: Preserve original monthly fee, only add fines
if (!this.monthlyFee && this.amount) {
  this.monthlyFee = this.amount; // Preserve original amount as monthlyFee
}

if (this.isModified('monthlyFee') || this.isModified('absenceFine') || this.isModified('otherAdjustments')) {
  const baseAmount = this.monthlyFee || this.amount || 0;
  this.amount = baseAmount + (this.absenceFine || 0) + (this.otherAdjustments || 0);
}
```

### 2. Fixed processAggregatedPayment Function (`backend/controllers/fee.controller.js`)

```javascript
// Before: Didn't preserve monthlyFee when adding fines
mostRecentFee.absenceFine = absenceFine || 0;
mostRecentFee.otherAdjustments = otherAdjustments || 0;

// After: Preserve original monthly fee before adding fines
if (!mostRecentFee.monthlyFee) {
  mostRecentFee.monthlyFee = mostRecentFee.amount || 0;
}
mostRecentFee.absenceFine = absenceFine || 0;
mostRecentFee.otherAdjustments = otherAdjustments || 0;
```

### 3. Updated Fee Creation Functions

Updated all fee creation functions to set `monthlyFee` field:
- `createInitialFeeRecord`
- `generateMonthlyFees`
- `createFeeRecord`

### 4. Created Migration Script (`backend/scripts/fixMonthlyFeeField.js`)

A migration script to fix existing fee records that don't have the `monthlyFee` field set properly.

## How the Fix Works

### Before Fix:
1. Fee record: `{ amount: 2600, monthlyFee: undefined, absenceFine: 0, otherAdjustments: 0 }`
2. Add fine: `{ amount: 2600, monthlyFee: undefined, absenceFine: 500, otherAdjustments: 0 }`
3. Pre-save hook: `amount = (undefined || 0) + 500 + 0 = 500` ❌
4. Result: Monthly fee lost, only fine amount saved

### After Fix:
1. Fee record: `{ amount: 2600, monthlyFee: 2600, absenceFine: 0, otherAdjustments: 0 }`
2. Add fine: `{ amount: 2600, monthlyFee: 2600, absenceFine: 500, otherAdjustments: 0 }`
3. Pre-save hook: `amount = 2600 + 500 + 0 = 3100` ✅
4. Result: Monthly fee preserved, fine added correctly

## Database Changes

### New Field Structure:
```javascript
{
  amount: 3100,        // Total amount (monthlyFee + fines)
  monthlyFee: 2600,    // Original monthly fee (preserved)
  absenceFine: 500,    // Absence fine
  otherAdjustments: 0, // Other adjustments
  // ... other fields
}
```

## Testing Steps

1. **Run Migration**: Execute the migration script to fix existing records
   ```bash
   cd backend/scripts
   node fixMonthlyFeeField.js
   ```

2. **Test Payment Processing**:
   - Go to process payment page
   - Verify total due shows correctly (monthlyFee + arrears + fines)
   - Process payment
   - Verify fee record shows correct breakdown:
     - `monthlyFee`: Original fee amount (e.g., 2600)
     - `absenceFine`: Fine amount (e.g., 500)
     - `amount`: Total amount (e.g., 3100)
     - `paidAmount`: Amount paid

3. **Verify Database Records**:
   - Check fee records have `monthlyFee` field set
   - Verify `amount` = `monthlyFee` + `absenceFine` + `otherAdjustments`
   - Confirm payment amounts are correct

## Files Modified

1. `backend/models/Fee.js` - Fixed pre-save hook
2. `backend/controllers/fee.controller.js` - Fixed payment processing and fee creation
3. `backend/scripts/fixMonthlyFeeField.js` - Migration script (new)
4. `backend/scripts/runMigration.js` - Migration runner (new)

## Benefits

1. **Preserves Monthly Fee**: Original monthly fee amount is never lost
2. **Correct Fine Handling**: Fines are added as separate fields, not replacements
3. **Accurate Totals**: Total amounts reflect actual fee + fines
4. **Data Integrity**: Existing records are migrated to new structure
5. **Future-Proof**: New fee records automatically use correct structure

## Migration Required

**Important**: Run the migration script before using the updated system to ensure existing fee records have the `monthlyFee` field properly set.

```bash
cd backend/scripts
node fixMonthlyFeeField.js
```

This will update all existing fee records to have the correct `monthlyFee` field based on their current `amount` and fine values.