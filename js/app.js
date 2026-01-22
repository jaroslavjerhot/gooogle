
/* ===============================
   CONFIG
================================ */
/* ===============================
   INIT
================================ */

const dctDefaultForm = {
    sText: 'Česko',
    sLang: 'cs',
    sGeo: 'CZ',
}

const dctCurrForm = { ...dctDefaultForm }    

let dctTrans = {}; // translation cache

const queryInput = document.getElementById('queryInput')
const eventSelect = document.getElementById('eventSelect');
const resultsLink = document.getElementById('open-results');
const createBtn = document.getElementById('create-query');
    
dctTrans[dctDefaultForm.sLang] = queryInput.value.trim(); // reset default language


document.addEventListener('DOMContentLoaded', () => {
    setDefaultQueryFromUrl();
    updateTitleFromInput(); // <-- set title immediately on load
    createCountryButtons();
    createYearButtons();
    //loadEventsCSV();
    //initEventSelector();

})


/* ===============================
   QUERY FROM URL
================================ */
function setDefaultQueryFromUrl() {
    const params = new URLSearchParams(window.location.search)
    dctCurrForm.sText = (params.get('q') || '').trim() || dctDefaultForm.sText;
    dctCurrForm.sLang = (params.get('l') || '').trim() || dctDefaultForm.sLang;
    dctCurrForm.sGeo = (params.get('g') || '').trim() || dctDefaultForm.sGeo;
    queryInput.value = dctCurrForm.sText;
    return dctCurrForm;
}

function updateTitleFromInput() {
    dctCurrForm.sText = queryInput.value.trim() ;
    //document.title = 'aInfo' + (text ? ': ' + text : 'Česko');
    document.title = 'a: ' + dctCurrForm.sText;
}

// // 1️⃣ on leaving the input (blur)
// queryInput.addEventListener('blur', handleQueryCommit);

// // 2️⃣ on pressing Enter or Tab inside input
// queryInput.addEventListener('keydown', e => {
//     if (e.key === 'Enter' || e.key === 'Tab') {
//         handleQueryCommit();
//     }
// });

// // 3️⃣ on clicking **any button**
// document.addEventListener('click', e => {
//     if (e.target.tagName === 'BUTTON') {
//         handleQueryCommit();
//         if (e.target.id === 'search-desktop' || e.target.id === 'search-mobile') {
//             runSearch();
//         }
//     }
// });

// function handleQueryCommit() {
//     const dctTrans = {}  // clear dictionary
//     dctTrans[dctDefaultForm.sLang] = queryInput.value.trim(); // reset default language
// }

// nastavi country config
const dctCountryConfig = {
    //CZ: { hl: dctDefaultForm.shl, gl: dctDefaultForm.sGeo },
    CZ: { lang: 'cs', hl: 'cs', gl: 'CZ', descr: 'Czechia' },
    EN: { lang: 'en', lr: 'lang_en', descr: 'all in EN' },
    SK: { lang: 'sk', gl: 'SK', descr: 'Slovakia'},
    UA: { lang: 'uk', hl: 'uk', gl: 'UA', descr: 'Ukraine'},
    US: { lang: 'en', hl: 'en', gl: 'US', descr: 'USA'},
    DE: { lang: 'de', hl: 'de', gl: 'DE', descr: 'Germany'},
    AT: { lang: 'de', hl: 'de', gl: 'AT', descr: 'Austria' },
    HU: { lang: 'hu', hl: 'hu', gl: 'HU', descr: 'Hungary' },
    PL: { lang: 'pl', hl: 'pl', gl: 'PL', descr: 'Poland' },    
}

Object.entries(dctCountryConfig).forEach(([key, o]) => {
  o.g =
    (o.hl ? `&hl=${o.hl}` : '') +
    (o.gl ? `&gl=${o.gl}` : '') +
    (o.lr ? `&lr=${o.lr}` : '')
})
// pridat CZ pokud neni
// if (!(dctDefaultForm.sGeo in dctCountryConfig)){
//     const dct = {};
//     dct[dctDefaultForm.sGeo] = { lang: dctDefaultForm.sLang, gl: dctDefaultForm.sGeo };
//     dctCountryConfig = {
//         ...dct,
//         ...dctCountryConfig
//     }
// }


const currentYear = new Date().getFullYear()
const previousYear = currentYear - 1;
const lstTimePeriods = [
    { label: 'last 24h', start: currentYear, end: currentYear, tbs: 'qdr:d' },
    { label: 'last week', start: currentYear, end: currentYear, tbs: 'qdr:w' },
    { label: 'last month', start: currentYear, end: currentYear, tbs: 'qdr:m' },
    { label: 'last year', start: currentYear, end: currentYear, tbs: 'qdr:y' },
    { label: 'last 3yrs', start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear - 3}` },
];

for (let y = currentYear; y > currentYear - 10; y--) {
    lstTimePeriods.push({ label: String(y), start: y, end: y, tbs: `cdr:1,cd_min:1/1/${y},cd_max:12/31/${y}` });
}

let selectedCountry = localStorage.getItem('lastCountry') || 'CZ'
let selectedYearRangeIndex = localStorage.getItem('lastYearIndex') ? Number(localStorage.getItem('lastYearIndex')) : 2 // default last = currentYear





/* ===============================
   UI BUILDERS
================================ */
function createCountryButtons() {
    const container = document.getElementById('countryButtons')
    container.innerHTML = ''
    Object.keys(dctCountryConfig).forEach(code => {
        const btn = document.createElement('button')
        btn.className = 'btn btn-outline-primary btn-country'
        // btn.innerText = code
        // btn.innerHTML = `${code} <span class="text-muted">${dctCountryConfig[code].descr}</span>`
        btn.innerHTML = `${code} <small><br>${dctCountryConfig[code].descr}</small>`
        if(code === selectedCountry) btn.classList.add('active')
        btn.onclick = () => setCountry(btn, code)
        container.appendChild(btn)
    })
}

function createYearButtons() {
    const container = document.getElementById('yearButtons')
    container.innerHTML = ''
    lstTimePeriods.forEach((range, index) => {
        const btn = document.createElement('button')
        btn.className = 'btn btn-outline-secondary btn-year'
        btn.innerText = range.label
        if(index === selectedYearRangeIndex) btn.classList.add('active')
        btn.onclick = () => setYear(btn, index)
        container.appendChild(btn)
    })
}

/* ===============================
   HANDLERS
================================ */
function setCountry(btn, country) {
    document.querySelectorAll('.btn-country').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedCountry = country
    localStorage.setItem('lastCountry', selectedCountry)
    document.title = 'a: ' + queryInput.value.trim();
    //runSearch()
}

function setYear(btn, index) {
    document.querySelectorAll('.btn-year').forEach(b => b.classList.remove('active'))
    if (index === -1) {return}; // no selection, just remove se
    if(btn) {btn.classList.add('active')}
    selectedYearRangeIndex = index
    localStorage.setItem('lastYearIndex', selectedYearRangeIndex);
    // eventSelect.value = '';
    document.title = 'a: ' + queryInput.value.trim();
    //runSearch()
}
// eventSelect.addEventListener('change', () => {
//     if (eventSelect.value) {
//         setYear(null, -1); // deselect year buttons
//     }
// });


/* ===============================
   SEARCH LOGIC
================================ */
async function runSearch() {
    const text = queryInput.value.trim()
    if(!text) return

    if (text !== dctTrans[dctDefaultForm.sLang]) {
        dctTrans = {}  // clear dictionary
        dctTrans[dctDefaultForm.sLang] = text
        document.title = 'a: ' + text;
    }
        //document.title = '1: ' + text;

    const lang = dctCountryConfig[selectedCountry].lang
    //alert('Searching for: ' + text + '\nLanguage: ' + lang)
    if (!(lang in dctTrans)) {
        try {
            const translated = await translateText(text, lang);
            // Prompt the user to edit/confirm the search query
            let finalText = prompt("Modify the translated text if needed:", translated);
            if (!finalText) return;
            dctTrans[lang] = finalText;
            openGoogleSearch(finalText)
        } catch {
            openGoogleSearch(text)
        }
    } else {
        openGoogleSearch(dctTrans[lang])
    }
}

async function translateText(text, lang) {
    if(lang === dctDefaultForm.sLang) return text
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=cs|' + lang
    const response = await fetch(url)
    const data = await response.json()
    if(!data.responseData?.translatedText) throw new Error('Translation failed')
    return data.responseData.translatedText
}

function openGoogleSearch(queryText) {
    let query = queryText

    //const range = lstTimePeriods[selectedYearRangeIndex]
    //let tbs = 'cdr:1'
    //if(range.start) tbs += ',cd_min:' + range.start
    //if(range.end) tbs += ',cd_max:' + range.end
    let tbs = '&tbs=' + lstTimePeriods[selectedYearRangeIndex].tbs

    // let eventOption = eventSelect.options[eventSelect.selectedIndex];
    // let eventStart = eventOption.dataset.start;
    // let eventEnd = eventOption.dataset.end;
    // const eventTbs = ''
    // if (eventStart || eventEnd) {
    //     eventTbs = '&tbs=cdr:1,'
    //     if (eventStart){eventTbs += 'cd_min:' + eventStart}
    //     if (eventEnd){eventTbs += ',cd_max:' + eventEnd}
    // }

    if(document.getElementById('imagesOnly').checked) {
        query += '&tbm=isch'
    }
    // if(dctCountryConfig[selectedCountry].lang !='cs' && dctCountryConfig[selectedCountry].lr !='lang_en') {
    if(!(selectedCountry in ['CZ','EN'])) {
        query += ' -site:.cz'
    }
    if(document.getElementById('excludeSocial').checked) {
        query += ' -site:facebook.com -site:instagram.com -site:youtube.com -site:x.com -site:wikipedia.org -site:reddit.com'
    }
    if(document.getElementById('presentationsOnly').checked) {
        query += ' (filetype:ppt OR filetype:pptx OR filetype:pdf)'
    }
    
    const cntry = dctCountryConfig[selectedCountry].g
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(query) +
            cntry + tbs
            //    '&gl=' + cfg.gl +
            //    '&tbs=' + encodeURIComponent(event)
            //    eventTbs

    // window.open(url, '_blank')

    // const a = document.createElement('a')
    //     a.href = url
    //     a.target = '_blank'
    //     a.rel = 'noopener'
    //     a.click()

    // // location.href = url
    // resultsLink.href = url
    // //resultsLink.style.display = 'inline-block'
    // resultsLink.style.hidden = false;
    // createBtn.style.display = 'none'
    createLinkPage(url);

}
/* ===============================
   ADMIN EVENTS CSV LOAD
================================ */
async function loadEventsCSV() {
    let csv = localStorage.getItem('eventsCSV');

    if (!csv) {
        const res = await fetch('events.csv');
        csv = await res.text();
    }
    return parseCSV(csv);
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(';');

    return lines.map(l => {
        const o = {};
        l.split(';').forEach((v, i) => o[headers[i]] = v || null);
        return o;
    });
}

// async function initEventSelector() {
//     const events = await loadEventsCSV();
//     //const sel = document.getElementById('eventSelect');

//     events.forEach(ev => {
//         const opt = document.createElement('option');
//         opt.value = ev.id;
//         opt.textContent = dateToYYYY_MM(ev.start) + ' – ' + dateToYYYY_MM(ev.end) + ' | ' + (ev.title || 'undefined');
//         opt.dataset.start = dateToUsformat(ev.start);
//         opt.dataset.end = dateToUsformat(ev.end);
//         eventSelect.appendChild(opt);
//     });
// }

function dateToYYYY_MM(str) {
    // str = "31.12.2025"
    if (!str) return '_____-___';
    const [day, month, year] = str.split('.');
    return `${year}-${month.padStart(2,'0')}`;
}

function dateToUsformat(str) {
    if (!str) return '';
    const parts = str.split('.');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${month.padStart(2,'0')}/${day.padStart(2,'0')}/${year}`;
}
function createLinkPage(google_url) {
    // Build a full HTML document as a string
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset='UTF-8', content='notranslate'>
    <title>aInfo</title>
    <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover'>
    <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' rel='stylesheet'>
    <link rel="icon" type="image/png" sizes="32x32" href="img/FaviconWhite32.png">
    <link rel="apple-touch-icon" href="img/FaviconWhite180.png">
    <link rel="icon" href="img/FaviconBlack32.png">
    <!-- CSS -->
    <link rel="stylesheet" href="css/style.css">
<style>
  body { background-color: #121212; color: #f0f0f0; }
  .desc { margin-bottom: 1rem; }
</style>
</head>
<body class="p-3 text-center">
  <h3>Open Google Search</h3>
  <a href="${google_url}" class="btn btn-success" rel="noopener">
    Open Google Search
  </a>
</body>
</html>
    `;

    // Create a Blob containing the HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open the new page in a new tab
    window.open(url, '_blank');
}

