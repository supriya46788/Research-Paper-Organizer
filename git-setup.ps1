# Git Setup for AI Paper Summarizer - PowerShell Version
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Setup for AI Paper Summarizer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Git installation
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Git is installed! Proceeding with setup..." -ForegroundColor Green
Write-Host ""

# Step 1: Add all files
Write-Host "1. Adding all files to staging..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "✓ Files added successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to add files" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: Commit changes
Write-Host "2. Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
Add AI-Powered Research Paper Summarizer Assistant

- Implement AI-powered research paper summarization using Gemini API
- Add tabbed interface: Details | Summary | Visuals | AI Assistant  
- Integrate Chart.js for data visualizations
- Add Web Speech API for voice synthesis
- Include comprehensive error handling and fallback mechanisms
- Add configuration management and setup documentation
- Support dark mode and responsive design
"@

try {
    git commit -m $commitMessage
    Write-Host "✓ Changes committed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to commit changes" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Create new branch
Write-Host "3. Creating new branch: feature/ai-paper-summarizer" -ForegroundColor Yellow
try {
    git checkout -b feature/ai-paper-summarizer
    Write-Host "✓ New branch created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create new branch" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Push to remote
Write-Host "4. Pushing to remote repository..." -ForegroundColor Yellow
try {
    git push origin feature/ai-paper-summarizer
    Write-Host "✓ Successfully pushed to remote" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to push to remote" -ForegroundColor Red
    Write-Host "You may need to set up remote origin first" -ForegroundColor Yellow
    Write-Host "Use: git remote add origin YOUR_REPOSITORY_URL" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Git operations completed." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to your GitHub repository" -ForegroundColor White
Write-Host "2. You should see a prompt to create a pull request" -ForegroundColor White
Write-Host "3. Click 'Compare & pull request'" -ForegroundColor White
Write-Host "4. Use the content from CHANGES_SUMMARY.md as the PR description" -ForegroundColor White
Write-Host "5. Submit the pull request" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
