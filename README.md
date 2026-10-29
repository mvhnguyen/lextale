# English LexTALE + Mandarin LexCH (Bilingual Administration)

This fork adapts the original [web-based LexTALE implementation by Gaspar Lukács](https://github.com/gasparl/lextale) for a two-test research session: **English LexTALE** (Lemhöfer & Broersma, 2012) and **Mandarin LexCH** (Qi et al., published online 2022, journal issue 2024). **LexCH is a word-based test and is not the 90-item character-based LexTALE_CH.**

## Administration

- Enter a numeric participant ID and the experimenter's name.
- Even IDs: English LexTALE, then Mandarin LexCH. Odd IDs: Mandarin LexCH, then English LexTALE.
- Complete both tests. English stimuli are shown individually with Yes/No responses; Mandarin presents 144 Chinese words/nonwords in a checkbox grid. Chinese instructions are in Chinese.
- At the end, a CSV download is requested and a **Save CSV again** button is available. **No scores or trial data are displayed to the participant.**
- Confirm the download is actually saved before closing the browser, especially on iPad.

## Scores and output

- English LexTALE: 40 scored real words and 20 scored nonwords, plus three unscored practice/dummy items. English score is the average of real-word and nonword accuracy percentages (0–100).
- Mandarin LexCH: 96 real words and 48 nonwords in the published 144-item sequence. Select a word only if its meaning is known or a synonym can be provided. Score = real words selected − 2 × nonwords selected (possible range −96 to 96).
- The combined UTF-8 CSV is named `lextale_PARTICIPANTID.csv` (e.g., `lextale_001.csv`). It records participant ID, experimenter, order, block, test, item, stimulus, real/nonword status, response, correctness, test score, and English item RT. Mandarin checkbox responses have **no item-specific RT**.
- Total output: **207 rows** (63 English + 144 Mandarin). Scores are repeated on test-specific rows to make filtering easier. Do not compare the raw LexTALE and LexCH scores as if they use the same scale.

## Hosting on GitHub Pages

Keep `index.html`, `main.js`, `lexch_data.js`, `stimdata.js`, and `styles.css` in the repository root. The `ch_items/` files from the original repository are no longer needed for this particular task but can remain in the fork. In repository Settings → Pages, publish from the default branch's root folder.

GitHub Pages only serves static files. **It does not automatically collect study results**. The browser requests a participant CSV download; confirm it saved successfully on the device.

## Source and research notes

- English stimuli remain from the original `stimdata.js` / LexTALE implementation.
- Mandarin items and their word/nonword classification were transcribed from the published LexCH questionnaire and answer key, retaining published item numbers. Verify text against the official appendix before production research collection.
- The browser layout is an adaptation of the paper questionnaire and should not be represented as an independently validated digital administration.
- This code does not enforce a time limit or prevent restarting/closing the browser before downloading.

## References

- Lemhöfer, K., & Broersma, M. (2012). Introducing LexTALE: A quick and valid Lexical Test for Advanced Learners of English. *Behavior Research Methods, 44*, 325–343. https://doi.org/10.3758/s13428-011-0146-0
- Qi et al. *LexCH: A quick and reliable receptive vocabulary size test for Chinese Learners.* *Applied Linguistics Review.* https://doi.org/10.1515/applirev-2022-0006
- Original open-source web implementation: https://github.com/gasparl/lextale

Preserve relevant original authorship, copyright and licensing notices when adapting or redistributing project files.
