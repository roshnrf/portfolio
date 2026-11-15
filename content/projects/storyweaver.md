---
title: StoryWeaver
tagline: Speech · LLM application
summary: A speech-practice app for children aged 4 to 6. The child describes a picture, the app finds the words they struggle with, then writes a short story to practise them.
year: "2025"
order: 4
status: Pilot with two children. The results are a feasibility check, not evidence of effectiveness.
tags: [Whisper, Gemini 2.5 Flash, Streamlit, gTTS, librosa, Python]
metrics:
  - value: 88.2%
    label: transcription accuracy in a quiet room
  - value: 72% → 87%
    label: practice accuracy, session 1 to 6
  - value: 100%
    label: session completion in the pilot
  - value: 10.5 min
    label: average session length
repo: https://github.com/roshnrf/StoryWeaver
---

## The problem

Pronunciation practice works through repetition, and four-year-olds do not repeat word lists willingly. StoryWeaver wraps the repetition in something a child wants to do: talk about a picture, then read a story written for them.

## How it works

![StoryWeaver architecture](/projects/storyweaver-architecture.png)

1. **Describe.** The child sees a picture and describes it aloud.
2. **Transcribe.** Whisper (base model) converts the recording to text.
3. **Analyse.** Gemini 2.5 Flash flags grammar, vocabulary and articulation errors in the transcript.
4. **Generate.** Gemini writes a short practice story built around the words the child found difficult.
5. **Practise.** The child reads the story line by line. Each line has a model pronunciation (gTTS) and a similarity score, and the child moves on at 80% or higher.

The app is built in Streamlit and stores progress locally. The repository includes an ethics note and a policy for handling children's data.

## Pilot results

Two children, aged 4 and 6, used it for one week, six sessions each.

| Measure | Result |
| --- | --- |
| Transcription accuracy (quiet room) | 88.2% |
| Articulation error detection | 91% |
| Grammar error detection | 88% |
| Vocabulary error detection | 85% |
| Practice accuracy, session 1 to session 6 | 72% to 87% |
| Sessions completed | 100% |

Detection rates were checked against manual review of the same recordings.

## Limitations

- **Two children is not a study.** These numbers show the app runs and children finish sessions. They do not show that it improves speech.
- **Error detection reads the transcript, not the audio.** If Whisper silently corrects a mispronounced word, the error is invisible to everything downstream.
- Transcription accuracy was measured in a quiet room only.

## What came next

That second limitation is why I built [ArticuPlay](/projects/articuplay). It replaces the transcript-level check with a fine-tuned model and phoneme-level alignment, so it can say which sound went wrong.
