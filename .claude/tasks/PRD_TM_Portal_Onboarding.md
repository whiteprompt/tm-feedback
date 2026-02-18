# PRD: TM Portal — Onboarding Completion Modal

## 1. Overview

Add a mandatory onboarding modal to the TM Portal that guides newly onboarded team members through required setup steps. The modal blocks portal interaction until all steps are manually marked as complete, then disappears permanently.

---

## 2. Problem

New team members often delay or skip onboarding steps because the portal provides no in-product enforcement. We need a lightweight, blocking mechanism that ensures completion before the user can access the portal normally.

---

## 3. Goals

- Ensure every new TM completes all onboarding steps before using the portal.
- Remove the modal permanently once onboarding is done — no clutter for returning users.
- Track onboarding state per user in the database.

---

## 4. Scope

### In Scope
- A blocking modal shown to users whose onboarding is not yet complete.
- Three onboarding steps, each manually confirmed by the user:
  1. **Redmine + Slack access check** — user confirms they have access to both tools.
  2. **Gmail 2FA setup** — user confirms two-factor authentication is enabled on their Gmail account.
  3. **Métodos de cobro form** — user confirms they have submitted the payment method form.
- Once all three steps are marked complete, the modal closes and never appears again for that user.
- Onboarding state is persisted in Supabase.

### Out of Scope
- Automated verification of step completion (e.g. API calls to Slack/Redmine/Google).
- Admin dashboard to manage or override onboarding state (future scope).
- Email or push reminders.

---

## 5. User Flow

1. User logs into TM Portal.
2. System checks the `onboarding_progress` table for the current user.
3. **If onboarding is incomplete:** modal appears immediately and blocks all portal interaction (no backdrop dismiss, no close button).
4. User reads each step and clicks "Mark as done" per step.
5. Once all 3 steps are marked, a "Complete Onboarding" button becomes active.
6. User clicks "Complete Onboarding" → record is updated in DB → modal closes permanently.
7. **If onboarding is already complete:** modal never renders.

---

## 6. Database Design (Supabase)

Create a new table: `onboarding_progress`

```sql
create table onboarding_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_email           text not null unique,
  step_redmine_slack   boolean not null default false,
  step_gmail_2fa       boolean not null default false,
  step_metodos_cobro   boolean not null default false,
  completed_at         timestamptz,         -- null until all steps done
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
```

**Logic:**
- A row is created for the user on first login (if it doesn't exist), keyed by `user_email`.
- Each step column is flipped to `true` when the user marks it done.
- When all three step columns are `true`, set `completed_at = now()`.
- On every login, check: `completed_at is not null` → skip modal.

---

## 7. UI Specification

### Modal Behavior
- **Blocking:** covers full screen with a dark overlay; cannot be dismissed by clicking outside or pressing Escape.
- **No close (X) button.**
- Appears immediately after login if onboarding is incomplete.

### Modal Content
- **Title:** "Complete your onboarding"
- **Subtitle:** "Please complete the following steps before accessing the portal."
- **Step list** (vertical, in order):

| # | Step | CTA |
|---|------|-----|
| 1 | Confirm you have access to **Redmine** and **Slack** | Checkbox or "Mark as done" button |
| 2 | Enable **Gmail 2FA** on your account | Checkbox or "Mark as done" button |
| 3 | Submit the **Métodos de cobro** form | Checkbox or "Mark as done" button |

- Each step shows a ✅ indicator once marked.
- **"Complete Onboarding"** primary button at the bottom — disabled until all 3 steps are checked.

---

## 8. Technical Requirements

- **Framework:** match existing TM Portal stack (confirm: React / Next.js?).
- **Auth:** use the current session email (`auth.email()`) to look up and write the user's row.
- **Supabase client:** use existing client instance; add RLS policy so users can only read/update their own row.
- **RLS policy example:**
  ```sql
  alter table onboarding_progress enable row level security;

  create policy "Users manage own onboarding"
    on onboarding_progress
    for all
    using (auth.email() = user_email)
    with check (auth.email() = user_email);
  ```
- **On login hook / layout:** check onboarding status at the top-level layout or auth wrapper — before rendering any portal content.
- **Optimistic UI:** mark step as done immediately in local state; persist to DB in the background. Show an error toast if the DB update fails and revert the step.

---

## 9. Acceptance Criteria

- [ ] A new user who logs in for the first time sees the blocking modal immediately.
- [ ] The modal cannot be closed without completing all 3 steps.
- [ ] Each step can be independently marked as done in any order.
- [ ] "Complete Onboarding" button is disabled until all steps are checked.
- [ ] After clicking "Complete Onboarding," the modal never appears again for that user.
- [ ] `completed_at` is set in the DB when onboarding is finished.
- [ ] A returning user with `completed_at` set never sees the modal.
- [ ] RLS prevents users from reading or modifying other users' onboarding records.

---

## 10. Open Questions

- What is the existing TM Portal frontend framework? (React, Next.js, Vue, other?)
- Should the "Métodos de cobro" step include a direct link to the form?
- Should there be an admin override to reset or skip onboarding for a specific user? (Deferred for now.)
