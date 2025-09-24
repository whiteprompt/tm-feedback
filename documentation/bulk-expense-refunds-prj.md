# Bulk Expense Refunds - Project Requirements Document

## Overview
Create a bulk expense refund submission system that allows users to upload multiple PDF receipts (up to 10) and process them efficiently through AI extraction, review, and bulk submission.

## Features

### 1. Multi-file Upload System
- **Route**: `/expense-refunds/bulk`
- **Component**: `BulkExpenseRefundClient.tsx`
- **File Limits**: Up to 10 PDF files per batch
- **File Validation**: Same as single form (PDF only, max 5MB each)
- **Interface**: Drag & drop zone with file list preview

### 2. Batch AI Extraction
- **Processing**: Sequential extraction to respect API rate limits
- **Progress Tracking**: Real-time progress indicator
- **Error Handling**: Continue processing remaining files if one fails
- **API Reuse**: Leverage existing `/api/expense-refunds/extract-receipt` endpoint

### 3. Review & Edit Interface
- **Display**: Editable table/grid showing all extracted data
- **Bulk Actions**: 
  - Apply concept to all items
  - Set currency for all items
  - Bulk delete failed extractions
- **Individual Editing**: Click-to-edit cells for corrections
- **Validation**: Real-time validation with error highlighting

### 4. Bulk Submission
- **API**: New `/api/expense-refunds/bulk` endpoint
- **Processing**: Submit all valid expense refunds simultaneously
- **Error Handling**: Partial success handling with detailed feedback
- **Confirmation**: Success summary with links to created items

## Technical Implementation

### Component Structure
Based on `ExpenseRefundFormV2Client.tsx`:

```typescript
interface BulkExpenseRefundForm {
  files: File[];
  extractedData: ExtractedDataWithFile[];
  validationErrors: ValidationError[];
}

interface ExtractedDataWithFile extends ExtractedData {
  fileId: string;
  fileName: string;
  status: 'pending' | 'extracting' | 'extracted' | 'error' | 'ready';
  errorMessage?: string;
}
```

### 4-Step Wizard Flow

#### Step 1: Upload (Multi-file)
- Multi-file drag & drop interface
- File validation and preview
- Remove individual files capability
- Progress to extraction automatically

#### Step 2: Extraction (Batch Processing)
- Sequential AI processing with progress bar
- Individual file status indicators
- Option to skip failed extractions
- Continue with successful extractions

#### Step 3: Review (Editable Grid)
- Table with columns: File, Title, Amount, Currency, Concept, Date, Description
- Inline editing capabilities
- Bulk action toolbar:
  - Select all/none checkboxes
  - Bulk concept assignment
  - Bulk currency assignment
  - Delete selected items
- Individual row actions (edit, delete)
- Validation indicators per row

#### Step 4: Confirmation (Submit)
- Summary of items to be submitted
- Final validation check
- Bulk submission with progress
- Success/error reporting

### API Endpoints

#### Existing (Reuse)
- `POST /api/expense-refunds/extract-receipt` - Individual extraction
- File upload validation logic

#### New
```typescript
// POST /api/expense-refunds/bulk
interface BulkSubmissionRequest {
  items: Array<{
    title: string;
    description: string;
    amount: string;
    currency: string;
    concept: string;
    submittedDate: string;
    exchangeRate: string;
    receiptFile: File;
  }>;
  userEmail: string;
}

interface BulkSubmissionResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    id?: string;
    fileName: string;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
```

### Navigation Updates
Update Navigation component to include bulk option:
```typescript
// Add to expense refunds dropdown
{
  label: 'Bulk Submit',
  href: '/expense-refunds/bulk',
  icon: 'upload-multiple'
}
```

## UI/UX Considerations

### Responsive Design
- Mobile: Stack form fields, simplified grid view
- Tablet: Condensed grid with horizontal scroll
- Desktop: Full grid with all columns visible

### Performance
- Lazy loading for large file previews
- Virtualized table for better performance with many items
- Progressive enhancement for file processing

### User Experience
- Clear progress indicators at each step
- Comprehensive error messages with suggested actions
- Unsaved changes warning
- Auto-save draft functionality (future enhancement)

## Error Handling

### File Upload Errors
- Individual file validation errors
- Size/type restrictions clearly communicated
- Option to replace invalid files

### Extraction Errors
- Continue processing remaining files
- Clear error messages for failed extractions
- Option to retry failed extractions
- Manual data entry for failed items

### Submission Errors
- Partial success handling
- Detailed error reporting per item
- Option to retry failed submissions
- Clear success/failure summary

## Security & Validation

### File Validation
- Reuse existing PDF validation logic
- Size limits per file and total batch
- MIME type verification
- Malware scanning (if available)

### Data Validation
- Server-side validation for all form fields
- Concept validation against allowed values
- Currency validation
- Amount and exchange rate validation

## Implementation Phases

### Phase 1: Core Structure
1. Create bulk route and component structure
2. Implement multi-file upload interface
3. Basic wizard navigation

### Phase 2: Extraction & Processing
1. Implement batch extraction logic
2. Add progress tracking
3. Error handling for extraction failures

### Phase 3: Review Interface
1. Create editable data grid
2. Implement bulk actions
3. Individual row editing
4. Validation indicators

### Phase 4: Submission & Polish
1. Implement bulk submission API
2. Add confirmation step
3. Success/error reporting
4. Navigation integration
5. Mobile responsiveness
6. Performance optimization

## Success Metrics
- Reduction in time to submit multiple expense refunds
- High success rate for AI extraction
- Low error rate during bulk submission
- Positive user feedback on ease of use

## Future Enhancements
- Auto-save drafts
- Template concepts for common expense types
- CSV export of submitted expenses
- Batch approval workflow for managers
- Integration with accounting systems