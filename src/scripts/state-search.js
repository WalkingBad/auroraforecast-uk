/**
 * State Search Functionality
 * Filters state cards based on search input
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('state-search');
    const grid = document.getElementById('states-grid');

    if (searchInput && grid) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = grid.querySelectorAll('.region-card');

            cards.forEach(card => {
                const name = card.getAttribute('data-name') || '';
                if (name.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
