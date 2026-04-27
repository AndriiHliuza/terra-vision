# 🌍 Terra Vision 
Terra Vision is a microservices-based Geographic Information System (GIS) designed to enhance humanitarian demining efforts. By integrating Computer Vision (YOLO) with thermal imagery. 

<h3 align="center">
  <font color="#8b3333">⚠️ WARNING: DATA ACCURACY ⚠️</font>
</h3>

<p align="center">
  <font color="#8b3333">
    The gis data in this system is for research purposes only.<br>
    It may contain inaccuracies and should not be used as a primary safety tool.
  </font>
</p>

> **Project Status: Preview**
> This project is currently in a **preview state** and is still actively under development. Both the system architecture and the underlying AI detection models are subject to ongoing improvements and optimization to increase reliability and performance.

> **Model Weights**
> The trained YOLO weight files (`.pt`) are not included in this repository. If you want to test the project locally, model weight must be provided externally to the `terra-vision-ai` service to enable detection functionality.


<h3 align="center">🌍 PROJECT OVERVIEW</h3>

## 🌟 Key Features

* **Thermal AI Detection:** Uses **YOLOv11** architectures trained on the thermal imagery dataset, enabling the detection of explosive objects.
* **Scalable Microservices:** A distributed architecture built on **Spring Boot** and **FastAPI**, ensuring high availability and modularity.
* **GIS Integration:** Seamlessly interacts with **IMSMA**, visualizing hazard data through an interactive **Leaflet** interface.
* **Security:** Uses JWT based security implemented using **Spring Security** API together with **Spring Gateway ** for robust authentication and authorization.



## 🛠️ Technical Stack

### Backend & Infrastructure
- **Java (Spring Boot, Spring WebFlux, Spring Cloud Gatewat):** Core business logic and microservice management.
- **Python (FastAPI):** For computer vision tasks.
- **Security:** HashiCorp Vault, Spring Security, JWT, CSRF Token.
- **Caching:** Redis.
- **Containerization:** Docker & Docker Compose.

### Frontend
- **React & TypeScript:** Modern, type-safe user interface.
- **Leaflet:** Specialized map visualization and GeoJSON handling.

### AI & Research
- **Object Detection:** YOLOv11 + MGT dataset.



## 🏗️ Architecture Overview

Terra Vision is structured into several specialized services:
1.  **Auth-Service:** Centralized identity management.
2.  **Gateway-Service:** Unified entry point using Spring Cloud Gateway + Spring Security configurations.
3.  **AI-Service:** Python-based module for YOLO model inference and image processing.
4.  **GIS-Service:** Handles spatial data persistence and external API integration (IMSMA/ArcGIS).



## 🎓 Research Context

This project serves as the practical implementation of a research thesis: *Hliuza, Andrii; Gordienko, Yuri; Polukhin, Andrii; Leier, Mairo; Jervan, Gert; Stirenko, Sergii (2025). Adaptive Infrared Landmine Detection: From Compact Models to Deployment Strategies. figshare. Conference contribution. https://doi.org/10.6084/m9.figshare.30339064.v1"*



## 📂 Project Structure
1. **📂deployment:** Contains docker-compose, .env files and scripts
2. **📂docs:** Project documentation
3. **📂src:** Source code of microservices (ai, auth, gateway, gis, ui)



## 📂 Demo

<p align="center">
  <strong>Home Page</strong><br>
  <img src="docs/images/home-page.png" alt="Home Page" width="900">
</p>

<p align="center">
  <strong>Profile Page</strong><br>
  <img src="docs/images/profile-page.png" alt="Profile Page" width="900">
</p>

<br>

### 🔐 Access Control

<p align="center">
  <strong>Login</strong><br>
  <img src="docs/images/login-page.png" alt="Login Page" width="900">
</p>

<p align="center">
  <strong>Registration</strong><br>
  <img src="docs/images/registration-page.png" alt="Registration Page" width="900">
</p>

<br>

### 🗺️ GIS & Mapping

<p align="center">
  <strong>Global Map View</strong><br>
  <img src="docs/images/map-page.png" alt="Map Page" width="900">
</p>

<p align="center">
  <strong>Layer Management</strong><br>
  <img src="docs/images/map-layers.png" alt="Map Layers" width="900">
</p>

<p align="center">
  <strong>Zone View</strong><br>
  <img src="docs/images/map-zone.png" alt="Map Zone" width="900">
</p>

<p align="center">
  <strong>Map Editor</strong><br>
  <img src="docs/images/map-editor-page.png" alt="Map Editor" width="900">
</p>

<br>

### 🔍 AI Detection (YOLO)

<p align="center">
  <strong>Detection Interface - 1</strong><br>
  <img src="docs/images/detector-page-1.png" alt="Detector 1" width="900">
</p>

<p align="center">
  <strong>Detection Interface - 2</strong><br>
  <img src="docs/images/detector-page-2.png" alt="Detector 2" width="900">
</p>

<p align="center">
  <strong>Detection Interface - 3</strong><br>
  <img src="docs/images/detector-page-3.png" alt="Detector 3" width="900">
</p>

<p align="center">
  <strong>Statistics & Analytics</strong><br>
  <img src="docs/images/stats-page.png" alt="Stats Page" width="900">
</p>

