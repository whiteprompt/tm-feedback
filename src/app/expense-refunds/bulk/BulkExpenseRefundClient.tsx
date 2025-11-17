'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Select from 'react-select';
import Navigation from '@/components/Navigation';
import ConceptSelect from '@/components/ConceptSelect';
import CurrencySelect from '@/components/CurrencySelect';
import ErrorBanner from '@/components/ErrorBanner';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { CURRENCIES, ExpenseRefundForm, ExtractedData } from '@/lib/constants';

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
  useEffect(() => {
    return () => {
      extractedData.forEach(item => {
        if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [extractedData]);

  const handleFilesUpload = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    let errorMessage = '';

    // Validate each file
    for (const file of fileArray) {
      if (!['application/pdf'].includes(file.type)) {
        errorMessage = 'Please upload only PDF files';
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
      setFiles(prev => [...prev, ...validFiles]);
      setError('');
      
      // Automatically proceed to extraction if files are valid
      if (validFiles.length > 0) {
        setCurrentStep('extraction');
        startBatchExtraction([...files, ...validFiles]);
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

  const startBatchExtraction = async (filesToProcess: File[]) => {
    setExtractionProgress({ current: 0, total: filesToProcess.length });
    const newExtractedData: ExtractedDataWithFile[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const fileId = i.toString();
      
      const extractedItem: ExtractedDataWithFile = {
        fileId,
        fileName: file.name,
        status: 'extracting',
        file,
        previewUrl: URL.createObjectURL(file)
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
          throw new Error('Failed to extract receipt data');
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
          date: ''
        };

        newExtractedData[i] = {
          ...extractedItem,
          ...mappedData,
          status: 'extracted'
        };

      } catch (error) {
        newExtractedData[i] = {
          ...extractedItem,
          status: 'error',
          errorMessage: 'Failed to extract receipt data'
        };
        console.error(`Error extracting ${file.name}:`, error);
      }

      setExtractionProgress({ current: i + 1, total: filesToProcess.length });
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
        
        return {
          title: item.vendor || '',
          description: item.vendor || '',
          amount: item.amount || '',
          currency: currency,
          concept: item.concept || '',
          submittedDate: new Date().toISOString().split('T')[0],
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
      const results = await Promise.all(submissionPromises);

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


  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="wp-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-wp-primary/30 border-t-wp-primary rounded-full animate-spin"></div>
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
    <div className="min-h-screen b-linear-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
      <Navigation />
      <main className="wp-section-sm">
        <div className="wp-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 wp-fade-in">
            <div>
              <h1 className="wp-heading-1 text-wp-text-primary mb-4">Bulk Expense Refunds</h1>
              <p className="wp-body text-wp-text-secondary">Upload multiple receipts and submit them efficiently</p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-wp-primary' : ['extraction', 'review', 'confirmation'].includes(currentStep) ? 'text-green-400' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'upload' ? 'border-wp-primary bg-wp-primary/20' : ['extraction', 'review', 'confirmation'].includes(currentStep) ? 'border-green-400 bg-green-400/20' : 'border-wp-text-muted'}`}>
                  {['extraction', 'review', 'confirmation'].includes(currentStep) ? '✓' : '1'}
                </div>
                <span className="wp-body-small font-medium">Upload</span>
              </div>
              
              <div className={`w-8 h-0.5 ${['extraction', 'review', 'confirmation'].includes(currentStep) ? 'bg-green-400' : 'bg-wp-text-muted/30'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'extraction' ? 'text-wp-primary' : ['review', 'confirmation'].includes(currentStep) ? 'text-green-400' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'extraction' ? 'border-wp-primary bg-wp-primary/20' : ['review', 'confirmation'].includes(currentStep) ? 'border-green-400 bg-green-400/20' : 'border-wp-text-muted'}`}>
                  {['review', 'confirmation'].includes(currentStep) ? '✓' : '2'}
                </div>
                <span className="wp-body-small font-medium">Extract</span>
              </div>
              
              <div className={`w-8 h-0.5 ${['review', 'confirmation'].includes(currentStep) ? 'bg-green-400' : 'bg-wp-text-muted/30'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'review' ? 'text-wp-primary' : currentStep === 'confirmation' ? 'text-green-400' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'review' ? 'border-wp-primary bg-wp-primary/20' : currentStep === 'confirmation' ? 'border-green-400 bg-green-400/20' : 'border-wp-text-muted'}`}>
                  {currentStep === 'confirmation' ? '✓' : '3'}
                </div>
                <span className="wp-body-small font-medium">Review</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'confirmation' ? 'bg-green-400' : 'bg-wp-text-muted/30'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'confirmation' ? 'text-wp-primary' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'confirmation' ? 'border-wp-primary bg-wp-primary/20' : 'border-wp-text-muted'}`}>
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

                <div className="max-w-2xl mx-auto">
                  <div className="border-2 border-dashed border-wp-border rounded-lg p-8 text-center hover:border-wp-primary/50 transition-colors duration-300 relative">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-wp-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <div>
                        <p className="wp-body text-wp-text-primary mb-2">Drop your receipts here or click to browse</p>
                        <p className="wp-body-small text-wp-text-muted">PDF files up to 5MB each, maximum 10 files</p>
                      </div>
                      
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="wp-body font-semibold text-wp-text-primary">Selected Files ({files.length}/10)</h3>
                      {files.map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center justify-between p-3 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                              </svg>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-primary font-medium">{file.name}</p>
                              <p className="wp-body-small text-wp-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(fileIndex)}
                            className="p-1 text-wp-text-muted hover:text-red-400 transition-colors duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
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

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Overall Progress */}
                  <div className="bg-wp-dark-card/60 border border-wp-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="wp-body font-medium text-wp-text-primary">
                        Processing {extractionProgress.current} of {extractionProgress.total} files
                      </span>
                      <span className="wp-body-small text-wp-text-muted">
                        {Math.round((extractionProgress.current / extractionProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-wp-dark-primary rounded-full h-2">
                      <div 
                        className="bg-wp-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Individual File Status */}
                  <div className="space-y-3">
                    {extractedData.map((item) => (
                      <div key={item.fileId} className="flex items-center justify-between p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.status === 'extracted' ? 'bg-green-400/20 text-green-400' :
                            item.status === 'error' ? 'bg-red-400/20 text-red-400' :
                            'bg-wp-primary/20 text-wp-primary'
                          }`}>
                            {item.status === 'extracted' ? '✓' : 
                             item.status === 'error' ? '✕' : 
                             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                          </div>
                          <div>
                            <p className="wp-body-small text-wp-text-primary font-medium">{item.fileName}</p>
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
                            className="p-2 text-wp-text-muted hover:text-red-400 transition-colors duration-300"
                            title="Remove this receipt"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="flex-1 py-3 px-4 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body font-medium text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-dark-card/80 transition-all duration-300"
                    >
                      Start Over
                    </button>
                    
                    {extractionProgress.current === extractionProgress.total && files.length < 10 && (
                      <button
                        type="button"
                        onClick={addMoreFiles}
                        className="flex-1 py-3 px-4 bg-wp-primary/20 border border-wp-primary/30 text-wp-primary rounded-lg wp-body font-medium hover:bg-wp-primary/30 transition-all duration-300"
                      >
                        Add More Files
                      </button>
                    )}
                    
                    {extractionProgress.current === extractionProgress.total && extractedData.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep('review')}
                        className="flex-1 wp-button-primary py-3 px-4 wp-body transition-all duration-300 hover:scale-105"
                      >
                        Review Data ({extractedData.filter(item => item.status === 'extracted').length} ready)
                      </button>
                    )}
                  </div>

                  {/* Progress status message */}
                  {extractionProgress.current === extractionProgress.total && extractedData.length === 0 && (
                    <div className="text-center pt-4">
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

                {/* Bulk Actions Toolbar */}
                <div className="bg-wp-dark-card/60 border border-wp-border rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <button
                        type="button"
                        onClick={selectAllItems}
                        className="px-3 py-2 bg-wp-primary/20 text-wp-primary rounded-lg wp-body-small hover:bg-wp-primary/30 transition-all duration-300"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={selectNoneItems}
                        className="px-3 py-2 bg-wp-dark-card/60 border border-wp-border text-wp-text-secondary rounded-lg wp-body-small hover:bg-wp-dark-card/80 transition-all duration-300"
                      >
                        Select None
                      </button>
                      <button
                        type="button"
                        onClick={deleteSelectedItems}
                        className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg wp-body-small hover:bg-red-600/30 transition-all duration-300"
                      >
                        Delete Selected
                      </button>
                    </div>

                  </div>
                </div>

                {/* Bulk Team Member Application */}
                <div className="bg-wp-dark-card/60 border border-wp-border rounded-lg p-4">
                  <h3 className="wp-body font-medium text-wp-primary mb-3">Bulk Apply Team Member</h3>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block wp-body-small text-wp-text-secondary mb-2">
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
                      className="px-4 py-2 bg-wp-primary text-white rounded-lg hover:bg-wp-primary/90 transition-colors wp-body-small font-medium"
                    >
                      Apply to Selected
                    </button>
                  </div>
                </div>


                {/* Data Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-wp-border">
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Select</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">File</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Title</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Amount</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Currency</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Exchange Rate</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Concept</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Team Member</th>
                        <th className="text-left p-3 wp-body-small text-wp-text-muted uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.map((item, index) => (
                        <tr key={index} className="border-b border-wp-border/50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => updateFormItem(index, 'selected', e.target.checked)}
                              className="w-4 h-4 text-wp-primary bg-transparent border-wp-border rounded focus:ring-wp-primary"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center">
                                <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                              </div>
                              <span className="wp-body-small text-wp-text-primary truncate max-w-32" title={extractedData[index]?.fileName}>
                                {extractedData[index]?.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateFormItem(index, 'title', e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border border-wp-border rounded wp-body-small text-wp-text-primary focus:outline-none focus:ring-1 focus:ring-wp-primary"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) => updateFormItem(index, 'amount', e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border border-wp-border rounded wp-body-small text-wp-text-primary focus:outline-none focus:ring-1 focus:ring-wp-primary"
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
                              className="w-full px-2 py-1 bg-transparent border border-wp-border rounded wp-body-small text-wp-text-primary focus:outline-none focus:ring-1 focus:ring-wp-primary"
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
                          <td className="p-3">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full wp-body-small ${
                              extractedData[index]?.status === 'extracted' ? 'bg-green-400/20 text-green-400' :
                              extractedData[index]?.status === 'error' ? 'bg-red-400/20 text-red-400' :
                              'bg-wp-primary/20 text-wp-primary'
                            }`}>
                              {extractedData[index]?.status === 'extracted' ? 'Ready' :
                               extractedData[index]?.status === 'error' ? 'Error' :
                               'Processing'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 py-3 px-4 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body font-medium text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-dark-card/80 transition-all duration-300"
                  >
                    Back to Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('confirmation')}
                    className="flex-1 wp-button-primary py-3 px-4 wp-body transition-all duration-300 hover:scale-105"
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
                  <div className="bg-wp-dark-card/60 border border-wp-border rounded-lg p-6">
                    <h3 className="wp-body font-semibold text-wp-text-primary mb-4">Submission Summary</h3>
                    
                    {/* Team Member Distribution */}
                    <div className="mb-6 p-4 bg-wp-primary/10 rounded-lg border border-wp-primary/30">
                      <div className="flex items-center space-x-3 mb-4">
                        <svg className="w-5 h-5 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="wp-body font-medium text-wp-primary">Team Member Distribution</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(() => {
                          const selectedItems = formData.filter(item => item.selected);
                          const groupedByTeamMember = selectedItems.reduce((acc, item) => {
                            const email = item.teamMemberEmail;
                            if (!acc[email]) {
                              acc[email] = { count: 0, totalAmount: 0 };
                            }
                            acc[email].count += 1;
                            acc[email].totalAmount += parseFloat(item.amount) || 0;
                            return acc;
                          }, {} as Record<string, { count: number; totalAmount: number }>);

                          return Object.entries(groupedByTeamMember).map(([email, stats]) => {
                            const isCurrentUser = email === session?.user?.email;
                            const member = teamMembers.find(m => m.email === email);
                            const displayName = isCurrentUser ? 'Me' : 
                              (member ? (member.name || `${member.lastName} ${member.firstName}`) : email);

                            return (
                              <div key={email} className="flex justify-between items-center p-3 bg-wp-dark-card/40 rounded-lg">
                                <div>
                                  <p className="wp-body-small font-medium text-wp-text-primary">{displayName}</p>
                                  <p className="wp-body-small text-wp-text-muted">{stats.count} expense{stats.count !== 1 ? 's' : ''}</p>
                                </div>
                                <p className="wp-body-small font-medium text-wp-primary">
                                  ${stats.totalAmount.toFixed(2)}
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="wp-heading-2 text-wp-primary">{formData.filter(item => item.selected).length}</p>
                        <p className="wp-body-small text-wp-text-muted">Items to Submit</p>
                      </div>
                      <div className="text-center">
                        <p className="wp-heading-2 text-green-400">
                          {formData.filter(item => item.selected && item.amount).reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0).toFixed(2)}
                        </p>
                        <p className="wp-body-small text-wp-text-muted">Total Amount</p>
                      </div>
                      <div className="text-center">
                        <p className="wp-heading-2 text-wp-text-primary">{extractedData.filter(item => item.status === 'extracted').length}</p>
                        <p className="wp-body-small text-wp-text-muted">Successfully Extracted</p>
                      </div>
                    </div>
                  </div>

                  {/* Items to be submitted */}
                  <div className="space-y-3">
                    <h3 className="wp-body font-semibold text-wp-text-primary">Items to be submitted:</h3>
                    {formData.map((item, itemIndex) => 
                      item.selected && (
                        <div key={itemIndex} className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Title</p>
                              <p className="wp-body text-wp-text-primary">{item.title}</p>
                            </div>
                            <div>
                              <p className="wp-body-small text-wp-text-muted">Amount</p>
                              <p className="wp-body text-wp-text-primary">{item.amount} {item.currency}</p>
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
                            <div>
                              <p className="wp-body-small text-wp-text-muted">File</p>
                              <p className="wp-body text-wp-text-primary truncate">{extractedData[itemIndex]?.fileName}</p>
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
                      className="flex-1 py-3 px-4 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body font-medium text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-dark-card/80 transition-all duration-300"
                    >
                      Back to Review
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkSubmission}
                      disabled={loading || formData.filter(item => item.selected).length === 0}
                      className="flex-1 wp-button-primary py-3 px-4 wp-body disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Submit All Expense Refunds</span>
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
    </div>
  );
}