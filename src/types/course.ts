export interface SyllabusWeek {
  week: number;
  topic: string;
  content: string;
  assignment?: string;
}

export interface Course {
  id: number;
  name: string;
  duration: string;
  tools: string[];
  price: string;
  level: string;
  students?: number;
  rating?: number;
  featured?: boolean;
  image?: string;
  videoUrl?: string;
  description?: string;
  whatYouLearn?: string[];
  weeks?: SyllabusWeek[];
}
