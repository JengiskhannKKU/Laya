# Laya - AI-Powered Fashion Tailoring Platform

Laya is an innovative, cutting-edge web application that brings the bespoke tailoring experience into the digital age. By deeply integrating Artificial Intelligence (via the KKU LLM API) into the fashion design workflow, Laya empowers users to conceptualize, visualize, and virtually try on custom-made clothing before ever placing a physical order. 

Designed with a premium, mobile-first aesthetic, Laya bridges the gap between traditional tailoring and modern e-commerce.

---

## 🌟 Core Features

Laya is built around three primary interactive pillars that guide the user from imagination to visualization:

### 1. Smart Pattern & Shape Recommendation
Instead of browsing through static catalogs, users start their journey by selecting their **Occasion** (e.g., Wedding, Casual, Work), **Gender/Type** (Men, Women, Unisex), and **Preferences** (Fitted, Straight, Loose). 
- The system uses these inputs to generate a base 2D mockup dynamically.
- Users can tweak granular details such as collar styles (Round, V-neck, Chinese collar, Square) and sleeve types.
- The UI instantly reflects these changes, providing a clear visual representation of the foundational garment shape.

### 2. Custom Fabric Integration
The soul of custom tailoring is the fabric. Laya allows users to bypass generic material options.
- **Upload Own Fabric:** Users can capture or upload an image of any fabric pattern they love.
- **Client-Side Compression:** High-resolution fabric images are automatically optimized and compressed within the browser before being converted to Base64, ensuring fast uploads and a smooth user experience.
- The AI engine then processes this fabric and seamlessly applies its texture, pattern, and color physics onto the user's previously selected clothing shape.

### 3. Virtual Try-On (ลองใส่เสมือนจริง)
The ultimate confidence booster for custom clothing. Once a dress shape and fabric are combined:
- Users can upload a full-body photograph of themselves.
- The AI deeply analyzes the posture and lighting of the user's photo.
- It then overlays the fully-designed, fabric-applied custom garment directly onto the user's body.
- Users can adjust the **Blend Level** and **Opacity** of the overlay to see exactly how the garment falls, drapes, and fits them in real life.

---

## 🛠️ Technology Stack

This project is structured as a robust **Monorepo**, separating the client-side experience from the heavy AI processing backend.

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI & Styling:** Material-UI (MUI), Tailwind CSS, Lucide React Icons
- **Animations:** Framer Motion for buttery smooth, app-like page transitions and micro-interactions.
- **Language:** TypeScript
- **State Management & Routing:** Next.js Hooks (`useRouter`, `useSearchParams` wrapped in `<Suspense>` for safe SSR/SSG).

### Backend
- **Framework:** Node.js with Express.js
- **AI Integration:** KKU LLM API (Gemini-2.5-Flash-Lite architecture) handling complex JSON generation and heavy Base64 image payload processing (up to 50MB payload limits configured).
- **Language:** TypeScript
- **Architecture:** Controller-Route pattern for clean scalability.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JengiskhannKKU/Laya.git
   cd Laya
   ```

2. **Install all dependencies**
   Run the following command from the root directory to automatically install dependencies for both the frontend and backend workspaces:
   ```bash
   npm run install:all
   ```

3. **Environment Variables**
   - Create a `.env` file in the `backend` directory and add your KKU LLM API keys and port settings.
   - Create a `.env.local` file in the `frontend` directory if you have frontend-specific variables.

### Running the Development Server

You can start both the frontend and backend servers simultaneously from the root directory using a single command:

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000 (or 5000 depending on your environment config)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
