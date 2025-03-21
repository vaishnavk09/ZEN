// Debug script for mood tracker
console.log("Mood debug script loaded");

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, checking for token");
  // Check for token
  const token = localStorage.getItem('token');
  console.log("Token exists:", !!token);
  
  if (!token) {
    console.error("No token found, redirecting to login");
    return;
  }
  
  // Test the mood API endpoints
  testMoodAPI(token);
});

async function testMoodAPI(token) {
  try {
    console.log("Testing getMoods API call");
    const moodsResponse = await window.mindfulmeAPI.mood.getMoods(token);
    console.log("Moods response:", moodsResponse);
    
    // Test creating a mood entry
    console.log("Testing createMood API call");
    const newMood = {
      mood: 4,
      notes: "Test mood entry from debug script",
      date: new Date().toISOString()
    };
    
    const createResponse = await window.mindfulmeAPI.mood.createMood(newMood, token);
    console.log("Create mood response:", createResponse);
    
    // Get moods again to verify the new entry is there
    const updatedMoodsResponse = await window.mindfulmeAPI.mood.getMoods(token);
    console.log("Updated moods response:", updatedMoodsResponse);
    
    if (updatedMoodsResponse.data && updatedMoodsResponse.data.length > 0) {
      // Test deleting the mood entry
      const moodToDelete = updatedMoodsResponse.data[0]._id;
      console.log("Testing deleteMood API call for ID:", moodToDelete);
      const deleteResponse = await window.mindfulmeAPI.mood.deleteMood(moodToDelete, token);
      console.log("Delete mood response:", deleteResponse);
    }
  } catch (error) {
    console.error("Error testing mood API:", error);
  }
} 