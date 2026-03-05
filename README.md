# Sq2Cube_AI — Single Image to 3D Generation Engine

## 🎯 Project Objective

Sq2Cube_AI is an AI-powered system that converts a single 2D image of an object into a 3D mesh model using pretrained generative 3D models and intelligent preprocessing.

Unlike classical multi-view reconstruction systems, this model leverages pretrained 3D priors to infer unseen geometry and generate a complete 3D representation from a single image.

The goal is to build a modular, GPU-enabled 2D-to-3D pipeline deployable via Google Colab and managed through a structured GitHub workflow.

---

## 🚀 Core Idea

When the system sees an object (e.g., a mug from the front), it does NOT reconstruct geometry using multiple views.

Instead, it:

1. Encodes the image
2. Uses a pretrained 3D generative backbone
3. Predicts missing geometry
4. Generates a full 3D mesh

This is **generative 3D modeling**, not classical reconstruction.

---

## 🧠 System Pipeline

User Image  
↓  
Image Quality Validation (optional)  
↓  
Preprocessing  
- Resize  
- Denoise  
- Contrast Normalization  
↓  
Optional Background Removal  
↓  
Pretrained Single-Image 3D Generator  
↓  
Implicit 3D Representation  
↓  
Mesh Extraction  
↓  
Mesh Post-processing  
- Smoothing  
- Cleaning  
- Decimation  
↓  
Confidence Score Estimation  
↓  
Export Optimized 3D Asset (.obj / .ply)

---

## 🛠 Technical Stack

### Core Framework
- Python
- PyTorch

### 3D Generation Backbone (Pretrained)
Inspired by:
- Shap-E
- TripoSR
- DreamFusion concept

(Using pretrained weights, not training from scratch)

### Image Processing
- OpenCV
- scikit-image
- NumPy

### 3D Processing
- Open3D

### Development Environment
- Google Colab (GPU runtime)

### Version Control
- GitHub
- Modular architecture

---

## 📁 Project Structure

sq2cube_AI/
├── models/
├── notebooks/
├── results/
├── src/
│   └── preprocessing/
│       ├── background_removal.py
│       ├── contrast.py
│       ├── denoise.py
│       ├── image_utils.py
│       └── resize.py
├── requirements.txt
└── README.md

---

## 🔬 Key Features

✔ Single image 3D inference  
✔ Implicit 3D representation  
✔ Mesh optimization pipeline  
✔ Modular preprocessing architecture  
✔ Colab GPU compatible  

---

## 📌 Future Scope

- Web deployment (Streamlit / HuggingFace Spaces)
- Multi-object support
- Real-time inference
- AR/VR integration
