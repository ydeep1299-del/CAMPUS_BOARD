# CampusBoard — Minimal Supabase + React Learning Project

A tiny notice board app covering: Auth, Protected Routes, Profile (with Storage
avatar upload), Database CRUD, and Realtime (feed + notifications).

## 1. Create a Supabase project
Go to supabase.com → New Project → copy the **Project URL** and **anon public
key** from Settings → API.

## 2. Set environment variables
Copy `.env.example` to `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run this SQL in the Supabase SQL Editor

```sql
-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  bio text,
  updated_at timestamp default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);


-- NOTICES
create table notices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  content text,
  created_at timestamp default now()
);

alter table notices enable row level security;

create policy "Notices are viewable by everyone"
  on notices for select using (true);

create policy "Users can insert their own notices"
  on notices for insert with check (auth.uid() = user_id);

create policy "Users can delete their own notices"
  on notices for delete using (auth.uid() = user_id);

create policy "Users can update their own notices"
  on notices for update using (auth.uid() = user_id);


-- NOTIFICATIONS
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamp default now()
);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can insert their own notifications"
  on notifications for insert with check (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update using (auth.uid() = user_id);


-- Notify to all users when any user updates the Notice 

create or replace function notify_all_users_on_new_notice()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into notifications (user_id, message)
  select id, 'New notice posted: "' || new.title || '"'
  from auth.users
  where id != new.user_id;
  return new;
end;
$$;

create trigger trg_notify_all_users_on_new_notice
after insert on notices
for each row
execute function notify_all_users_on_new_notice();
```

## 4. Enable Realtime
In Supabase Dashboard → **Database → Replication**, turn on replication for
the `notices` and `notifications` tables (toggle them on in the list of
tables under "supabase_realtime" publication).

## 5. Create the Storage bucket
Dashboard → **Storage** → New bucket → name it `avatars` → mark **Public**.

Then add these storage policies (Storage → avatars → Policies):

```sql
create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
```

(This works because the app uploads to a path like `{userId}/filename.jpg` —
the first folder segment must match the logged-in user's id.)

## 6. Email confirmation setting (optional but recommended for testing)
Dashboard → **Authentication → Providers → Email** → you can toggle
"Confirm email" OFF while developing, so signup logs you in immediately
without needing to click a confirmation link.

## 7. Install & run

```bash
npm install
npm run dev
```

Visit http://localhost:5173 — sign up, log in, post a notice, open a second
browser (or incognito) tab logged in as a different user, and watch the
notice board update live. Post a notice and check the bell icon for the
live notification.

## What each topic maps to
| Feature | File(s) |
|---|---|
| Auth (signup/login/logout/session) | `context/AuthContext.jsx`, `pages/Login.jsx`, `pages/Signup.jsx` |
| Protected routes | `routes/ProtectedRoute.jsx` |
| Profile + metadata | `pages/Profile.jsx` |
| Storage / avatar upload | `components/AvatarUpload.jsx` |
| Database CRUD | `hooks/useNotices.js`, `components/NoticeForm.jsx`, `components/NoticeCard.jsx` |
| Realtime feed | `hooks/useRealtimeNotices.js` |
| Live notifications | `hooks/useNotifications.js`, `components/NotificationBell.jsx` |

## Notes / simplifications made on purpose
- The notification created in `NoticeForm.jsx` is a **self-notification**
  (confirming your own post went live) just to demonstrate the insert →
  realtime → bell pipeline. In a real app you'd insert one notification row
  per relevant recipient (e.g. followers, classmates) instead.
- No comments, likes, or edit-notice UI — kept to one CRUD entity so the
  core Supabase concepts stay visible and easy to trace.
- CSS is intentionally bare-bones right now (see `src/index.css`) — styling
  can be layered on top once the wiring is working.
