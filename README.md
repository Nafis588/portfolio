# Premium Glassmorphic Developer Portfolio

A modern, high-performance, responsive single-page portfolio website designed to showcase your skills, work experience, and public projects. Built using pure **Vanilla HTML5, CSS3, and modern JavaScript (ES6+)** with a stunning glassmorphism style and native light/dark theme toggle.

---

## 🌟 Key Features

- **Theme Switching**: Seamless transition between dark and light themes with preference memory saved in `localStorage`.
- **Dynamic Typewriter**: Smooth typewriter animation introducing your skills on the hero header.
- **GitHub Integration**: Enter any GitHub username dynamically on the page to fetch and showcase live repositories using the GitHub REST API (including description, languages, and star count).
- **Responsive Layout**: Fluid grids and layouts shifting seamlessly from mobile, tablet, desktop, up to ultrawide screens.
- **Interactive Timeline**: Clean vertical career timeline to chart professional experience and educational milestones.
- **Valid Contact Form**: Visual error styling and field constraints with animated simulated submission loader.

---

## 🚀 How to Run Locally

Since this project uses vanilla technologies, there are no complicated installation steps!

### Option 1: Direct File Opening (Easiest)
1. Open the directory `C:\Users\Nafis\.gemini\antigravity-ide\scratch\portfolio`.
2. Double-click the `index.html` file to open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Server (Recommended)
Using a local server helps prevent potential CORS restrictions with older browsers during API calls:
- If you use VS Code, install the **Live Server** extension, open the project folder, and click **Go Live**.
- Or, if you have Python installed, open the command line in this folder and run:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your web browser.

---

## 📦 Setting Up Git & Pushing to GitHub (Windows Guide)

If the command line says `git is not recognized`, follow these steps to initialize and push your repository:

### Step 1: Install Git on Windows
1. Download the installer from the official site: **[git-scm.com/download/win](https://git-scm.com/download/win)**.
2. Run the installer. You can accept the default options during setup.
3. Once installation completes, restart your IDE/Terminal to reload system variables.

### Step 2: Configure Git
Open your command terminal and set your global identity info:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Initialize Repository & Commit
Navigate to this project folder in your console and execute:
```bash
# Initialize local repository
git init

# Add all files to staging
git add .

# Create the first commit
git commit -m "initial: setup premium glassmorphic portfolio"
```

### Step 4: Create a GitHub Repository & Push
1. Go to your GitHub dashboard: **[github.com/new](https://github.com/new)**.
2. Enter a repository name (e.g., `portfolio`), keep it **Public**, and do **not** select Add README, gitignore, or license (since we already have files). Click **Create repository**.
3. Copy the URL under the "Quick setup" section. It looks like `https://github.com/your-username/portfolio.git`.
4. Run the following commands in your local project folder:
   ```bash
   # Add the remote repository URL
   git remote add origin https://github.com/your-username/portfolio.git
   
   # Set the default branch name to main
   git branch -M main
   
   # Push the code up to GitHub
   git push -u origin main
   ```

---

## 🌐 How to Deploy Live (GitHub Pages)

GitHub allows hosting your static HTML page for **free**!

1. Open your repository on GitHub.
2. Navigate to **Settings** (tab at the top) -> **Pages** (in the sidebar on the left).
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: Select **`main`** and folder **`/ (root)`**
4. Click **Save**.
5. Wait 1-2 minutes. GitHub will display a notification banner at the top of the Pages screen: *"Your site is live at `https://your-username.github.io/portfolio/`"*.

Now you can share your live portfolio link with recruiters and clients!
