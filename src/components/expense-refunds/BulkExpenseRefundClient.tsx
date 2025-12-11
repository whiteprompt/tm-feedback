'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Select from 'react-select';
import ConceptSelect from '@/components/ConceptSelect';
import CurrencySelect from '@/components/CurrencySelect';
import ErrorBanner from '@/components/ErrorBanner';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { CURRENCIES, ExpenseRefundForm, ExtractedData } from '@/lib/constants';
import { twMerge } from 'tailwind-merge';
import FilePreviewModal from '@/components/FilePreviewModal';
import { useAdmin } from '@/contexts/AdminContext';
import Tooltip from '@/components/Tooltip';

interface ExtractedDataWithFile extends ExtractedData {
  fileId: string;
  fileName: string;
  status: 'pending' | 'extracting' | 'extracted' | 'error' | 'ready';
  errorMessage?: string;
  file: File;
  previewUrl?: string;
}

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  status: string;
}

interface BulkExpenseRefundForm extends ExpenseRefundForm {
  selected: boolean;
}

type WizardStep = 'upload' | 'extraction' | 'review' | 'confirmation';

export default function BulkExpenseRefundClient() {
  const { isAdmin } = useAdmin();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedDataWithFile[]>([]);
  const [formData, setFormData] = useState<BulkExpenseRefundForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [bulkTeamMember, setBulkTeamMember] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/expense-refunds/bulk')}`);
    }
  }, [status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set default bulk team member selection
  useEffect(() => {
    if (session?.user?.email && !bulkTeamMember) {
      setBulkTeamMember(session.user.email);
    }
  }, [session?.user?.email, bulkTeamMember]);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!session?.user?.email) return;

      setLoadingTeamMembers(true);
      try {
        const response = await fetch('/api/team-members');
        if (response.ok) {
          const data = await response.json();
          
          // Handle both error response and successful response
          if (data.error) {
            console.warn('API returned error:', data.message);
            setTeamMembers([]);
          } else if (Array.isArray(data)) {
            // Add computed name field for display
            const membersWithName = data.map((member: TeamMember) => ({
              ...member,
              name: member.name || `${member.lastName} ${member.firstName}`
            }));
            setTeamMembers(membersWithName);
          } else {
            console.warn('Unexpected data format:', data);
            setTeamMembers([]);
          }
        } else {
          console.warn('Failed to load team members, using current user as fallback');
          setTeamMembers([]);
        }
      } catch (error) {
        console.error('Error loading team members:', error);
        setTeamMembers([]);
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    fetchTeamMembers();
  }, [session?.user?.email]);

  // Track form changes
  useEffect(() => {
    setHasUnsavedChanges(formData.length > 0 || files.length > 0);
  }, [formData, files]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Cleanup object URLs
  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFilesUpload = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    let errorMessage = '';

    // Validate each file
    for (const file of fileArray) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        errorMessage = 'Please upload only PDF or image files (JPEG, JPG, PNG)';
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        errorMessage = 'File size must be less than 5MB';
        continue;
      }

      validFiles.push(file);
    }

    // Check total file limit
    if (files.length + validFiles.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }

    if (errorMessage) {
      setError(errorMessage);
    }

    if (validFiles.length > 0) {
      const previousFileCount = files.length;
      setFiles(prev => [...prev, ...validFiles]);
      setError('');
      
      // Automatically proceed to extraction if files are valid
      if (validFiles.length > 0) {
        setCurrentStep('extraction');
        // Only process the new files, starting from the previous file count
        startBatchExtraction([...files, ...validFiles], previousFileCount);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFilesUpload(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setExtractedData(prev => prev.filter(item => item.fileId !== index.toString()));
  };

  const removeExtractedItem = (fileIndex: number) => {
    // Remove from all related arrays
    setFiles(prev => prev.filter((_, i) => i !== fileIndex));
    setExtractedData(prev => prev.filter(item => item.fileId !== fileIndex.toString()));
    setFormData(prev => prev.filter((_, i) => i !== fileIndex));
  };

  const startOver = () => {
    // Reset all state to initial values
    setFiles([]);
    setExtractedData([]);
    setFormData([]);
    setCurrentStep('upload');
    setExtractionProgress({ current: 0, total: 0 });
    setError('');
    setHasUnsavedChanges(false);
  };

  const addMoreFiles = () => {
    // Go back to upload step but keep existing files
    setCurrentStep('upload');
  };

  const handleNavigation = (navigationFn: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowLeaveWarning(true);
    } else {
      navigationFn();
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowLeaveWarning(false);
  };

  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowLeaveWarning(false);
  };

  const startBatchExtraction = async (filesToProcess: File[], startIndex: number = 0) => {
    // Calculate how many new files to process
    const newFilesCount = filesToProcess.length - startIndex;
    setExtractionProgress({ current: 0, total: newFilesCount });
    
    // Preserve existing extracted data
    const existingExtractedData = startIndex > 0 ? extractedData : [];
    const newExtractedData: ExtractedDataWithFile[] = [...existingExtractedData];

    // Only process files from startIndex onwards
    for (let i = startIndex; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const fileId = i.toString();
      
      const extractedItem: ExtractedDataWithFile = {
        fileId,
        fileName: file.name,
        status: 'extracting',
        file,
        previewUrl: (() => {
          const url = URL.createObjectURL(file);
          objectUrlsRef.current.add(url);
          return url;
        })()
      };

      newExtractedData.push(extractedItem);
      setExtractedData([...newExtractedData]);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        const response = await fetch('/api/expense-refunds/extract-receipt', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          // Handle failed extraction gracefully without throwing
          newExtractedData[i] = {
            ...extractedItem,
            status: 'error',
            errorMessage: 'Failed to extract receipt data'
          };
          continue; // Skip to next file
        }

        const extractedInfo = await response.json();
        
        const mappedData: ExtractedData = {
          amount: extractedInfo.output?.totalPrice || '',
          vendor: extractedInfo.output?.store || '',
          description: extractedInfo.output?.store || '',
          tax: (extractedInfo.output?.tax && extractedInfo.output.tax !== 'null') ? extractedInfo.output.tax : '0',
          currency: extractedInfo.output?.currency || '',
          concept: extractedInfo.output?.concept || '',
          exchangeRate: extractedInfo.output?.exchangeRate || '1',
          date: extractedInfo.output?.date || ''
        };

        newExtractedData[i] = {
          ...extractedItem,
          ...mappedData,
          status: 'extracted'
        };

      } catch {
        // Handle any other errors (network issues, JSON parsing, etc.)
        newExtractedData[i] = {
          ...extractedItem,
          status: 'error',
          errorMessage: 'Failed to extract receipt data'
        };
        // Silently handle the error - UI will show error status
      }

      setExtractionProgress({ current: i - startIndex + 1, total: newFilesCount });
      setExtractedData([...newExtractedData]);

      // Small delay to respect API limits
      if (i < filesToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Helper function to map extracted currency to valid currency codes
    const mapCurrency = (extractedCurrency: string | undefined): string => {
      if (!extractedCurrency) return 'USD';
      
      const currency = extractedCurrency.toUpperCase().trim();
      
      // Direct currency code matches
      const validCurrencies = CURRENCIES.map(c => c.value);
      if (validCurrencies.includes(currency)) {
        return currency;
      }
      
      // Currency symbol and name mappings
      const currencyMappings: Record<string, string> = {
        'R$': 'BRL',
        'REAL': 'BRL',
        'REAIS': 'BRL',
        'BRAZILIAN REAL': 'BRL',
        '$': 'USD',
        'DOLLAR': 'USD',
        'DOLLARS': 'USD',
        'US DOLLAR': 'USD',
        '€': 'EUR',
        'EURO': 'EUR',
        'EUROS': 'EUR',
        '£': 'GBP',
        'POUND': 'GBP',
        'POUNDS': 'GBP',
        'BRITISH POUND': 'GBP',
        'PESO': 'ARS',
        'PESOS': 'ARS',
        'ARGENTINE PESO': 'ARS',
        'CAD$': 'CAD',
        'CANADIAN DOLLAR': 'CAD',
        'AUD$': 'AUD',
        'AUSTRALIAN DOLLAR': 'AUD'
      };
      
      return currencyMappings[currency] || 'USD';
    };

    // Helper function to get exchange rate for currency
    const getExchangeRateForCurrency = async (currency: string): Promise<string> => {
      if (currency === 'USD') return '1';
      
      try {
        const response = await fetch('/api/exchange-rates');
        if (response.ok) {
          const data = await response.json();
          const rate = data.rates[currency];
          return rate ? rate.toString() : '1';
        }
      } catch (error) {
        console.error('Error fetching exchange rate for', currency, ':', error);
      }
      return '1';
    };

    // Helper function to validate and format date
    const validateDate = (dateString: string | undefined): string => {
      if (!dateString || dateString.trim() === '') return '';
      
      // Check if it's a placeholder like "dd/mm/yyyy" or similar
      const placeholderPatterns = [
        /^dd\/mm\/yyyy$/i,
        /^mm\/dd\/yyyy$/i,
        /^yyyy\/mm\/dd$/i,
        /^dd-mm-yyyy$/i,
        /^mm-dd-yyyy$/i,
        /^yyyy-mm-dd$/i
      ];
      
      if (placeholderPatterns.some(pattern => pattern.test(dateString.trim()))) {
        return '';
      }
      
      // Try to parse the date to check if it's valid
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return '';
      }
      
      // Return the date in YYYY-MM-DD format for the input field
      return parsedDate.toISOString().split('T')[0];
    };

    // Convert extracted data to form data with proper exchange rates
    const newFormData: BulkExpenseRefundForm[] = await Promise.all(
      newExtractedData.map(async (item) => {
        const currency = mapCurrency(item.currency);
        
        // Always fetch the correct exchange rate for non-USD currencies
        // Don't trust the extracted exchange rate as it might be incorrect
        let exchangeRate = '1';
        if (currency !== 'USD') {
          exchangeRate = await getExchangeRateForCurrency(currency);
        }
        
        // Validate the date - use empty string if invalid
        const validatedDate = validateDate(item.date);
        
        return {
          title: item.vendor || '',
          description: item.vendor || '',
          amount: item.amount || '',
          currency: currency,
          concept: item.concept || '',
          submittedDate: validatedDate || new Date().toISOString().split('T')[0],
          exchangeRate: exchangeRate,
          selected: item.status === 'extracted',
          teamMemberEmail: session?.user?.email || ''
        };
      })
    );

    setFormData(newFormData);
    setCurrentStep('review');
  };

  const updateFormItem = async (index: number, field: keyof BulkExpenseRefundForm, value: string | boolean) => {
    // If currency is being changed, also update the exchange rate
    if (field === 'currency' && typeof value === 'string') {
      let exchangeRate = '1';
      
      if (value !== 'USD') {
        try {
          const response = await fetch('/api/exchange-rates');
          if (response.ok) {
            const data = await response.json();
            const rate = data.rates[value];
            exchangeRate = rate ? rate.toString() : '1';
          }
        } catch (error) {
          console.error('Error fetching exchange rate for', value, ':', error);
        }
      }
      
      setFormData(prev => prev.map((item, i) => 
        i === index ? { ...item, [field]: value, exchangeRate: exchangeRate } : item
      ));
    } else {
      setFormData(prev => prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ));
    }
  };

  const selectAllItems = () => {
    setFormData(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const selectNoneItems = () => {
    setFormData(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const deleteSelectedItems = () => {
    const selectedIndices = formData
      .map((item, idx) => item.selected ? idx : -1)
      .filter(idx => idx !== -1);
    
    setFormData(prev => prev.filter((_, idx) => !selectedIndices.includes(idx)));
    setExtractedData(prev => prev.filter((_, idx) => !selectedIndices.includes(idx)));
    setFiles(prev => prev.filter((_, idx) => !selectedIndices.includes(idx)));
  };

  const handleBulkSubmission = async () => {
    setLoading(true);
    setError('');

    const itemsToSubmit = formData
      .map((item, i) => ({ ...item, file: extractedData[i]?.file }))
      .filter(item => item.selected && item.file);

    if (itemsToSubmit.length === 0) {
      setError('No items selected for submission');
      setLoading(false);
      return;
    }

    try {
      // Create individual form submissions using Promise.all for parallel processing
      const submissionPromises = itemsToSubmit.map(async (item) => {
        const formDataToSend = new FormData();
        formDataToSend.append('title', item.title);
        formDataToSend.append('description', item.description || '');
        formDataToSend.append('amount', item.amount);
        formDataToSend.append('currency', item.currency);
        formDataToSend.append('concept', item.concept);
        formDataToSend.append('submittedDate', item.submittedDate);
        formDataToSend.append('exchangeRate', item.exchangeRate);
        formDataToSend.append('userEmail', item.teamMemberEmail || session?.user?.email || '');
        
        if (item.file) {
          formDataToSend.append('receipt', item.file);
        }

        const response = await fetch('/api/expense-refunds', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to submit ${item.title}`);
        }

        return await response.json();
      });

      // Wait for all submissions to complete
      await Promise.all(submissionPromises);

      // Reset form and clear unsaved changes flag
      setFiles([]);
      setExtractedData([]);
      setFormData([]);
      setHasUnsavedChanges(false);
      
      // Redirect to expense refunds list without warning
      router.push('/expense-refunds');
    } catch (error) {
      setError(`Failed to submit expense refunds: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error submitting bulk expense refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const navigationFn = () => {
      if (currentStep === 'extraction') {
        setCurrentStep('upload');
      } else if (currentStep === 'review') {
        setCurrentStep('extraction');
      } else if (currentStep === 'confirmation') {
        setCurrentStep('review');
      }
    };
    
    handleNavigation(navigationFn);
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Validation function to check if all selected items have required fields
  const validateSelectedItems = () => {
    const selectedItems = formData.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      return { isValid: false, message: 'No items selected' };
    }

    const invalidItems = selectedItems.filter(item => {
      // Check if title is empty or only whitespace
      const hasTitle = item.title && item.title.trim().length > 0;
      
      // Check if amount is empty, zero, or invalid
      const hasAmount = item.amount && item.amount.trim().length > 0 && parseFloat(item.amount) > 0;
      
      // Check if exchange rate is empty or invalid
      const hasExchangeRate = item.exchangeRate && item.exchangeRate.trim().length > 0 && parseFloat(item.exchangeRate) > 0;
      
      // Check if date is empty
      const hasDate = item.submittedDate && item.submittedDate.trim().length > 0;
      
      // Check if concept is empty
      const hasConcept = item.concept && item.concept.trim().length > 0;
      
      return !hasTitle || !hasAmount || !hasExchangeRate || !hasDate || !hasConcept;
    });

    if (invalidItems.length > 0) {
      return { 
        isValid: false, 
        message: `${invalidItems.length} selected item${invalidItems.length > 1 ? 's' : ''} ${invalidItems.length > 1 ? 'are' : 'is'} missing required fields (title, amount, exchange rate, date, or concept)` 
      };
    }

    return { isValid: true, message: '' };
  };

  if (status === 'loading' || !isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="wp-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`
                border-wp-primary/30 border-t-wp-primary h-16 w-16 animate-spin
                rounded-full border-4
              `}></div>
            </div>
            <p className="wp-body text-wp-text-secondary">Loading your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div>
      <main className="wp-section-sm">
        <div className="wp-container h-full">
          {/* Header */}
          <div className={`
            wp-fade-in mb-16 flex flex-col gap-6
            sm:flex-row sm:items-center sm:justify-between
          `}>
            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              <div className={`
                flex items-center space-x-2
                ${currentStep === 'upload' ? `text-wp-primary` : ['extraction', 'review', 'confirmation'].includes(currentStep) ? `
                  text-green-400
                ` : `text-wp-text-muted`}
              `}>
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full border-2
                  text-sm font-medium
                  ${currentStep === 'upload' ? `
                    border-wp-primary bg-wp-primary/20
                  ` : ['extraction', 'review', 'confirmation'].includes(currentStep) ? `
                    border-green-400 bg-green-400/20
                  ` : `border-wp-text-muted`}
                `}>
                  {['extraction', 'review', 'confirmation'].includes(currentStep) ? '✓' : '1'}
                </div>
                <span className="wp-body-small font-medium">Upload</span>
              </div>
              
              <div className={`
                h-0.5 w-8
                ${['extraction', 'review', 'confirmation'].includes(currentStep) ? `
                  bg-green-400
                ` : `bg-wp-text-muted/30`}
              `}></div>
              
              <div className={`
                flex items-center space-x-2
                ${currentStep === 'extraction' ? `text-wp-primary` : ['review', 'confirmation'].includes(currentStep) ? `
                  text-green-400
                ` : `text-wp-text-muted`}
              `}>
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full border-2
                  text-sm font-medium
                  ${currentStep === 'extraction' ? `
                    border-wp-primary bg-wp-primary/20
                  ` : ['review', 'confirmation'].includes(currentStep) ? `
                    border-green-400 bg-green-400/20
                  ` : `border-wp-text-muted`}
                `}>
                  {['review', 'confirmation'].includes(currentStep) ? '✓' : '2'}
                </div>
                <span className="wp-body-small font-medium">Extract</span>
              </div>
              
              <div className={`
                h-0.5 w-8
                ${['review', 'confirmation'].includes(currentStep) ? `
                  bg-green-400
                ` : `bg-wp-text-muted/30`}
              `}></div>
              
              <div className={`
                flex items-center space-x-2
                ${currentStep === 'review' ? `text-wp-primary` : currentStep === 'confirmation' ? `
                  text-green-400
                ` : `text-wp-text-muted`}
              `}>
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full border-2
                  text-sm font-medium
                  ${currentStep === 'review' ? `
                    border-wp-primary bg-wp-primary/20
                  ` : currentStep === 'confirmation' ? `
                    border-green-400 bg-green-400/20
                  ` : `border-wp-text-muted`}
                `}>
                  {currentStep === 'confirmation' ? '✓' : '3'}
                </div>
                <span className="wp-body-small font-medium">Review</span>
              </div>
              
              <div className={`
                h-0.5 w-8
                ${currentStep === 'confirmation' ? `bg-green-400` : `
                  bg-wp-text-muted/30
                `}
              `}></div>
              
              <div className={`
                flex items-center space-x-2
                ${currentStep === 'confirmation' ? `text-wp-primary` : `
                  text-wp-text-muted
                `}
              `}>
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full border-2
                  text-sm font-medium
                  ${currentStep === 'confirmation' ? `
                    border-wp-primary bg-wp-primary/20
                  ` : `border-wp-text-muted`}
                `}>
                  4
                </div>
                <span className="wp-body-small font-medium">Submit</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="wp-card p-8">
            {/* Upload Step */}
            {currentStep === 'upload' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Upload Receipts</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    Upload up to 10 PDF receipts for bulk processing. We&apos;ll automatically extract information from each receipt.
                  </p>
                </div>

                <div className="mx-auto max-w-2xl">
                  <div className={`
                    border-wp-border relative rounded-lg border-2 border-dashed
                    p-8 text-center transition-colors duration-300
                    hover:border-wp-primary/50
                  `}>
                    <div className="space-y-4">
                      <div className={`
                        bg-wp-primary/20 mx-auto flex h-16 w-16 items-center
                        justify-center rounded-full
                      `}>
                        <svg className="text-wp-primary h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <div>
                        <p className="wp-body text-wp-text-primary mb-2">Drop your receipts here or click to browse</p>
                        <p className="wp-body-small text-wp-text-muted">PDF or image files (JPEG, PNG) up to 5MB each, maximum 10 files</p>
                      </div>
                      
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        multiple
                        onChange={handleFileChange}
                        className={`
                          absolute inset-0 h-full w-full cursor-pointer
                          opacity-0
                        `}
                      />
                    </div>
                  </div>
                  
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="wp-body text-wp-text-primary font-semibold">Selected Files ({files.length}/10)</h3>
                      {files.map((file, fileIndex) => (
                        <div key={fileIndex} className={`
                          bg-wp-dark-card/60 border-wp-border flex items-center
                          justify-between rounded-lg border p-3
                        `}>
                          <div className="flex items-center space-x-3">
                            <div className={`
                              flex h-8 w-8 items-center justify-center rounded
                              bg-red-500/20
                            `}>
                              <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                            </div>
                            <div>
                              <p className={`
                                wp-body-small text-wp-text-primary font-medium
                              `}>{file.name}</p>
                              <p className="wp-body-small text-wp-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(fileIndex)}
                            className={`
                              text-wp-text-muted p-1 transition-colors
                              duration-300
                              hover:text-red-400
                            `}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Navigation Buttons - Show when there are extracted files */}
                  {extractedData.length > 0 && (
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={startOver}
                        className={`
                          wp-button-secondary flex-1 px-4 py-3 transition-all
                          duration-300
                          hover:scale-105
                        `}
                      >
                        Start Over
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('review')}
                        className={`
                          wp-button-primary flex-1 px-4 py-3 transition-all
                          duration-300
                          hover:scale-105
                        `}
                      >
                        Continue to Review ({extractedData.filter(item => item.status === 'extracted').length} ready)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extraction Step */}
            {currentStep === 'extraction' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Extracting Receipt Data</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    Processing your receipts with AI to extract expense information...
                  </p>
                </div>

                <div className="mx-auto max-w-2xl space-y-6">
                  {/* Overall Progress */}
                  <div className={`
                    bg-wp-dark-card/60 border-wp-border rounded-lg border p-6
                  `}>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="wp-body text-wp-text-primary font-medium">
                        Processing {extractionProgress.current} of {extractionProgress.total} files
                      </span>
                      <span className="wp-body-small text-wp-text-muted">
                        {Math.round((extractionProgress.current / extractionProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="bg-wp-dark-primary h-2 w-full rounded-full">
                      <div 
                        className={`
                          bg-wp-primary h-2 rounded-full transition-all
                          duration-300
                        `}
                        style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Individual File Status */}
                  <div className="space-y-3">
                    {extractedData.map((item) => (
                      <div key={item.fileId} className={`
                        bg-wp-dark-card/60 border-wp-border flex items-center
                        justify-between rounded-lg border p-4
                      `}>
                        <div className="flex items-center space-x-3">
                          <div className={`
                            flex h-8 w-8 items-center justify-center
                            rounded-full
                            ${
                            item.status === 'extracted' ? `
                              bg-green-400/20 text-green-400
                            ` :
                            item.status === 'error' ? `
                              bg-red-400/20 text-red-400
                            ` :
                            'bg-wp-primary/20 text-wp-primary'
                          }
                          `}>
                            {item.status === 'extracted' ? '✓' : 
                             item.status === 'error' ? '✕' : 
                             <div className={`
                               h-4 w-4 animate-spin rounded-full border-2
                               border-current border-t-transparent
                             `}></div>}
                          </div>
                          <div>
                            <p className={`
                              wp-body-small text-wp-text-primary font-medium
                            `}>{item.fileName}</p>
                            <p className="wp-body-small text-wp-text-muted">
                              {item.status === 'extracted' ? 'Extraction completed' :
                               item.status === 'error' ? item.errorMessage || 'Extraction failed' :
                               'Processing...'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Remove button - only show after processing is complete or failed */}
                        {(item.status === 'extracted' || item.status === 'error') && (
                          <button
                            type="button"
                            onClick={() => removeExtractedItem(parseInt(item.fileId))}
                            className={`
                              text-wp-text-muted p-2 transition-colors
                              duration-300
                              hover:text-red-400
                            `}
                            title="Remove this receipt"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-6">
                    <button
                      type="button"
                      onClick={startOver}
                      className={`
                        wp-button-secondary flex-1 px-4 py-3 transition-all
                        duration-300
                        hover:scale-105
                      `}
                    >
                      Start Over
                    </button>
                    
                    {extractionProgress.current === extractionProgress.total && files.length < 10 && (
                      <button
                        type="button"
                        onClick={addMoreFiles}
                        className={`
                          wp-button-secondary flex-1 px-4 py-3 transition-all
                          duration-300
                          hover:scale-105
                        `}
                      >
                        Add More Files
                      </button>
                    )}
                    
                    {extractionProgress.current === extractionProgress.total && extractedData.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep('review')}
                        className={`
                          wp-button-primary flex-1 px-4 py-3 transition-all
                          duration-300
                          hover:scale-105
                        `}
                      >
                        Review Data ({extractedData.filter(item => item.status === 'extracted').length} ready)
                      </button>
                    )}
                  </div>

                  {/* Progress status message */}
                  {extractionProgress.current === extractionProgress.total && extractedData.length === 0 && (
                    <div className="pt-4 text-center">
                      <p className="wp-body text-wp-text-muted">No receipts remaining. Click &quot;Start Over&quot; to upload new files.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Review & Edit Data</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    Review the extracted information and make any necessary corrections.
                  </p>
                </div>

                {/* Error Banner */}
                {error && <ErrorBanner error={error} onDismiss={() => setError('')} />}

                {/* Bulk Team Member Application */}
                {isAdmin && (
                  <div className={`
                    bg-wp-dark-card/60 border-wp-border w-[70%] rounded-lg
                    border p-4
                  `}>
                    <h3 className="wp-body text-wp-primary mb-3 font-medium">Bulk Apply Team Member</h3>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className={`
                          wp-body-small text-wp-text-secondary mb-2 block
                        `}>
                          Select team member to apply to all checked expenses
                        </label>
                        <Select
                          value={teamMembers.length > 0 ? 
                            teamMembers.find(member => member.email === bulkTeamMember) ? 
                              { value: bulkTeamMember, label: teamMembers.find(member => member.email === bulkTeamMember)?.name || bulkTeamMember } : 
                              { value: bulkTeamMember, label: bulkTeamMember === session?.user?.email ? 'Me' : bulkTeamMember } : 
                            { value: bulkTeamMember, label: 'Me' }
                          }
                          onChange={(selected) => {
                            if (selected) {
                              setBulkTeamMember(selected.value);
                            }
                          }}
                          options={(() => {
                            const options = [
                              { value: session?.user?.email || '', label: 'Me' },
                              ...teamMembers.map(member => ({
                                value: member.email,
                                label: `${member.name || `${member.lastName} ${member.firstName}`} (${member.email})`
                              }))
                            ];
                            return options;
                          })()}
                          placeholder={loadingTeamMembers ? "Loading team members..." : "Select team member"}
                          isLoading={loadingTeamMembers}
                          className="basic-single"
                          classNamePrefix="select"
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: 'rgba(26, 26, 46, 0.6)',
                              borderColor: 'rgba(64, 75, 104, 0.3)',
                              minHeight: '40px',
                            }),
                            singleValue: (base) => ({ ...base, color: '#E2E8F0' }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: 'rgba(26, 26, 46, 0.95)',
                              zIndex: 50
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused ? '#00A3B4' : 'transparent',
                              color: '#E2E8F0'
                            })
                          }}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                          menuPosition="fixed"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => prev.map(item => 
                            item.selected ? { ...item, teamMemberEmail: bulkTeamMember } : item
                          ));
                        }}
                        className={twMerge('wp-button-primary','transition-all',`
                          duration-300
                        `,`hover:scale-105`)}
                      >
                        Apply to Selected
                      </button>
                    </div>
                  </div>
                )}

                {/* Bulk Actions Links */}
                <div className={`
                  border-wp-border mb-4 flex items-center justify-end gap-4
                  border-b px-1 pb-4
                `}>
                  <button
                    type="button"
                    onClick={selectAllItems}
                    className={`
                      text-wp-primary cursor-pointer text-sm font-medium
                      transition-colors
                      hover:text-wp-primary/80
                    `}
                  >
                    Select All
                  </button>
                  <div className="bg-wp-border h-4 w-px"></div>
                  <button
                    type="button"
                    onClick={selectNoneItems}
                    className={`
                      text-wp-text-secondary cursor-pointer text-sm font-medium
                      transition-colors
                      hover:text-wp-text-primary
                    `}
                  >
                    Select None
                  </button>
                  <div className="bg-wp-border h-4 w-px"></div>
                  <button
                    type="button"
                    onClick={deleteSelectedItems}
                    className={`
                      cursor-pointer text-sm font-medium text-red-400
                      transition-colors
                      hover:text-red-300
                    `}
                  >
                    Delete Selected
                  </button>
                </div>

                {/* Data Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-wp-border border-b">
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Select</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Status</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>File</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Title</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Date</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Amount</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Currency</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Exchange Rate</th>
                        <th className={`
                          wp-body-small text-wp-text-muted p-3 text-left
                          tracking-wider uppercase
                        `}>Concept</th>
                        {isAdmin && (
                          <th className={`
                            wp-body-small text-wp-text-muted p-3 text-left
                            tracking-wider uppercase
                          `}>Team Member</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.map((item, index) => (
                        <tr key={index} className="border-wp-border/50 border-b">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => updateFormItem(index, 'selected', e.target.checked)}
                              className={`
                                text-wp-primary border-wp-border h-4 w-4 rounded
                                bg-transparent
                                focus:ring-wp-primary
                              `}
                            />
                          </td>
                          <td className="p-3">
                            <div className={`
                              wp-body-small inline-flex items-center
                              rounded-full px-2 py-1
                              ${
                              extractedData[index]?.status === 'extracted' ? `
                                bg-green-400/20 text-green-400
                              ` :
                              extractedData[index]?.status === 'error' ? `
                                bg-red-400/20 text-red-400
                              ` :
                              'bg-wp-primary/20 text-wp-primary'
                            }
                            `}>
                              {extractedData[index]?.status === 'extracted' ? 'Ready' :
                               extractedData[index]?.status === 'error' ? 'Error' :
                               'Processing'}
                            </div>
                          </td>
                          <td className="p-3">
                            <Tooltip content={extractedData[index]?.fileName || ''}>
                              <button
                                type="button"
                                onClick={() => {
                                  const fileData = extractedData[index];
                                  if (fileData?.previewUrl) {
                                    setPreviewFile({
                                      url: fileData.previewUrl,
                                      name: fileData.fileName
                                    });
                                  }
                                }}
                                className={`
                                  hover:bg-wp-primary/20 hover:text-wp-primary
                                  flex h-8 w-8 items-center justify-center
                                  rounded text-white transition-colors
                                `}
                                title="Click to preview file"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </Tooltip>
                          </td>
                          <td className="p-3">
                            <Tooltip content={item.title}>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateFormItem(index, 'title', e.target.value)}
                                className={`
                                  border-wp-border w-full min-w-[180px] rounded
                                  border bg-transparent px-2 py-1 text-white
                                  focus:ring-wp-primary focus:ring-1
                                  focus:outline-none
                                `}
                              />
                            </Tooltip>
                          </td>
                          <td className="p-3">
                            <input
                              type="date"
                              value={item.submittedDate}
                              onChange={(e) => updateFormItem(index, 'submittedDate', e.target.value)}
                              className={`
                                border-wp-border bg-wp-dark-secondary
                                text-wp-text-primary w-full rounded border px-2
                                py-1
                                [color-scheme:dark]
                                focus:ring-wp-primary focus:ring-1
                                focus:outline-none
                              `}
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) => updateFormItem(index, 'amount', e.target.value)}
                              className={`
                                border-wp-border w-full min-w-[120px] rounded
                                border bg-transparent px-2 py-1 text-white
                                focus:ring-wp-primary focus:ring-1
                                focus:outline-none
                              `}
                            />
                          </td>
                          <td className="p-3">
                            <div className="min-w-32">
                              <CurrencySelect
                                value={item.currency}
                                onChange={(value) => updateFormItem(index, 'currency', value)}
                                placeholder="Currency"
                                showQuickButtons={false}
                                compact={true}
                                usePortal={true}
                                className="text-sm"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              value={item.exchangeRate}
                              onChange={(e) => updateFormItem(index, 'exchangeRate', e.target.value)}
                              className={`
                                border-wp-border w-full rounded border
                                bg-transparent px-2 py-1 text-white
                                focus:ring-wp-primary focus:ring-1
                                focus:outline-none
                              `}
                            />
                          </td>
                          <td className="p-3">
                            <div className="min-w-48">
                              <ConceptSelect
                                value={item.concept}
                                onChange={(value) => updateFormItem(index, 'concept', value)}
                                placeholder="Select concept"
                                showQuickButtons={false}
                                usePortal={true}
                                className="text-sm"
                              />
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="p-3">
                              <div className="min-w-48">
                                  <Select
                                    value={(() => {
                                      if (teamMembers.length > 0) {
                                        const member = teamMembers.find(m => m.email === item.teamMemberEmail);
                                        if (member) {
                                          return { value: member.email, label: member.name || `${member.lastName} ${member.firstName}` };
                                        }
                                      }
                                      return { 
                                        value: item.teamMemberEmail, 
                                        label: item.teamMemberEmail === session?.user?.email ? 'Me' : item.teamMemberEmail 
                                      };
                                    })()}
                                    onChange={(selected) => {
                                      if (selected) {
                                        updateFormItem(index, 'teamMemberEmail', selected.value);
                                      }
                                    }}
                                    options={[
                                      { value: session?.user?.email || '', label: 'Me' },
                                      ...teamMembers.map(member => ({
                                        value: member.email,
                                        label: `${member.name || `${member.lastName} ${member.firstName}`}`
                                      }))
                                    ]}
                                    placeholder={loadingTeamMembers ? "Loading..." : "Select"}
                                    isLoading={loadingTeamMembers}
                                    className="basic-single"
                                    classNamePrefix="select"
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        backgroundColor: 'rgba(26, 26, 46, 0.6)',
                                        borderColor: 'rgba(64, 75, 104, 0.3)',
                                        minHeight: '32px',
                                        fontSize: '14px'
                                      }),
                                      singleValue: (base) => ({ ...base, color: '#E2E8F0' }),
                                      menu: (base) => ({
                                        ...base,
                                        backgroundColor: 'rgba(26, 26, 46, 0.95)',
                                        zIndex: 50
                                      }),
                                      option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? '#00A3B4' : 'transparent',
                                        color: '#E2E8F0'
                                      })
                                    }}
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                    menuPosition="fixed"
                                  />
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('extraction')}
                    className={twMerge('wp-button-secondary','flex-1')}
                  >
                    Back to Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const validation = validateSelectedItems();
                      if (validation.isValid) {
                        setError('');
                        setCurrentStep('confirmation');
                      } else {
                        setError(validation.message);
                      }
                    }}
                    className={twMerge('wp-button-primary','flex-1',`
                      transition-all
                    `,`duration-300`,`hover:scale-105`)}
                  >
                    Continue to Confirmation
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Confirm Submission</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    Review your expense refunds before final submission.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className={`
                    bg-wp-dark-card/60 border-wp-border rounded-lg border p-6
                  `}>
                    <h3 className={`
                      wp-body text-wp-text-primary mb-4 font-semibold
                    `}>Submission Summary</h3>
                    
                    {/* Team Member Distribution */}
                    {isAdmin && (
                      <div className={`
                        bg-wp-primary/10 border-wp-primary/30 mb-6 rounded-lg
                        border p-4
                      `}>
                        <div className="mb-4 flex items-center space-x-3">
                          <svg className="text-wp-primary h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="wp-body text-wp-primary font-medium">Team Member Distribution</p>
                        </div>
                        <div className={`
                          grid grid-cols-1 gap-4
                          sm:grid-cols-2
                        `}>
                          {(() => {
                            const selectedItems = formData.filter(item => item.selected);
                            const groupedByTeamMember = selectedItems.reduce((acc, item) => {
                              const email = item.teamMemberEmail;
                              if (!acc[email]) {
                                acc[email] = { count: 0, totalAmount: 0 };
                              }
                              acc[email].count += 1;
                              const amount = parseFloat(item.amount) || 0;
                              const exchangeRate = parseFloat(item.exchangeRate) || 1;
                              acc[email].totalAmount += amount / exchangeRate;
                              return acc;
                            }, {} as Record<string, { count: number; totalAmount: number }>);

                            return Object.entries(groupedByTeamMember).map(([email, stats]) => {
                              const isCurrentUser = email === session?.user?.email;
                              const member = teamMembers.find(m => m.email === email);
                              const displayName = isCurrentUser ? 'Me' : 
                                (member ? (member.name || `${member.lastName} ${member.firstName}`) : email);

                              return (
                                <div key={email} className={`
                                  bg-wp-dark-card/40 flex items-center
                                  justify-between rounded-lg p-3
                                `}>
                                  <div>
                                    <p className={`
                                      wp-body-small text-wp-text-primary
                                      font-medium
                                    `}>{displayName}</p>
                                    <p className={`
                                      wp-body-small text-wp-text-muted
                                    `}>{stats.count} expense{stats.count !== 1 ? 's' : ''}</p>
                                  </div>
                                  <p className={`
                                    wp-body-small text-wp-primary font-medium
                                  `}>
                                    ${formatAmount(stats.totalAmount)}
                                  </p>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    <div className={`
                      grid gap-4
                      md:grid-cols-3
                    `}>
                      <div className="text-center">
                        <p className="wp-heading-2 text-wp-primary">{formData.filter(item => item.selected).length}</p>
                        <p className="wp-body-small text-wp-text-muted">Items to Submit</p>
                      </div>
                      <div className="text-center">
                        <p className="wp-heading-2 text-green-400">
                          {formatAmount(formData.filter(item => item.selected && item.amount).reduce((sum, item) => {
                            const amount = parseFloat(item.amount || '0');
                            const exchangeRate = parseFloat(item.exchangeRate || '1');
                            return sum + (amount / exchangeRate);
                          }, 0))}
                        </p>
                        <p className="wp-body-small text-wp-text-muted">Total Amount (USD)</p>
                      </div>
                      <div className="text-center">
                        <p className="wp-heading-2 text-wp-text-primary">{extractedData.filter(item => item.status === 'extracted').length}</p>
                        <p className="wp-body-small text-wp-text-muted">Successfully Extracted</p>
                      </div>
                    </div>
                  </div>

                  {/* Items to be submitted */}
                  <div className="space-y-3">
                    <h3 className="wp-body text-wp-text-primary font-semibold">Items to be submitted:</h3>
                    {formData.map((item, itemIndex) => 
                      item.selected && (
                        <div key={itemIndex} className={`
                          bg-wp-dark-card/60 border-wp-border rounded-lg border
                          p-4
                        `}>
                          <div className={`
                            grid gap-4
                            md:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-7
                          `}>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Title</p>
                              <p className="wp-body text-wp-text-primary">{item.title}</p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Date</p>
                              <p className="wp-body text-wp-text-primary">{new Date(item.submittedDate).toLocaleDateString('en-US')}</p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Original Amount</p>
                              <p className="wp-body text-wp-text-primary">{formatAmount(item.amount)} {item.currency}</p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Amount USD</p>
                              <p className="wp-body text-wp-text-primary">
                                ${formatAmount((parseFloat(item.amount || '0') / parseFloat(item.exchangeRate || '1')))}
                              </p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Exchange Rate</p>
                              <p className="wp-body text-wp-text-primary">{item.exchangeRate}</p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Concept</p>
                              <p className="wp-body text-wp-text-primary">{item.concept || 'Not selected'}</p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Team Member</p>
                              <p className="wp-body text-wp-text-primary">
                                {(() => {
                                  const isCurrentUser = item.teamMemberEmail === session?.user?.email;
                                  if (isCurrentUser) return 'Me';
                                  
                                  const member = teamMembers.find(m => m.email === item.teamMemberEmail);
                                  return member ? 
                                    (member.name || `${member.lastName} ${member.firstName}`) : 
                                    item.teamMemberEmail;
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={goBack}
                      className={twMerge('wp-button-secondary','flex-1')}
                    >
                      Back to Review
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkSubmission}
                      disabled={loading || formData.filter(item => item.selected).length === 0}
                      className={`
                        wp-button-primary flex flex-1 items-center
                        justify-center space-x-2 px-4 py-3 transition-all
                        duration-300
                        hover:scale-105
                        disabled:cursor-not-allowed disabled:opacity-50
                      `}
                    >
                      {loading ? (
                        <>
                          <div className={`
                            h-5 w-5 animate-spin rounded-full border-2
                            border-white border-t-transparent
                          `}></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          Submit All Expense Refunds
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            <ErrorBanner 
              error={error} 
              onDismiss={() => setError('')}
              title="Error submitting bulk expense refunds"
              variant="warning"
            />
          </div>
        </div>
      </main>

      {/* Navigation Warning Dialog */}
      <ConfirmationModal
        isOpen={showLeaveWarning}
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        title="You have unsaved changes"
        message="Are you sure you want to leave? Your progress will be lost."
        confirmLabel="Leave"
        cancelLabel="Cancel"
        variant="warning"
      />
      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name || ''}
      />
    </div>
  );
}