// JS for AI-based tag suggestion on research paper upload

function suggestTagsForPaper(title, abstract) {
    return fetch('/api/papers/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, abstract })
    })
    .then(res => res.json())
    .then(data => data.suggestedTags || []);
}

// Example usage: call this when user enters title/abstract or uploads a paper
window.showTagSuggestions = function() {
    const title = document.getElementById('paperTitle').value;
    const abstract = document.getElementById('paperAbstract').value;
    const suggestionBox = document.getElementById('tagSuggestions');
    suggestionBox.textContent = 'Loading suggestions...';
    suggestTagsForPaper(title, abstract).then(tags => {
        if (tags.length === 0) {
            suggestionBox.textContent = 'No suggestions.';
        } else {
            suggestionBox.innerHTML = tags.map(tag => `<span class="tag-suggestion">${tag}</span>`).join(' ');
        }
    });
}
