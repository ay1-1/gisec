import coursesData from '@/public/data/courses.json';
import { Course } from '@/types/course';

export async function getCourses(): Promise<Course[]> {
  // Currently retrieves static JSON data asynchronously.
  // This can be easily refactored to fetch from a real backend REST API endpoint:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
  // return res.json();
  return coursesData.courses as Course[];
}

export async function getCourseById(id: number): Promise<Course | null> {
  const courses = await getCourses();
  return courses.find(c => c.id === id) || null;
}

export async function getFeaturedCourses(): Promise<Course[]> {
  const courses = await getCourses();
  return courses.filter(c => c.featured);
}
