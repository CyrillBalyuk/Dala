// Test script to set up localStorage for certificate testing
// Copy and paste this into browser console on http://localhost:5174

// Step 1: Set user data
const userData = {
  id: "user-qa",
  name: "QA Tester",
  email: "qa@t"
};
localStorage.setItem('edu_user', JSON.stringify(userData));
console.log('✅ User data set:', userData);

// Step 2: Set progress data for course-web-1 (all assignments completed)
const progressData = {
  "course-web-1": {
    "a1": true,
    "a2": true,
    "a3": true,
    "a4": true,
    "a5": true
  }
};
localStorage.setItem('edu_progress', JSON.stringify(progressData));
console.log('✅ Progress data set:', progressData);

// Step 3: Verify data was set
console.log('📦 localStorage.edu_user:', localStorage.getItem('edu_user'));
console.log('📦 localStorage.edu_progress:', localStorage.getItem('edu_progress'));

console.log('🎯 Now navigate to: http://localhost:5174/course/course-web-1');
console.log('🎯 The download buttons should be active!');