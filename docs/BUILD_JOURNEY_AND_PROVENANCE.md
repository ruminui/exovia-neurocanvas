# Exovia NeuroCanvas — Build journey and public provenance

Reviewed on 2026-07-21.

This document records how Exovia NeuroCanvas was conceived, iterated and prepared for OpenAI Build Week. It is intended to help judges understand the human-AI collaboration, the product decisions, and the boundary between implemented work and roadmap ideas.

## Public build conversation

The project development conversation shared by the creator is available here:

- https://chatgpt.com/share/6a5cddb2-6080-83e9-82b7-b4b5940dc1a8

This shared conversation is supplied as supporting provenance. The repository history remains the authoritative technical record of what was actually committed.

## Product origin

The starting idea was to store and navigate information visually rather than leaving knowledge trapped in a linear chat or a collection of disconnected documents. The concept evolved into a visual knowledge workspace where users can:

- import or create information;
- organize it as connected nodes;
- ask questions over the active workspace;
- navigate from an answer back to its evidence;
- inspect quality and contradiction signals;
- replay important human or agent actions;
- preserve local work through saving, recovery and export.

The central design principle became:

> Navigate knowledge. Verify every answer. Replay every decision.

## Steps followed

### 1. Define the real problem

We identified recurring failures in current AI workflows: context is fragmented, sources are hard to inspect, decisions are difficult to audit, and users cannot easily recover the path that produced an answer.

### 2. Turn the idea into a usable product flow

The app was organized around a judge-friendly and user-friendly sequence:

1. create or open a workspace;
2. import or add information;
3. explore the visual map;
4. ask a question;
5. navigate to the strongest answer;
6. inspect exact evidence;
7. review knowledge health and contradictions;
8. replay actions and decisions;
9. save, recover or export the project.

### 3. Build an offline-first visual application

The repository contains the local visual product, persistent workspaces, import/export, evidence inspection, Answer & Audit, quality signals, replay features, accessibility work and a governed Living Evidence Room vertical slice.

### 4. Separate implemented capabilities from roadmap claims

Real-time multiuser synchronization, external workflow providers, shared remote browsers and live media transport are not presented as completed production integrations. They remain explicitly labeled as roadmap work until deployed and tested.

### 5. Make the product understandable on first use

The mobile and desktop experience was improved with:

- simple mode;
- contextual floating explanations;
- larger mobile touch targets;
- purpose/use-case onboarding;
- Spanish-first presentation with English support;
- clearer Android navigation;
- recovery and privacy explanations.

### 6. Prepare Android distribution

Capacitor packaging and a GitHub Actions workflow were added to produce an Android test APK and publish it through a stable release link. The download must still be verified from a real completed workflow release before being described as available.

### 7. Create a public product website

A Wix site was generated for judges and users:

- https://exovia.wixsite.com/exovia-neurocanvas-1

It explains the problem, solution, workflow, capabilities, use cases, privacy model, Android availability and frequently asked questions.

### 8. Prepare the competition submission

The submission package includes:

- a public repository;
- a public product website;
- a recorded demonstration video;
- a concise judge flow;
- an accuracy and compliance checklist;
- transparent status statements;
- this public build provenance link.

A Devpost confirmation screen supplied by the creator states that the project was submitted and remains editable until the hackathon deadline.

## Human and AI roles

The creator supplied the product vision, priorities, testing feedback, video demonstration, submission decisions and final approval. ChatGPT assisted with product structuring, code and documentation changes, mobile usability, Android packaging configuration, website generation, audit checklists and submission preparation.

The collaboration is documented through the shared conversation and the Git commit history. Neither source should be treated as proof that a feature passed runtime testing unless corresponding execution evidence exists.

## Selected implementation milestones

Representative repository milestones include:

- mobile interface and Android usability improvements;
- contextual help assets and tests;
- resilience, recovery and large-input safeguards;
- solo-operator completion tooling and runbook;
- Android Capacitor configuration and build workflow;
- official website and competition compliance documentation.

For exact changes, dates and authorship, inspect the repository commit history.

## Evidence hierarchy

Judges and reviewers should use this order when verifying claims:

1. running application and demo video;
2. source code and tests in this repository;
3. Git commit history and workflow results;
4. official website;
5. public build conversation as supporting provenance.

## Honest status

The visual product, mobile interface, official website and governed local Live Room vertical slice are implemented in the repository. Android packaging and automated release are configured, but the actual APK availability depends on a successful workflow and downloadable release asset. No test or integration should be considered verified without execution evidence.