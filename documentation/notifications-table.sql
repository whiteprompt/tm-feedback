-- Notifications table for team member feedback app
-- This table stores notifications for users with optional entity_id for redirection

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    text TEXT NOT NULL,
    read_date TIMESTAMP WITH TIME ZONE NULL,
    entity_id TEXT NULL, -- Optional field for app redirection (e.g., leave_id, expense_id)
    module TEXT NOT NULL, -- Module name (e.g., 'Leaves', 'Expense Refunds', 'Feedbacks')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(email);
CREATE INDEX IF NOT EXISTS idx_notifications_read_date ON notifications(read_date);
CREATE INDEX IF NOT EXISTS idx_notifications_module ON notifications(module);
CREATE INDEX IF NOT EXISTS idx_notifications_email_read ON notifications(email, read_date);

-- Add RLS (Row Level Security) policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Users can update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: System can insert notifications (for creating new notifications)
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
