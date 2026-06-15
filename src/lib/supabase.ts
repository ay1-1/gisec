// ==============================================================================
// GISEC Technologies Platform - REST Client for Supabase (Dependency-Free)
// ==============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if we have live credentials configured
export const isLiveDb = (): boolean => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// ==============================================================================
// CORE DATA INTERFACES
// ==============================================================================
export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'tutor' | 'admin';
  courseId?: number;
  courseName?: string;
  enrolled?: boolean;
}

// Local storage helper functions
const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item ? (JSON.parse(item) as T) : defaultValue;
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ==============================================================================
// PURE FETCH HELPERS TO SUPABASE ENDPOINTS
// ==============================================================================

async function fetchSupabaseAuth(endpoint: string, body: any) {
  const url = `${supabaseUrl}/auth/v1/${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error?.message || 'Auth action failed');
  }
  return data;
}

async function fetchSupabaseRest(
  table: string, 
  method: 'GET' | 'POST' | 'PATCH', 
  query: string = '', 
  body: any = null,
  headers: Record<string, string> = {}
) {
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Postgrest error on ${table}:`, errText);
    throw new Error(`Database error on ${table}`);
  }

  if (method === 'GET') {
    return res.json();
  }
  return res.text();
}

// ==============================================================================
// PUBLIC AUTH & DATA OPERATIONS
// ==============================================================================

/**
 * Sign up a new user (Student)
 */
export async function signUpUser(
  email: string,
  fullName: string,
  phone: string,
  courseId: number,
  courseName: string,
  paymentReceiptName: string
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  if (isLiveDb()) {
    try {
      const tempPassword = `GisecUser@${email.split('@')[0]}!`;
      
      // 1. Sign up user in Supabase Auth
      const authData = await fetchSupabaseAuth('signup', {
        email,
        password: tempPassword,
        data: {
          full_name: fullName,
          phone: phone
        }
      });

      if (!authData.user) throw new Error('Auth creation failed');
      const userId = authData.user.id;

      // 2. Insert user profile into custom users table
      await fetchSupabaseRest('users', 'POST', '', {
        id: userId,
        email,
        full_name: fullName,
        role: 'student'
      });

      // 3. Find active cohort for this course
      const cohorts = await fetchSupabaseRest('cohorts', 'GET', `?course_id=eq.${courseId}&is_active=eq.true&limit=1`);
      
      let cohortId = null;
      if (cohorts && cohorts.length > 0) {
        cohortId = cohorts[0].id;
      }

      if (cohortId) {
        // Create pending enrollment record
        await fetchSupabaseRest('enrollments', 'POST', '', {
          user_id: userId,
          cohort_id: cohortId,
          paid_status: false,
          payment_reference: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });
      }

      const session: UserSession = {
        id: userId,
        email,
        fullName,
        role: 'student',
        courseId,
        courseName,
        enrolled: false
      };

      return { success: true, session };
    } catch (err: any) {
      console.error('Supabase Sign Up Error:', err);
      return { success: false, error: err.message || 'Error occurred during registration' };
    }
  } else {
    // Fallback: LocalStorage Mock
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const userExists = students.some(s => s.email === email);
    
    if (userExists) {
      return { success: false, error: 'User already exists' };
    }

    const mockId = crypto.randomUUID();
    const mockStudent = {
      id: mockId,
      fullName,
      email,
      phone,
      courseId,
      courseName,
      paymentReceipt: paymentReceiptName,
      status: 'pending_verification',
      enrolledAt: new Date().toISOString()
    };

    students.push(mockStudent);
    setLocalStorageItem('gisek_students', students);

    const session: UserSession = {
      id: mockId,
      email,
      fullName,
      role: 'student',
      courseId,
      courseName,
      enrolled: false
    };

    return { success: true, session };
  }
}

/**
 * Log in an existing user
 */
export async function signInUser(
  email: string
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  if (isLiveDb()) {
    try {
      // Fetch user profile
      const usersList = await fetchSupabaseRest('users', 'GET', `?email=eq.${email}&limit=1`);
      if (!usersList || usersList.length === 0) {
        throw new Error('User account not found. Please register.');
      }
      const userRecord = usersList[0];

      // Fetch enrollment and course data
      const enrollments = await fetchSupabaseRest('enrollments', 'GET', `?user_id=eq.${userRecord.id}&limit=1`);
      
      let courseId: number | undefined = undefined;
      let courseName: string | undefined = undefined;
      let enrolled = false;

      if (enrollments && enrollments.length > 0) {
        enrolled = enrollments[0].paid_status;
        
        // Retrieve associated cohort/course info
        const cohortData = await fetchSupabaseRest('cohorts', 'GET', `?id=eq.${enrollments[0].cohort_id}&limit=1`);
        if (cohortData && cohortData.length > 0) {
          courseId = cohortData[0].course_id;
          const courseData = await fetchSupabaseRest('courses', 'GET', `?id=eq.${courseId}&limit=1`);
          if (courseData && courseData.length > 0) {
            courseName = courseData[0].name;
          }
        }
      }

      const session: UserSession = {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.full_name,
        role: userRecord.role,
        courseId,
        courseName,
        enrolled
      };

      // Set active session ID for concurrent login prevention
      const currentSessionId = crypto.randomUUID();
      await fetchSupabaseRest('user_sessions', 'POST', '', {
        user_id: userRecord.id,
        active_session_id: currentSessionId,
        updated_at: new Date().toISOString()
      }, {
        'Prefer': 'resolution=merge-duplicates'
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('session_uuid', currentSessionId);
      }

      return { success: true, session };
    } catch (err: any) {
      console.error('Supabase Sign In Error:', err);
      return { success: false, error: err.message || 'Error logging in' };
    }
  } else {
    // Fallback: LocalStorage Mock
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const matchedUser = students.find(s => s.email === email);

    if (matchedUser) {
      const isPaid = matchedUser.status === 'active' || matchedUser.status === 'verified';
      const session: UserSession = {
        id: matchedUser.id || 'mock-id',
        email: matchedUser.email,
        fullName: matchedUser.fullName,
        role: email.includes('admin') ? 'admin' : email.includes('tutor') ? 'tutor' : 'student',
        courseId: matchedUser.courseId,
        courseName: matchedUser.courseName,
        enrolled: isPaid
      };
      
      const currentSessionId = crypto.randomUUID();
      setLocalStorageItem(`session_${matchedUser.email}`, currentSessionId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('session_uuid', currentSessionId);
      }

      return { success: true, session };
    } else {
      // Demo credentials logic
      if (email === 'admin@gisec.africa' || email === 'tutor@gisec.africa') {
        const mockId = crypto.randomUUID();
        const session: UserSession = {
          id: mockId,
          email,
          fullName: email.startsWith('admin') ? 'GISEC Administrator' : 'Lead Course Tutor',
          role: email.startsWith('admin') ? 'admin' : 'tutor',
          enrolled: true
        };
        return { success: true, session };
      }
      return { success: false, error: 'User email not found. Please sign up.' };
    }
  }
}

/**
 * Check if the current user session is still valid
 */
export async function validateSession(email: string, userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  const currentSessionId = localStorage.getItem('session_uuid');
  if (!currentSessionId) return false;

  if (isLiveDb()) {
    try {
      const sessionsList = await fetchSupabaseRest('user_sessions', 'GET', `?user_id=eq.${userId}&limit=1`);
      if (!sessionsList || sessionsList.length === 0) return false;
      return sessionsList[0].active_session_id === currentSessionId;
    } catch {
      return false;
    }
  } else {
    // Fallback: LocalStorage
    const savedSessionId = localStorage.getItem(`session_${email}`);
    return savedSessionId === currentSessionId;
  }
}

/**
 * Fetch live classes for a given user's cohort
 */
export async function getLiveClasses(email: string): Promise<any[]> {
  if (isLiveDb()) {
    try {
      const usersList = await fetchSupabaseRest('users', 'GET', `?email=eq.${email}&limit=1`);
      if (!usersList || usersList.length === 0) return [];
      const userId = usersList[0].id;
      
      const enrollments = await fetchSupabaseRest('enrollments', 'GET', `?user_id=eq.${userId}&limit=1`);
      if (!enrollments || enrollments.length === 0) return [];
      const cohortId = enrollments[0].cohort_id;

      return await fetchSupabaseRest('live_classes', 'GET', `?cohort_id=eq.${cohortId}&order=schedule_time.asc`);
    } catch {
      return getMockLiveClasses();
    }
  } else {
    return getMockLiveClasses();
  }
}

function getMockLiveClasses() {
  return [
    {
      id: 1,
      topic: 'Live Q&A Session - Foundation Principles',
      schedule_time: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      meeting_link: 'https://zoom.us/mock-meeting-gisec-1',
      recording_link: null
    },
    {
      id: 2,
      topic: 'Industry Mentorship - Portfolio Building & Career Growth',
      schedule_time: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      meeting_link: 'https://zoom.us/mock-meeting-gisec-2',
      recording_link: 'https://youtube.com/watch?v=wv9Up_fVafc'
    }
  ];
}

export interface SubmissionData {
  id?: number;
  userId: string;
  courseId: number;
  weekNumber: number;
  gitLink: string;
  liveLink: string;
  gradeScore?: number;
  tutorFeedback?: string;
  submittedAt: string;
  studentName?: string;
}

/**
 * Get student submissions
 */
export async function getSubmissions(userId: string, courseId: number): Promise<SubmissionData[]> {
  if (isLiveDb()) {
    try {
      const dbSubs = await fetchSupabaseRest('submissions', 'GET', `?user_id=eq.${userId}&course_id=eq.${courseId}`);
      return dbSubs.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        courseId: s.course_id,
        weekNumber: s.week_number,
        gitLink: s.git_link,
        liveLink: s.live_link,
        gradeScore: s.grade_score,
        tutorFeedback: s.tutor_feedback,
        submittedAt: s.submitted_at
      }));
    } catch {
      return getLocalStorageItem<SubmissionData[]>(`subs_${userId}_${courseId}`, []);
    }
  } else {
    return getLocalStorageItem<SubmissionData[]>(`subs_${userId}_${courseId}`, []);
  }
}

/**
 * Submit project (HNG workflow)
 */
export async function submitProject(
  userId: string,
  courseId: number,
  weekNumber: number,
  gitLink: string,
  liveLink: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('submissions', 'POST', '', {
        user_id: userId,
        course_id: courseId,
        week_number: weekNumber,
        git_link: gitLink,
        live_link: liveLink,
        submitted_at: new Date().toISOString()
      }, {
        'Prefer': 'resolution=merge-duplicates'
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const key = `subs_${userId}_${courseId}`;
    const subs = getLocalStorageItem<SubmissionData[]>(key, []);
    const existingIdx = subs.findIndex(s => s.weekNumber === weekNumber);
    
    const newSub: SubmissionData = {
      userId,
      courseId,
      weekNumber,
      gitLink,
      liveLink,
      submittedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      subs[existingIdx] = { ...subs[existingIdx], ...newSub };
    } else {
      subs.push(newSub);
    }
    setLocalStorageItem(key, subs);
    return { success: true };
  }
}

/**
 * Get all submissions (for Tutors/Admins)
 */
export async function getAllSubmissions(): Promise<SubmissionData[]> {
  if (isLiveDb()) {
    try {
      const dbSubs = await fetchSupabaseRest('submissions', 'GET');
      const mapped: SubmissionData[] = [];
      for (const s of dbSubs) {
        const uRes = await fetchSupabaseRest('users', 'GET', `?id=eq.${s.user_id}&limit=1`);
        const name = uRes && uRes.length > 0 ? uRes[0].full_name : 'Student';
        mapped.push({
          id: s.id,
          userId: s.user_id,
          courseId: s.course_id,
          weekNumber: s.week_number,
          gitLink: s.git_link,
          liveLink: s.live_link,
          gradeScore: s.grade_score,
          tutorFeedback: s.tutor_feedback,
          submittedAt: s.submitted_at,
          studentName: name
        });
      }
      return mapped;
    } catch {
      return getMockSubmissions();
    }
  } else {
    return getMockSubmissions();
  }
}

function getMockSubmissions(): SubmissionData[] {
  if (typeof window !== 'undefined') {
    const allMock: SubmissionData[] = [];
    const keys = Object.keys(localStorage);
    const subKeys = keys.filter(k => k.startsWith('subs_'));
    for (const key of subKeys) {
      const parts = key.split('_');
      const userId = parts[1];
      const courseId = parseInt(parts[2]);
      const subs = JSON.parse(localStorage.getItem(key) || '[]') as SubmissionData[];
      
      const students = JSON.parse(localStorage.getItem('gisek_students') || '[]') as any[];
      const student = students.find(s => s.id === userId);
      const name = student ? student.fullName : 'Jane Doe';

      for (const s of subs) {
        allMock.push({
          ...s,
          studentName: name
        });
      }
    }
    if (allMock.length > 0) return allMock;
  }
  return [
    {
      id: 1,
      userId: 'student-1',
      courseId: 5,
      weekNumber: 1,
      gitLink: 'https://github.com/sample/hng-task-1',
      liveLink: 'https://hng-task-1.vercel.app',
      submittedAt: new Date().toISOString(),
      studentName: 'Blessing Obi'
    }
  ];
}

/**
 * Grade project submission (for Tutors/Admins)
 */
export async function gradeSubmission(
  submissionId: number | string,
  userId: string,
  courseId: number,
  weekNumber: number,
  score: number,
  feedback: string,
  tutorId: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb() && typeof submissionId === 'number') {
    try {
      await fetchSupabaseRest('submissions', 'PATCH', `?id=eq.${submissionId}`, {
        grade_score: score,
        tutor_feedback: feedback,
        graded_by: tutorId
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const key = `subs_${userId}_${courseId}`;
    const subs = getLocalStorageItem<SubmissionData[]>(key, []);
    const idx = subs.findIndex(s => s.weekNumber === weekNumber);
    if (idx >= 0) {
      subs[idx].gradeScore = score;
      subs[idx].tutorFeedback = feedback;
      setLocalStorageItem(key, subs);
      return { success: true };
    }
    return { success: false, error: 'Submission not found' };
  }
}

/**
 * Update User Profile
 */
export async function updateUserProfile(
  userId: string,
  email: string,
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('users', 'PATCH', `?id=eq.${userId}`, {
        full_name: fullName
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const idx = students.findIndex(s => s.id === userId || s.email === email);
    if (idx >= 0) {
      students[idx].fullName = fullName;
      setLocalStorageItem('gisek_students', students);
      return { success: true };
    }
    return { success: false, error: 'User not found in local records' };
  }
}
