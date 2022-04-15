// ==UserScript==
// @name         Duolingo HearEverything
// @namespace    http://tampermonkey.net/
// @version      0.63
// @description  Reads aloud most sentences in Duo's challenges.
// @author       Esh
// @match        https://*.duolingo.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const VERSION = '0.63 --- 1 ---';

const LOG_STRING = 'Duolingo HearEverything: ';
const buttonPosition = 'bottom'; // bottom / top allowed
let voiceSelect;
let config = {};
const DEBUG = false;
// for config mouse hover
let hover = true;

let synth = window.speechSynthesis;
let voices = [];
let newPage = false;
let addedSpeech = false;
let challengesUrls = [];
let challengesReads = [];
let timeout;
let howlPlay = false;

let speakerButton = `
  <a class="_3UpNo _3EXrQ _2VrUB" data-test="speaker-button" title="Listen" id="speak">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94 73" width="94" height="73" preserveAspectRatio="xMidYMid meet" style="padding-left: 20%; width: 80%; height: 100%; transform: translate3d(0px, 0px, 0px);">
    <defs>
      <clipPath id="__lottie_element_402"><rect width="94" height="73" x="0" y="0"></rect></clipPath>
      <clipPath id="__lottie_element_404">
        <path d="M0,0 L1000,0 L1000,1038 L0,1038z"></path>
      </clipPath>
      <clipPath id="__lottie_element_409">
        <path d="M0,0 L1338,0 L1338,738 L0,738z"></path>
      </clipPath>
    </defs>
    <g clip-path="url(#__lottie_element_402)">
      <g clip-path="url(#__lottie_element_404)" transform="matrix(0.26499998569488525,0,0,0.26499998569488525,-84.5,-101.53498840332031)" opacity="1" style="display: block;">
        <g transform="matrix(1.3600000143051147,0,0,1.3600000143051147,516.219970703125,522.4000244140625)" opacity="0.9069389991639046" style="display: block;">
          <path stroke-linecap="round" stroke-linejoin="miter" fill-opacity="0" stroke-miterlimit="4" stroke="rgb(28,176,246)" stroke-opacity="1" stroke-width="22.485592375331898" d=" M48.88100051879883,-88.13400268554688 C79.822998046875,-70.9219970703125 100.77899932861328,-37.88800048828125 100.77899932861328,0 C100.77899932861328,37.9109992980957 79.7979965209961,70.96199798583984 48.82500076293945,88.16500091552734"></path>
        </g>
        <g style="display: block;" transform="matrix(1.3600000143051147,0,0,1.3600000143051147,516.219970703125,522.4000244140625)" opacity="1">
          <path stroke-linecap="round" stroke-linejoin="miter" fill-opacity="0" stroke-miterlimit="4" stroke="rgb(28,176,246)" stroke-opacity="1" stroke-width="20.500305987715482" d=" M24.131000518798828,-42.808998107910156 C39.055999755859375,-34.37099838256836 49.14099884033203,-18.354000091552734 49.14099884033203,0 C49.14099884033203,18.386999130249023 39.02000045776367,34.42900085449219 24.049999237060547,42.854000091552734"></path>
        </g>
        <g clip-path="url(#__lottie_element_409)" transform="matrix(1.0370399951934814,0,0,0.9629600048065186,136.53640747070312,163.66775512695312)" opacity="1" style="display: block;">
          <g transform="matrix(1,0,0,1,260.93701171875,373.6780090332031)" opacity="1" style="display: block;">
            <g opacity="1" transform="matrix(6,0,0,6,0,0)">
              <path fill="rgb(28,176,246)" fill-opacity="1" d=" M-8.293000221252441,-11.675000190734863 C-8.293000221252441,-11.675000190734863 -0.12300000339746475,-11.675000190734863 -0.12300000339746475,-11.675000190734863 C2.9070000648498535,-11.675000190734863 5.367000102996826,-9.21500015258789 5.367000102996826,-6.184999942779541 C5.367000102996826,-6.184999942779541 5.367000102996826,6.425000190734863 5.367000102996826,6.425000190734863 C5.367000102996826,9.454999923706055 2.9070000648498535,11.914999961853027 -0.12300000339746475,11.914999961853027 C-0.12300000339746475,11.914999961853027 -8.293000221252441,11.914999961853027 -8.293000221252441,11.914999961853027 C-11.322999954223633,11.914999961853027 -13.782999992370605,9.454999923706055 -13.782999992370605,6.425000190734863 C-13.782999992370605,6.425000190734863 -13.782999992370605,-6.184999942779541 -13.782999992370605,-6.184999942779541 C-13.782999992370605,-9.21500015258789 -11.322999954223633,-11.675000190734863 -8.293000221252441,-11.675000190734863z M-4.980999946594238,-11.656999588012695 C-4.980999946594238,-11.656999588012695 10.218999862670898,-22.32699966430664 10.218999862670898,-22.32699966430664 C11.24899959564209,-23.047000885009766 12.659000396728516,-22.797000885009766 13.369000434875488,-21.777000427246094 C13.638999938964844,-21.39699935913086 13.779000282287598,-20.937000274658203 13.779000282287598,-20.476999282836914 C13.779000282287598,-20.476999282836914 13.779000282287598,20.472999572753906 13.779000282287598,20.472999572753906 C13.779000282287598,21.722999572753906 12.769000053405762,22.732999801635742 11.519000053405762,22.732999801635742 C11.059000015258789,22.732999801635742 10.609000205993652,22.593000411987305 10.218999862670898,22.322999954223633 C10.218999862670898,22.322999954223633 -4.980999946594238,11.652999877929688 -4.980999946594238,11.652999877929688 C-5.580999851226807,11.232999801635742 -5.940999984741211,10.543000221252441 -5.940999984741211,9.803000450134277 C-5.940999984741211,9.803000450134277 -5.940999984741211,-9.807000160217285 -5.940999984741211,-9.807000160217285 C-5.940999984741211,-10.536999702453613 -5.580999851226807,-11.22700023651123 -4.980999946594238,-11.656999588012695z"></path>
              <g opacity="1" transform="matrix(1,0,0,1,0,0)"></g>
            </g>
          </g>
        </g>
      </g>
    </g>
    </svg>
  </a>
`;

// Element definitions
const WRONG_ANSWER_CLASS = '._1UqAr._1sqiF';
const RIGHT_ANSWER_CLASS = '._1UqAr._1Nmv6';
const RIGHT_CLASS = '._1Nmv6';
const WRONG_CLASS = '._1sqiF';
const ANSWER_HEADLINE = '._1x6Dk';
const ANSWER_CONTAINER = '._2ez4I';
const DIALOGUE_SPEAKER_CLASS = '_29e-M _39MJv _2Hg6H';

// currently used
const ANSWER_CLASS = '._1UqAr';
const ANSWER = 'blame';
const ANSWER_QS = '[data-test~="' + ANSWER + '"]';
const RIGHT_ANSWER = 'blame-correct';
const RIGHT_ANSWER_QS = '[data-test~="' + RIGHT_ANSWER + '"]';
const RIGHT_ANSWER_TYPO_QS = '[data-test~="' + RIGHT_ANSWER + '"] ._3gI0Y';
const WRONG_ANSWER = 'blame-incorrect';
const WRONG_ANSWER_QS = '[data-test~="' + WRONG_ANSWER + '"]';
const CHALLENGE_TAP_TOKEN = 'challenge-tap-token'; // challenge-translate (tap)
const CHALLENGE_TAP_TOKEN_QS = '[data-test="' + CHALLENGE_TAP_TOKEN + '"]';
const WORD_BANK = 'word-bank'; // if exists it's tap instead of keyboard (challenge-translate)
const WORD_BANK_QS = '[data-test="' + WORD_BANK + '"]';
const TRANSLATE_INPUT = 'challenge-translate-input';
const TRANSLATE_INPUT_QS = '[data-test="' + TRANSLATE_INPUT + '"]';
// const SPEAKER_BUTTON = 'speaker-button';
// const SPEAKER_BUTTON_QS = '[data-test="' + SPEAKER_BUTTON + '"]';
const SPEAKER_BUTTON = '._1KXUd._1I13x._2kfEr._1nlVc._2fOC9.UCrz7.t5wFJ';
const SPEAKER_BUTTON_QS = SPEAKER_BUTTON;
// const HINT_SENTENCE = 'hint-sentence';
// const HINT_SENTENCE_QS = '[data-test="' + HINT_SENTENCE + '"]';
const HINT_SENTENCE = '._29e-M._39MJv._2Hg6H';
const HINT_SENTENCE_QS = HINT_SENTENCE;
// const HINT_SENTENCE_CTC = '._3NgMa._2Hg6H'; // hint sentence replacement for challenge tap complete
// const HINT_SENTENCE_CTC_QS = HINT_SENTENCE_CTC;
const CHALLENGE_JUDGE = 'challenge-judge-text';
const CHALLENGE_JUDGE_QS = '[data-test="' + CHALLENGE_JUDGE + '"]';
const CHALLENGE_JUDGE_INTRO = 'hint-token';
const CHALLENGE_JUDGE_INTRO_QS = '[data-test="' + CHALLENGE_JUDGE_INTRO + '"]';
// const FORM_PROMPT = 'challenge-form-prompt';
// const FORM_PROMPT_QS = '[data-test="' + FORM_PROMPT + '"]';
const FORM_PROMPT = '._2SfAl._2Hg6H';
const FORM_PROMPT_QS = FORM_PROMPT;
// const CHALLENGE_CHOICE = 'challenge-choice';
// const CHALLENGE_CHOICE_QS = '[data-test="' + CHALLENGE_CHOICE + '"]';
const RIGHT_OPTION_QS = '[aria-checked="true"] div';
const TEXT_INPUT = 'challenge-text-input';
const TEXT_INPUT_QS = '[data-test="' + TEXT_INPUT + '"]';
const SPEAK_INTRO = 'speakIntro';
const SPEAK_INTRO_QS = '#' + SPEAK_INTRO;
const NEXT_BUTTON = 'player-next';
const NEXT_BUTTON_QS = '[data-test="' + NEXT_BUTTON + '"]';
const HINT_TOKEN = 'hint-token';
const HINT_TOKEN_QS = '[data-test="' + HINT_TOKEN + '"]';

// used page types
const FORM = 'challenge-form';
const TRANSLATE = 'challenge-translate';
const DIALOGUE = 'challenge-dialogue';
const GAP_FILL = 'challenge-gapFill';
const COMPLETE_REVERSE_TRANSLATION = 'challenge-completeReverseTranslation';
const TAP_COMPLETE = 'challenge-tapComplete';
const LISTEN_COMPREHENSION = 'challenge-listenComprehension';
const READ_COMPREHENSION = 'challenge-readComprehension';
const NAME = 'challenge-name';
const SPEAK = 'challenge-speak';
const LISTEN_TAP = 'challenge-listenTap';
const LISTEN = 'challenge-listen';

// duo reads aloud
const SELECT_TRANSCRIPTION = 'challenge-selectTranscription';

// allowed challenge types
const TEST = [FORM, TRANSLATE, DIALOGUE, GAP_FILL, COMPLETE_REVERSE_TRANSLATION, TAP_COMPLETE, LISTEN_COMPREHENSION, READ_COMPREHENSION, NAME, SPEAK, LISTEN_TAP, LISTEN];
// challenges where duo has to read
const NO_MUTE = [LISTEN, SELECT_TRANSCRIPTION, GAP_FILL, LISTEN_TAP, LISTEN_COMPREHENSION];
var buttonDisabled = true;

function debug(s) {
  console.debug(LOG_STRING + s);
}

// needed for Duo Mute
// intercept xmlhttprequest to get session json and extract challenges
(function (open) {
  XMLHttpRequest.prototype.open = function () {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4 && this.responseURL.includes('sessions')) {
        if (this.response.challenges) {
          this.response.challenges.map((challenge) => {
            if (typeof challenge.tts !== 'undefined') {
              challengesUrls.push(challenge.tts);
              challengesReads.push(challenge.prompt);
            }
          });
        }
        // console.log(challengesUrls);
        // console.log(challengesReads);
      }
    }, false);
    open.apply(this, arguments);
  };
})(XMLHttpRequest.prototype.open);

// needed for Duo Muto
// Intercept Howl.play (which plays the sound over Howl.js).
// of course the linter doesn't know the object Howl, but it is there ;)
(function (play) {
  Howl.prototype.play = function () {
    if (config.he_muteduo) {
      debug('intercepting Duo speaking');
      //if (challengesUrls.includes(this._src)) {
      let read = challengesReads[challengesUrls.indexOf(this._src)];
      if (DEBUG) document.querySelector('#mySentence').innerText = read;
      if (typeof read != 'undefined') {
        debug('read = ' + read);
        howlPlay = true;
        clearTimeout(timeout);
        let utter = generateUtter(read);
        synth.cancel();
        synth.speak(utter);
      } else {
        play.apply(this, arguments);
      }
    } else {
      play.apply(this, arguments);
    }
  }
})(Howl.prototype.play);

window.onload = function () {
  'use strict';
  debug(VERSION);
  // console.log('---------------------onload-------------------------');
  voices = window.speechSynthesis.getVoices();
  //debug(voices);
  //setVoice();
  readConfig();
  new MutationObserver(start).observe(document.body, {
    // attributes: true,
    childList: true,
    subtree: true
  });
  debug('MutationObserver running');
}

function setVoice() {
  voiceSelect = GM_getValue('voiceSelect', 1000);
  //debug('stored voice = ' + voiceSelect);
  var duoState = JSON.parse(localStorage.getItem('duo.state'));
  config.lang = duoState.user.learningLanguage;

  if (voiceSelect == 1000) {
    for (let i = 0; i < voices.length; i++) {
      if (voices[i].lang.includes(config.lang)) {
        voiceSelect = i;
        //debug('auto set voice');
      }
    }
  }
  //debug(`voice = ${voiceSelect}, learning language = ${config.lang}`);
}

// toggles visibility
function togglePopout(id) {
  let popout = document.getElementById(id);
  // popout.style.display === "none" ? popout.style.display = "block" : popout.style.display = "none";
  if (popout.style.display === 'none') {
    popout.style.display = 'block';
    document.addEventListener('click', closePopout);
    popout.addEventListener('mouseenter', setHover);
    popout.addEventListener('mouseleave', removeHover);
  } else {
    popout.style.display = 'none';
    document.removeEventListener('click', closePopout);
    popout.removeEventListener('mouseenter', setHover);
    popout.removeEventListener('mouseleave', removeHover);
  }
}

function setHover() {
  hover = true;
  // debug('hover = true');
}

function removeHover() {
  setTimeout(function () { hover = false; }, '100');
}

function closePopout() {
  // debug('closePopout: hover = ' + hover);
  if (!hover) {
    hover = true;
    togglePopout('hearEverythingConfig');
  }
}

function readConfig() {
  config.ap_timeout = 1000; // GM_getValue('he_auto_timeout', 1000);
  config.he_ct_auto = GM_getValue('he_ct_auto', true);
  config.he_cgf_auto = GM_getValue('he_cgf_auto', true);
  config.he_cgf_click = GM_getValue('he_cgf_click', true);
  config.he_cgf_autointro = GM_getValue('he_cgf_autointro', true);
  config.he_cd_auto = GM_getValue('he_cd_auto', false);
  config.he_cd_click = GM_getValue('he_cd_click', true);
  config.he_cd_autointro = GM_getValue('he_cd_autointro', true);
  config.he_cf_auto = GM_getValue('he_cf_auto', true);
  config.he_cf_click = GM_getValue('he_cf_click', true);
  config.he_cf_autointro = GM_getValue('he_cf_autointro', false);
  config.he_ctc_auto = GM_getValue('he_ctc_auto', true);
  config.he_ctc_click = GM_getValue('he_ctc_click', false);
  config.he_ctc_autointro = GM_getValue('he_ctc_autointro', true);
  config.he_cn_auto = GM_getValue('he_cn_auto', true);
  config.he_muteduo = GM_getValue('he_muteduo', false);
  config.he_lc_click = GM_getValue('he_lc_click', true);
  config.he_cs_auto = GM_getValue('he_cs_auto', true);
  config.he_clt_auto = GM_getValue('he_clt_auto', true);
  config.he_crc_auto = GM_getValue('he_crc_auto', true);
  config.he_crc_click = GM_getValue('he_crc_click', false);
  config.he_crc_autointro = GM_getValue('he_crc_autointro', false);
  config.he_cl_auto = GM_getValue('he_cl_auto', true);
  setVoice();
  // console.debug(config);
}

// builds a configBlock
// auto = autoplay, click = read options, intro = read intro
function createConfigOption(challenge, prefix, auto, click, intro) {
  let name = challenge.split('-');
  for (let i = 0; i < name.length; i++) {
    name[i] = name[i][0].toUpperCase() + name[i].substr(1);
  }
  name = name.join(' ');

  let styleCheckbox = 'style="vertical-align: bottom;"';
  let clickSpan = '';
  let autoSpan = '';
  let introSpan = '';
  if (auto === true) autoSpan = `<input type="checkbox" id="he_${prefix}_auto" value="autoplay" ${styleCheckbox}></input><label for="he_${prefix}_auto"> auto play</label></span>`;
  if (click === true) clickSpan = `<input type="checkbox" id="he_${prefix}_click" value="readoptions" ${styleCheckbox}></input><label for="he_${prefix}_click"> read options</label></span>`;
  if (intro === true) introSpan = `<input type="checkbox" id="he_${prefix}_autointro" value="autointro" ${styleCheckbox}></input><label for="he_${prefix}_autointro"> auto intro</label></span>`;
  let config = `
          <div class="QowCP">
            <div id="config-${challenge}">${name}:
              <div class="myOptions">
                <span>${autoSpan}</span>
                <span>${clickSpan}</span>
                <span>${introSpan}</span>
              </div>
            </div>
          </div>
        `;
  return config;
}

// adds config to the page
function addConfig() {
  if (!document.querySelector('#hearEverythingGear') && document.querySelector('[role="progressbar"]')) {
    let configButton = document.createElement('button');
    configButton.setAttribute('id', 'hearEverythingGear');
    configButton.setAttribute('class', '_2hiHn _2kfEr _1nlVc _2fOC9 UCrz7 t5wFJ _1DC8p _2jNpf');
    configButton.setAttribute('style', `grid-column: 3/3; background-image:url(//d35aaqx5ub95lt.cloudfront.net/images/gear.svg);
        background-position: 0px 0px; background-repeat: no-repeat; background-size: contain;`);

    let configDiv = document.createElement('div');
    configDiv.setAttribute('class', '_3yqw1 np6Tv _1Xlh1');
    configDiv.setAttribute('style', 'display: none; position: fixed; margin-top: 1rem;');
    configDiv.setAttribute('id', 'hearEverythingConfig');
    let options = '<option value="1000">Auto</option>';
    for (let i = 0; i < voices.length; i++) {
      options += `<option value="${i}">${voices[i].name}</option>`;
    }
    let styleCheckbox = 'style="vertical-align: bottom;"';
    let configMute = `
          <div class="QowCP">
            <div id="config-voice">Duo Voice:
              <div class="myOptions">
                <span><input type="checkbox" id="he_muteduo" value="muteduo" ${styleCheckbox}></input><label for="he_muteduo"> mute (beta)</label></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        `;
    // autoplay, play options, read intro
    let configListenComprehension = createConfigOption(LISTEN_COMPREHENSION, 'lc', false, true, false);
    let configTranslate = createConfigOption(TRANSLATE, 'ct', true, false, false);
    let configGapFill = createConfigOption(GAP_FILL, 'cgf', true, true, true);
    let configTapComplete = createConfigOption(TAP_COMPLETE, 'ctc', true, true, true);
    let configForm = createConfigOption(FORM, 'cf', true, true, true);
    let configDialogue = createConfigOption(DIALOGUE, 'cd', true, true, true);
    let configName = createConfigOption(NAME, 'cn', true, false, false);
    let configSpeak = createConfigOption(SPEAK, 'cs', true, false, false);
    let configListenTap = createConfigOption(LISTEN_TAP, 'clt', true, false, false);
    let configReadComprehension = createConfigOption(READ_COMPREHENSION, 'crc', true, true, true);
    let configListen = createConfigOption(LISTEN, 'cl', true, false, false);
    configDiv.innerHTML = `
    <div class="_3uS_y eIZ_c" data-test="config-popout" style="--margin:20px;">
      <div class="_2O14B _2XlFZ _1v2Gj WCcVn" style="z-index: 1;">
        <div class="_1KUxv _1GJUD _3lagd SSzTP" style="width: auto;"><div class="_1cv-y"></div>
        <div class="QowCP">
          <div class="_1m77f" style="text-align: center">Language &nbsp;
            <select style="background-color: #ffc800; color: white;" id="configLanguage">
            ${options}
            </select>
          </div>
        </div>
        <div class="QowCP" id="he_configChallenges">
<style>
.myOptions {
  display: flex;
  justify-content: space-around;
}
.myOptions span {
  width: 15ch;
}
</style>
          ${configListenComprehension}
          ${configTranslate}
          ${configGapFill}
          ${configTapComplete}
          ${configForm}
          ${configDialogue}
          ${configName}
          ${configSpeak}
          ${configListenTap}
          ${configReadComprehension}
          ${configListen}
          ${configMute}
        </div>
      </div>
    </div>`;

    document.querySelector('[role="progressbar"]').insertAdjacentElement('afterend', configButton);
    configButton.insertAdjacentElement('afterend', configDiv);
    configButton.addEventListener('click', function () { togglePopout('hearEverythingConfig'); });
    let configLanguage = document.getElementById('configLanguage')
    configLanguage.querySelector('[value="' + voiceSelect + '"]').setAttribute('selected', true);
    configLanguage.addEventListener('change', function () {
      voiceSelect = configLanguage.options[configLanguage.selectedIndex].value;
      GM_setValue('voiceSelect', voiceSelect);
      setVoice();
    });

    setVisibleConfig();
    document.getElementById('hearEverythingConfig').addEventListener('change', function (e) {
      GM_setValue(e.target.id, e.target.checked);
      config[e.target.id] = e.target.checked;
    });
  }
  if (document.querySelector('#hearEverythingGear') && document.querySelector('[role="progressbar"]')) {
    highlightConfig([LISTEN_COMPREHENSION, TRANSLATE, GAP_FILL, TAP_COMPLETE, FORM, DIALOGUE, NAME, SPEAK, LISTEN_TAP, READ_COMPREHENSION, LISTEN]);
  }
}

// sets all checkboxes to the current config
function setVisibleConfig() {
  (Object.keys(config)).map((key) => {
    if (document.getElementById(key)) document.getElementById(key).checked = config[key];
  });
}

// highlights the current challenge config
// list = array
function highlightConfig(list) {
  list.map((entry) => {
    document.querySelector('#config-' + entry).style = 'border: none; padding: 3px;';
  });
  // document.querySelector('#config-voice').style = 'border: none; padding: 3px;';
  let challenge = getChallengeType()[0];
  let element = document.querySelector('#config-' + challenge);
  if (element !== null) element.style = 'border: 1px solid gray; border-radius: 2px; padding: 3px;';
}

// returns false or the spoken sentence
function isDuoSpeaking() {

}

function start() {
  if (document.querySelector('[data-test="challenge-header"]')) {
    addConfig();
    checkNewPage();
    let challenge = getChallengeType()[0];
    if (challenge) {
      buildDebug();
      if (newPage === true) {
        if (document.querySelector(ANSWER_QS) !== null) {
          renderAnswerSpeakButton();
        } else {
          renderIntroSpeakButton();
          // speak optionen
          if (challenge === LISTEN_COMPREHENSION) {
            if (addedSpeech === false && document.querySelectorAll(CHALLENGE_JUDGE_INTRO_QS).length !== 0) {
              if (config.he_lc_click === true) {
                let hint = document.querySelector(HINT_TOKEN_QS).parentNode.innerText.replace('…', '').replace('...', '');
                addSpeech(CHALLENGE_JUDGE_QS, hint);
                addedSpeech = true;
              }
            }
          }
          if (challenge === FORM) {
            if (addedSpeech === false && document.querySelectorAll(CHALLENGE_JUDGE_QS).length !== 0) {
              if (config.he_cf_click === true) {
                addSpeech(CHALLENGE_JUDGE_QS);
                addedSpeech = true;
              }
            }
          }
          if (challenge === GAP_FILL) {
            if (addedSpeech === false && document.querySelectorAll(CHALLENGE_JUDGE_INTRO_QS).length !== 0) {
              if (config.he_cgf_click === true) {
                addSpeech(CHALLENGE_JUDGE_QS);
                addedSpeech = true;
              }
            }
          }
          if (challenge === DIALOGUE) {
            if (addedSpeech === false && document.querySelectorAll(CHALLENGE_JUDGE_INTRO_QS).length !== 0) {
              if (config.he_cd_click === true) {
                addSpeech(CHALLENGE_JUDGE_QS);
                addedSpeech = true;
              }
            }
          }
          if (challenge === TAP_COMPLETE) {
            if (addedSpeech === false && document.querySelectorAll(CHALLENGE_TAP_TOKEN_QS).length !== 0) {
              if (config.he_ctc_click === true) {
                addSpeech(CHALLENGE_TAP_TOKEN_QS);
                addedSpeech = true;
              }
            }
          }
          if (challenge === READ_COMPREHENSION) {
            if (addedSpeech === false && document.querySelectorAll(CHALLENGE_JUDGE_QS).length !== 0) {
              if (config.he_crc_click === true) {
                let hint = document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.nextSibling.firstChild.innerText.replace('…', '').replace('...', '');
                addSpeech(CHALLENGE_JUDGE_QS, hint);
                addedSpeech = true;
              }
            }
          }
        }

      }
    } else {
      // we detected no content to use, so we are not interested in this page
      newPage = false;
    }
  }
}

function prepareChallengeGapFill() {
  let answer;
  if (document.querySelector(RIGHT_ANSWER_QS)) {
    answer = document.querySelector(RIGHT_OPTION_QS).innerText;
  }
  if (document.querySelector(WRONG_ANSWER_QS)) {
    let answerElement = document.querySelector(ANSWER_CLASS);
    if (answerElement.lastElementChild) {
      answer = answerElement.lastElementChild.innerText;
    } else {
      answer = answerElement.innerText;
    }
  }
  // question
  let read = document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.innerText;
  // new type, which has two blanc places
  if (answer.includes('...')) {
    let answers = answer.split(' ... ');
    debug('answer 1 = ' + answers[0]);
    debug('answer 2 = ' + answers[1]);
    let reads = read.split('\n');
    debug('reads = ' + reads);
    if (reads.length === 2) {
      read = answers[0] + reads[0] + answers[1] + reads[1];
    } else {
      read = reads[0] + answers[0] + reads[1] + answers[1] + reads[2];
    }
  } else {
    // if the answer is at the start of the sentence, there's no \n
    if (read.includes('\n')) {
      read = read.replace('\n', answer);
    } else {
      read = answer + read;
    }
  }
  document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.innerHTML = `<span>${read}</span>`;
  return read;
}

function introChallengeGapFill() {
  if (document.querySelector(HINT_TOKEN_QS)) {
    let read = document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.innerText;
    let speaker = document.createElement('div');
    speaker.innerHTML = speakerButton;
    speaker.children[0].id = SPEAK_INTRO;
    speaker.children[0].style = 'width:40px; height:40px; background:transparent; margin-left:-16px; margin-right:0px; padding-bottom:5px';
    document.querySelector(HINT_TOKEN_QS).insertAdjacentElement('beforeBegin', speaker);
    return read;
  }
}

function prepareChallengeForm() {
  let answer;
  if (document.querySelector(RIGHT_ANSWER_QS)) {
    answer = document.querySelector(RIGHT_OPTION_QS).innerText;
  }
  if (document.querySelector(WRONG_ANSWER_QS)) {
    let answerElement = document.querySelector(ANSWER_CLASS);
    if (answerElement.lastElementChild) {
      answer = answerElement.lastElementChild.innerText;
    } else {
      answer = answerElement.innerText;
    }
  }
  let read = document.querySelector(FORM_PROMPT_QS).getAttribute('data-prompt').replace(/_+/, answer);
  document.querySelector(FORM_PROMPT_QS).innerHTML = `<span>${read}</span>`;
  return read;
}

function introChallengeForm() {
  if (document.querySelector(FORM_PROMPT_QS)) {
    let read = document.querySelector(FORM_PROMPT_QS).getAttribute('data-prompt').replace(/_+/, '\n');
    let speaker = document.createElement('div');
    speaker.innerHTML = speakerButton;
    speaker.children[0].id = SPEAK_INTRO;
    speaker.children[0].style = 'width:40px; height:40px; background:transparent; margin-left:-16px; margin-right:0px; padding-bottom:5px';
    document.querySelector(FORM_PROMPT_QS).insertAdjacentElement('afterBegin', speaker);
    return read;
  }
}

function prepareChallengeName() {
  let read;
  if (document.querySelector(RIGHT_ANSWER_QS)) {
    read = document.querySelector(TEXT_INPUT_QS).value;
  }
  if (document.querySelector(WRONG_ANSWER_QS)) {
    read = document.querySelector(ANSWER_CLASS).innerText;
  }
  return read;
}

function prepareChallengeTranslate() {
  let read;
  if (document.querySelector(RIGHT_ANSWER_QS)) {
    if (document.querySelector(WORD_BANK_QS)) {
      // debug('innerText = ' + document.querySelector(CHALLENGE_TAP_TOKEN_QS).parentNode.parentNode.innerText);
      read = document.querySelector(CHALLENGE_TAP_TOKEN_QS).parentNode.parentNode.innerText.replace(/\n/g, ' ');
      read = read.replace(/' /g, "'");
    } else {
      let tI = document.querySelector(TRANSLATE_INPUT_QS);
      if (tI.lang === config.lang) read = tI.innerHTML;
    }
  }
  if (document.querySelector(WRONG_ANSWER_QS) || document.querySelector(RIGHT_ANSWER_TYPO_QS)) {
    let answer = document.querySelector(ANSWER_CLASS);
    if (answer.lastElementChild) {
      read = answer.lastElementChild.innerText;
    } else {
      read = answer.innerText;
    }
  }
  if (document.querySelector(SPEAKER_BUTTON_QS)) {
    read = document.querySelector(HINT_TOKEN_QS).parentNode.innerText;
  }
  // console.debug('HearEverything: read = ' + read);
  return read;
}

function prepareChallengeTapComplete() {
  let read;
  if (document.querySelector(RIGHT_ANSWER_QS)) {
    read = document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.innerText.replace(/\n/g, '');
  }
  if (document.querySelector(WRONG_ANSWER_QS)) {
    read = document.querySelector(ANSWER_CLASS).innerText;
  }
  // console.debug('HearEverything: read = ' + read);
  return read;
}

function prepareChallengeDialogue() {
  let read;
  let speaker1 = document.querySelector('[class="' + DIALOGUE_SPEAKER_CLASS + '"]').innerText;
  let speaker2;
  if (document.querySelector(WRONG_ANSWER_QS)) {
    speaker2 = document.querySelector('._1UqAr._1sqiF').innerText;
  } else {
    speaker2 = document.querySelector('[aria-checked="true"]').querySelector('[data-test="challenge-judge-text"]').innerText;
  }
  read = speaker1 + '\n' + speaker2;
  return read
}

function introChallengeDialogue() {
  if (document.querySelector(HINT_SENTENCE_QS)) {
    let read = document.querySelector(HINT_SENTENCE_QS).innerText;
    let speaker = document.createElement('div');
    speaker.innerHTML = speakerButton;
    speaker.children[0].id = SPEAK_INTRO;
    speaker.children[0].style = 'width:40px; height:40px; background:transparent; margin-left:-16px; margin-right:0px; padding-bottom:5px';
    document.querySelector(HINT_SENTENCE_QS).insertAdjacentElement('afterBegin', speaker);
    return read;
  }
}

function prepareChallengeReadComprehension() {
  let read;
  let speaker1 = document.querySelector(HINT_TOKEN_QS).parentNode.innerText;
  let speaker2;
  if (document.querySelector(WRONG_ANSWER_QS)) {
    speaker2 = document.querySelector(ANSWER_CLASS).innerText;
  } else {
    speaker2 = document.querySelector(RIGHT_OPTION_QS).innerText;
  }
  read = speaker1 + '\n' + document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.nextSibling.firstChild.innerText.replace('...', ' ' + speaker2);
  return read
}

function introChallengeReadComprehension() {
  if (document.querySelector(HINT_TOKEN_QS)) {
    let read = document.querySelector(HINT_TOKEN_QS).parentNode.innerText;
    let speaker = document.createElement('div');
    speaker.innerHTML = speakerButton;
    speaker.children[0].id = SPEAK_INTRO;
    speaker.children[0].style = 'width:40px; height:40px; background:transparent; margin-left:-7px; margin-bottom:-10px; margin-right:0px;';
    document.querySelector(HINT_TOKEN_QS).parentNode.parentNode.insertAdjacentElement('beforeBegin', speaker);
    return read;
  }
}

function prepareChallengeSpeak() {
  if (document.querySelector(HINT_TOKEN_QS)) {
    let read = document.querySelector(HINT_TOKEN_QS).parentNode.innerText;
    return read;
  }
}

function prepareChallengeListenTap() {
  if (document.querySelector(CHALLENGE_TAP_TOKEN_QS)) {
    let read = document.querySelector(CHALLENGE_TAP_TOKEN_QS).parentNode.parentNode.innerText;
    return read.replace(/\n/g, ' ').replace(/' /g, "'");
  }
}

function renderIntroSpeakButton() {
  if (document.querySelector(SPEAK_INTRO_QS) === null) {
    let read = '';
    let challenge = getChallengeType()[0];
    if (challenge === DIALOGUE) read = introChallengeDialogue();
    if (challenge === READ_COMPREHENSION) read = introChallengeReadComprehension();
    if (challenge === FORM) read = introChallengeForm();
    if (challenge === GAP_FILL || challenge === TAP_COMPLETE) read = introChallengeGapFill();

    if (read !== '') {
      if (DEBUG) document.querySelector('#mySentence').innerText = read;
      debug('intro = ' + read);
      let utter = generateUtter(read);
      addSpeakListener(SPEAK_INTRO, utter, read);
      if (challenge === DIALOGUE && config.he_cd_autointro) {
        document.querySelector(SPEAK_INTRO_QS).click();
      }
      if (challenge === READ_COMPREHENSION && config.he_crc_autointro) {
        document.querySelector(SPEAK_INTRO_QS).click();
      }
      if (challenge === FORM && config.he_cf_autointro) {
        document.querySelector(SPEAK_INTRO_QS).click();
      }
      if (challenge === GAP_FILL && config.he_cgf_autointro) {
        document.querySelector(SPEAK_INTRO_QS).click();
      }
      if (challenge === TAP_COMPLETE && config.he_ctc_autointro) {
        document.querySelector(SPEAK_INTRO_QS).click();
      }
    }
  }
}

function renderAnswerSpeakButton() {
  let read = '';
  let challenge = getChallengeType()[0];
  if (challenge === FORM) {
    read = prepareChallengeForm();
  }
  if (challenge === TRANSLATE || challenge === LISTEN || challenge === COMPLETE_REVERSE_TRANSLATION) {
    read = prepareChallengeTranslate();
  }
  if (challenge === DIALOGUE) {
    read = prepareChallengeDialogue();
  }
  if (challenge === READ_COMPREHENSION) {
    read = prepareChallengeReadComprehension();
  }
  if (challenge === NAME) {
    read = prepareChallengeName();
  }
  if (challenge === GAP_FILL) {
    read = prepareChallengeGapFill();
  }
  /*
  if (challenge === COMPLETE_REVERSE_TRANSLATION) {
      read = prepareChallengeTranslate();
  } */
  if (challenge === TAP_COMPLETE) {
    read = prepareChallengeTapComplete();
  }
  if (challenge === SPEAK) {
    read = prepareChallengeSpeak();
  }
  if (challenge === LISTEN_TAP) {
    read = prepareChallengeListenTap();
  }
  debug('read = ' + read);
  let utter = generateUtter(read);
  // add speaker button to answer and fill in the correct answer in the headline
  updateText(read);
  // if we have added the speaker button, we find it in the document
  addSpeakListener('speak', utter, read);
  // do it for every page to trigger the Duo speaker button also
  document.removeEventListener('keydown', myShortcutListener);
  document.addEventListener('keydown', myShortcutListener);

  newPage = false;
  // console.debug('Now it\'s an old page');
  addedSpeech = false;
  // console.debug('Reset: speech isn\'t attached to options any more');
  // if you like autoplay, it waits 1 second an plays it
  if (((challenge === TRANSLATE) || (challenge === COMPLETE_REVERSE_TRANSLATION)) && config.he_ct_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === GAP_FILL && config.he_cgf_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === TAP_COMPLETE && config.he_ctc_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === FORM && config.he_cf_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === DIALOGUE && config.he_cd_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === NAME && config.he_cn_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === SPEAK && config.he_cs_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === LISTEN_TAP && config.he_clt_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === READ_COMPREHENSION && config.he_crc_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
  if (challenge === LISTEN && config.he_cl_auto === true) {
    timeoutAutoplay(challenge, utter);
  }
}

function timeoutAutoplay(challenge, utter) {
  timeout = setTimeout(function () {
    debug('auto play ' + challenge);
    synth.cancel();
    synth.speak(utter);
  }, config.ap_timeout);
}

function addSpeakListener(id, utter, read) {
  let speak = document.querySelector('#' + id);
  if (speak) {
    speak.addEventListener('click', function () { synth.cancel(); synth.speak(utter); });
    // console.debug('EventListener bound to speak button');
    if (DEBUG) document.querySelector('#mySentence').innerText = read;
    document.getElementById(id).title = read;
  } else {
    debug('No speak button found');
  }
}

function generateUtter(read) {
  let utter = new SpeechSynthesisUtterance(read);
  utter.voice = voices[voiceSelect];
  utter.volume = 1;
  utter.pitch = 1;
  utter.rate = 1;
  utter.lang = config.lang;
  return utter;
}

function myShortcutListener(event) {
  let speak = document.querySelector('#speak');
  let duoSpeak = document.querySelector(SPEAKER_BUTTON_QS);
  // ALT + l combo
  if (event.altKey && event.key === 'l') {
    if (speak) { speak.click(); }
    else if (duoSpeak) duoSpeak.click();
    debug('alt = ' + event.altKey + ' + ' + event.key);
  }
}

function readTapComplete(tap) {
  let read = '';
  let words = tap.childNodes;
  words.forEach(function (word) {
    if (word.nodeName === 'SPAN') read += word.children[0].innerText;
    if (word.nodeName === 'DIV') {
      read += word.querySelector('[class="_2Z2xv"]').children[0].innerText;
    }
  });
  return read;
}

// gives some debug information directly in the Duo-GUI
function buildDebug() {
  /*
  const FORM = 'challenge-form';
const TRANSLATE = 'challenge-translate';
const DIALOGUE = 'challenge-dialogue';
const GAP_FILL = 'challenge-gapFill';
const COMPLETE_REVERSE_TRANSLATION = 'challenge-completeReverseTranslation';
const TAP_COMPLETE = 'challenge-tapComplete';
const LISTEN_COMPREHENSION = 'challenge-listenComprehension';
const READ_COMPREHENSION = 'challenge-readComprehension';
const NAME = 'challenge-name';
*/
  if (DEBUG) {
    if (!document.querySelector('#myChallenge')) {
      let challenge = getChallengeType()[0];
      let autoPlay = 'disabled';
      let speakOption = 'disabled';
      let autoIntro = 'disabled';
      if (challenge === TRANSLATE && config.he_ct_auto) autoPlay = 'enabled';
      // document.getElementById('he_cgf_auto').checked = config.he_cgf_auto;
      if (challenge === GAP_FILL && config.he_cgf_auto) autoPlay = 'enabled';
      // document.getElementById('he_cgf_click').checked = config.he_cgf_click;
      if (challenge === GAP_FILL && config.he_cgf_click) speakOption = 'enabled';
      // document.getElementById('he_ctc_auto').checked = config.he_ctc_auto;
      if (challenge === TAP_COMPLETE && config.he_ctc_auto) autoPlay = 'enabled';
      // document.getElementById('he_ctc_click').checked = config.he_ctc_click;
      if (challenge === TAP_COMPLETE && config.he_ctc_click) speakOption = 'enabled';
      // document.getElementById('he_cf_auto').checked = config.he_cf_auto;
      if (challenge === FORM && config.he_cf_auto) autoPlay = 'enabled';
      // document.getElementById('he_cf_click').checked = config.he_cf_click;
      if (challenge === FORM && config.he_cf_click) speakOption = 'enabled';
      // document.getElementById('he_cd_auto').checked = config.he_cd_auto;
      if (challenge === DIALOGUE && config.he_cd_auto) autoPlay = 'enabled';
      // document.getElementById('he_cd_click').checked = config.he_cd_click;
      if (challenge === DIALOGUE && config.he_cd_click) speakOption = 'enabled';
      // document.getElementById('he_cd_autointro').checked = config.he_cd_autointro;
      if (challenge === DIALOGUE && config.he_cd_autointro) autoIntro = 'enabled';
      // document.getElementById('he_cn_auto').checked = config.he_cn_auto;
      if (challenge === NAME && config.he_cn_auto) autoPlay = 'enabled';
      // document.getElementById('he_muteduo').checked = config.he_muteduo;
      if (challenge === LISTEN_COMPREHENSION && config.he_lc_click) speakOption = 'enabled';
      // if (challenge === DIALOGUE && config.he_cd_autointro) autoIntro = 'enabled';
      if (challenge === SPEAK && config.he_cs_auto) autoPlay = 'enabled';
      let debug = document.createElement('div');
      debug.innerHTML = `<span>Challenge-Name: <span id="myChallenge">${getChallengeType()[0]}</span></span>
    <span>Sentence to speak: <span id="mySentence"></span></span>
    <span>Speak options: <span id="myOptions">${speakOption}</span></span>
    <span>Auto play: <span id="myAutoPlay">${autoPlay}</span></span>
    <span>Auto intro: <span id="myAutoIntro">${autoIntro}</span></span>
    <span>Not found: <span id="myNotFound"></span></span>`;
      debug.style = "font-size: small; text-align:left; display:grid;";
      document.querySelector('[data-test="challenge-header"]').insertAdjacentElement('afterend', debug);
      if (!document.querySelector(HINT_SENTENCE_QS)) document.querySelector('#myNotFound').innerText += ' HINT_SENTENCE: ' + HINT_SENTENCE;
      if (!document.querySelector(SPEAKER_BUTTON_QS)) document.querySelector('#myNotFound').innerText += ' SPEAKER_BUTTON: ' + SPEAKER_BUTTON;
    }
  }
}

function checkNewPage() {
  if (!document.querySelector('#myNewPage')) {
    let nP = document.createElement('div');
    nP.id = 'myNewPage';
    document.querySelector('[data-test="challenge-header"]').insertAdjacentElement('afterend', nP);
    //console.debug('---- div - newPage ----');
    debug('Challenge Type = ' + getChallengeType()[0]);
    newPage = true;
    if (howlPlay === false) {
      synth.cancel();
    } else {
      howlPlay = false;
    }
  } else {
    //console.debug('---- div - oldPage ----');
  }
}

// returns challenge type or false
function getChallengeType() {
  let element = document.querySelector('[data-test~="challenge"]');
  if (element !== null) {
    return [element.getAttribute('data-test').split(' ')[1], element];
  } else {
    return [false];
  }
}

// gets the type of the current challenge
// returns array [type, HTMLElement]
// returns null if no usable type is found
// if returnEverything = true, it returns also noType
function parsedChallengeType(returnEverything = false) {

  let type = null;
  let noType = ['Unidentified Page Type'];
  for (let i = 0; i < TEST.length; i++) {
    if (document.querySelector(`[data-test="${TEST[i]}"]`)) {
      type = [TEST[i], document.querySelector(`[data-test="${TEST[i]}"]`)];
    }
  }
  if (document.querySelector(`[data-test="${SELECT_TRANSCRIPTION}"]`)) { noType = ['No usable page type (' + SELECT_TRANSCRIPTION + ')', '']; }
  if (document.querySelector(`[data-test="${READ_COMPREHENSION}"]`)) { noType = ['No usable page type (' + READ_COMPREHENSION + ')', '']; }
  if (document.querySelector(`[data-test="${LISTEN}"]`)) { noType = ['No usable page type (' + LISTEN + ')', '']; }
  if (document.querySelector(`[data-test="${LISTEN_TAP}"]`)) { noType = ['No usable page type (' + LISTEN_TAP + ')', '']; }
  if (document.querySelector(`[data-test="${LISTEN_COMPREHENSION}"]`)) { noType = ['No usable page type (' + LISTEN_COMPREHENSION + ')', '']; }

  // type ? console.info('HearEverything: Page Type = ' + type[0]) : console.info('HearEverything: ' + noType[0]);
  if (returnEverything) {
    return type ? type : noType;
  } else {
    return type;
  }
}

function addSpeech(qs, t = '') {
  //console.debug('Add speech to the option buttons:');
  if (t !== '') t += ' ';
  let options = document.querySelectorAll(qs);
  for (let i = 0; i < options.length; i++) {
    let utter = generateUtter(t + options[i].innerText);
    options[i].parentNode.addEventListener('click', function () { synth.cancel(); synth.speak(utter); });
    // console.debug('EventListener bound: ' + options[i].innerHTML);
    debug('Option = ' + t + options[i].innerText);
    // options[i].id = 'eventListener' + i;
  }
}

function updateText(t) {
  // don't add a listen button if there is no text t
  if (t !== '') {
    // console.debug('We should now add a speak button');
    let formPrompt = document.querySelector('[data-test="challenge-form-prompt"]');
    let translateInput = document.querySelector('[data-test="challenge-translate-input"]');

    if (TEST.includes(getChallengeType()[0])) {
      let div = document.createElement('div');
      div.class = 'np6Tv';
      div.style = 'position: absolute; align-self: flex-end; top: 1.8rem;';
      div.innerHTML = speakerButton;
      // if the answer is displayed
      if (document.querySelector('._3dRS9._3DKa-._1tuLI')) {
        if (translateInput !== null) {
          if (translateInput.lang === config.lang) {
            document.querySelector('._3dRS9._3DKa-._1tuLI').insertAdjacentElement('afterBegin', div);
            // console.debug('Speaker Button Bottom added');
          }
        } else {
          document.querySelector('._3dRS9._3DKa-._1tuLI').insertAdjacentElement('afterBegin', div);
          // console.debug('Speaker Button Bottom added');
        }
      }
    }
  }
}
