document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const submitText = form.querySelector('.submit-text');
    const loadingSpinner = form.querySelector('.loading-spinner');

    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    // Send email using EmailJS
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form)
        .then(() => {
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
        }, (error) => {
            submitBtn.disabled = false;
            submitText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            Swal.fire({
                title: 'Error!',
                text: 'Failed to send message. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
                background: '#292929',
                color: '#ecf0f1',
                confirmButtonColor: '#ef4444'
            });
        });
});
