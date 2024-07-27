document.getElementById('nameForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let fatherName = document.getElementById('fatherName').value.toLowerCase();
    let motherName = document.getElementById('motherName').value.toLowerCase();
    let gender = document.getElementById('gender').value;

    let F1_3 = fatherName.slice(0, 3);
    let F2_3 = fatherName.slice(-3);
    let M1_3 = motherName.slice(0, 3);
    let M2_3 = motherName.slice(-3);

    let F1_2 = fatherName.slice(0, 2);
    let F2_2 = fatherName.slice(-2);
    let M1_2 = motherName.slice(0, 2);
    let M2_2 = motherName.slice(-2);

    let F1_1 = fatherName.slice(0, 1);
    let F2_1 = fatherName.slice(-1);
    let M1_1 = motherName.slice(0, 1);
    let M2_1 = motherName.slice(-1);

    let nameFiles = {
        'male': 'male_names.json',
        'female': 'female_names.json',
        'unisex': 'unisex_names.json'
    };

    fetchNames(nameFiles[gender]).then(names => {
        let suggestions = getSuggestions(names, gender, M1_3, F2_3, F1_3, M2_3, M1_2, F2_2, F1_2, M2_2, M1_1, F2_1, F1_1, M2_1);

        if (gender === 'unisex') {
            let maleNames = fetchNames(nameFiles['male']).then(names => getSuggestions(names, 'male', M1_3, F2_3, F1_3, M2_3, M1_2, F2_2, F1_2, M2_2, M1_1, F2_1, F1_1, M2_1));
            let femaleNames = fetchNames(nameFiles['female']).then(names => getSuggestions(names, 'female', M1_3, F2_3, F1_3, M2_3, M1_2, F2_2, F1_2, M2_2, M1_1, F2_1, F1_1, M2_1));

            Promise.all([maleNames, femaleNames]).then(results => {
                let uniqueSuggestions = Array.from(new Set(results[0].concat(results[1]).concat(suggestions)));
                displaySuggestions(uniqueSuggestions);
            });
        } else {
            displaySuggestions(suggestions);
        }
    });
});

function fetchNames(file) {
    return fetch(file)
        .then(response => response.json())
        .then(data => data.names);
}

function getSuggestions(names, gender, M1_3, F2_3, F1_3, M2_3, M1_2, F2_2, F1_2, M2_2, M1_1, F2_1, F1_1, M2_1) {
    let suggestions = [];

    const matchNames = (nameList, firstPart, lastPart, stars) => {
        return nameList.filter(nameObj => 
            nameObj.name.toLowerCase().startsWith(firstPart) &&
            nameObj.name.toLowerCase().endsWith(lastPart)
        ).map(nameObj => ({
            name: stars + ' ' + nameObj.name,
            meaning: nameObj.meaning
        }));
    };

    if (gender === 'male') {
        suggestions = matchNames(names, M1_3, F2_3, '***');
        if (suggestions.length === 0) {
            suggestions = matchNames(names, M1_2, F2_2, '**');
        }
        if (suggestions.length === 0) {
            suggestions = matchNames(names, M1_1, F2_1, '');
        }
    } else if (gender === 'female') {
        suggestions = matchNames(names, F1_3, M2_3, '***');
        if (suggestions.length === 0) {
            suggestions = matchNames(names, F1_2, M2_2, '**');
        }
        if (suggestions.length === 0) {
            suggestions = matchNames(names, F1_1, M2_1, '');
        }
    }

    return Array.from(new Set(suggestions.map(s => s.name))).map(name => {
        const nameObj = suggestions.find(s => s.name === name);
        return {
            name: nameObj.name,
            meaning: nameObj.meaning
        };
    });
}

function displaySuggestions(names) {
    let resultsDiv = document.getElementById('results');
    if (names.length > 0) {
        let message = names.map(nameObj => {
            const stars = nameObj.name.includes('***') ? '***' : nameObj.name.includes('**') ? '**' : '';
            const name = nameObj.name.replace(stars, '').trim();
            return `${stars} ${name} - ${nameObj.meaning}`;
        }).join('\n');

        alert(`Suggested Names:\n${message}`);
        resultsDiv.innerHTML = `<h2>Suggested Names:</h2><ul>${names.map(nameObj => `<li>${nameObj.name} - ${nameObj.meaning}</li>`).join('')}</ul>`;
    } else {
        alert("No names found.");
        resultsDiv.innerHTML = `<h2>No names found</h2>`;
    }
}
