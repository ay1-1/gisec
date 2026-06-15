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

// ==============================================================================
// ADMIN OPERATIONS (COHORT, STUDENT, AND ROLE MANAGEMENT)
// ==============================================================================

export interface AdminStats {
  totalStudents: number;
  totalTutors: number;
  activeCohorts: number;
  totalRevenue: string;
}

export interface AdminStudentData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  courseName: string;
  cohortId?: number;
  cohortName?: string;
  paidStatus: boolean;
  enrolledAt: string;
}

export interface AdminCohortData {
  id: number;
  courseId: number;
  courseName: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (isLiveDb()) {
    try {
      const users = await fetchSupabaseRest('users', 'GET');
      const cohorts = await fetchSupabaseRest('cohorts', 'GET');
      const enrollments = await fetchSupabaseRest('enrollments', 'GET');
      
      const studentsCount = users.filter((u: any) => u.role === 'student').length;
      const tutorsCount = users.filter((u: any) => u.role === 'tutor' || u.role === 'admin').length;
      const activeCohortsCount = cohorts.filter((c: any) => c.is_active).length;
      const paidCount = enrollments.filter((e: any) => e.paid_status).length;
      
      const totalRev = paidCount * 150000;
      
      return {
        totalStudents: studentsCount,
        totalTutors: tutorsCount,
        activeCohorts: activeCohortsCount,
        totalRevenue: `₦${totalRev.toLocaleString()}`
      };
    } catch (err) {
      console.error(err);
      return { totalStudents: 0, totalTutors: 0, activeCohorts: 0, totalRevenue: '₦0' };
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const cohorts = getLocalStorageItem<any[]>('gisek_cohorts', [
      { id: 1, course_id: 1, name: 'SE Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true },
      { id: 2, course_id: 2, name: 'DA Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true }
    ]);
    const tutorsCount = students.filter(s => s.role === 'tutor' || s.role === 'admin' || s.email.includes('admin') || s.email.includes('tutor')).length + 2; 
    const activeCount = cohorts.filter(c => c.is_active).length;
    const paidCount = students.filter(s => s.status === 'active' || s.status === 'verified' || s.status === 'paid').length;
    
    return {
      totalStudents: students.filter(s => !s.role || s.role === 'student').length,
      totalTutors: tutorsCount,
      activeCohorts: activeCount,
      totalRevenue: `₦${(paidCount * 150000).toLocaleString()}`
    };
  }
}

export async function getAdminStudents(): Promise<AdminStudentData[]> {
  if (isLiveDb()) {
    try {
      const users = await fetchSupabaseRest('users', 'GET', '?role=eq.student');
      const enrollments = await fetchSupabaseRest('enrollments', 'GET');
      const cohorts = await fetchSupabaseRest('cohorts', 'GET');
      const courses = await fetchSupabaseRest('courses', 'GET');
      
      return users.map((u: any) => {
        const enrollment = enrollments.find((e: any) => e.user_id === u.id);
        const cohort = enrollment ? cohorts.find((c: any) => c.id === enrollment.cohort_id) : null;
        const course = cohort ? courses.find((cr: any) => cr.id === cohort.course_id) : null;
        
        return {
          id: u.id,
          fullName: u.full_name,
          email: u.email,
          phone: u.phone || 'N/A',
          courseName: course ? course.name : 'Not Assigned',
          cohortId: cohort ? cohort.id : undefined,
          cohortName: cohort ? cohort.name : undefined,
          paidStatus: enrollment ? enrollment.paid_status : false,
          enrolledAt: u.created_at
        };
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const cohorts = getLocalStorageItem<any[]>('gisek_cohorts', [
      { id: 1, course_id: 1, name: 'SE Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true },
      { id: 2, course_id: 2, name: 'DA Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true }
    ]);
    
    return students
      .filter(s => !s.role || s.role === 'student')
      .map(s => {
        const cohort = cohorts.find(c => c.id === s.cohortId || (c.course_id === s.courseId));
        return {
          id: s.id,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone || 'N/A',
          courseName: s.courseName || 'Software Engineering',
          cohortId: s.cohortId || (cohort ? cohort.id : undefined),
          cohortName: s.cohortName || (cohort ? cohort.name : undefined),
          paidStatus: s.status === 'active' || s.status === 'verified' || s.status === 'paid',
          enrolledAt: s.enrolledAt || new Date().toISOString()
        };
      });
  }
}

export async function getAdminCohorts(): Promise<AdminCohortData[]> {
  if (isLiveDb()) {
    try {
      const cohorts = await fetchSupabaseRest('cohorts', 'GET');
      const courses = await fetchSupabaseRest('courses', 'GET');
      
      return cohorts.map((c: any) => {
        const course = courses.find((cr: any) => cr.id === c.course_id);
        return {
          id: c.id,
          courseId: c.course_id,
          courseName: course ? course.name : 'Unknown',
          name: c.name,
          startDate: c.start_date,
          endDate: c.end_date,
          isActive: c.is_active
        };
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  } else {
    const cohorts = getLocalStorageItem<any[]>('gisek_cohorts', [
      { id: 1, course_id: 1, name: 'SE Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true },
      { id: 2, course_id: 2, name: 'DA Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true }
    ]);
    const courses = [
      { id: 1, name: 'Software Engineering' },
      { id: 2, name: 'Data Analytics' },
      { id: 3, name: 'Cybersecurity' },
      { id: 4, name: 'UI/UX Design' },
      { id: 5, name: 'Product Management' },
      { id: 6, name: 'Digital Marketing' }
    ];
    
    return cohorts.map(c => {
      const course = courses.find(cr => cr.id === c.course_id || cr.name.toLowerCase() === c.name.toLowerCase());
      return {
        id: c.id,
        courseId: c.course_id,
        courseName: course ? course.name : 'Software Engineering',
        name: c.name,
        startDate: c.start_date,
        endDate: c.end_date,
        isActive: c.is_active
      };
    });
  }
}

export async function createNewCohort(
  courseId: number,
  name: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('cohorts', 'POST', '', {
        course_id: courseId,
        name,
        start_date: startDate,
        end_date: endDate,
        is_active: true
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const cohorts = getLocalStorageItem<any[]>('gisek_cohorts', [
      { id: 1, course_id: 1, name: 'SE Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true },
      { id: 2, course_id: 2, name: 'DA Cohort 1', start_date: '2026-06-01', end_date: '2026-09-01', is_active: true }
    ]);
    const newId = cohorts.length > 0 ? Math.max(...cohorts.map(c => c.id)) + 1 : 1;
    cohorts.push({
      id: newId,
      course_id: courseId,
      name,
      start_date: startDate,
      end_date: endDate,
      is_active: true
    });
    setLocalStorageItem('gisek_cohorts', cohorts);
    return { success: true };
  }
}

export async function toggleCohortStatus(
  cohortId: number,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('cohorts', 'PATCH', `?id=eq.${cohortId}`, {
        is_active: isActive
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const cohorts = getLocalStorageItem<any[]>('gisek_cohorts', []);
    const idx = cohorts.findIndex(c => c.id === cohortId);
    if (idx >= 0) {
      cohorts[idx].is_active = isActive;
      setLocalStorageItem('gisek_cohorts', cohorts);
      return { success: true };
    }
    return { success: false, error: 'Cohort not found' };
  }
}

export async function onboardNewTutor(
  email: string,
  fullName: string,
  role: 'tutor' | 'admin' = 'tutor'
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      const tempPassword = `GisecStaff@${email.split('@')[0]}!`;
      
      const authData = await fetchSupabaseAuth('signup', {
        email,
        password: tempPassword,
        data: {
          full_name: fullName
        }
      });
      
      if (!authData.user) throw new Error('Auth creation failed');
      const userId = authData.user.id;
      
      await fetchSupabaseRest('users', 'POST', '', {
        id: userId,
        email,
        full_name: fullName,
        role: role
      });
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const exists = students.some(s => s.email === email);
    if (exists) {
      const idx = students.findIndex(s => s.email === email);
      students[idx].role = role;
      students[idx].fullName = fullName;
      setLocalStorageItem('gisek_students', students);
      return { success: true };
    }
    
    students.push({
      id: crypto.randomUUID(),
      fullName,
      email,
      role: role,
      status: 'active',
      enrolledAt: new Date().toISOString()
    });
    setLocalStorageItem('gisek_students', students);
    return { success: true };
  }
}

export async function updateStudentEnrollment(
  userId: string,
  cohortId: number,
  paidStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      const enrollments = await fetchSupabaseRest('enrollments', 'GET', `?user_id=eq.${userId}`);
      if (enrollments && enrollments.length > 0) {
        await fetchSupabaseRest('enrollments', 'PATCH', `?user_id=eq.${userId}`, {
          cohort_id: cohortId,
          paid_status: paidStatus
        });
      } else {
        await fetchSupabaseRest('enrollments', 'POST', '', {
          user_id: userId,
          cohort_id: cohortId,
          paid_status: paidStatus,
          payment_reference: `REF-ADMIN-${Date.now()}`
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const idx = students.findIndex(s => s.id === userId);
    if (idx >= 0) {
      const cohorts = getLocalStorageItem<any[]>('gisek_cohorts', []);
      const matchedCohort = cohorts.find(c => c.id === cohortId);
      
      students[idx].cohortId = cohortId;
      if (matchedCohort) {
        students[idx].cohortName = matchedCohort.name;
        students[idx].courseId = matchedCohort.course_id;
      }
      students[idx].status = paidStatus ? 'verified' : 'pending_verification';
      setLocalStorageItem('gisek_students', students);
      return { success: true };
    }
    return { success: false, error: 'Student profile not found' };
  }
}
