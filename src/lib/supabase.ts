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
  assignedCourseId?: number;
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
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE', 
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
  courseId: number | null,
  courseName: string | null,
  paymentReceiptName: string | null
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

      const user = authData.user || (authData.id ? authData : null);
      if (!user) throw new Error('Auth creation failed');
      const userId = user.id;

      // 2. Insert user profile into custom users table
      await fetchSupabaseRest('users', 'POST', '', {
        id: userId,
        email,
        full_name: fullName,
        role: 'student'
      });

      if (courseId) {
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
      }

      const session: UserSession = {
        id: userId,
        email,
        fullName,
        role: 'student',
        courseId: courseId || undefined,
        courseName: courseName || undefined,
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
      status: courseId ? 'pending_verification' : 'registered',
      enrolledAt: new Date().toISOString()
    };

    students.push(mockStudent);
    setLocalStorageItem('gisek_students', students);

    const session: UserSession = {
      id: mockId,
      email,
      fullName,
      role: 'student',
      courseId: courseId || undefined,
      courseName: courseName || undefined,
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
        enrolled,
        assignedCourseId: userRecord.assigned_course_id || undefined
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
        role: matchedUser.role || (email.includes('admin') ? 'admin' : email.includes('tutor') ? 'tutor' : 'student'),
        courseId: matchedUser.courseId,
        courseName: matchedUser.courseName,
        enrolled: isPaid,
        assignedCourseId: matchedUser.assignedCourseId
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
          enrolled: true,
          assignedCourseId: undefined
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
      return getLocalStorageItem<any[]>('gisek_live_classes_mock', getMockLiveClasses());
    }
  } else {
    return getLocalStorageItem<any[]>('gisek_live_classes_mock', getMockLiveClasses());
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
export async function getAllSubmissions(assignedCourseId?: number): Promise<SubmissionData[]> {
  if (isLiveDb()) {
    try {
      let query = '';
      if (assignedCourseId !== undefined && assignedCourseId !== null) {
        query = `?course_id=eq.${assignedCourseId}`;
      }
      const dbSubs = await fetchSupabaseRest('submissions', 'GET', query);
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
      return getMockSubmissions(assignedCourseId);
    }
  } else {
    return getMockSubmissions(assignedCourseId);
  }
}

function getMockSubmissions(assignedCourseId?: number): SubmissionData[] {
  if (typeof window !== 'undefined') {
    const allMock: SubmissionData[] = [];
    const keys = Object.keys(localStorage);
    const subKeys = keys.filter(k => k.startsWith('subs_'));
    for (const key of subKeys) {
      const parts = key.split('_');
      const userId = parts[1];
      const courseId = parseInt(parts[2]);
      
      // Filter by assigned course id if tutor is restricted
      if (assignedCourseId !== undefined && assignedCourseId !== null && courseId !== assignedCourseId) {
        continue;
      }
      
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
  
  const defaultSubs = [
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
  if (assignedCourseId !== undefined && assignedCourseId !== null) {
    return defaultSubs.filter(s => s.courseId === assignedCourseId);
  }
  return defaultSubs;
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

/**
 * Enroll a student in a course track from the dashboard
 */
export async function enrollInCourse(
  userId: string,
  courseId: number,
  courseName: string,
  paymentMethod: 'bank' | 'online',
  receiptName: string | null
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      // 1. Find active cohort
      const cohorts = await fetchSupabaseRest('cohorts', 'GET', `?course_id=eq.${courseId}&is_active=eq.true&limit=1`);
      if (!cohorts || cohorts.length === 0) {
        throw new Error('No active cohort found for this track. Please contact support.');
      }
      const cohortId = cohorts[0].id;

      // 2. Insert or update enrollment
      const enrollments = await fetchSupabaseRest('enrollments', 'GET', `?user_id=eq.${userId}&cohort_id=eq.${cohortId}`);
      
      const reference = paymentMethod === 'online' 
        ? `REF-PAYSTACK-${Date.now()}`
        : (receiptName || `REF-BANK-${Date.now()}`);

      if (enrollments && enrollments.length > 0) {
        await fetchSupabaseRest('enrollments', 'PATCH', `?id=eq.${enrollments[0].id}`, {
          paid_status: false,
          payment_reference: reference
        });
      } else {
        await fetchSupabaseRest('enrollments', 'POST', '', {
          user_id: userId,
          cohort_id: cohortId,
          paid_status: false,
          payment_reference: reference
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  } else {
    // LocalStorage Mock
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const idx = students.findIndex(s => s.id === userId);
    
    if (idx >= 0) {
      students[idx].courseId = courseId;
      students[idx].courseName = courseName;
      students[idx].paymentReceipt = receiptName;
      students[idx].status = paymentMethod === 'online' ? 'verified' : 'pending_verification';
      setLocalStorageItem('gisek_students', students);

      // Also update currentUser in localStorage if active
      if (typeof window !== 'undefined') {
        const userSession = localStorage.getItem('currentUser');
        if (userSession) {
          const user = JSON.parse(userSession);
          if (user.id === userId) {
            user.course = courseName;
            user.courseId = courseId;
            user.enrolled = paymentMethod === 'online'; // online activates immediately in mock
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        }
      }
      
      return { success: true };
    }
    return { success: false, error: 'User profile not found in local records' };
  }
}

/**
 * Update course preview video, price, description, and cover image
 */
export async function updateCourseDetails(
  courseId: number,
  videoUrl: string,
  image?: string,
  price?: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('courses', 'PATCH', `?id=eq.${courseId}`, {
        video_url: videoUrl,
        ...(image ? { image } : {}),
        ...(price ? { price } : {}),
        ...(description ? { description } : {})
      });
      return { success: true };
    } catch (err: any) {
      console.error('Supabase course patch error:', err);
      return { success: false, error: err.message || 'Failed to update course details' };
    }
  } else {
    // LocalStorage Mock
    const courses = getLocalStorageItem<any[]>('gisek_courses_mock', []);
    const idx = courses.findIndex(c => c.id === courseId);
    if (idx >= 0) {
      courses[idx].videoUrl = videoUrl;
      if (image) courses[idx].image = image;
      if (price) courses[idx].price = price;
      if (description) courses[idx].description = description;
      setLocalStorageItem('gisek_courses_mock', courses);
      return { success: true };
    }
    return { success: false, error: 'Course not found in mock storage.' };
  }
}

// ==============================================================================
// LEARNING MANAGEMENT & RESOURCE LIBRARY FUNCTIONS
// ==============================================================================

export interface AdminTutorData {
  id: string;
  fullName: string;
  email: string;
  role: 'tutor' | 'admin';
  assignedCourseId?: number;
  assignedCourseName?: string;
}

export async function scheduleLiveClass(
  cohortId: number,
  topic: string,
  scheduleTime: string,
  meetingLink: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('live_classes', 'POST', '', {
        cohort_id: cohortId,
        topic,
        schedule_time: scheduleTime,
        meeting_link: meetingLink
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const list = getLocalStorageItem<any[]>('gisek_live_classes_mock', getMockLiveClasses());
    const newId = list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1;
    list.push({
      id: newId,
      cohort_id: cohortId,
      topic,
      schedule_time: scheduleTime,
      meeting_link: meetingLink,
      recording_link: null
    });
    setLocalStorageItem('gisek_live_classes_mock', list);
    return { success: true };
  }
}

export async function publishClassRecording(
  classId: number,
  recordingLink: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('live_classes', 'PATCH', `?id=eq.${classId}`, {
        recording_link: recordingLink
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const list = getLocalStorageItem<any[]>('gisek_live_classes_mock', getMockLiveClasses());
    const idx = list.findIndex(l => l.id === classId);
    if (idx >= 0) {
      list[idx].recording_link = recordingLink;
      setLocalStorageItem('gisek_live_classes_mock', list);
      return { success: true };
    }
    return { success: false, error: 'Live class not found' };
  }
}

function getMockResources() {
  return [
    {
      id: 1,
      course_id: 1,
      title: 'Git & GitHub Cheat Sheet',
      description: 'Essential Git commands for team collaboration.',
      url: 'https://education.github.com/git-cheat-sheet-education.pdf',
      category: 'Reference',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      course_id: 1,
      title: 'HNG Stage 1 Project Template',
      description: 'Boilerplate template for HNG stage 1 task.',
      url: 'https://github.com/hng/stage1-template',
      category: 'Template',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      course_id: 2,
      title: 'SQL Query Optimization Guide',
      description: 'Performance tuning and indexing strategies.',
      url: 'https://use-the-index-luke.com/',
      category: 'Slides',
      created_at: new Date().toISOString()
    }
  ];
}

export async function addLearningResource(
  courseId: number,
  title: string,
  description: string,
  url: string,
  category: string
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('resources', 'POST', '', {
        course_id: courseId,
        title,
        description,
        url,
        category,
        created_at: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const list = getLocalStorageItem<any[]>('gisek_resources_mock', getMockResources());
    const newId = list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1;
    list.push({
      id: newId,
      course_id: courseId,
      title,
      description,
      url,
      category,
      created_at: new Date().toISOString()
    });
    setLocalStorageItem('gisek_resources_mock', list);
    return { success: true };
  }
}

export async function getLearningResources(courseId: number): Promise<any[]> {
  if (isLiveDb()) {
    try {
      return await fetchSupabaseRest('resources', 'GET', `?course_id=eq.${courseId}&order=created_at.desc`);
    } catch (err) {
      console.error(err);
      return [];
    }
  } else {
    const list = getLocalStorageItem<any[]>('gisek_resources_mock', getMockResources());
    return list.filter(l => l.course_id === courseId);
  }
}

export async function deleteLearningResource(resourceId: number): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('resources', 'DELETE', `?id=eq.${resourceId}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  } else {
    const list = getLocalStorageItem<any[]>('gisek_resources_mock', getMockResources());
    const filtered = list.filter(l => l.id !== resourceId);
    setLocalStorageItem('gisek_resources_mock', filtered);
    return { success: true };
  }
}

export async function getAdminTutors(): Promise<AdminTutorData[]> {
  if (isLiveDb()) {
    try {
      const users = await fetchSupabaseRest('users', 'GET');
      const courses = await fetchSupabaseRest('courses', 'GET');
      
      return users
        .filter((u: any) => u.role === 'tutor' || u.role === 'admin')
        .map((u: any) => {
          const course = courses.find((cr: any) => cr.id === u.assigned_course_id);
          return {
            id: u.id,
            fullName: u.full_name,
            email: u.email,
            role: u.role,
            assignedCourseId: u.assigned_course_id || undefined,
            assignedCourseName: course ? course.name : 'All Tracks'
          };
        });
    } catch (err) {
      console.error(err);
      return [];
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const defaults = [
      { id: 'mock-tutor-default-id', fullName: 'Lead Course Tutor', email: 'tutor@gisec.africa', role: 'tutor', assignedCourseId: undefined },
      { id: 'mock-admin-default-id', fullName: 'GISEC Administrator', email: 'admin@gisec.africa', role: 'admin', assignedCourseId: undefined }
    ];
    
    const tutorsList = [...students.filter(s => s.role === 'tutor' || s.role === 'admin')];
    
    for (const def of defaults) {
      if (!tutorsList.some(t => t.email === def.email) && !students.some(s => s.email === def.email)) {
        tutorsList.push(def);
      }
    }
    
    const courses = [
      { id: 1, name: 'Software Engineering' },
      { id: 2, name: 'Data Analytics' },
      { id: 3, name: 'Cybersecurity' },
      { id: 4, name: 'UI/UX Design' },
      { id: 5, name: 'Product Management' },
      { id: 6, name: 'Digital Marketing' }
    ];
    
    return tutorsList.map(t => {
      const course = courses.find(c => c.id === t.assignedCourseId);
      return {
        id: t.id,
        fullName: t.fullName,
        email: t.email,
        role: t.role,
        assignedCourseId: t.assignedCourseId,
        assignedCourseName: course ? course.name : 'All Tracks'
      };
    });
  }
}

export async function assignTutorToCourse(
  tutorId: string,
  courseId: number | null
): Promise<{ success: boolean; error?: string }> {
  if (isLiveDb()) {
    try {
      await fetchSupabaseRest('users', 'PATCH', `?id=eq.${tutorId}`, {
        assigned_course_id: courseId
      });
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to assign course' };
    }
  } else {
    const students = getLocalStorageItem<any[]>('gisek_students', []);
    const idx = students.findIndex(s => s.id === tutorId);
    if (idx >= 0) {
      students[idx].assignedCourseId = courseId || undefined;
      setLocalStorageItem('gisek_students', students);
      return { success: true };
    } else {
      const defaults = [
        { id: 'mock-tutor-default-id', fullName: 'Lead Course Tutor', email: 'tutor@gisec.africa', role: 'tutor' },
        { id: 'mock-admin-default-id', fullName: 'GISEC Administrator', email: 'admin@gisec.africa', role: 'admin' }
      ];
      const matched = defaults.find(d => d.id === tutorId);
      if (matched) {
        students.push({
          ...matched,
          assignedCourseId: courseId || undefined,
          status: 'active',
          enrolledAt: new Date().toISOString()
        });
        setLocalStorageItem('gisek_students', students);
        return { success: true };
      }
    }
    return { success: false, error: 'Tutor account not found' };
  }
}
