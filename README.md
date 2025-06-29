# 🧠 Prepnosis

<div align="center">
  <img src="https://prepnosis.vercel.app/logo.png" alt="Prepnosis Logo" height="80"/>
  
  <h3>🎯 The Ultimate NEET-PG & INICET Preparation Platform</h3>
  
  <p>An open-source, fully interactive web platform designed for medical aspirants to practice high-yield MCQs, track progress, and compete with peers in a realistic exam environment.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js"/>
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase"/>
    <img src="https://img.shields.io/badge/ShadCN-UI-000000?style=flat-square&logo=shadcnui" alt="ShadCN UI"/>
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
    <img src="https://img.shields.io/badge/Open%20Source-❤️-red?style=flat-square" alt="Open Source"/>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 🌟 Why Prepnosis?

> **"Success in NEET-PG isn't just about knowing the answers—it's about practicing under pressure, analyzing your weaknesses, and continuously improving."**

Prepnosis transforms the traditional approach to medical exam preparation by providing:

- 🎯 **Realistic Exam Environment** - Timed tests that mirror actual NEET-PG/INICET conditions
- 📊 **Advanced Analytics** - Deep insights into your performance patterns
- 🏆 **Competitive Learning** - Leaderboards and peer comparison
- 🧠 **Smart Retention** - Bookmarks, notes, and spaced repetition
- 📱 **Responsive Design** - Practice anywhere, anytime

---

## ✨ Features

### 📝 **Comprehensive Test Types**

| Test Type | Description | Key Benefits |
|-----------|-------------|--------------|
| **🌍 Public Grand Tests** | Full-syllabus, time-bound tests open to all users | Live leaderboards, realistic exam pressure |
| **📚 Subject Tests** | Focused practice on individual subjects | Targeted improvement, subject mastery |
| **🎨 Custom Tests** | User-created tests by topic/difficulty | Personalized practice, flexible learning |
| **⚡ Daily Challenges** | Optional timed mini-challenges | Consistent practice habit |

### 📊 **Advanced Analytics & Insights**

<details>
<summary>🔍 Click to explore analytics features</summary>

- **Performance Dashboard**: Visual analytics per subject, topic, and test type
- **Rank & Percentile Tracking**: See your position with movement trends
- **Subject-wise Strength Analysis**: Identify your strong and weak areas
- **Topic-wise Heatmaps**: Visual representation of your performance across topics
- **Time Analysis**: Track your speed and accuracy patterns
- **Progress Trends**: Monitor improvement over time

</details>

### 🎮 **Engagement Features**

- **🏆 Leaderboards**: Public ranking for grand tests and cumulative performance
- **⚔️ Battle Mode**: Real-time 1v1 quiz battles with friends or random users
- **🎯 Achievement System**: Unlock badges and milestones
- **📱 Social Features**: Share progress and compete with study groups

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prepnosis.git
   cd prepnosis
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` 🎉

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) | App Router, SSR, Performance |
| **Database** | ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square&logo=supabase) | Database, Auth, Realtime |
| **UI Components** | ![ShadCN UI](https://img.shields.io/badge/ShadCN-UI-000000?style=flat-square) | Beautiful, accessible components |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css) | Utility-first CSS framework |
| **State Management** | ![Zustand](https://img.shields.io/badge/Zustand-State-FF6B6B?style=flat-square) | Lightweight state management |
| **Data Fetching** | ![TanStack Query](https://img.shields.io/badge/TanStack-Query-FF4154?style=flat-square) | Server state management |
| **Animations** | ![Framer Motion](https://img.shields.io/badge/Framer-Motion-0055FF?style=flat-square) | Smooth animations |

</div>

---

## 📋 Question Dataset & Format

### 📚 **Data Source**

Prepnosis utilizes the comprehensive **MedMCQA dataset** for high-quality medical MCQs:

> **🏥 [MedMCQA Dataset](https://github.com/medmcqa/medmcqa)**  
> *A large-scale, Multiple-Choice Question Answering (MCQA) dataset designed to address real-world medical entrance exam questions.*

**Dataset Highlights:**
- **194k+ High-Quality Questions** covering 2,400+ healthcare topics
- **Aligned with AIIMS & NEET-PG** examination patterns
- **21 Medical Subjects** with detailed explanations
- **Expert-Curated Content** from medical professionals

### 📝 **Question Schema**

Questions in Prepnosis follow the MedMCQA standardized format:

```json
{
  "id": "uuid",
  "question": "Gp2b3A inhibitors are all except -",
  "opa": "Abciximab",
  "opb": "Eptifibatide", 
  "opc": "Tirofiban",
  "opd": "Prasugrel",
  "exp": "Ans. is 'd' i.e., Prasugrel. Prasugrel is a P2Y12 receptor antagonist, not a Gp2b3A inhibitor...",
  "cop": 4,
  "subject_name": "Pharmacology",
  "topic_name": "Antiplatelets and Fibrinolytics",
  "choice_type": "multi"
}
```

### 📊 **Dataset Statistics**

| Metric | Count |
|--------|--------|
| **Total Questions** | 194,000+ |
| **Medical Subjects** | 21 |
| **Healthcare Topics** | 2,400+ |
| **Question Types** | Single/Multiple Choice |
| **Languages** | English |

---

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] Basic test interface
- [x] User authentication
- [x] Question management system
- [x] Basic analytics

### Phase 2: Enhanced Features 🚧
- [ ] Advanced analytics dashboard
- [ ] Leaderboard system
- [ ] Bookmark functionality
- [ ] Performance tracking

### Phase 3: Social Features 🔮
- [ ] Battle Mode (1v1 quiz battles)
- [ ] Study groups
- [ ] Discussion forums
- [ ] Mentor system

### Phase 4: AI Integration 🤖
- [ ] Personalized question recommendations
- [ ] Adaptive difficulty
- [ ] Smart scheduling
- [ ] Performance predictions

---

## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x400/0066cc/ffffff?text=Dashboard+Preview" alt="Dashboard" width="400"/>
  <img src="https://via.placeholder.com/800x400/00cc66/ffffff?text=Test+Interface" alt="Test Interface" width="400"/>
</div>

---

## 🤝 Contributing

We love contributions! Here's how you can help make Prepnosis even better:

### Ways to Contribute

- 🐛 **Report Bugs**: Found an issue? Let us know!
- 💡 **Suggest Features**: Have ideas? We'd love to hear them!
- 📝 **Improve Documentation**: Help make our docs clearer
- 🔧 **Submit Code**: Fix bugs or add features
- 📊 **Add Questions**: Contribute high-quality MCQs

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Acknowledgments

### 📚 **Special Thanks to MedMCQA**

We extend our heartfelt gratitude to the **MedMCQA team** for providing the comprehensive medical question dataset that powers Prepnosis:

> **🏥 [MedMCQA: A Large-scale Multi-Subject Multi-Choice Dataset for Medical domain Question Answering](https://github.com/medmcqa/medmcqa)**

**Citation:**
```bibtex
@article{pal2022medmcqa,
  title={MedMCQA: A Large-scale Multi-Subject Multi-Choice Dataset for Medical domain Question Answering},
  author={Pal, Ankit and Umapathi, Logesh Kumar and Sankarasubbu, Malaikannan},
  journal={arXiv preprint arXiv:2203.14371},
  year={2022}
}
```

**Key Contributors:**
- **Ankit Pal** - Dataset Creation & Curation
- **Logesh Kumar Umapathi** - Data Processing & Validation  
- **Malaikannan Sankarasubbu** - Research Supervision

### 🙏 **Additional Acknowledgments**

- **Medical Students & Educators** who provided valuable feedback during development
- **Open Source Community** for amazing tools and libraries that make this platform possible
- **Healthcare Professionals** who validated question accuracy and explanations
- **Beta Testers** who helped identify bugs and suggest improvements
- **Contributors** who help make this platform better every day

### 📖 **Research & References**

This platform is built upon solid research foundations:

- **MedMCQA Research Paper**: [arXiv:2203.14371](https://arxiv.org/abs/2203.14371)
- **Dataset Repository**: [github.com/medmcqa/medmcqa](https://github.com/medmcqa/medmcqa)
- **Medical Education Research**: Various studies on computer-assisted medical education

---

**⭐ If you find Prepnosis helpful, please consider giving it a star on GitHub! ⭐**
