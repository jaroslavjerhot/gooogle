
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

const dctTrans = {}; // translation cache
const queryInput = document.getElementById('queryInput')


document.addEventListener('DOMContentLoaded', () => {
    setDefaultQueryFromUrl();
    updateTitleFromInput(); // <-- set title immediately on load
    createCountryButtons();
    createYearButtons();
    //loadEventsCSV();
    initEventSelector();

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

queryInput.addEventListener('input', () => {
    dctTrans = {}  // clear dictionary
    dctTrans[dctDefaultForm.sLang] = queryInput.value.trim(); // reset default language
})

// nastavi country config
const dctCountryConfig = {
    CZ: { lang: dctDefaultForm.sLang, gl: dctDefaultForm.sGeo },
    //CZ: { lang: 'cs', gl: 'CZ' },
    SK: { lang: 'sk', gl: 'SK' },
    UA: { lang: 'uk', gl: 'UA' },
    US: { lang: 'en', gl: 'US' },
    DE: { lang: 'de', gl: 'DE' },
    AT: { lang: 'de', gl: 'AT' },
    HU: { lang: 'hu', gl: 'HU' },
    PL: { lang: 'pl', gl: 'PL' },    
}
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
const YEAR_RANGES = [
//    { label: '<2009', start: null, end: 2009, tbs: 'cdr:1,cd_max:12/31/2008' },
//    { label: '2010-2014', start: 2010, end: 2014, tbs: 'cdr:1,cd_min:1/1/2010,cd_max:12/31/2014' },
//    { label: '2015-2018', start: 2015, end: 2018, tbs: 'cdr:1,cd_min:1/1/2015,cd_max:12/31/2018' },
//    { label: '2019-2021', start: 2019, end: 2021, tbs: 'cdr:1,cd_min:1/1/2019,cd_max:12/31/2021' },
//    { label: '2022-' + (previousYear), start: 2022, end: previousYear, tbs: `cdr:1,cd_min:1/1/2022,cd_max:12/31/${previousYear}`},
    { label: String(currentYear-3), start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear-3},cd_max:12/31/${currentYear-3}` },
    { label: String(currentYear-2), start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear-2},cd_max:12/31/${currentYear-2}` },
    { label: String(currentYear-1), start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear-1},cd_max:12/31/${currentYear-1}` },
    { label: String(currentYear), start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear},cd_max:12/31/${currentYear}` },
    { label: 'last week', start: currentYear, end: currentYear, tbs: 'qdr:w' },
    { label: 'last 24h', start: currentYear, end: currentYear, tbs: 'qdr:d' }
];

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
        btn.innerText = code
        if(code === selectedCountry) btn.classList.add('active')
        btn.onclick = () => setCountry(btn, code)
        container.appendChild(btn)
    })
}

function createYearButtons() {
    const container = document.getElementById('yearButtons')
    container.innerHTML = ''
    YEAR_RANGES.forEach((range, index) => {
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
    runSearch()
}

function setYear(btn, index) {
    document.querySelectorAll('.btn-year').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedYearRangeIndex = index
    localStorage.setItem('lastYearIndex', selectedYearRangeIndex)
    runSearch()
}


/* ===============================
   SEARCH LOGIC
================================ */
async function runSearch() {
    const text = queryInput.value.trim()
    //document.title = '1: ' + text;
    if(!text) return
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

    //const range = YEAR_RANGES[selectedYearRangeIndex]
    //let tbs = 'cdr:1'
    //if(range.start) tbs += ',cd_min:' + range.start
    //if(range.end) tbs += ',cd_max:' + range.end
    let tbs = YEAR_RANGES[selectedYearRangeIndex].tbs

    if(document.getElementById('imagesOnly').checked) {
        query += '&tbm=isch'
    }
    if(dctCountryConfig[selectedCountry].lang !='cs') {
        query += ' -site:.cz'
    }
    if(document.getElementById('excludeSocial').checked) {
        query += ' -site:facebook.com -site:instagram.com -site:youtube.com -site:x.com -site:wikipedia.org -site:reddit.com'
    }
    
    const cfg = dctCountryConfig[selectedCountry]
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(query) +
                '&hl=' + cfg.lang +
                '&gl=' + cfg.gl +
                '&tbs=' + encodeURIComponent(tbs)

    window.open(url, '_blank')

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

async function initEventSelector() {
    const events = await loadEventsCSV();
    const sel = document.getElementById('eventSelect');

    events.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.textContent = dateToYYYY_MM(ev.start) + ' – ' + dateToYYYY_MM(ev.end) + ' | ' + (ev.title || 'undefined');
        opt.dataset.start = dateToUsformat(ev.start);
        opt.dataset.end = dateToUsformat(ev.end);
        sel.appendChild(opt);
    });
}

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
