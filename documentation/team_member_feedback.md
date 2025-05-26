## Team Member Feedback table

```sql

CREATE TABLE IF NOT EXISTS team_member_feedback

-- Add indexes to team_member_feedback table
CREATE INDEX IF NOT EXISTS idx_team_member_feedback_user_email ON team_member_feedback(user_email);
CREATE INDEX IF NOT EXISTS idx_team_member_feedback_project_id ON team_member_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_team_member_feedback_user_project ON team_member_feedback(user_email, project_id);

```