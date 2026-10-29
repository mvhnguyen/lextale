/*jshint esversion: 6 */

let lexlang = 'en';
let participantId = '';
let experimenterName = '';
let languageOrder = [];
let phaseIndex = 0;
let allRows = [];
let phaseSummaries = [];
let phaseStart = 0;
let finished = false;
let phaseCompleted = false;
let downloadUrl = null;
const csvColumns = ['participant_id','experimenter','language','order_position','item_number','stimulus','is_real','dummy','response','correct','response_time_ms'];
const labelLanguage = lang => lang === 'en' ? 'English' : 'Mandarin';
const csvField = value => '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
const makeCsv = () => '\uFEFF' + [csvColumns.join(','), ...allRows.map(row => csvColumns.map(k => csvField(row[k])).join(','))].join('\r\n') + '\r\n';
function appendRow(itemNumber, stimulus, isReal, dummy, response, correct, responseMs) {
    allRows.push({participant_id:participantId, experimenter:experimenterName, language:labelLanguage(lexlang),
        order_position:phaseIndex + 1, item_number:itemNumber, stimulus:stimulus,
        is_real:isReal, dummy:dummy, response:response, correct:correct, response_time_ms:responseMs});
}
function showOnly(id) {
    ['div_start','div_lex_intro','div_lex_main','div_lexch_main','div_between','div_end','div_feed'].forEach(x => {
        document.getElementById(x).style.display = x === id ? 'block' : 'none';
    });
}
function begin_session() {
    const id = document.getElementById('participant_id').value.trim();
    const exp = document.getElementById('experimenter_name').value.trim();
    const error = document.getElementById('form_error');
    if (!/^\d+$/.test(id)) { error.textContent = 'Enter a numeric participant ID (digits only).'; return; }
    if (!exp) { error.textContent = 'Enter the experimenter name.'; return; }
    error.textContent = '';
    participantId = id;
    experimenterName = exp;
    languageOrder = Number(BigInt(id) % 2n) === 0 ? ['en','ch1'] : ['ch1','en'];
    phaseIndex = 0; allRows = []; phaseSummaries = []; finished = false;
    select_lg();
}
function continue_session() {
    if (finished || phaseIndex !== 0) return;
    phaseIndex = 1;
    select_lg();
}
function complete_language(summary) {
    if (phaseCompleted) return;
    phaseCompleted = true;
    phaseSummaries.push(summary);
    if (phaseIndex === 0) {
        document.getElementById('between_done').textContent = labelLanguage(lexlang) + ' completed.';
        document.getElementById('between_next').textContent = 'Next: ' + labelLanguage(languageOrder[1]) + '.';
        showOnly('div_between');
    } else {
        finished = true;
        full_data = makeCsv();
        document.getElementById('end_filename').textContent = get_filename();
        showOnly('div_feed');
        // A browser may block automatic downloads. A visible Save button is always provided.
        dl_as_file(get_filename(), full_data);
    }
}
function get_filename() { return 'lextale_' + participantId + '.csv'; }
function download_results() {
    if (!finished) return;
    dl_as_file(get_filename(), full_data);
}


let path_imgs = './ch_items/';

document.addEventListener("DOMContentLoaded", function() {
    preload_single('LEXTALE_CH_instructions.png', 'intro_ch');
    basic_times.page_loaded = Date.now();
});

function lex_next() {
    window.lexstim_item = lextale_items.shift();
    document.getElementById('lexstim').textContent = lexstim_item.word;
    start_time = Date.now();
}

let basic_times = {};
let full_data;
let corr_word = 0;
let corr_nonword = 0;
// citP.corr_word + '+' + citP.corr_nonword
let start_time = 0;
let lex_item_num = 1;
let bool_dict = {
    0: 'false',
    1: 'true'
};

function lexclick(lexrespd) {
    if (finished || phaseCompleted || lexlang !== 'en' || !window.lexstim_item) return;
    lexstim_item.response_time = Date.now() - start_time;
    lexstim_item.response = lexrespd;
    const isCorrect = (lexstim_item.wstatus === 1 && lexrespd === 'yes') ||
                      (lexstim_item.wstatus === 0 && lexrespd === 'no');
    if (isCorrect && lexstim_item.dummy === 0) {
        if (lexstim_item.wstatus === 1) corr_word++;
        else corr_nonword++;
    }
    appendRow(lex_item_num++, lexstim_item.word, lexstim_item.wstatus,
        lexstim_item.dummy, lexrespd, isCorrect ? 'yes' : 'no', lexstim_item.response_time);
    document.activeElement.blur();
    window.lexstim_item = null;
    if (lextale_items.length > 0) lex_next();
    else {
        const score = (corr_word / 40 * 100 + corr_nonword / 20 * 100) / 2;
        complete_language('English: ' + score.toFixed(2) + '% (words ' + corr_word + '/40, nonwords ' + corr_nonword + '/20)');
    }
}

function get_times() {
    basic_times.test_end = Date.now();
    console.log(basic_times);
    let t_full = basic_times.test_end - basic_times.intro_shown;
    let t_test = basic_times.test_end - basic_times.test_start;
    return '<br><br>Duration from instruction shown to test completed: ' +
        format_ms(t_full) + '<br>Duration of test part only: ' + format_ms(t_test);
}

function format_ms(milis) {
    var mins = Math.floor(milis / 1000 / 60);
    var secs = Math.round(milis / 1000 - (mins * 60)).toFixed();
    return '<b>' + mins + ' min ' + secs + ' s</b>';
}

function ch_ending() {
    if (finished || phaseCompleted || lexlang !== 'ch1') return;
    let corr_ch = 0, corr_nonch = 0;
    lextale_items.forEach((item, i) => {
        const checked = document.getElementById(item.filename + '_cb').checked;
        const correct = (item.valid === 1 && checked) || (item.valid === 0 && !checked);
        if (correct) { if (item.valid === 1) corr_ch++; else corr_nonch++; }
        appendRow(i + 1, item.filename, item.valid, 0, checked ? 'yes' : 'no', correct ? 'yes' : 'no', '');
    });
    const score = (corr_ch / 60 * 100 + corr_nonch / 30 * 100) / 2;
    complete_language('Mandarin: ' + score.toFixed(2) + '% (characters ' + corr_ch + '/60, pseudocharacters ' + corr_nonch + '/30)');
}

function images_loaded() {
    console.log('All images loaded.');
    document.getElementById('loading_id').style.display = 'none';
    document.getElementById('startbuttn').style.display = 'block';
}

function fillsrcs_ex(src, i) {
    let chked = "";
    if (i == 0 || i == 3) {
        chked = " checked";
    }
    return '<hr><li><input id="' + src +
        '_cb" type="checkbox" ' + chked + ' disabled> <label for="' + src +
        '_cb">' + (i + 1) +
        '. <img class="question_class" src="" alt="是汉字"></label></li>' +
        '<img class="ch_chars" id="' + src + '" src="" alt="Image could not be loaded!">';
}

function fillsrcs(src, i) {
    return '<hr><li><input id="' + src +
        '_cb" type="checkbox"> <label for="' + src +
        '_cb">' + (i + 1) +
        '. <img class="question_class" src="" alt="是汉字"></label></li>' +
        '<img class="ch_chars" id="' + src + '" src="" alt="Image could not be loaded!">';
}

function select_lg() {
    lexlang = languageOrder[phaseIndex];
    corr_word = 0; corr_nonword = 0; lex_item_num = 1; phaseCompleted = false;
    document.querySelectorAll('.lg_en, .lg_ch, .lg_ch2').forEach(elem => elem.style.display = 'none');
    const selected = lexlang === 'en' ? '.lg_en' : '.lg_ch';
    document.querySelectorAll(selected).forEach(elem => elem.style.display = 'block');
    document.getElementById('phase_heading').textContent = 'Part ' + (phaseIndex + 1) + ' of 2: ' + labelLanguage(lexlang);
    showOnly('div_lex_intro');
    if (lexlang === 'ch1') {
        document.getElementById('startbuttn').style.display = 'none';
        load_all_ch();
    } else {
        window.lextale_items = lex_dict.en.slice();
        document.getElementById('startbuttn').style.display = 'inline-block';
    }
    basic_times.intro_shown = Date.now();
}

function load_pre_ch() {
    preload_single('LEXTALE_CH_instruction_short1.png', 'intro_ch_short1');
    preload_single('LEXTALE_CH_instruction_bottom.png', 'intro_ch_bottom');
    preload_single('LEXTALE_CH_instruction_short2.png', 'intro_ch_short2');
    preload_single('LEXTALE_CH_instruction_end.png', 'intro_ch_end');
    preload_single('LEXTALE_CH_exampleitem01.png', 'corr1');
    preload_single('LEXTALE_CH_exampleitem04.png', 'corr4');
    let quests = document.querySelectorAll('.question_class');
    quests.forEach((elem) => {
        elem.src = path_imgs + 'LEXTALE_CH_instruction_question.png';
    });
    const example_srcs = ['LEXTALE_CH_exampleitem01.png', 'LEXTALE_CH_exampleitem02.png', 'LEXTALE_CH_exampleitem03.png', 'LEXTALE_CH_exampleitem04.png'];
    document.getElementById('ch_list_examples').innerHTML = example_srcs.map(fillsrcs_ex).join('');
    document.getElementById("LEXTALE_CH_exampleitem01.png").checked = true;
    document.getElementById("LEXTALE_CH_exampleitem04.png").checked = true;
    preloadAll(example_srcs)
        .then(images => console.log("Examples loaded."))
        .catch(err => {
            console.error('Failed', err);
            document.getElementById('loading_id').innerHTML = '<br><b>Failed to load example images! (For proper usage see  <a href="https://github.com/gasparl/lextale" target="_blank">https://github.com/gasparl/lextale</a>. See Console for more information about this specific error.)</b>';
        });
}

function load_all_ch() {
    window.lextale_items = lex_dict.ch;
    const sources = lextale_items.map(dct => dct.filename);
    document.getElementById('ch_list').innerHTML = sources.map(fillsrcs).join('');

    preloadAll(sources)
        .then(images => images_loaded())
        .catch(err => {
            console.error('Failed', err);
            document.getElementById('loading_id').innerHTML = '<br><b>Failed to load test images! (For proper usage see  <a href="https://github.com/gasparl/lextale" target="_blank">https://github.com/gasparl/lextale</a>. See Console for more information about this specific error.)</b>';
        });

    let quests = document.querySelectorAll('.question_class');
    quests.forEach((elem) => {
        elem.src = path_imgs + 'LEXTALE_CH_instruction_question.png';
    });
}

function lexmain() {
    basic_times.test_start = Date.now();
    if (lexlang === 'ch1') {
        showOnly('div_lexch_main');
        window.scrollTo(0, 0);
    } else {
        showOnly('div_lex_main');
        lex_next();
    }
}

function copy_to_clip(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        return clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

function dl_as_file(filename_to_dl, data_to_dl) {
    const blob = new Blob([data_to_dl], {type:'text/csv;charset=utf-8'});
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename_to_dl;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
}


function store_via_php() {
    fetch('./store.php', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        },
        body: JSON.stringify({
            fname_post: "lextale_results.txt",
            results_post: full_data
        })
    })
        .then(response => response.text())
        .then(echoed => {
            console.log(echoed);
            if (echoed === 'success') {
                console.log("The data seems successful saved.");
                // add here any further code to do in case of success
            } else {
                console.log("There is some issue with the saving.");
                // add here any further code to do in case of failure
                // e.g. offer to download via button and send via email
            }
        })
        .catch((error) => {
            console.log('Request failed (internet connection or server issue): ', error);
            // add here any further code to do in case of failure
            // e.g. offer to download via button and send via email
        });
};

function neat_date() {
    var m = new Date();
    return m.getFullYear() + "" + ("0" + (m.getMonth() + 1)).slice(-2) + "" + ("0" + m.getDate()).slice(-2) + "" + ("0" + m.getHours()).slice(-2) + "" + ("0" + m.getMinutes()).slice(-2) + "" + ("0" + m.getSeconds()).slice(-2);
}

function preload_single(src, id) {
    const img = document.getElementById(id);
    img.onload = function() {
        console.log("Loaded:", src);
        if (id == 'intro_ch') {
            load_pre_ch();
        }
    };
    img.onerror = function() {
        console.log("Failed:", src);
    };
    img.src = path_imgs + src;
}

const preload = src => new Promise(function(resolve, reject) {
    const img = document.getElementById(src);
    img.onload = function() {
        resolve(img);
    };
    img.onerror = reject;
    img.src = path_imgs + src;
});

const preloadAll = sources => Promise.all(sources.map(preload));
