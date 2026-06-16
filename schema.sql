-- ==============================================================================
-- GISEC Technologies Platform - Database Schema SQL
-- Target Database: PostgreSQL / Supabase
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Roles Type
create type user_role as enum ('student', 'tutor', 'admin');

-- 1. USERS TABLE
create table if not exists users (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    full_name text not null,
    role user_role default 'student'::user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. COURSES TABLE
create table if not exists courses (
    id serial primary key,
    name text not null,
    duration text not null,
    tools text[] default '{}'::text[] not null,
    price text not null,
    level text not null,
    description text,
    image text,
    video_url text,
    what_you_learn text[] default '{}'::text[] not null,
    rating numeric(3, 2) default 4.50,
    students_count integer default 0,
    featured boolean default false
);

-- 3. SYLLABUS / WEEKS TABLE
create table if not exists course_weeks (
    id serial primary key,
    course_id integer references courses(id) on delete cascade not null,
    week_number integer not null,
    topic text not null,
    content text not null,
    assignment text,
    unique(course_id, week_number)
);

-- 4. COHORTS TABLE
create table if not exists cohorts (
    id serial primary key,
    course_id integer references courses(id) on delete cascade not null,
    name text not null,
    start_date date not null,
    end_date date not null,
    is_active boolean default true not null
);

-- 5. ENROLLMENTS TABLE (Access Control & Payment Tracker)
create table if not exists enrollments (
    id serial primary key,
    user_id uuid references users(id) on delete cascade not null,
    cohort_id integer references cohorts(id) on delete cascade not null,
    paid_status boolean default false not null,
    payment_reference text unique,
    enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, cohort_id)
);

-- 6. STUDENT PROGRESS TABLE
create table if not exists student_progress (
    id serial primary key,
    user_id uuid references users(id) on delete cascade not null,
    course_id integer references courses(id) on delete cascade not null,
    completed_weeks integer[] default '{}'::integer[] not null,
    current_week integer default 1 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, course_id)
);

-- 7. PROJECT SUBMISSIONS TABLE (HNG Workflow)
create table if not exists submissions (
    id serial primary key,
    user_id uuid references users(id) on delete cascade not null,
    course_id integer references courses(id) on delete cascade not null,
    week_number integer not null,
    git_link text,
    live_link text,
    grade_score integer, -- scale 1-100 or null if ungraded
    tutor_feedback text,
    graded_by uuid references users(id),
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, course_id, week_number)
);

-- 8. LIVE CLASSES TABLE (Schedules & Recorded links)
create table if not exists live_classes (
    id serial primary key,
    cohort_id integer references cohorts(id) on delete cascade not null,
    topic text not null,
    schedule_time timestamp with time zone not null,
    meeting_link text not null,
    recording_link text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. USER SESSIONS TABLE (Concurrent Login Prevention)
create table if not exists user_sessions (
    id serial primary key,
    user_id uuid references users(id) on delete cascade unique not null,
    active_session_id text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for search efficiency
create index if not exists idx_users_email on users(email);
create index if not exists idx_enrollments_user_id on enrollments(user_id);
create index if not exists idx_student_progress_user_course on student_progress(user_id, course_id);
create index if not exists idx_submissions_user_course_week on submissions(user_id, course_id, week_number);
create index if not exists idx_live_classes_cohort_time on live_classes(cohort_id, schedule_time);

-- Migration updates
alter table courses add column if not exists video_url text;
