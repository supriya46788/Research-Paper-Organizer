document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const submitText = form.querySelector('.submit-text');
    const loadingSpinner = form.querySelector('.loading-spinner');

    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    // Simulate an API call
    setTimeout(() => {
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');

        Swal.fire({
            title: 'Success!',
            text: 'Your message has been sent successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
            background: '#292929',
            color: '#ecf0f1',
            confirmButtonColor: '#3b82f6'
        }).then(() => {
            form.reset();
        });
    }, 2000);
});