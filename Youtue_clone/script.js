// Simple filter for the project cards: category chips + search box.
const cards = document.querySelectorAll('.video-card');
const chips = document.querySelectorAll('#chips button');
const search = document.getElementById('search');
const empty = document.getElementById('empty');
let activeFilter = 'all';

function applyFilters() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
        const tags = card.dataset.tags.split(' ');
        const title = card.querySelector('h3').textContent.toLowerCase();
        const matchesChip = activeFilter === 'all' || tags.includes(activeFilter);
        const matchesSearch = title.includes(query) || tags.some((tag) => tag.includes(query));
        const show = matchesChip && matchesSearch;
        card.hidden = !show;
        if (show) visible++;
    });

    empty.hidden = visible > 0;
}

chips.forEach((chip) => {
    chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        chips.forEach((c) => (c.className = c === chip ? 'btn1' : 'btn'));
        applyFilters();
    });
});

search.addEventListener('input', applyFilters);
document.querySelector('.srch-vtn').addEventListener('click', applyFilters);
