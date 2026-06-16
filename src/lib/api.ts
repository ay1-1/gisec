import coursesData from '@/public/data/courses.json';
import { Course } from '@/types/course';
import { isLiveDb } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Clean helper to query course tables via fetch
async function fetchSupabaseCourses(query: string = ''): Promise<any[]> {
  const url = `${supabaseUrl}/rest/v1/courses${query}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch courses from Supabase');
  }
  return res.json();
}

async function fetchCourseWeeks(courseId: number): Promise<any[]> {
  const url = `${supabaseUrl}/rest/v1/course_weeks?course_id=eq.${courseId}&order=week_number.asc`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function getCourses(): Promise<Course[]> {
  if (isLiveDb()) {
    try {
      const dbCourses = await fetchSupabaseCourses();
      return dbCourses.map(c => ({
        id: c.id,
        name: c.name,
        duration: c.duration,
        tools: c.tools || [],
        price: c.price,
        level: c.level,
        students: c.students_count,
        rating: Number(c.rating || 4.5),
        featured: c.featured,
        image: c.image,
        videoUrl: c.video_url,
        description: c.description,
        whatYouLearn: c.what_you_learn || []
      }));
    } catch (err) {
      console.error('Database course fetch failed. Falling back to local courses.json', err);
    }
  }
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('gisek_courses_mock');
    if (cached) {
      return JSON.parse(cached) as Course[];
    }
  }
  
  return coursesData.courses as Course[];
}

export async function getCourseById(id: number): Promise<Course | null> {
  if (isLiveDb()) {
    try {
      const dbCourses = await fetchSupabaseCourses(`?id=eq.${id}&limit=1`);
      if (dbCourses && dbCourses.length > 0) {
        const c = dbCourses[0];
        const dbWeeks = await fetchCourseWeeks(c.id);
        
        return {
          id: c.id,
          name: c.name,
          duration: c.duration,
          tools: c.tools || [],
          price: c.price,
          level: c.level,
          students: c.students_count,
          rating: Number(c.rating || 4.5),
          featured: c.featured,
          image: c.image,
          videoUrl: c.video_url,
          description: c.description,
          whatYouLearn: c.what_you_learn || [],
          weeks: dbWeeks.map(w => ({
            week: w.week_number,
            topic: w.topic,
            content: w.content,
            assignment: w.assignment
          }))
        };
      }
    } catch (err) {
      console.error('Database getCourseById failed. Falling back to local search.', err);
    }
  }

  const courses = await getCourses();
  return courses.find(c => c.id === id) || null;
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const courses = await getCourses();
  return courses.filter(c => c.featured);
}
