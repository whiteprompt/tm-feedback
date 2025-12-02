'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ConceptSelect from '@/components/ConceptSelect';
import CurrencySelect from '@/components/CurrencySelect';
import ErrorBanner from '@/components/ErrorBanner';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useRouter } from 'next/navigation';
import { ExpenseRefundForm } from '@/lib/constants';

interface TypeConfig {
  title: string;
  description: string;
  concept: string;
  receiptLabel: string;
  receiptRequired: boolean;
  descriptionLabel: string;
  amount: number;
}

interface ExpenseRefundFormClientProps {
  type?: string;
}

// Configuration for different expense types
const TYPE_CONFIGS: Record<string, TypeConfig> = {
  Social: {
    title: 'Social Event',
    description: 'Social Event',
    concept: 'Social Events',
    receiptLabel: 'Social Event picture',
    receiptRequired: true,
    descriptionLabel: 'Comments',
    amount: 30
  },
};

export default function ExpenseRefundFormClient({ type }: ExpenseRefundFormClientProps) {
  // Get configuration for the current type
  const typeConfig = type ? TYPE_CONFIGS[type] : null;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<ExpenseRefundForm>({
    title: typeConfig?.title || '',
    description: typeConfig?.description || '',
    currency: 'USD',
    concept: typeConfig?.concept || '',
    submittedDate: new Date().toISOString().split('T')[0],
    exchangeRate: '1',
    teamMemberEmail: session?.user?.email || '',
    amount: typeConfig?.amount ? typeConfig.amount.toString() : '',
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
      title: typeConfig?.title || '',
      description: typeConfig?.description || '',
      amount: '',
      currency: 'USD',
      concept: typeConfig?.concept || '',
      submittedDate: new Date().toISOString().split('T')[0],
    };

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, typeConfig]);

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

    if (typeConfig?.receiptRequired && !formData.receiptFile) {
      setError(`Please upload a ${typeConfig.receiptLabel || 'receipt'}`);
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
        title: typeConfig?.title || '',
        description: typeConfig?.description || '',
        amount: '',
        currency: 'USD',
        concept: typeConfig?.concept || '',
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
      <main className="wp-section-sm">
        <div className="wp-container">
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

              <div className={`
                space-y-3
                md:col-span-2
              `}>
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
                    bg-wp-dark-secondary border-wp-border text-wp-text-primary
                    w-full rounded-lg border-2 px-4 py-3
                    [color-scheme:dark]
                    transition-all duration-200
                    focus:border-wp-primary focus:ring-wp-primary/20
                    focus:ring-2
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
                {typeConfig?.descriptionLabel || 'Description'} <span className={`
                  text-red-400
                `}>*</span>
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
                {typeConfig?.receiptLabel || 'Receipt'}
                {typeConfig?.receiptRequired && <span className="text-red-400">*</span>}
              </label>
              <p className="wp-body-small text-wp-text-secondary mb-4">
                Upload a receipt for your expense (JPG, PNG, or PDF format, max 5MB).
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  lang='en'
                  onChange={handleFileChange}
                  required={typeConfig?.receiptRequired}
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
                  bg-wp-dark-card/60 border-wp-border wp-body flex-1
                  cursor-pointer rounded-lg border px-6 py-4
                `}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`
                  wp-button-primary flex flex-1 items-center justify-center
                  space-x-2 px-6 py-4 transition-all duration-300
                  hover:scale-105
                  disabled:cursor-not-allowed
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
