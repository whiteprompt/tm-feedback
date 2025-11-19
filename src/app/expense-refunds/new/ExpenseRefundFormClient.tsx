'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import ConceptSelect from '@/components/ConceptSelect';
import CurrencySelect from '@/components/CurrencySelect';
import ErrorBanner from '@/components/ErrorBanner';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { ExpenseRefundForm } from '@/lib/constants';

export default function ExpenseRefundFormClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fetchingExchangeRate, setFetchingExchangeRate] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/expense-refunds/new')}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid receipt file (JPG, PNG, or PDF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, receiptFile: file }));
      setError('');
    }
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
    <div className={`
      from-wp-dark-primary via-wp-dark-secondary to-wp-dark-tertiary
      min-h-screen bg-linear-to-br
    `}>
      <Navigation />
        <main className="wp-section-sm">
          <div className="wp-container">
          {/* Header */}
          <div className={`
            wp-fade-in mb-16 flex flex-col gap-6
            sm:flex-row sm:items-center sm:justify-between
          `}>
            <h1 className="wp-heading-1 text-wp-text-primary mb-4">Submit Expense Refund</h1>
            <p className="wp-body text-wp-text-secondary">Submit a new expense refund request</p>
          </div>

          {/* Form Card */}
          <div className="wp-card p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className={`
                wp-body-small text-wp-text-muted font-semibold tracking-wider
                uppercase
              `}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`
                  bg-wp-dark-card/60 border-wp-border wp-body
                  text-wp-text-primary placeholder-wp-text-muted w-full
                  rounded-lg border px-4 py-3 transition-all duration-300
                  focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                  focus:outline-none
                `}
                placeholder="Enter a title for your expense refund"
                required
              />
            </div>

            <div className={`
              grid gap-6
              md:grid-cols-3
            `}>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Amount <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary placeholder-wp-text-muted w-full
                    rounded-lg border px-4 py-3 transition-all duration-300
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
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
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Exchange Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: e.target.value }))}
                    className={`
                      bg-wp-dark-card/60 border-wp-border wp-body
                      text-wp-text-primary placeholder-wp-text-muted w-full
                      rounded-lg border px-4 py-3 transition-all duration-300
                      focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                      focus:outline-none
                    `}
                    placeholder="1.0000"
                    disabled={fetchingExchangeRate}
                  />
                  {fetchingExchangeRate && (
                    <div className={`
                      absolute top-1/2 right-3 -translate-y-1/2 transform
                    `}>
                      <div className={`
                        border-wp-primary h-4 w-4 animate-spin rounded-full
                        border-2 border-t-transparent
                      `}></div>
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

            <div className={`
              grid gap-6
              md:grid-cols-2
            `}>
              <div className="space-y-3">
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
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
                <label className={`
                  wp-body-small text-wp-text-muted font-semibold tracking-wider
                  uppercase
                `}>
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.submittedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, submittedDate: e.target.value }))}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary w-full rounded-lg border px-4 py-3
                    transition-all duration-300
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className={`
                wp-body-small text-wp-text-muted font-semibold tracking-wider
                uppercase
              `}>
                Description <span className="text-red-400">*</span>
              </label>
              <p className="wp-body-small text-wp-text-secondary mb-4">
                Please provide a detailed description of the expense, including the business purpose and any relevant context.
              </p>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className={`
                  bg-wp-dark-card/60 border-wp-border wp-body
                  text-wp-text-primary placeholder-wp-text-muted w-full
                  resize-none rounded-lg border px-4 py-3 transition-all
                  duration-300
                  focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                  focus:outline-none
                `}
                placeholder="Describe the expense and its business purpose"
                required
              />
            </div>

            <div className="space-y-3">
              <label className={`
                wp-body-small text-wp-text-muted font-semibold tracking-wider
                uppercase
              `}>
                Receipt
              </label>
              <p className="wp-body-small text-wp-text-secondary mb-4">
                Upload a receipt for your expense (JPG, PNG, or PDF format, max 5MB).
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className={`
                    bg-wp-dark-card/60 border-wp-border wp-body
                    text-wp-text-primary w-full rounded-lg border px-4 py-3
                    transition-all duration-300
                    file:bg-wp-primary file:mr-4 file:rounded-lg file:border-0
                    file:px-4 file:py-2 file:text-sm file:font-medium
                    file:text-white
                    hover:file:bg-wp-primary/80
                    focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                    focus:outline-none
                  `}
                />
                {formData.receiptFile && (
                  <div className="wp-body-small text-wp-text-secondary mt-2">
                    Selected: {formData.receiptFile.name}
                  </div>
                )}
              </div>
            </div>

            <ErrorBanner 
              error={error} 
              onDismiss={() => setError('')}
              title="Error submitting expense refund"
            />

            <div className="flex gap-6 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setPendingNavigation(() => () => router.push('/expense-refunds'));
                    setShowLeaveWarning(true);
                  } else {
                    router.push('/expense-refunds');
                  }
                }}
                className={`
                  bg-wp-dark-card/60 border-wp-border wp-body
                  text-wp-text-secondary flex-1 rounded-lg border px-6 py-4
                  font-medium transition-all duration-300
                  hover:text-wp-text-primary hover:bg-wp-dark-card/80
                  focus:ring-wp-primary focus:border-wp-primary focus:ring-2
                  focus:outline-none
                `}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`
                  wp-button-primary wp-body flex flex-1 items-center
                  justify-center space-x-2 px-6 py-4 transition-all duration-300
                  hover:scale-105
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
              >
                {loading ? (
                  <>
                    <div className={`
                      h-5 w-5 animate-spin rounded-full border-2 border-white
                      border-t-transparent
                    `}></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Submit Expense Refund</span>
                  </>
                )}
              </button>
            </div>
          </form>
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
