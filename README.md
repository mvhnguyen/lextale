# LexTALE — English and Mandarin (bilingual administration)

This repository is an adaptation of the open-source [LexTALE(_CH) web implementation by Gaspar Lukács](https://github.com/gasparl/lextale). It is configured for administering **both English LexTALE and Mandarin Chinese LexTALE_CH to the same participant** in one browser-based session, including on an iPad.

The adaptation retains the original English and Chinese stimulus definitions, Chinese character images, and task formats. It removes the participant-facing language selection and uses participant ID parity to determine test order. The German and Dutch tests and the Chinese version with additional English instructions are not part of this administration workflow.

## Session procedure

1. Open this repository's GitHub Pages website in a browser.
2. Enter a **numeric participant ID** (e.g., `001` or `002`) and the **experimenter name**.
3. Select **Begin session**. The language order is assigned automatically:

   | Participant ID | First test | Second test |
   | --- | --- | --- |
   | Even (e.g., `002`) | English | Mandarin |
   | Odd (e.g., `001`) | Mandarin | English |

4. Read the instructions and complete the first test.
5. Use the transition screen to continue to the second test. Participants complete **both** tests in the assigned order.
6. At the end, save the combined CSV and **confirm that the file is present on the device** before closing the page.

The Mandarin test uses **Chinese-only instructions** (`ch1` in the original implementation). Both task formats are preserved:

- **English LexTALE:** 63 displayed items (3 unscored introductory/dummy items plus 40 real words and 20 nonwords), judged individually as word/nonword. Response time is recorded per item.
- **Mandarin LexTALE_CH:** 90 character images (60 real characters, 30 pseudocharacters), presented as a scrollable checklist. Participants select the images they judge to be real Chinese characters. Item-level response times are **not** collected for this version.

The two tests retain their original category-balanced percentage scoring: the mean of accuracy on real and nonreal items. English dummy items are excluded from the English score.

## Output and data handling

After both tests, the program requests a CSV download and displays a **Save CSV again** button in case the browser blocks or does not complete that download. **No scores, accuracy summaries, or trial-level results are displayed to the participant.** The completion screen only shows the CSV filename and save instructions.

The filename is `lextale_<participant_id>.csv`, preserving the entered ID. For example, participant `002` produces `lextale_002.csv`.

A complete session produces **153 item-level rows**: 63 English items (including the 3 dummy items) and 90 Mandarin items. Its CSV columns are:

| Column | Meaning |
| --- | --- |
| `participant_id` | ID entered at the beginning |
| `experimenter` | Experimenter name entered at the beginning |
| `language` | `English` or `Mandarin` |
| `order_position` | `1` for first test, `2` for second test |
| `item_number` | Item number within that language |
| `stimulus` | English word/nonword or Mandarin image filename |
| `is_real` | `1` for real item, `0` for nonreal item |
| `dummy` | `1` for English unscored introductory items, otherwise `0` |
| `response` | `yes` / `no`; for Mandarin, selected / not selected |
| `correct` | `yes` / `no` |
| `response_time_ms` | English response time in milliseconds; blank for Mandarin |

**Important:** GitHub Pages is a static host. It does **not** automatically upload participant responses to GitHub or a server. Results are generated in the browser and must be saved on the device. In Safari on iPad, confirm the file was actually saved and can be found through Files/Downloads or the browser's download interface. Reusing an ID may create multiple downloads with similar names, depending on browser behavior.

## Hosting with GitHub Pages

This fork can be hosted independently of the original project:

1. Upload the adapted `index.html` and `main.js` to your fork's repository root.
2. Keep `stimdata.js`, `styles.css`, `ch_items/`, and the original supporting assets in place.
3. In the repository, select **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch**, select the repository's publishing branch (`master` or `main`, as applicable) and `/ (root)`, then save.
5. Use the website link displayed under GitHub Pages settings.

This adaptation is intended for experimenter-supervised administration. Test the full workflow on the actual iPad/browser before collecting data, including a session with an odd ID, a session with an even ID, Chinese image loading, and the saved CSV. Do not assume a download succeeded just because the completion screen appeared.

## Files

- `index.html`: participant/experimenter entry, task instructions, task displays, transition screen, and download-only completion screen.
- `main.js`: session flow, counterbalancing, responses, scoring, CSV generation, and download behavior.
- `stimdata.js`: original stimulus definitions and item validity labels.
- `ch_items/`: Mandarin character images and Chinese instruction graphics.
- `styles.css`: visual styling retained from the original implementation.

## Original implementation and attribution

Adapted from **Gaspar Lukács' LexTALE(_CH) repository**: https://github.com/gasparl/lextale

The original project includes web-based English, German, Dutch, and Mandarin versions, as well as PsychoPy implementations for some languages. This fork changes the **web administration workflow**; it does not claim to introduce new validated stimulus sets or new normative scoring. For original usage details, code, and support, refer to the [upstream repository](https://github.com/gasparl/lextale). Any original license and attribution requirements continue to apply.

### References

Chan, I. L., & Chang, C. B. (2018). LEXTALE_CH: A quick, character-based proficiency test for Mandarin Chinese. In A. B. Bertolini & M. J. Kaplan (Eds.), *Proceedings of the 42nd Annual Boston University Conference on Language Development*, Vol. 1 (pp. 114–130). Somerville, MA: Cascadilla Press. Materials: https://osf.io/qdy4n/

Lemhöfer, K., & Broersma, M. (2012). Introducing LexTALE: A quick and valid Lexical Test for Advanced Learners of English. *Behavior Research Methods, 44*(2), 325–343. https://doi.org/10.3758/s13428-011-0146-0

Lukács, G., Kawai, C., Ansorge, U., & Fekete, A. (2022). Detecting concealed language knowledge via response times. *Applied Linguistics Review*. https://doi.org/10.1515/applirev-2020-0130

Original implementation DOI: [10.5281/zenodo.3826505](https://doi.org/10.5281/zenodo.3826505).
