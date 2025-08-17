# 📚 Research Paper Organizer

A clean, minimal, and static web-based tool built using **HTML, CSS, and JavaScript** to help students, researchers, and professionals neatly **organize, categorize, and access** their research papers in one place.

> 🚀 This is an open-source beginner-friendly project aimed at promoting open collaboration, UI enhancement, and useful features like tagging, filtering, and paper previews.

---

## ✨ Features

### Core Features
* 🎯 Static single-page application (SPA) with smooth UI
* 📁 Add and organize research paper entries
* 📇 Sort and filter by category (like AI, ML, Web, etc.)
* 🔍 Search bar to quickly find a paper
* 📌 Visual cards for each paper with title, author(s), and description
* 📄 PDF upload and preview functionality
* 🌙 Dark mode toggle
* 📱 Responsive design for all devices
* 📝 Citation generation (APA, MLA, Chicago)

### 🤖 AI-Powered Features (NEW!)
* 🧠 **AI Summarization**: Get TL;DR, detailed summaries, key points, and research questions using Google's Gemini API
* 📊 **Interactive Visualizations**: Keyword frequency charts, research timeline, and topic distribution analysis
* 🗣️ **Voice Assistant**: Text-to-speech functionality to read summaries aloud
* 💬 **AI Chat Assistant**: Ask questions about your research papers and get contextual responses
* 🎨 Built with pure HTML, CSS, and JavaScript – no frameworks

---

## 📁 Project Structure

```
research-paper-organizer/
├── index.html          # Main HTML structure
├── style.css           # All custom styling with AI interface styles
├── script.js           # Core DOM manipulation and paper management
├── config.js           # Configuration for AI features and API settings
├── ai-assistant.js     # AI integration with Gemini API
├── SETUP.md           # Detailed setup guide for AI features
├── assets/            # Images, icons, or resources
└── README.md          # Project documentation
```

---

## 💡 How to Use

### Basic Setup
1. Clone this repo:

   ```bash
   git clone https://github.com/supriya46788/Research-Paper-Organizer.git
   ```

2. Open `index.html` in your browser.

3. Start adding your research papers directly.

### 🚀 Server Version (Recommended)

4. **Run with Server** (No API key setup required for users):
   ```bash
   # Install dependencies
   npm install
   
   # Set up your environment (one-time setup)
   cp .env.example .env
   # Add your Gemini API key to .env file
   
   # Start the server
   npm start
   ```
   
   - Visit `http://localhost:3000`
   - AI features work immediately - no user setup required!
   - **For detailed server setup, see [SERVER_SETUP.md](SERVER_SETUP.md)**

### 📱 Static Version (Client-side)

5. **Alternative: Client-side Setup**:
   - Open `index.html` directly in browser
   - Users need to provide their own Gemini API key
   - Click "🧠 Summarize Paper" → Enter API key when prompted
   
📄 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

---

## 🛠️ Roadmap (Planned Features)

* Add localStorage support to save entries
* Add dynamic paper upload & preview
* Add PDF embedding and reading inside cards
* Responsive design for mobile view
* Dark mode toggle
* Convert to a fully dynamic app (React/Vanilla JS)
* Login/signup feature for cloud syncing

---

## 🧑‍💻 How to Contribute

We welcome contributors of all skill levels! Here’s how to get started:

### 🏁 Step-by-Step

1. **Fork** the repository.
2. **Clone** your fork.

   ```bash
   git clone https://github.com/supriya46788/Research-Paper-Organizer.git
   ```
3. Create a new branch:

   ```bash
   git checkout -b your-feature-name
   ```
4. Make your changes and **commit**:

   ```bash
   git commit -m "Added feature XYZ"
   ```
5. **Push** the branch and create a **Pull Request**.

---

## 🔖 Contribution Guidelines

* Stick to clean and readable code
* Make small, well-documented pull requests
* For design changes, try to follow a minimal UI
* Always link issues you're solving
* Ask questions or open discussions freely in the Issues tab

---

## 🖖 Good First Issues

Want to get started? Look at our [Good First Issues](https://github.com/supriya46788/Research-Paper-Organizer/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

---

## 🧑‍💻 Project Admin

**Supriya Pandey.**
[GitHub](https://github.com/supriya46788) • [LinkedIn](https://www.linkedin.com/in/supriyapandey595/)

---

## 🙌 Support & Star

If you like this project, **give it a ⭐** to support more such beginner-friendly repositories!

## 🔍 GitHub Keywords

research paper, organize research, file manager, academic research, digital organizer, research tools, python project, streamlit, machine learning, AI