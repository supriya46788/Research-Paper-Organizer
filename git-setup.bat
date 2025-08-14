@echo off
echo ========================================
echo Git Setup for AI Paper Summarizer
echo ========================================
echo.

echo Checking Git installation...
git --version
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo.
echo Git is installed! Proceeding with setup...
echo.

echo 1. Adding all files to staging...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo 2. Committing changes...
git commit -m "Add AI-Powered Research Paper Summarizer

- Implement AI-powered research paper summarization using Gemini API
- Add tabbed interface: Details | Summary | Visuals | AI Assistant  
- Integrate Chart.js for data visualizations
- Add Web Speech API for voice synthesis
- Include comprehensive error handling and fallback mechanisms
- Add configuration management and setup documentation
- Support dark mode and responsive design"
if %errorlevel% neq 0 (
    echo ERROR: Failed to commit changes
    pause
    exit /b 1
)

echo 3. Creating new branch: feature/ai-paper-summarizer
git checkout -b feature/ai-paper-summarizer
if %errorlevel% neq 0 (
    echo ERROR: Failed to create new branch
    pause
    exit /b 1
)

echo 4. Pushing to remote repository...
git push origin feature/ai-paper-summarizer
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to remote
    echo You may need to set up remote origin first
    echo Use: git remote add origin YOUR_REPOSITORY_URL
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Git operations completed.
echo ========================================
echo.
echo Next steps:
echo 1. Go to your GitHub repository
echo 2. You should see a prompt to create a pull request
echo 3. Click "Compare & pull request"
echo 4. Use the content from CHANGES_SUMMARY.md as the PR description
echo 5. Submit the pull request
echo.
pause
