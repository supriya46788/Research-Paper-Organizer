document.addEventListener("DOMContentLoaded", function () {
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