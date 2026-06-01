// Load courses from JSON file
async function loadCourses() {
    try {
        const response = await fetch('../data/courses.json');
        const data = await response.json();
        displayCourses(data.courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('coursesGrid').innerHTML = '<p>Error loading courses. Please refresh the page.</p>';
    }
}

function displayCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-header">
                <h2>${course.name}</h2>
                <span class="price">${course.price}</span>
            </div>
            <p class="duration">⏱️ ${course.duration}</p>
            <div class="tools">
                <strong>Tools:</strong>
                ${course.tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
            </div>
            <div class="weeks-preview">
                <strong>What you'll learn (first 4 weeks):</strong>
                <ul>
                    ${course.weeks.slice(0, 4).map(week => `
                        <li>Week ${week.week}: ${week.topic}</li>
                    `).join('')}
                </ul>
            </div>
            <button onclick="enrollInCourse(${course.id}, '${course.name}')" class="btn-enroll">
                Enroll Now →
            </button>
        </div>
    `).join('');
}

function enrollInCourse(courseId, courseName) {
    // Store selected course in localStorage
    localStorage.setItem('selectedCourse', JSON.stringify({ id: courseId, name: courseName }));
    // Redirect to signup page
    window.location.href = 'signup.html';
}

// Load courses when page loads
if (document.getElementById('coursesGrid')) {
    loadCourses();
}