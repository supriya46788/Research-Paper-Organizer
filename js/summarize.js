document.getElementById("summaryForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const pdfFile = document.getElementById("pdfFile").files[0];
  if (!pdfFile) {
    Swal.fire("Error", "Please select a PDF file first", "error");
    return;
  }

  // Validate file type
  if (pdfFile.type !== 'application/pdf') {
    Swal.fire("Error", "Please select a valid PDF file", "error");
    return;
  }

  // Validate file size (10MB)
  if (pdfFile.size > 10 * 1024 * 1024) {
    Swal.fire("Error", "File size must be less than 10MB", "error");
    return;
  }

  // Show loading spinner
  document.getElementById("loadingSpinner").classList.remove("hidden");
  document.getElementById("summaryResult").classList.add("hidden");

  const formData = new FormData();
  formData.append("file", pdfFile);

  try {
    // Updated API endpoint to match your routes
    const response = await fetch("http://localhost:3000/api/gemini/summarize", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    
    // Hide loading spinner
    document.getElementById("loadingSpinner").classList.add("hidden");

    if (data.success && data.summary) {
      document.getElementById("summaryText").innerHTML = data.summary.replace(/\n/g, '<br>');
      document.getElementById("summaryResult").classList.remove("hidden");
      
      Swal.fire({
        title: "Success!",
        text: "Your PDF has been summarized successfully",
        icon: "success"
      });
    } else {
      Swal.fire("Error", data.error || "Could not generate summary", "error");
    }

  } catch (error) {
    document.getElementById("loadingSpinner").classList.add("hidden");
    console.error("Error:", error);
    Swal.fire("Error", "Network error. Please check if the server is running.", "error");
  }
});

// Fixed: File selection feedback - check if elements exist first
document.getElementById("pdfFile").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    // Check if the upload area exists before trying to modify it
    const uploadArea = document.querySelector(".file-upload-area");
    if (uploadArea) {
      uploadArea.innerHTML = `
        <i class="fas fa-file-pdf upload-icon" style="color: #dc2626;"></i>
        <div class="upload-text">${file.name}</div>
        <div class="upload-subtext">File size: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
      `;
    }
    
    // Reset summary result on new file selection
    const summaryResult = document.getElementById("summaryResult");
    if (summaryResult) {
      summaryResult.classList.add("hidden");
    }
    
    console.log(`File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  }
});

// Fixed: Reset upload area - check if element exists first
const uploadArea = document.querySelector(".file-upload-area");
if (uploadArea) {
  uploadArea.addEventListener("click", function() {
    if (this.innerHTML.includes("fa-file-pdf")) {
      this.innerHTML = `
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <div class="upload-text">Choose PDF file or drag & drop</div>
        <div class="upload-subtext">Supports PDF files up to 10MB</div>
      `;
      
      const pdfFileInput = document.getElementById("pdfFile");
      if (pdfFileInput) {
        pdfFileInput.value = "";
      }
      
      const summaryResult = document.getElementById("summaryResult");
      if (summaryResult) {
        summaryResult.classList.add("hidden");
      }
    }
  });
}

// Alternative: Simple file name display (if you don't have the upload area styling)
// Uncomment this if you want a simple file name display instead
/*
document.getElementById("pdfFile").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    console.log(`Selected file: ${file.name}`);
    
    // Create or update a simple file info display
    let fileInfo = document.getElementById("fileInfo");
    if (!fileInfo) {
      fileInfo = document.createElement("div");
      fileInfo.id = "fileInfo";
      fileInfo.style.marginTop = "10px";
      fileInfo.style.padding = "10px";
      fileInfo.style.backgroundColor = "#f0f9ff";
      fileInfo.style.border = "1px solid #bae6fd";
      fileInfo.style.borderRadius = "8px";
      this.parentNode.appendChild(fileInfo);
    }
    
    fileInfo.innerHTML = `
      <i class="fas fa-file-pdf" style="color: #dc2626; margin-right: 8px;"></i>
      <strong>${file.name}</strong> 
      <span style="color: #6b7280;">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
    `;
  }
});
*/
