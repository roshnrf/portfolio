---
title: PIRS
tagline: Anomaly detection · RL
summary: A 9-layer pipeline that scores insider-threat risk from behavioural drift and forecasts it seven days ahead. Validated on two datasets, the second without retraining.
year: "2026"
order: 3
status: B.Tech capstone project at VIT Chennai.
tags: [TensorFlow, scikit-learn, Isolation Forest, LSTM autoencoder, One-Class SVM, Q-learning, Streamlit, Python]
metrics:
  - value: "0.8973"
    label: ROC-AUC on CERT r6.2
  - value: "0.7429"
    label: ROC-AUC on LANL, no retraining
  - value: 3 of 5
    label: insiders ranked in the top 5% of risk
  - value: 4,000
    label: users over 515 days
repo: https://github.com/roshnrf/PIRS
demo: https://pirs-v2.streamlit.app/
---

## The problem

Most security tooling raises an alert after data has already left the building. Insider threats are harder still: the person has legitimate access, so no single action looks wrong. What changes is behaviour over time. PIRS (Predictive Insider Risk and Stabilization System) tries to catch that drift early enough to respond before an incident.

## How it works

![PIRS 9-layer architecture](/projects/pirs-architecture.jpg)

The pipeline has nine layers in three groups.

**Early warning (layers 1 to 4).** Ingest activity logs, build a per-user behavioural baseline, score anomalies, and forecast how each user's drift will develop over the next seven days.

**Personalised response (layers 5 to 7).** Profile each user against OCEAN personality archetypes, combine everything into a risk score, and choose an intervention level.

**Learning and measurement (layers 8 and 9).** A Q-learning agent tunes which intervention suits which profile, and a metrics layer reports the outcome.

Anomaly scoring is an ensemble of three detectors with fixed weights:

| Detector | Weight |
| --- | --- |
| Isolation Forest | 0.50 |
| LSTM autoencoder | 0.35 |
| One-Class SVM | 0.15 |

## Results

![ROC curve on CERT r6.2](/projects/pirs-roc.png)

**CERT r6.2** (simulated enterprise, 4,000 users, 515 days): ROC-AUC 0.8973, with 3.6% of the population flagged. Three of the five labelled insiders ranked in the top 5% of risk.

**LANL** (real authentication logs, 12,416 users): ROC-AUC 0.7429 with no retraining and no architectural change. 20 of 97 red-team accounts landed in the top 5%.

![Risk trajectories for flagged users](/projects/pirs-trajectories.png)

The [live dashboard](https://pirs-v2.streamlit.app/) shows risk trajectories, archetypes and interventions across all 4,000 users.

## Limitations

- **Five positive labels.** CERT r6.2 contains five insiders among 4,000 users. Any metric built on five cases has wide error bars.
- **Synthetic data.** CERT is simulated. The LANL result is the more honest test, and it is lower.
- **Single-day attacks are missed.** The two insiders PIRS did not rank highly acted within a single day. A drift-based method has nothing to measure there.
- **The prevention metrics are my own.** Measures such as the early-prevention rate come from a simulation with assumed parameters. They describe a modelled outcome, not a measured one, so the headline here is ROC-AUC.

## What I learned

Feature engineering mattered more than model choice. The gains came from better behavioural features; the ensemble added robustness on top. I wrote up the first version in [How I Built a 9-Layer Insider Threat Detection Pipeline](/writing/insider-threat-detection).
