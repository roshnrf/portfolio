---
title: How I Built a 9-Layer Insider Threat Detection Pipeline
date: "2026-03-01"
summary: Breaking down PIRS, from raw CERT r6.2 data to a Q-learning intervention engine processing 1.3M records.
readingTime: 8 min read
---

> This post describes the first version of PIRS, and its numbers are from that version. The current version reports a ROC-AUC of 0.8973 on CERT r6.2. See the [project page](/projects/pirs) for up-to-date results.

Insider threats are one of the hardest problems in cybersecurity. Unlike external attacks, insiders have legitimate access. They know the systems, the data, and the blind spots. The question isn't whether to monitor, but how to detect subtle behavioural shifts before they become incidents.

This post walks through the architecture of PIRS (Predictive Insider Risk & Stabilization System), a 9-stage pipeline that processes 1.3M user-day records to detect threats 3 to 14 days before attack.

## The Dataset

I used the CERT r6.2 dataset, a synthetic but realistic insider threat dataset modelling 4,000 employees over 515 days. It includes logon/logoff events, file access, email activity, HTTP traffic, and psychometric profiles. The challenge: only 5 confirmed insider threats in the entire dataset. That's a needle-in-a-haystack class imbalance problem.

## Pipeline Architecture

The system is built as 9 sequential stages, each feeding into the next. This modular design means I can swap out any layer, replace the anomaly detector or change the feature set, without touching the rest of the pipeline.

```
Stage 1: Data ingestion & cleaning
Stage 2: Temporal alignment (user-day records)
Stage 3: Feature engineering (behavioural features)
Stage 4: Baseline profiling (per-user normal behaviour)
Stage 5: Drift detection (deviation from baseline)
Stage 6: Anomaly scoring (Isolation Forest)
Stage 7: Sequence modelling (LSTM Autoencoder)
Stage 8: Ensemble classification (One-Class SVM)
Stage 9: Intervention matching (Q-Learning)
```

The first 5 stages handle data transformation. Stages 6 to 8 are the detection ensemble. Stage 9 is the most unusual: a reinforcement learning module that maps detected risk to personalised interventions based on the employee's psychometric profile.

## Results

The pipeline achieved a ROC-AUC of 0.8554 on CERT r6.2, detecting 3 of 5 real threats 3 to 14 days before the actual attack event. When validated on the LANL dataset (12,416 users, 69GB of auth logs), it achieved 0.7429 ROC-AUC without any architectural changes, demonstrating portability.

## What I Learned

The biggest lesson: feature engineering matters more than model choice. My best model improvements came from crafting better behavioural features, not from swapping one model for another. The model ensemble helped with robustness, but the features did the heavy lifting.

If you want to dig into the code, it's all on [GitHub](https://github.com/roshnrf/PIRS).
