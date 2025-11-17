'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import ConceptSelect from '@/components/ConceptSelect';
import CurrencySelect from '@/components/CurrencySelect';
import ErrorBanner from '@/components/ErrorBanner';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { CURRENCIES, EXPENSE_CONCEPTS, ExpenseRefundForm, ExtractedData } from '@/lib/constants';

type WizardStep = 'upload' | 'review' | 'form';

export default function ExpenseRefundFormV2Client() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [formData, setFormData] = useState<ExpenseRefundForm>({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    concept: '',
    submittedDate: new Date().toISOString().split('T')[0],
    exchangeRate: '1',
    teamMemberEmail: session?.user?.email || '',
  });
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [fetchingExchangeRate, setFetchingExchangeRate] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/expense-refunds/new-v2')}`);
    }
  }, [status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track form changes
  useEffect(() => {
    const initialFormData = {
      title: '',
      description: '',
      amount: '',
      currency: 'USD',
      concept: '',
      submittedDate: new Date().toISOString().split('T')[0],
      exchangeRate: '1',
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && hasUnsavedChanges) {
        e.preventDefault();
        setPendingNavigation(() => () => router.push(link.href));
        setShowLeaveWarning(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hasUnsavedChanges, router]);

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

  // Cleanup object URL when component unmounts or PDF changes
  useEffect(() => {
    return () => {
      if (uploadedImage && uploadedImage !== 'pdf-placeholder' && uploadedImage.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (formData.currency === 'USD') {
        setFormData(prev => ({ ...prev, exchangeRate: '1' }));
        return;
      }

      setFetchingExchangeRate(true);
      try {
        const response = await fetch('/api/exchange-rates');
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        const rate = data.rates[formData.currency];
        
        if (rate) {
          setFormData(prev => ({ ...prev, exchangeRate: rate.toString() }));
        } else {
          console.warn(`Exchange rate not found for currency: ${formData.currency}`);
          setFormData(prev => ({ ...prev, exchangeRate: '1' }));
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Keep the current exchange rate or default to 1 if there's an error
        if (!formData.exchangeRate || formData.exchangeRate === '1') {
          setFormData(prev => ({ ...prev, exchangeRate: '1' }));
        }
      } finally {
        setFetchingExchangeRate(false);
      }
    };

    // Only fetch if currency is set and client is ready
    if (isClient && formData.currency) {
      fetchExchangeRate();
    }
  }, [formData.currency, isClient, formData.exchangeRate]);

  const handleFileUpload = async (file: File) => {
    setExtracting(true);
    setError('');

    try {
      // Validate file type
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid PDF file');
        setExtracting(false);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setExtracting(false);
        return;
      }

      // Create a preview URL for the PDF
      const pdfUrl = URL.createObjectURL(file);
      setUploadedImage(pdfUrl);

      // Store the file
      setFormData(prev => ({ ...prev, receiptFile: file }));

      // Call our secure API route instead of the external API directly
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
      
      // Map the API response to our expected format
      const mappedData: ExtractedData = {
        amount: extractedInfo.output?.totalPrice || '',
        vendor: extractedInfo.output?.store || '',
        description: extractedInfo.output?.store || '',
        tax: (extractedInfo.output?.tax && extractedInfo.output.tax !== 'null') ? extractedInfo.output.tax : '0',
        currency: extractedInfo.output?.currency || '',
        concept: extractedInfo.output?.concept || '',
        exchangeRate: extractedInfo.output?.exchangeRate || '',
        // We don't have date in the response, so we'll leave it empty
        date: ''
      };
      
      setExtractedData(mappedData);
      setCurrentStep('review');
    } catch (error) {
      setError('Failed to extract receipt data. Please try again.');
      console.error('Error extracting receipt data:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

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

  const applyExtractedData = () => {
    if (extractedData) {
      // Map currency if detected, otherwise keep current selection
      const currency = mapCurrency(extractedData.currency) || formData.currency;

      // Verify the concept exists in our options
      const conceptExists = EXPENSE_CONCEPTS.find(c => c.label === extractedData.concept);

      setFormData(prev => ({
        ...prev,
        amount: extractedData.amount || prev.amount,
        description: extractedData.vendor || prev.description,
        title: extractedData.vendor || prev.title,
        submittedDate: extractedData.date || prev.submittedDate,
        concept: extractedData.concept || prev.concept,
        currency: currency,
        exchangeRate: extractedData.exchangeRate || prev.exchangeRate,
      }));
    }
    setCurrentStep('form');
  };

  const skipExtraction = () => {
    setCurrentStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a title for your expense refund');
      setLoading(false);
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    if (!formData.concept) {
      setError('Please select a concept');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('concept', formData.concept);
      formDataToSend.append('submittedDate', formData.submittedDate);
      formDataToSend.append('exchangeRate', formData.exchangeRate);
      formDataToSend.append('userEmail', session?.user?.email || '');
      
      if (formData.receiptFile) {
        formDataToSend.append('receipt', formData.receiptFile);
      }

      const response = await fetch('/api/expense-refunds', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit expense refund');
      }

      // Reset form and unsaved changes flag
      setFormData({
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        concept: '',
        submittedDate: new Date().toISOString().split('T')[0],
        exchangeRate: '1',
        teamMemberEmail: session?.user?.email || '',
      });
      setHasUnsavedChanges(false);
      
      // Redirect to expense refunds list
      router.push('/expense-refunds');
    } catch (error) {
      setError('Failed to submit expense refund');
      console.error('Error submitting expense refund:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    const navigationFn = () => {
      if (currentStep === 'review') {
        setCurrentStep('upload');
      } else if (currentStep === 'form') {
        setCurrentStep('review');
      }
    };
    
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowLeaveWarning(true);
    } else {
      navigationFn();
    }
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
    <div className="min-h-screen bg-linear-to-br from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary">
      <Navigation />
      <main className="wp-section-sm">
        <div className="wp-container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-16 wp-fade-in">
            <div>
              <h1 className="wp-heading-1 text-wp-text-primary mb-4">Submit Expense Refund</h1>
              <p className="wp-body text-wp-text-secondary">Upload your receipt and let AI extract the information</p>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-wp-primary' : currentStep === 'review' || currentStep === 'form' ? 'text-green-400' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'upload' ? 'border-wp-primary bg-wp-primary/20' : currentStep === 'review' || currentStep === 'form' ? 'border-green-400 bg-green-400/20' : 'border-wp-text-muted'}`}>
                  {currentStep === 'review' || currentStep === 'form' ? '✓' : '1'}
                </div>
                <span className="wp-body-small font-medium">Upload</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'review' || currentStep === 'form' ? 'bg-green-400' : 'bg-wp-text-muted/30'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'review' ? 'text-wp-primary' : currentStep === 'form' ? 'text-green-400' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'review' ? 'border-wp-primary bg-wp-primary/20' : currentStep === 'form' ? 'border-green-400 bg-green-400/20' : 'border-wp-text-muted'}`}>
                  {currentStep === 'form' ? '✓' : '2'}
                </div>
                <span className="wp-body-small font-medium">Review</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep === 'form' ? 'bg-green-400' : 'bg-wp-text-muted/30'}`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'form' ? 'text-wp-primary' : 'text-wp-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'form' ? 'border-wp-primary bg-wp-primary/20' : 'border-wp-text-muted'}`}>
                  3
                </div>
                <span className="wp-body-small font-medium">Submit</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="wp-card p-8">
            {currentStep === 'upload' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Upload Receipt</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    {`Upload a PDF of your receipt and we'll automatically extract the information for you.`}
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="border-2 border-dashed border-wp-border rounded-lg p-8 text-center hover:border-wp-primary/50 transition-colors duration-300">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-wp-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-wp-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <div>
                        <p className="wp-body text-wp-text-primary mb-2">Drop your receipt here or click to browse</p>
                        <p className="wp-body-small text-wp-text-muted">PDF up to 5MB</p>
                      </div>
                      
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={extracting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  {extracting && (
                    <div className="mt-6 flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-wp-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="wp-body text-wp-text-secondary">Extracting receipt data...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 'review' && extractedData && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Review Extracted Data</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    Please review the information we extracted from your receipt and make any necessary corrections.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Receipt Preview */}
                  {uploadedImage && uploadedImage !== 'pdf-placeholder' && (
                    <div className="space-y-4">
                      <h3 className="wp-body font-semibold text-wp-text-primary">Receipt Preview</h3>
                      <div className="border border-wp-border rounded-lg overflow-hidden bg-white">
                        <iframe
                          src={uploadedImage}
                          className="w-full h-96"
                          title="PDF Receipt Preview"
                        />
                      </div>
                      <div className="text-center">
                        <p className="wp-body-small text-wp-text-muted">
                          📄 {formData.receiptFile?.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => window.open(uploadedImage, '_blank')}
                          className="mt-2 px-4 py-2 text-wp-primary hover:text-wp-primary/80 transition-colors duration-300 wp-body-small underline"
                        >
                          Open in new tab
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Extracted Data */}
                  <div className="space-y-6">
                    <h3 className="wp-body font-semibold text-wp-text-primary">Extracted Information</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Store/Vendor
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.vendor || 'Not detected'}
                        </p>
                      </div>

                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Total Amount
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.amount || 'Not detected'}
                        </p>
                      </div>

                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Tax Amount
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.tax && extractedData.tax !== 'null' ? extractedData.tax : '0'}
                        </p>
                      </div>

                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Currency
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.currency ? mapCurrency(extractedData.currency) : 'Not detected'}
                        </p>
                      </div>

                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Exchange Rate
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.exchangeRate || 'Not detected'}
                        </p>
                      </div>

                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Concept
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.concept ? 
                            EXPENSE_CONCEPTS.find(c => c.value === extractedData.concept)?.label || extractedData.concept 
                            : 'Not detected'}
                        </p>
                      </div>

                      <div className="p-4 bg-wp-dark-card/60 border border-wp-border rounded-lg">
                        <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold block mb-2">
                          Date
                        </label>
                        <p className="wp-body text-wp-text-primary">
                          {extractedData.date || 'Not detected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex-1 py-3 px-4 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body font-medium text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-dark-card/80 transition-all duration-300"
                      >
                        Upload Different PDF
                      </button>
                      <button
                        type="button"
                        onClick={applyExtractedData}
                        className="flex-1 wp-button-primary py-3 px-4 wp-body transition-all duration-300 hover:scale-105"
                      >
                        Use This Data
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={skipExtraction}
                      className="w-full py-2 px-4 text-wp-text-muted hover:text-wp-text-secondary transition-colors duration-300 wp-body-small"
                    >
                      Skip and fill manually
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'form' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="wp-heading-2 text-wp-text-primary mb-4">Complete Your Expense Refund</h2>
                  <p className="wp-body text-wp-text-secondary mb-8">
                    Review and complete the form with your expense details.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                      placeholder="Enter a title for your expense refund"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                        Amount <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                        Currency <span className="text-red-400">*</span>
                      </label>
                      <CurrencySelect
                        value={formData.currency}
                        onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                        placeholder="Select currency"
                        required={true}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                        Exchange Rate
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          value={formData.exchangeRate}
                          onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: e.target.value }))}
                          className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                          placeholder="1.0000"
                          disabled={fetchingExchangeRate}
                        />
                        {fetchingExchangeRate && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-wp-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <p className="wp-body-small text-wp-text-muted">
                        {formData.currency === 'USD' ? 
                          'Base currency (USD = 1)' : 
                          `1 USD = ${formData.exchangeRate} ${formData.currency}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                        Concept <span className="text-red-400">*</span>
                      </label>
                      <ConceptSelect
                        value={formData.concept}
                        onChange={(value) => setFormData(prev => ({ ...prev, concept: value }))}
                        placeholder="Select concept"
                        required={true}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                        Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.submittedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, submittedDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="wp-body-small text-wp-text-muted uppercase tracking-wider font-semibold">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <p className="wp-body-small text-wp-text-secondary mb-4">
                      Please provide a detailed description of the expense, including the business purpose and any relevant context.
                    </p>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={5}
                      className="w-full px-4 py-3 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body text-wp-text-primary placeholder-wp-text-muted focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300 resize-none"
                      placeholder="Describe the expense and its business purpose"
                      required
                    />
                  </div>

                  <ErrorBanner 
                    error={error} 
                    onDismiss={() => setError('')}
                    title="Error submitting expense refund"
                  />

                  <div className="flex gap-6 pt-4">
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex-1 py-4 px-6 bg-wp-dark-card/60 border border-wp-border rounded-lg wp-body font-medium text-wp-text-secondary hover:text-wp-text-primary hover:bg-wp-dark-card/80 focus:outline-none focus:ring-2 focus:ring-wp-primary focus:border-wp-primary transition-all duration-300"
                    >
                      Back to Review
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 wp-button-primary py-4 px-6 wp-body disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
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
                          <span>Submit Expense Refund</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Error Display */}
            <ErrorBanner 
              error={error} 
              onDismiss={() => setError('')}
              title="Error submitting expense refund"
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
