# PRJ: Bulk Expense Refund Feature

## Project Overview
Create a bulk expense refund submission system that allows users to upload multiple receipt files, extract data from each automatically using AI, review and edit the extracted information, and submit all expense refunds to Notion in a single workflow.

## Current State Analysis
The application already has:
- Single expense refund form with AI extraction (`/expense-refunds/new-v2`)
- Receipt data extraction API (`/api/expense-refunds/extract-receipt`)
- Expense refund submission API (`/api/expense-refunds`)
- Navigation structure with expense refund dropdown
- Comprehensive styling system with White Prompt design tokens

## Technical Requirements

### 1. File Structure
```
src/app/expense-refunds/
├── bulk/
│   ├── page.tsx                    # Main bulk expense refund page
│   └── BulkExpenseRefundClient.tsx # Client component with bulk functionality
├── new-v2/                         # Existing single form
└── page.tsx                        # Existing expense refunds list
```

### 2. Core Features

#### 2.1 Multi-File Upload System
- **File Types**: PDF receipts (same as current system)
- **File Limits**: 
  - Maximum 10 files per batch
  - 5MB per file maximum
  - Total batch size limit: 25MB
- **Upload Interface**:
  - Drag & drop zone for multiple files
  - File list with preview thumbnails
  - Individual file removal capability
  - Progress indicators during upload
  - File validation with clear error messages

#### 2.2 Batch AI Extraction
- **Sequential Processing**: Process one file at a time to avoid API rate limits
- **Progress Tracking**: Show extraction progress for each file
- **Error Handling**: Continue processing other files if one fails
- **Data Structure**:
  ```typescript
  interface BulkExtractedData {
    fileId: string;
    fileName: string;
    extractedData: ExtractedData | null;
    extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  }
  ```

#### 2.3 Review & Edit Interface
- **Table/Card View**: Display all extracted data in editable format
- **Individual Editing**: Edit each expense refund separately
- **Bulk Actions**:
  - Select all/none functionality
  - Bulk concept assignment
  - Bulk currency setting
  - Bulk date assignment
- **Validation**: Real-time validation for required fields
- **Data Synchronization**: Keep track of which entries have been modified

#### 2.4 Bulk Submission System
- **Submission Strategy**: Submit all valid expense refunds simultaneously
- **Progress Tracking**: Show submission progress for each item
- **Error Recovery**: Handle partial failures gracefully
- **Success Handling**: Redirect to expense refunds list with success message

### 3. UI/UX Design Requirements

#### 3.1 Wizard Flow
1. **Upload Step**: Multi-file selection and upload
2. **Extraction Step**: AI processing with progress indicators
3. **Review Step**: Editable table/grid of extracted data
4. **Confirmation Step**: Final review and bulk submission

#### 3.2 Progress Indicators
- Overall wizard progress (4 steps)
- File upload progress bars
- AI extraction progress for each file
- Submission progress for each expense refund

#### 3.3 Error States
- File upload errors (size, type, network)
- AI extraction failures with retry options
- Validation errors with clear field highlighting
- Submission failures with detailed error messages

#### 3.4 Responsive Design
- Mobile-optimized multi-file upload
- Tablet-friendly review interface
- Desktop-optimized bulk editing experience

### 4. API Requirements

#### 4.1 New Bulk Submission Endpoint
```typescript
// POST /api/expense-refunds/bulk
interface BulkSubmissionRequest {
  expenseRefunds: Array<{
    title: string;
    description: string;
    amount: string;
    currency: string;
    concept: string;
    submittedDate: string;
    exchangeRate: string;
    receiptFile: File;
  }>;
}

interface BulkSubmissionResponse {
  success: boolean;
  results: Array<{
    index: number;
    success: boolean;
    id?: string;
    error?: string;
  }>;
  totalSubmitted: number;
  totalFailed: number;
}
```

#### 4.2 Enhanced Extraction Endpoint
- Reuse existing `/api/expense-refunds/extract-receipt`
- Add support for batch processing metadata
- Implement rate limiting and queue management

### 5. Data Management

#### 5.1 State Management
```typescript
interface BulkExpenseRefundState {
  currentStep: 'upload' | 'extraction' | 'review' | 'confirmation';
  files: File[];
  extractedData: BulkExtractedData[];
  editedData: Map<string, Partial<ExpenseRefundForm>>;
  submissionResults: SubmissionResult[];
  loading: boolean;
  error: string | null;
}
```

#### 5.2 Form Validation
- Required field validation per expense refund
- Amount validation (positive numbers)
- Currency consistency checks
- Date format validation
- Concept selection validation

### 6. Performance Considerations

#### 6.1 File Handling
- Client-side file compression for large PDFs
- Lazy loading of file previews
- Memory management for multiple large files

#### 6.2 API Optimization
- Sequential AI extraction to respect rate limits
- Parallel submission of validated expense refunds
- Request cancellation support
- Retry logic for failed operations

#### 6.3 User Experience
- Optimistic UI updates where possible
- Background processing with progress feedback
- Auto-save draft functionality
- Session persistence for incomplete forms

### 7. Navigation Integration

#### 7.1 Navigation Updates
- Add "Bulk Submit" option to expense refunds dropdown
- Update navigation menu structure:
  ```typescript
  Expense Refunds -> {
    "My Expense Refunds" (current list),
    "Submit New" (single form),
    "Bulk Submit" (new bulk form)
  }
  ```

#### 7.2 Routing Structure
- `/expense-refunds/bulk` - Main bulk submission page
- Consistent with existing routing patterns

### 8. Security & Validation

#### 8.1 File Security
- Server-side file type validation
- Virus scanning for uploaded files
- Secure file storage and cleanup
- File size and count limits

#### 8.2 Data Validation
- Server-side validation for all extracted data
- SQL injection prevention
- XSS protection for file names and descriptions
- Rate limiting for bulk operations

### 9. Testing Strategy

#### 9.1 Unit Tests
- File upload component testing
- AI extraction data processing
- Form validation logic
- API endpoint testing

#### 9.2 Integration Tests
- End-to-end bulk submission workflow
- Error handling scenarios
- File processing pipeline
- API communication

#### 9.3 Performance Tests
- Large file upload handling
- Multiple file processing
- Concurrent user scenarios
- Memory usage optimization

### 10. Error Handling & Recovery

#### 10.1 Upload Errors
- Network interruption recovery
- File corruption handling
- Invalid file type guidance
- Size limit exceeded messaging

#### 10.2 Processing Errors
- AI extraction service failures
- Partial batch processing
- Data corruption detection
- Retry mechanisms

#### 10.3 Submission Errors
- Individual expense refund failures
- Network timeout handling
- Validation error recovery
- Partial success scenarios

### 11. Implementation Phases

#### Phase 1: Core Infrastructure
1. Create basic bulk upload component
2. Implement multi-file selection and preview
3. Set up routing and navigation
4. Create initial UI layout

#### Phase 2: AI Integration
1. Implement sequential file processing
2. Add progress tracking for extractions
3. Create extraction results interface
4. Handle extraction errors gracefully

#### Phase 3: Review & Edit
1. Build editable data table/grid
2. Implement individual item editing
3. Add bulk action capabilities
4. Create validation system

#### Phase 4: Submission & Polish
1. Implement bulk submission API
2. Add submission progress tracking
3. Handle submission errors
4. Add success/failure feedback
5. Performance optimization
6. Testing and bug fixes

### 12. Success Metrics
- Reduction in time to submit multiple expense refunds
- Increase in expense refund submission accuracy
- User adoption rate of bulk functionality
- Reduction in support tickets related to expense refunds

## Technical Dependencies
- Existing AI extraction service (N8N webhook)
- Current expense refund API infrastructure
- React-Select for dropdown components
- White Prompt design system
- NextAuth for authentication
- Existing Notion integration

## Constraints & Considerations
- Maintain consistency with existing single form UX
- Ensure mobile responsiveness
- Handle API rate limits gracefully
- Preserve existing functionality
- Follow established code patterns and architecture
