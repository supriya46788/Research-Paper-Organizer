document.addEventListener("DOMContentLoaded", function () {
  const darkToggle = document.getElementById('darkToggle');
  const darkToggleIcon = document.getElementById('darkToggleIcon');
  
  // Check for saved dark mode preference or default to light mode
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Apply initial dark mode state
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkToggleIcon.className = 'fas fa-sun';
  }
  
  // Dark mode toggle handler
  darkToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Update icon
    darkToggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    
    // Save preference
    localStorage.setItem('darkMode', isDark.toString());
  });
  const form = document.getElementById("forgotForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    // Simulate API call
    alert(`If ${email} is registered, a reset link will be sent.`);
    
    // TODO: Replace with actual backend integration
    form.reset();
  });
});