# AI-Powered-Automated-Resume-Builder-Web-Application
**AI-Powered Automated Resume Builder** is an interactive and split screen web application that separates user input from A4 scaled canvas previewing. This tool provides real-time typography switching between Executive Serif and Modern Sans serif fonts, along with NLP simulation for professional text formatting optimization.

🚀 Live Demo
(Once hosted, insert your link here: e.g., https://yourusername.github.io/ai-resume-builder/)

🌟 Features
Real-Time Two-Way Sync: Instant visual synchronization between the editor panel and the resume layout canvas as you type.

Dual-Template Architecture:

Executive Layout: Traditional, centered styling utilizing classic Serif typography (Times New Roman) optimal for corporate, finance, and legal sectors.

Modern Layout: Sleek, left-aligned layout featuring progressive Sans-Serif fonts (Inter and Poppins) and high-impact blue geometry tailored for tech, design, and startup roles.

Intelligent Text Optimization (AI Engine): Embedded client-side automation simulating NLP processing to instantaneously re-engineer raw sentences into impact-driven, ATS-compliant bullet points.

Dynamic Tag Compiling: Automated string splitting logic that converts comma-separated inputs directly into uniform hard-skills badge grids.

Pixel-Perfect Export: Implements isolated @media print directives to suppress web UI, margins, browser headers, and footers, forcing a flawless 1:1 A4 PDF download through the native system interface.

🛠️ Tech Stack & Architecture
Structure: HTML5 (Semantic Structure)

Styling & Layout: CSS3 (Flexbox for application framing, CSS Grid for modular document architecture, CSS Variables for theme management)

Logic Engine: Vanilla JavaScript (Event-Driven State Architecture, Asynchronous Simulations)

Typography & Vector Graphics: Google Fonts (Inter, Poppins), FontAwesome Icons

📁 Project Structure


├── index.html      # Structural layer, entry configurations & layout panels
├── style.css       # Core design layer, print directives & template variations
└── script.js       # Core state synchronization, token splitting & AI workflows
💻 Getting Started
To run this application locally, you do not need to install any heavy packages or build configurations.

Clone the Repository: 
Bash git clone https://github.com/yourusername/ai-resume-builder.git

git clone https://github.com/yourusername/ai-resume-builder.git

Navigate to the Directory:
Bash cd ai-resume-builder

Launch the App:

Simply double-click index.html to open it in any modern browser (Chrome, Edge, Safari, Firefox).

Alternatively, run it using the Live Server extension in VS Code.

📈 Future Scalability Path
While the application operates with maximum performance as a static standalone client build, its structural mapping allows seamless scalability towards:

Component Migration: Rewriting the DOM bindings into state-driven React/Next.js hooks.

API Integration: Swapping out static simulation buffers for dynamic endpoints leveraging the Gemini API or OpenAI API.

Database Persistence: Utilizing PostgreSQL or MongoDB alongside authentication platforms (Clerk/NextAuth) to enable multi-account user saving profiles.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
