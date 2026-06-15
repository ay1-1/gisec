import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isLiveDb } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Database helper inside route handler
async function updateEnrollmentInSupabase(email: string, reference: string): Promise<void> {
  // 1. Get user record
  const usersUrl = `${supabaseUrl}/rest/v1/users?email=eq.${email}&limit=1`;
  const userRes = await fetch(usersUrl, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  if (!userRes.ok) return;
  const users = await userRes.json();
  if (users.length === 0) return;
  const userId = users[0].id;

  // 2. Update paid status in enrollments table
  const enrollUrl = `${supabaseUrl}/rest/v1/enrollments?user_id=eq.${userId}`;
  await fetch(enrollUrl, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      paid_status: true,
      payment_reference: reference
    })
  });

  // 3. Initialize student progress tracking
  // Get the enrolled cohort/course ID first
  const enrollDetailUrl = `${supabaseUrl}/rest/v1/enrollments?user_id=eq.${userId}&limit=1`;
  const detailRes = await fetch(enrollDetailUrl, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  if (!detailRes.ok) return;
  const enrolls = await detailRes.json();
  if (enrolls.length === 0) return;
  const cohortId = enrolls[0].cohort_id;

  // Get course ID for cohort
  const cohortUrl = `${supabaseUrl}/rest/v1/cohorts?id=eq.${cohortId}&limit=1`;
  const cohortRes = await fetch(cohortUrl, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  });
  if (!cohortRes.ok) return;
  const cohorts = await cohortRes.json();
  if (cohorts.length === 0) return;
  const courseId = cohorts[0].course_id;

  // Upsert progress
  const progressUrl = `${supabaseUrl}/rest/v1/student_progress`;
  await fetch(progressUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      user_id: userId,
      course_id: courseId,
      completed_weeks: [],
      current_week: 1,
      updated_at: new Date().toISOString()
    })
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    // Local/Sandbox demo: if webhook secret is not set, we can allow unsecured verification
    if (!webhookSecret || webhookSecret.startsWith('whsec_...')) {
      const payload = JSON.parse(rawBody);
      const email = payload.data?.customer?.email || payload.email;
      const reference = payload.data?.reference || payload.reference;

      console.log('Sandbox payment webhook received:', { email, reference });
      
      if (isLiveDb() && email && reference) {
        await updateEnrollmentInSupabase(email, reference);
      }
      
      return NextResponse.json({ received: true, sandbox: true });
    }

    // Secure Verification for Production
    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature verification' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const email = event.data.customer.email;
      const reference = event.data.reference;

      console.log('Production charge success webhook:', { email, reference });

      if (isLiveDb()) {
        await updateEnrollmentInSupabase(email, reference);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
