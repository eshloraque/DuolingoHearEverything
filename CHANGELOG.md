# Changelog

## 0.69.1

- replaced window.onload with addEventListener to allow other scripts to trigger this as well

## 0.69

### added

- challenge typeCloze autoplay

### changed

- options dialog is now more compressed
- highlight function is easier

## 0.68

### added

- challenge completeReverseTranslation

### changed

- challenge gapFill speaker position
- bugfix read answer with typo

## 0.67

### added

- challenge tapCloze (autoIntro, autoPlay)

## 0.66

### added

- read tips (beta)

### changed

- some refactoring

## 0.65

### added

- challenge match overrides cartoon character on tap
- challenge translate overrides cartoon character on tap

### changed

- challenge gap fill replaces only ____
- challenge form replaces only ____
- challenge read comprehension discards blanking
- challenge read comprehension adds space in front of answer
- config dialogue has spaces in challenge names

## 0.64.2

### changed

- more refactoring

## 0.64.1

### changed

- some refactoring

## 0.64

### added

- challenge listen tap overrides cartoon character on tap

### changed

- challenge listen tap refactored

## 0.63.2

### changed

- challenge translate refactored

## 0.63.1

### changed

- fixed challenge read comprehension bug, that no answer has been read

## 0.63

### added

- challenge tapClozeTable autoplay and autointro

### changed

- code refactored

## 0.62.1

### changed

- code refactoring

## until 0.62

// 0.62: auto play challenge form, gap-fill, tap-complete
// 0.61: mute Duo
// 0.60: add challenge listen
// 0.59.1: fix listen tap bug with '
// 0.59: add challenge read comprehension
// 0.58: read again challenge listen tap
// 0.57: remove interception calls
// 0.56: read again challenge translate
// 0.55: Fix challenge gap-fill
// 0.54: Simplify code (addConfig())
// 0.53: Auto play for speak challenge
// 0.52: Duo mute removed
// 0.51: Duo will be muted correctly
// 0.50: fixed challenge form
// 0.49: fixed challenge tap-complete
// 0.48: fixed challenge listen comprehension, included config

// 0.7: Mutation Observer instead of setInterval
// 0.6: Add voice to choices on click
// 0.6.1: check why not the innerText of the answer is displayed in the full sentence?
// 0.8.1: fix speaking numbers for options
// 0.9: Move speak button near the continue button
// 0.10.2: set better newPage = true - deleted
// 0.10.3: debug quirks from setting newPage
// 0.11: cleaned up some code
// 0.12: finally got rid of the new page problem
// 0.13: show some debug infos on the page
// 0.14: more working reading
// 0.15: added more challenges to read
// 0.16: Challenges, which work (some partially) // FORM, TRANSLATE, DIALOGUE, GAP_FILL, COMPLETE_REVERSE_TRANSLATION, TAP_COMPLETE
// 0.17: added shortcut ALT+l
// 0.18: listening button for DIALOGUE and bugfixing TRANSLATE
// 0.19: better listening button
// 0.20: Voice selection
// 0.21: cleaned up code
// 0.22: challenge translate (tap) working
// 0.22.1: no speaker button with translate from learning language
// 0.23: Alt + l for Duo buttons, too
// 0.24: tap-complete working
// 0.25: form challenge working
// 0.25.1: bugfix: challenge-translate
// 0.26: challenge read-comprehension
// 0.27: challenge name
// 0.28: autoplay for challenge translate
// 0.29: replace prompt at challenge gap fill
// 0.30: gap fill auto play
// 0.30.1: fixed playback stops
// 0.31: stops playback on new page
// 0.31.1: fixed gap fill not reading whole answer
// 0.32: auto play for complete reverse translation
// 0.33: toggle options readout at gap fill challenge
// 0.34: challenge dialogue auto play, auto intro, play options
// 0.34.1: bug fix only render intro button at challenge dialogue
// 0.35: challenge tapComplete
// 0.36: challenge form
// 0.37: challenge gap fill - extended
// bug fix challenge Tap Complete
// 0.38: better looking config menu
// 0.38.1: removed unused code
// 0.39: hide config on mouse click outside
// 0.40: challenge-name
// 0.41: get challenges data
// 0.42: get typo answers
// 0.43: mute most Duo speech
// 0.44: challenge hint in config popup, minor bugfixes
// 0.44.1: eventHandler for unmute - everything beta
// 0.44.2: gray borders for challenge hint
// 0.45: show more debug information
// 0.46: fixed autoIntro with challenge dialogue
// 0.47: fixed reading english challenge translate
