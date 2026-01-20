
/* ===============================
   CONFIG
================================ */
const COUNTRY_CONFIG = {
    CZ: { lang: 'cs', gl: 'CZ' },
    CZ2: { lang: 'cs', gl: 'CZ' },
    SK: { lang: 'sk', gl: 'SK' },
    UA: { lang: 'uk', gl: 'UA' },
    US: { lang: 'en', gl: 'US' },
    DE: { lang: 'de', gl: 'DE' },
    AT: { lang: 'de', gl: 'AT' },
    HU: { lang: 'hu', gl: 'HU' },
    PL: { lang: 'pl', gl: 'PL' },    
}

const currentYear = new Date().getFullYear()
const previousYear = currentYear - 1;
const YEAR_RANGES = [
    { label: '<2009', start: null, end: 2009, tbs: 'cdr:1,cd_max:12/31/2008' },
    { label: '2010-2014', start: 2010, end: 2014, tbs: 'cdr:1,cd_min:1/1/2010,cd_max:12/31/2014' },
    { label: '2015-2018', start: 2015, end: 2018, tbs: 'cdr:1,cd_min:1/1/2015,cd_max:12/31/2018' },
    { label: '2019-2021', start: 2019, end: 2021, tbs: 'cdr:1,cd_min:1/1/2019,cd_max:12/31/2021' },
    { label: '2022-' + (previousYear), start: 2022, end: previousYear, tbs: `cdr:1,cd_min:1/1/2022,cd_max:12/31/${previousYear}`},
    { label: String(currentYear), start: currentYear, end: currentYear, tbs: `cdr:1,cd_min:1/1/${currentYear},cd_max:12/31/${currentYear}` },
    { label: 'last week', start: currentYear, end: currentYear, tbs: 'qdr:w' },
    { label: 'last 24h', start: currentYear, end: currentYear, tbs: 'qdr:d' }
];

let selectedCountry = localStorage.getItem('lastCountry') || 'CZ'
let selectedYearRangeIndex = localStorage.getItem('lastYearIndex') ? Number(localStorage.getItem('lastYearIndex')) : 2 // default last = currentYear

/* ===============================
   INIT
================================ */
document.addEventListener('DOMContentLoaded', () => {
    createCountryButtons();
    createYearButtons();
    setDefaultQueryFromUrl();
    updateTitleFromInput(); // <-- set title immediately on load
})

/* ===============================
   UI BUILDERS
================================ */
function createCountryButtons() {
    const container = document.getElementById('countryButtons')
    container.innerHTML = ''
    Object.keys(COUNTRY_CONFIG).forEach(code => {
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
   QUERY FROM URL
================================ */
function setDefaultQueryFromUrl() {
    const params = new URLSearchParams(window.location.search)
    const q = (params.get('q') || '').trim() || 'Česko';
    document.getElementById('queryInput').value = q ? decodeURIComponent(q) : ''
}
function updateTitleFromInput() {
    const text = document.getElementById('queryInput').value.trim() ;
    document.title = 'aInfo' + (text ? ': ' + text : 'Česko');
}
/* ===============================
   SEARCH LOGIC
================================ */
async function runSearch() {
    const text = document.getElementById('queryInput').value.trim()
    //document.title = '1: ' + text;
    if(!text) return
    const lang = COUNTRY_CONFIG[selectedCountry].lang
    try {
        const translated = await translateText(text, lang);
        // Prompt the user to edit/confirm the search query
        let finalText = prompt("Modify the search query if needed:", translated);
        if (!finalText) return;
        openGoogleSearch(finalText)
    } catch {
        openGoogleSearch(text)
    }
}

async function translateText(text, lang) {
    if(lang === 'cs') return text
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=cs|' + lang
    const response = await fetch(url)
    const data = await response.json()
    if(!data.responseData?.translatedText) throw new Error('Translation failed')
    return data.responseData.translatedText
}

function openGoogleSearch(queryText) {
    let query = queryText

    const range = YEAR_RANGES[selectedYearRangeIndex]
    //let tbs = 'cdr:1'
    //if(range.start) tbs += ',cd_min:' + range.start
    //if(range.end) tbs += ',cd_max:' + range.end
    let tbs = range.tbs

    if(document.getElementById('excludeSocial').checked) {
        query += ' -site:facebook.com -site:instagram.com -site:youtube.com -site:x.com -site:wikipedia.org -site:reddit.com'
    }
    query += ' -site:.cz'
    
    

    const cfg = COUNTRY_CONFIG[selectedCountry]
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(query) +
                '&hl=' + cfg.lang +
                '&gl=' + cfg.gl +
                '&tbs=' + encodeURIComponent(tbs)

    window.open(url, '_blank')
}
