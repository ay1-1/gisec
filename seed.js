// ==============================================================================
// GISEC Technologies Platform - Database Seeder Script (Dependency-Free)
// Run this script to populate your Supabase database with courses and weeks.
// Execution command: node seed.js
// ==============================================================================

const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found. Please verify configuration.');
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const equalIdx = trimmed.indexOf('=');
    if (equalIdx > 0) {
      const key = trimmed.slice(0, equalIdx).trim();
      let val = trimmed.slice(equalIdx + 1).trim();
      
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey || serviceKey.startsWith('sb_secret_...')) {
  console.error('❌ Error: Missing Supabase URL or Service Role secret key in .env.local.');
  process.exit(1);
}

// 2. Fetch wrapper helper
async function callSupabase(table, method, body = null, query = '') {
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const response = await fetch(url, {
    method,
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase request to ${table} failed: ${response.status} ${response.statusText}\nDetails: ${errText}`);
  }

  return response.json();
}

async function runSeed() {
  try {
    console.log('🚀 Loading courses from public/data/courses.json...');
    const coursesFilePath = path.join(__dirname, 'public', 'data', 'courses.json');
    if (!fs.existsSync(coursesFilePath)) {
      throw new Error(`Courses data file not found at ${coursesFilePath}`);
    }
    
    const rawData = fs.readFileSync(coursesFilePath, 'utf8');
    const { courses } = JSON.parse(rawData);

    console.log(`\n⏳ Seeding ${courses.length} learning tracks into database...`);

    for (const c of courses) {
      console.log(`\n🔹 Seeding Track: "${c.name}"`);

      // A. Insert Course
      const insertedCourses = await callSupabase('courses', 'POST', {
        id: c.id,
        name: c.name,
        duration: c.duration,
        tools: c.tools,
        price: c.price,
        level: c.level,
        description: c.description,
        image: c.image,
        what_you_learn: c.whatYouLearn,
        rating: c.rating,
        students_count: c.students,
        featured: c.featured
      });

      const dbCourse = insertedCourses[0];
      console.log(`   ✅ Course saved. ID: ${dbCourse.id}`);

      // B. Insert Syllabus Weeks
      if (c.weeks && c.weeks.length > 0) {
        console.log(`   ⏳ Seeding weeks syllabus for "${c.name}"...`);
        const weeksPayload = c.weeks.map(w => ({
          course_id: dbCourse.id,
          week_number: w.week,
          topic: w.topic,
          content: w.content,
          assignment: w.assignment
        }));

        await callSupabase('course_weeks', 'POST', weeksPayload);
        console.log(`   ✅ Saved ${c.weeks.length} week modules.`);
      }

      // C. Insert Default Cohort
      console.log(`   ⏳ Initializing default cohort for "${c.name}"...`);
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 90); // 12-week timeline

      await callSupabase('cohorts', 'POST', {
        course_id: dbCourse.id,
        name: `${c.name} - Cohort 1`,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        is_active: true
      });
      console.log(`   ✅ Default active cohort created.`);
    }

    // D. Insert Mock Live Classes for Cohort 1
    console.log('\n⏳ Initializing mock live class roster...');
    const cohorts = await callSupabase('cohorts', 'GET', null, '?limit=1');
    if (cohorts && cohorts.length > 0) {
      const cohortId = cohorts[0].id;
      
      const startClass = new Date();
      startClass.setDate(startClass.getDate() + 2); // 2 days from now
      
      await callSupabase('live_classes', 'POST', [
        {
          cohort_id: cohortId,
          topic: 'Live Q&A Session - Foundation Principles',
          schedule_time: startClass.toISOString(),
          meeting_link: 'https://zoom.us/mock-meeting-gisec-1'
        }
      ]);
      console.log('   ✅ Roster initialized.');
    }

    console.log('\n🎉 Database successfully seeded with GISEC learning curricula and track structures!');
  } catch (error) {
    console.error('\n❌ Seeding failed with error:', error.message);
    process.exit(1);
  }
}

runSeed();
