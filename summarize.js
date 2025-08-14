document.getElementById("summaryForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const pdfFile = document.getElementById("pdfFile").files[0];
  if (!pdfFile) {
    Swal.fire("Error", "Please select a PDF file first", "error");
    return;
  }

  document.getElementById("loadingSpinner").classList.remove("hidden");
  document.getElementById("summaryResult").classList.add("hidden");

  const formData = new FormData();
  formData.append("file", pdfFile);

  try {
    const res = await fetch("http://localhost:5000/summarize", { // backend endpoint
      method: "POST",
      body: formData
    });

    const data = await res.json();
    document.getElementById("loadingSpinner").classList.add("hidden");

    if (data.summary) {
      document.getElementById("summaryText").innerText = data.summary;
      document.getElementById("summaryResult").classList.remove("hidden");
    } else {
      Swal.fire("Error", "Could not generate summary", "error");
    }

  } catch (err) {
    document.getElementById("loadingSpinner").classList.add("hidden");
    Swal.fire("Error", "Something went wrong: " + err.message, "error");
  }
});
