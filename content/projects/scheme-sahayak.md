---
title: Scheme Sahayak
tagline: Voice AI · RAG
summary: A voice assistant that answers questions about Indian government schemes in Hindi and Malayalam, and says "I'm not sure" instead of guessing when retrieval is weak.
year: "2026"
order: 2
status: Runs locally. Demo recordings in Hindi and Malayalam are further down this page.
tags: [Pipecat, Sarvam AI, LangChain, FAISS, bge-m3, Silero VAD, Playwright, Python]
metrics:
  - value: 1.0–1.5 s
    label: median end-to-end response, no GPU
  - value: "0.38"
    label: retrieval confidence gate, calibrated from data
  - value: "41"
    label: central government schemes indexed
  - value: "2"
    label: languages, Hindi and Malayalam
repo: https://github.com/roshnrf/scheme-sahayak-voice-assistant
---

## The problem

India runs hundreds of welfare schemes, and the people they are meant for often cannot search for them in English. A voice interface in the user's own language is the obvious answer, and the obvious risk: a language model that confidently invents an eligibility rule is worse than no assistant at all.

Mature efforts already exist here, including myScheme and BHASHINI's VoicERA. I built this from scratch to learn what a real-time voice pipeline demands, not to compete with them.

## How it works

![Scheme Sahayak pipeline: speech to text, echo filter, retrieval with a confidence gate, LLM, text to speech](/projects/scheme-architecture.jpeg)

A spoken question passes through a Pipecat pipeline:

1. **Speech to text** with Sarvam `saaras:v3`, with Silero VAD and smart-turn detection deciding when the speaker has finished.
2. **Echo suppression**, a transcript filter that drops the assistant's own voice when the microphone picks it up.
3. **Retrieval** over a FAISS index of scheme documents, embedded locally with `BAAI/bge-m3`.
4. **The confidence gate.** If the best match scores below the threshold, the assistant returns a fixed "I am not certain" reply and the LLM is never called.
5. **Generation** with `sarvam-30b`, grounded in the retrieved scheme text.
6. **Text to speech** with Sarvam `bulbul:v3`.

Scheme data comes from myscheme.gov.in through a Playwright scraper, with Sarvam `mayura:v1` handling translation. Retrieval, thresholding and generation live in one framework-agnostic module, so the same logic can be tested without any audio.

## Demo

Recorded sessions with the assistant, one per language. Sound on.

**Hindi**

<video controls preload="metadata" playsinline src="/projects/scheme-demo-hindi.mp4" aria-label="Scheme Sahayak demo session in Hindi"></video>

**Malayalam**

<video controls preload="metadata" playsinline src="/projects/scheme-demo-malayalam.mp4" aria-label="Scheme Sahayak demo session in Malayalam"></video>

## Calibrating the gate

The threshold is not a guess. I ran genuine scheme questions and unrelated questions through retrieval and looked at where the scores landed:

| Query type | Similarity score |
| --- | --- |
| Genuine scheme questions | 0.40 to 0.50 |
| Unrelated questions | 0.27 to 0.37 |

The two groups do not overlap, so the gate sits at **0.38**, in the gap between them.

## Latency

Measured on Windows without a GPU, across Hindi sessions:

| Stage | Time |
| --- | --- |
| Speech to text, time to first byte | 0.39 to 0.53 s |
| Retrieval | under 0.1 s |
| Text to speech, time to first byte | 0.24 to 0.39 s |
| End to end, median | about 1.0 to 1.5 s |

## What broke along the way

Real-time audio fails in ways a text chatbot never does. The README documents four bugs with their root causes:

- **Transcript contamination across turns.** Buffered text from one turn leaked into the next question.
- **A self-echo feedback loop.** The assistant heard its own speech through the microphone and answered itself.
- **Per-field translation fallbacks** on myscheme.gov.in, where some fields arrive translated and others do not.
- **Empty LLM responses** that had to be caught before they reached the speech stage.

## Limitations

- No acoustic echo cancellation, so it needs a headset. The transcript filter is a workaround, not a fix.
- 41 schemes is a small slice of what exists, so many real questions correctly hit the "not certain" path.
- Local only. It is not deployed publicly.
