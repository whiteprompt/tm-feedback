'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeaveType } from '@/lib/types';
import ErrorBanner from '@/components/ErrorBanner';

interface LeaveFormData {
  fromDate: string;
  toDate: string;
  type: LeaveType;
  comments: string;
  certificate: File | null;
  approvedByEmail: string;
}

const initialFormData: LeaveFormData = {
  fromDate: '',
  toDate: '',
  type: LeaveType.AnnualLeave,
  comments: '',
  certificate: null,
  approvedByEmail: '',
};

export default function LeaveFormClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<LeaveFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      certificate: file
    }));
  };

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const fromDate = new Date(formData.fromDate);
    const toDate = new Date(formData.toDate);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('fromDate', formData.fromDate);
      submitData.append('toDate', formData.toDate);
      submitData.append('type', formData.type);
      submitData.append('comments', formData.comments);
      submitData.append('approvedByEmail', formData.approvedByEmail);
      
      if (formData.certificate) {
        submitData.append('certificate', formData.certificate);
      }

      const response = await fetch('/api/leaves', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit leave request');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/leaves');
      }, 2000);
    } catch (error) {
      console.error('Error submitting leave:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="wp-card wp-fade-in p-8 text-center">
        <div className="text-wp-success mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="wp-heading-2 text-wp-text-primary mb-2">Leave Request Submitted!</h2>
        <p className="wp-body text-wp-text-muted mb-4">
          Your leave request has been successfully submitted and is pending approval.
        </p>
        <p className="wp-body-small text-wp-text-muted">
          Redirecting to leaves page...
        </p>
      </div>
    );
  }

  return (
    <div className="wp-card wp-fade-in p-8">

      <ErrorBanner 
        error={error} 
        onDismiss={() => setError('')}
        title="Error submitting leave request"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`
          grid grid-cols-1 gap-6
          md:grid-cols-2
        `}>
          {/* Start Date */}
          <div>
            <label htmlFor="fromDate" className={`
              wp-body text-wp-text-primary mb-2 block font-medium
            `}>
              Start Date *
            </label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleInputChange}
              required
              className={`
                bg-wp-dark-secondary border-wp-border text-wp-text-primary
                w-full rounded-lg border-2 px-4 py-3 transition-all duration-200
                focus:border-wp-primary focus:ring-wp-primary/20 focus:ring-2
              `}
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="toDate" className={`
              wp-body text-wp-text-primary mb-2 block font-medium
            `}>
              End Date *
            </label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={handleInputChange}
              required
              className={`
                bg-wp-dark-secondary border-wp-border text-wp-text-primary
                w-full rounded-lg border-2 px-4 py-3 transition-all duration-200
                focus:border-wp-primary focus:ring-wp-primary/20 focus:ring-2
              `}
            />
          </div>
        </div>

        {/* Days Calculation */}
        {formData.fromDate && formData.toDate && (
          <div className={`
            bg-wp-primary/10 border-wp-primary/30 rounded-lg border p-4
          `}>
            <div className="flex items-center">
              <svg className="text-wp-primary mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4h8m-4-4v8m-4-4h8" />
              </svg>
              <span className="wp-body text-wp-primary font-medium">
                Total days requested: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Leave Type */}
        <div>
          <label htmlFor="type" className={`
            wp-body text-wp-text-primary mb-2 block font-medium
          `}>
            Leave Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className={`
              bg-wp-dark-secondary border-wp-border text-wp-text-primary w-full
              rounded-lg border-2 px-4 py-3 transition-all duration-200
              focus:border-wp-primary focus:ring-wp-primary/20 focus:ring-2
            `}
          >
            <option value={LeaveType.AnnualLeave}>Annual Leave</option>
            <option value={LeaveType.UnpaidLeave}>Unpaid Leave</option>
            <option value={LeaveType.IllnessLeave}>Illness Leave</option>
            <option value={LeaveType.PTOLeave}>PTO Leave</option>
          </select>
        </div>

        {/* Approval By */}
        <div>
          <label htmlFor="approvedByEmail" className={`
            wp-body text-wp-text-primary mb-2 block font-medium
          `}>
            Approval By *
          </label>
          <select
            id="approvedByEmail"
            name="approvedByEmail"
            value={formData.approvedByEmail}
            onChange={handleInputChange}
            required
            className={`
              bg-wp-dark-secondary border-wp-border text-wp-text-primary w-full
              rounded-lg border-2 px-4 py-3 transition-all duration-200
              focus:border-wp-primary focus:ring-wp-primary/20 focus:ring-2
            `}
          >
            <option value="">Select approver...</option>
            <option value="mariano.selvaggi@whiteprompt.com">mariano.selvaggi@whiteprompt.com</option>
            <option value="federico.matavos@whiteprompt.com">federico.matavos@whiteprompt.com</option>
            <option value="diego.gallardo@whiteprompt.com">diego.gallardo@whiteprompt.com</option>
            <option value="jeremias.gibilbank@whiteprompt.com">jeremias.gibilbank@whiteprompt.com</option>
            <option value="vanesa.fernandez@whiteprompt.com">vanesa.fernandez@whiteprompt.com</option>
            <option value="leonardo.tenaglia@whiteprompt.com">leonardo.tenaglia@whiteprompt.com</option>
            <option value="nacho@whiteprompt.com">nacho@whiteprompt.com</option>
          </select>
        </div>

        {/* Comments */}
        <div>
          <label htmlFor="comments" className={`
            wp-body text-wp-text-primary mb-2 block font-medium
          `}>
            Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows={4}
            placeholder="Add any additional comments or details about your leave request..."
            className={`
              bg-wp-dark-secondary border-wp-border text-wp-text-primary w-full
              resize-none rounded-lg border-2 px-4 py-3 transition-all
              duration-200
              focus:border-wp-primary focus:ring-wp-primary/20 focus:ring-2
            `}
          />
        </div>

        {/* Certificate Upload */}
        <div>
          <label htmlFor="certificate" className={`
            wp-body text-wp-text-primary mb-2 block font-medium
          `}>
            Certificate/Medical Note (Optional)
          </label>
          <div className="relative">
            <input
              type="file"
              id="certificate"
              name="certificate"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className={`
                bg-wp-dark-secondary border-wp-border text-wp-text-primary
                w-full rounded-lg border-2 px-4 py-3 transition-all duration-200
                focus:border-wp-primary focus:ring-wp-primary/20 focus:ring-2
                file:bg-wp-primary file:mr-4 file:rounded-full file:border-0
                file:px-4 file:py-2 file:text-sm file:font-semibold
                file:text-white
                hover:file:bg-wp-primary/90
              `}
            />
          </div>
          <p className="wp-body-small text-wp-text-muted mt-2">
            Upload a certificate or medical note if required for your leave type. Accepted formats: JPG, PNG, PDF (max 5MB)
          </p>
          {formData.certificate && (
            <div className={`
              bg-wp-dark-card border-wp-border mt-2 rounded-lg border p-3
            `}>
              <div className="flex items-center">
                <svg className="text-wp-success mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="wp-body-small text-wp-text-primary">
                  {formData.certificate.name} ({(formData.certificate.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={`
          border-wp-border flex items-center justify-end space-x-4 border-t pt-6
        `}>
          <button
            type="button"
            onClick={() => router.push('/leaves')}
            className={`
              bg-wp-dark-secondary text-wp-text-primary border-wp-border
              rounded-lg border px-6 py-3 font-medium transition-all
              duration-200
              hover:bg-wp-dark-card hover:border-wp-primary/50
            `}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.fromDate || !formData.toDate || !formData.approvedByEmail}
            className={`
              bg-wp-primary flex items-center space-x-2 rounded-lg px-6 py-3
              font-medium text-white transition-all duration-200
              hover:bg-wp-primary/90
              disabled:bg-wp-text-muted disabled:cursor-not-allowed
            `}
          >
            {isSubmitting ? (
              <>
                <div className={`
                  h-4 w-4 animate-spin rounded-full border-b-2 border-white
                `}></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

