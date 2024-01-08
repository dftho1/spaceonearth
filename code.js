let lastCategory = null;
let lastFilter = null;
let queuedCategories = [];
let currentSuggestions = {};
let isComboMode = false;

document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', function() {
        lastFilter = this.value;
        if (!isComboMode && lastCategory) {
            generateSuggestion(lastCategory);
        } else if (isComboMode) {
            regenerateComboSuggestions();
        }
    });
});

document.getElementById('comboModeToggle').addEventListener('change', function() {
    isComboMode = this.checked;
    queuedCategories = [];
    currentSuggestions = {};
    clearAllActiveButtons();
    updatePlaceholderText();
    setRefreshButtonState(false);
});

function regenerateComboSuggestions() {
    queuedCategories.forEach(category => {
        const items = suggestions[lastFilter][category];
        const randomIndex = Math.floor(Math.random() * items.length);
        currentSuggestions[category] = items[randomIndex];
    });
    updateSuggestionsDisplay();
}

function updatePlaceholderText() {
    const placeholderElement = document.getElementById('suggestions');
    placeholderElement.innerText = isComboMode ? 
        'Select up to three categories for a combination of suggestions' :
        'Select a category above to receive a suggestion';
    placeholderElement.classList.add('placeholder-text');
}

function clearAllActiveButtons() {
    document.querySelectorAll('.suggs').forEach(button => button.classList.remove('button-active'));
}

function setRefreshButtonState(isActive) {
    const refreshButton = document.querySelector('.new-button');
    refreshButton.classList.toggle('refresh-button-inactive', !isActive);
}

window.onload = function() {
    updatePlaceholderText();
    setRefreshButtonState(false);
    lastFilter = document.querySelector('input[name="filter"]:checked').value;
};

function generateSuggestion(type) {
    const filter = document.querySelector('input[name="filter"]:checked').value;
    if (!isComboMode) {
        setActiveButton(type);
        lastCategory = type;
        lastFilter = filter;
        updateSingleSuggestion(type, filter);
    } else {
        queueCategory(type);
    }
}

function queueCategory(category) {
    const isAlreadyQueued = queuedCategories.includes(category);

    if (isAlreadyQueued) {
        queuedCategories = queuedCategories.filter(c => c !== category);
        toggleActiveButton(category, false);
    } else if (queuedCategories.length < 3) {
        queuedCategories.push(category);
        toggleActiveButton(category, true);
    } else {
        alert('Please deselect a category before adding another.');
        return;
    }
    updateSuggestionsDisplay();
}

function toggleActiveButton(category, isActive) {
    const button = document.querySelector(`button[onclick="generateSuggestion('${category}')"]`);
    button?.classList.toggle('button-active', isActive);
}

function setActiveButton(category) {
    document.querySelectorAll('.suggs').forEach(btn => btn.classList.remove('button-active'));
    const activeButton = document.querySelector(`button[onclick="generateSuggestion('${category}')"]`);
    activeButton?.classList.add('button-active');
}

function updateSingleSuggestion(category, filter) {
    const categoryItems = suggestions[filter][category];
    const randomIndex = Math.floor(Math.random() * categoryItems.length);
    const suggestion = categoryItems[randomIndex];

    const suggestionsElement = document.getElementById('suggestions');
    suggestionsElement.innerText = suggestion;
    suggestionsElement.classList.remove('placeholder-text');
    suggestionsElement.classList.add('suggestion-text');

    setRefreshButtonState(true);
}

function updateSuggestionsDisplay() {
    const suggestionsElement = document.getElementById('suggestions');
    const hasCategoriesQueued = queuedCategories.length > 0;

    if (hasCategoriesQueued) {
        suggestionsElement.innerHTML = ''; // Clear existing content including placeholder text

        // Check and update current suggestions for newly added categories
        queuedCategories.forEach(category => {
            if (!currentSuggestions.hasOwnProperty(category)) {
                const items = suggestions[lastFilter][category];
                const randomIndex = Math.floor(Math.random() * items.length);
                currentSuggestions[category] = items[randomIndex];
            }
        });

        // Create or update slots
        for (let i = 0; i < 3; i++) {
            const category = queuedCategories[i];
            createSuggestionSlot(suggestionsElement, category, i !== 2);
        }
    } else {
        // No categories queued, show placeholder text
        updatePlaceholderText();
    }

    setRefreshButtonState(hasCategoriesQueued);
    suggestionsElement.classList.toggle('placeholder-text', !hasCategoriesQueued);
}

function createSuggestionSlot(parentElement, category, addPlusSymbol) {
    // Create a div for the category label
    if (isComboMode && category) {
        const categoryLabel = document.createElement('div');
        categoryLabel.classList.add('category-label');
        categoryLabel.textContent = getCategoryName(category);
        parentElement.appendChild(categoryLabel);
    }

    // Create the suggestion slot as a div
    const suggestionSlot = document.createElement('div');
    suggestionSlot.classList.add('suggestion-slot');

    if (category && currentSuggestions[category]) {
        const suggestionText = document.createElement('span');
        suggestionText.textContent = currentSuggestions[category];
        suggestionText.classList.add('suggestion-text');
        suggestionSlot.appendChild(suggestionText);

        // Add a refresh button within the slot
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'R'; // Placeholder text, to be replaced with an icon in CSS
        refreshButton.classList.add('refresh-button');
        refreshButton.onclick = function() { refreshSingleSuggestion(category, suggestionText); };
        suggestionSlot.appendChild(refreshButton);
    } else {
        // Empty slot will be blank
        suggestionSlot.classList.add('empty-slot');
    }

    parentElement.appendChild(suggestionSlot);

    // Add '+' symbol
    if (addPlusSymbol) {
        const plusSpan = document.createElement('span');
        plusSpan.classList.add('plus-symbol');
        plusSpan.textContent = ' + ';
        parentElement.appendChild(plusSpan);
    }
}

function refreshSingleSuggestion(category, suggestionTextElement) {
    const items = suggestions[lastFilter][category];
    const randomIndex = Math.floor(Math.random() * items.length);
    currentSuggestions[category] = items[randomIndex];
    suggestionTextElement.textContent = currentSuggestions[category];
}

function getCategoryName(category) {
    // Assuming you have a mapping object for category names
    const categoryMapping = {
        "location": "Location",
        "quirk": "Quirk",
        "tvshow": "TV Show",
        "belief": "Belief",
        // Add other categories here
    };

    // Strip any numeric or duplicate suffixes and map to the correct name
    const baseCategory = category.replace(/\d+$/, '').replace(/_dup\d+$/, '');
    return categoryMapping[baseCategory] || baseCategory; // Fallback to the baseCategory if no mapping found
}

function clearSuggestionsDisplay() {
    currentSuggestions = {};
    updatePlaceholderText();
    setRefreshButtonState(false);
}

function regenerateLastSuggestion() {
    if (isComboMode) {
        regenerateComboSuggestions();
    } else if (lastCategory) {
        generateSuggestion(lastCategory);
    } else {
        document.getElementById('suggestions').innerText = 'Please generate a suggestion first.';
    }
}
