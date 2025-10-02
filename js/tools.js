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

//favorites section functions

document.addEventListener('DOMContentLoaded', () => {
    const bookmarkIcons = document.querySelectorAll('.bookmark-icon');
    
    // Function to update the visual state of all stars on page load
    function initializeStars() {
        let favorites = JSON.parse(localStorage.getItem('favoriteTools')) || [];
        const favoriteIds = favorites.map(fav => fav.id);

        bookmarkIcons.forEach(icon => {
            const toolId = icon.dataset.toolId;
            if (favoriteIds.includes(toolId)) {
                icon.classList.add('favorited');
                icon.classList.add('fa-solid');
                icon.classList.remove('fa-regular');
            }
        });
    }

    // Function to add or remove a tool from favorites
    function toggleFavorite(icon) {
        let favorites = JSON.parse(localStorage.getItem('favoriteTools')) || [];
        const tool = {
            id: icon.dataset.toolId,
            name: icon.dataset.toolName,
            url: icon.dataset.toolUrl
        };

        const existingIndex = favorites.findIndex(fav => fav.id === tool.id);

        if (existingIndex > -1) {
    
            favorites.splice(existingIndex, 1);
            icon.classList.remove('favorited');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
        } else {
            
            favorites.push(tool);
            icon.classList.add('favorited');
            icon.classList.add('fa-solid');
            icon.classList.remove('fa-regular');
        }

        localStorage.setItem('favoriteTools', JSON.stringify(favorites));

        loadFavoriteTools();
    }

    function loadFavoriteTools() {
        const favorites = JSON.parse(localStorage.getItem('favoriteTools')) || [];
        const favoritesListDiv = document.getElementById('favorite-tools-list');

        favoritesListDiv.innerHTML = '';

        if (favorites.length === 0) {
            favoritesListDiv.innerHTML = '<p>Your study zone is waiting! 📚 Click the ⭐ on any tool to build your personal research kit! ✍️</p>';
        } else {
            favorites.forEach(tool => {
                const toolLink = document.createElement('a');
                toolLink.href = tool.url;
                toolLink.textContent = tool.name;
                if (!tool.url.endsWith('.html')) {
                    toolLink.target = '_blank';
                }
                toolLink.className = 'favorite-tool-link'; // For styling
                favoritesListDiv.appendChild(toolLink);
            });
        }
    }

    
    loadFavoriteTools();
    
    initializeStars();
    
    bookmarkIcons.forEach(icon => {
        icon.addEventListener('click', (event) => {
            event.stopPropagation(); 
            toggleFavorite(icon);
        });
    });
});