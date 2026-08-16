# Kinematic Insight

Build a polished, modern frontend-only web application called “ALS-NET” for my university research project on AI-assisted Amyotrophic Lateral Sclerosis (ALS) assessment.

IMPORTANT:

Build ONLY the frontend.

Do NOT build a backend.

Do NOT build a database.

Do NOT implement real ALS diagnosis or medical prediction.

Use realistic mock/demo data for the results.

However, the webcam and microphone must actually work in the browser.

The code should be structured so a real Python/PyTorch backend can be connected later.

Clearly label simulated results as Demo / Mock Result and state that the system is not a medical diagnostic tool.

The frontend should visually and functionally represent the workflow described in my ALS-NET research paper: webcam/microphone input → facial landmark extraction → normalization → clinical task → model analysis → assessment results.

TECH STACK

Use:

React

Vite

TypeScript or JavaScript

Tailwind CSS

Lucide icons

Recharts for graphs

Browser MediaDevices API

MediaRecorder API

Web Audio API

A browser-compatible facial landmark solution such as MediaPipe Face Mesh if practical

Keep the code clean and component-based.

1. LANDING PAGE

Create a professional medical-AI/research style landing page.

Title:

ALS-NET

Subtitle:

AI-Assisted Oro-Facial Motor Assessment

Description:

“An experimental privacy-preserving framework for analyzing facial kinematics and speech-related motor patterns in neurological disorders.”

Show a visual workflow:

Webcam + Microphone
↓
Facial Landmark Extraction
↓
68-Point Facial Kinematics
↓
Bounding-Box Normalization
↓
Clinical Task Analysis
↓
ALS-NET Architecture
↓
Assessment Results

Add three feature cards:

Privacy-Preserving

Uses compact facial landmark representations rather than relying on raw facial imagery for the proposed analysis pipeline.

Task-Specific AI

Different neural architectures are associated with different clinical motion characteristics.

Interpretable Analysis

Temporal attention and facial movement visualizations help demonstrate which movement patterns contribute to the assessment.

Primary button:

Start Assessment

Secondary button:

Explore ALS-NET

Add a clear disclaimer:

Research Prototype — This application is for demonstration and research purposes only and does not provide a medical diagnosis.

2. CAMERA & MICROPHONE CHECK

When the user clicks Start Assessment, open a setup page.

LEFT SIDE:

Large live webcam preview.

Show an overlay around the face.

If possible, display live facial landmarks over the face.

RIGHT SIDE:

System Check

Camera

Connected / Not detected

Microphone

Connected / Not detected

Face

Detected / Not detected

Face Position

Centered / Reposition required

Lighting

Good / Improve lighting

Show green check icons when available.

Include buttons:

Enable Camera
Enable Microphone
Continue

The browser must actually request camera and microphone permissions.

If permission is denied, display a friendly error message.

3. LIVE FACIAL LANDMARK VIEW

Create a polished visualization showing the detected facial landmarks.

Display approximately 68 facial landmark points.

Visualize the major facial regions:

Jaw

Mouth

Nose

Eyes

Eyebrows

Add controls:

Live
Pause
Show Trajectory

When the user moves their face, the visualization should update if the chosen browser landmark library supports it.

Also show:

Landmark Representation
68 points × 2 coordinates

Normalized Coordinate Space
[0,1]

Do not claim that the browser is performing ALS detection.

This is only the frontend visualization layer.

4. CLINICAL TASK SELECTION

Create a clean task-selection page based on the ALS-NET research framework.

Divide tasks into two categories.

NON-SPEECH TASKS

NSM_BIGSMILE

Instruction:
“Smile as widely as possible and hold the position.”

Purpose:
“Evaluates bilateral facial symmetry and range of motion.”

Model shown:
Siamese Network

NSM_SPREAD

Instruction:
“Spread your lips laterally as far as comfortably possible.”

Purpose:
“Evaluates facial movement and symmetry.”

NSM_BLOW

Instruction:
“Perform the instructed blowing movement.”

Purpose:
“Evaluates coordinated lip movement.”

Model shown:
ST-GCN

NSM_KISS

Instruction:
“Pucker your lips as if giving a kiss.”

Purpose:
“Evaluates lip movement and coordination.”

SPEECH TASKS

DDK_PA

Instruction:
“Repeat PA as quickly and clearly as possible.”

DDK_PATAKA

Instruction:
“Repeat PA-TA-KA as quickly and clearly as possible.”

Purpose:
“Evaluates rapid articulatory coordination and temporal movement patterns.”

Model shown:
Bi-GRU + Temporal Attention

BBP_NORMAL

Instruction:
“Repeat: Buy Bobby a Puppy.”

Purpose:
“Evaluates coordinated multi-articulator movement.”

Each task should have:

Task name

Category

Instruction

Purpose

Associated ALS-NET architecture

Start button

Allow the user to select one task for the demonstration.

5. ASSESSMENT / RECORDING PAGE

Create the main assessment interface.

TOP:

Assessment — DDK_PATAKA

Progress:
Task 1 of 1

CENTER:

Large live webcam.

Show facial landmarks over the video.

RIGHT PANEL:

Current Task

DDK_PATAKA

“Repeat PA-TA-KA as quickly and clearly as possible.”

Below it:

Microphone

Display a REAL-TIME audio waveform using the Web Audio API.

Below:

Recording

Timer:
00:00

Buttons:

Start Recording
Stop
Retake

When recording:

Show:

🔴 Recording

Actually capture the webcam and microphone stream using MediaRecorder.

The recorded data does not need to be sent anywhere.

After stopping, show:

Recording Complete

Buttons:

Analyze Demo
Retake

6. PROCESSING SCREEN

After clicking Analyze Demo, show a visually impressive processing animation.

Title:

ALS-NET Analysis

Show the following pipeline sequentially:

Video Input

Facial Landmark Extraction

Bounding-Box Normalization

20-Frame Sequence Construction

Task Identification

Architecture Selection

Kinematic Analysis

Assessment Complete

Show:

Input Representation

(20, 68, 2)

Then display:

Selected Architecture

For NSM_BIGSMILE:
Siamese Network — Spatial Symmetry Prior

For DDK_PATAKA:
Bi-GRU + Temporal Self-Attention — Temporal/Apex Prior

For NSM_BLOW:
ST-GCN — Coordinated Movement Prior

Use a 3–5 second simulated processing animation.

IMPORTANT:
This is only a frontend demonstration. Do not pretend that a real ML model is running.

7. RESULTS DASHBOARD

Create a professional research/clinical-style results dashboard.

Header:

ALS-NET Assessment Results

Status:

Demo Analysis Complete

Clearly display:

⚠️ SIMULATED DEMO RESULT
“This result is generated using demonstration data. It is not a medical diagnosis.”

Show cards:

Assessment Indicator

Demo / Simulated

Sensitivity

88.9%

Specificity

86.4%

F1 Score

87.5%

AUC-ROC

0.910

Use these only as demonstration values based on the research paper's reported results.

Do not imply these are results for the current webcam user.

8. TASK-SPECIFIC RESULT

If DDK_PATAKA is selected:

Show:

Bi-GRU + Temporal Attention

Demo AUC:

0.941

Create a line/area chart:

Temporal Attention

X-axis:
Frame 1 → Frame 20

Y-axis:
Attention Weight

Generate realistic mock attention values.

Highlight several “apex frames”.

When hovering over a point:

Frame 14
Attention Weight: 0.87

Add explanation:

“Attention peaks represent temporal regions receiving greater weight in the demonstration visualization. They should not be interpreted as direct evidence of ALS.”

If NSM_BIGSMILE is selected:

Show:

Siamese Network

Demo AUC:

0.925

Create a facial symmetry visualization comparing:

Left Facial Region
vs.
Right Facial Region

Show a mock:

Symmetry Difference

If NSM_BLOW is selected:

Show:

ST-GCN

Demo AUC:

0.905

Show a graph representation of facial landmarks with connections between neighboring points.

9. FACIAL MOVEMENT ANALYSIS

Create a section:

Facial Kinematic Analysis

Display the 68-point facial landmark visualization.

Include:

Current frame

Frame slider from 1–20

Play

Pause

Reset

Show a small information panel:

Sequence Length: 20 frames

Landmarks: 68

Coordinates: 2D

Normalization: Bounding-box normalized

Representation: (20, 68, 2)

Again, this is a visualization only.

10. ALS-NET ARCHITECTURE SECTION

Create a beautiful architecture comparison section.

Three cards:

Siamese Network

Spatial Symmetry Prior

Best suited for:
NSM_BIGSMILE

Visual:

Left Face
→ Shared Encoder

Right Face
→ Shared Encoder

→ Latent Distance

→ Classification

Bi-GRU + Attention

Temporal/Apex Prior

Best suited for:
DDK_PATAKA

Visual:

Frame 1 → Frame 2 → ... → Frame 20

→ Bi-GRU

→ Temporal Attention

→ Apex Frames

ST-GCN

Coordinated Movement Prior

Best suited for:
NSM_BLOW

Visual:

Facial landmark nodes
+
spatial connections
+
temporal sequence

→ ST-GCN

11. PRIVACY SECTION

Create a dedicated privacy card.

Title:

Privacy-Preserving Design

Explain:

“The proposed ALS-NET framework is based on compact facial landmark trajectories rather than direct RGB pixel representations.”

Show:

Camera
→ Landmark Representation
→ Kinematic Data

Add:

No backend
No database
No cloud upload

For this frontend prototype, recordings should remain within the browser session unless the user explicitly downloads them.

12. SESSION SUMMARY

At the end show:

Assessment Summary

Task:
DDK_PATAKA

Input:
Webcam + Microphone

Representation:
68-point facial landmarks

Sequence:
20 frames

Architecture:
Bi-GRU + Temporal Attention

Result:
Demo / Simulated

Buttons:

Run Another Task

View Architecture

Generate Demo Report

DESIGN

The website should look like a serious medical research application.

Use:

White/light background

Navy/dark blue primary color

Subtle blue gradients

Clean cards

Rounded corners

Professional typography

Minimal shadows

Modern charts

Clean icons

Smooth but subtle animations

Do NOT make it look like:

a gaming website

a crypto dashboard

a generic AI landing page

an overly futuristic neon interface

Make it look appropriate for presenting to a university professor/research supervisor.

Make the desktop experience excellent because the website will primarily be demonstrated on a laptop.

Make it responsive as well.

IMPORTANT IMPLEMENTATION RULES

Webcam MUST actually work.

Microphone MUST actually work.

Audio waveform MUST react to microphone input.

Facial landmark visualization should work in the browser if possible.

Recording buttons should actually record using MediaRecorder.

Do not implement a real ALS classifier.

Do not create a backend.

Do not create a database.

Do not upload recordings anywhere.

Use mock data for model results.

Clearly label all model results as DEMO/SIMULATED.

Keep the code modular so a Python/PyTorch API can be added later.

Do not make medical claims such as “ALS detected” or “You have ALS.”

The website should be fully functional as a frontend demonstration from start to finish.

FINAL USER FLOW

The complete demo should work like this:

Landing Page
→ Start Assessment
→ Camera/Microphone Check
→ Live Face + Audio
→ Select Clinical Task
→ Follow Task Instructions
→ Record Webcam + Audio
→ Simulated ALS-NET Processing
→ Results Dashboard
→ Facial Kinematic Visualization
→ Temporal Attention / Symmetry / ST-GCN Visualization
→ Session Summary

Build the actual working frontend now. Do not stop at static UI mockups.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://als-face-insight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/640bbef3-a575-4a0b-9d54-db17db99e2ff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
