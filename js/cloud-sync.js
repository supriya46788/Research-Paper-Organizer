// Cloud sync UI logic for uploading and downloading papers
window.uploadPaperToCloud = function() {
    const fileInput = document.getElementById('cloudPaperFile');
    const file = fileInput.files[0];
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    fetch('/api/cloud/upload', {
        method: 'POST',
        headers: {}, // Auth header if needed
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.url) {
            document.getElementById('cloudUploadResult').innerHTML = `Uploaded! <a href="${data.url}" target="_blank">View File</a>`;
        } else {
            document.getElementById('cloudUploadResult').textContent = data.message || 'Upload failed';
        }
    });
}

window.downloadPaperFromCloud = function() {
    const fileName = document.getElementById('cloudFileName').value;
    if (!fileName) return alert('Enter file name');
    window.open(`/api/cloud/download/${fileName}`, '_blank');
}
