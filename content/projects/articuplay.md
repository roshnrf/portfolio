---
title: ArticuPlay
tagline: Speech ML · Fine-tuning
summary: A speech-therapy app for children with Childhood Apraxia of Speech. A LoRA-tuned Whisper scores each attempt phoneme by phoneme and names the type of error.
year: "2026"
order: 2
status: Not publicly deployed. Trained on the UltraSuite corpus, which is licensed for non-commercial use.
tags: [faster-whisper, LoRA, PyTorch, FastAPI, PostgreSQL, Supabase, React, TypeScript, espeak-ng]
metrics:
  - value: 96.0%
    label: phoneme accuracy on held-out words
  - value: 80.0%
    label: stock Whisper on the same words
  - value: 28% → 3%
    label: false accepts on real disordered speech
  - value: 0.73%
    label: of parameters trained (1.77M)
repo: https://github.com/roshnrf/ArticuPlay
---

## The problem

Children with Childhood Apraxia of Speech (CAS) know what they want to say but struggle to plan the movements to say it. Therapy is repetition with precise feedback. A speech-language pathologist does not mark a word right or wrong; they note *which* sound went wrong and *how*: a substitution, an omission, a reduced cluster, a dropped syllable.

Off-the-shelf speech recognition gives a transcript, and a transcript hides exactly that detail. Worse, a general ASR model "corrects" a child's attempt toward the nearest real word, which makes wrong attempts look right.

## How it works

![ArticuPlay architecture](/projects/articuplay-architecture.svg)

1. The child hears a target word (text to speech via `edge-tts`) and repeats it.
2. A self-hosted `faster-whisper` model with a LoRA adapter transcribes the attempt.
3. Target and attempt are converted to IPA phonemes with `phonemizer` (espeak-ng).
4. A custom Wagner-Fischer edit-distance alignment lines up the two phoneme sequences and classifies each difference as a substitution, omission, cluster reduction or syllable deletion.

The backend is FastAPI with async SQLAlchemy and Alembic on PostgreSQL (Supabase); the frontend is React 19 with TypeScript, Vite and Tailwind. Everything is self-hosted, so no child's audio leaves the system.

## The model

Whisper-small, fine-tuned with LoRA (r = 16, alpha = 32). That trains 1.77M parameters, 0.73% of the model. Training data is the UXTD subset of UltraSuite plus synthetic TTS audio for the 491 words in the product vocabulary.

A second model, a binary phone classifier for velars and rhotics, was trained on UXSSD with leave-one-speaker-out cross-validation. It reached 60.9% with a frozen encoder and 67.9% with LoRA.

## Results

![Held-out generalisation: fine-tuned model vs stock Whisper](/projects/articuplay-holdout.png)

On a held-out set of 30 words the model never saw:

| Model | Phoneme accuracy |
| --- | --- |
| Stock Whisper-small | 80.0% |
| LoRA fine-tuned | 96.0% |

Three training seeds gave 96.0%, 98.2% and 96.0%.

On real disordered speech through the live pipeline, across three iterations of the acceptance gate:

| Version | False accept | False reject |
| --- | --- | --- |
| First | 28% | 32% |
| Second | 15% | 44% |
| Third | 3% | 46% |

![Error-type rates](/projects/articuplay-error-rates.png)

## Limitations

I would rather state these than have a reader find them:

- **False rejects are high, at 46%.** Each tightening of the gate cut false accepts and pushed false rejects up, so wrong attempts are now rarely praised but correct ones are often asked to repeat. This is the main thing to fix.
- The held-out set is 30 words. It shows the direction, not a tight estimate.
- The phone classifier is about 68% accurate, not yet useful on its own.
- English only.
- Latency is 3.0 to 3.5 s end to end on CPU, right at the edge of the 3 s budget.
- UltraSuite is CC BY-NC 4.0, so the trained models cannot be used commercially.

The repository also keeps a version history across 12 iterations and a security audit that found and fixed unauthenticated session endpoints and missing Supabase row-level security.
