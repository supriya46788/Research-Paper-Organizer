// Fade-in on scroll
const cards = document.querySelectorAll('.tool-card');
const observer = new IntersectionObserver(entries => {
entries.forEach(entry => {
    if(entry.isIntersecting){
    entry.target.classList.add('show');
    }
});
}, {threshold: 0.1});
cards.forEach(card => observer.observe(card));

// Filter functionality
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
btn.addEventListener('click', () => {
    const category = btn.getAttribute('data-filter');
    cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
    } else {
        card.style.display = 'none';
    }
    });
});
});