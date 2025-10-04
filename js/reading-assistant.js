// Intelligent Reading Assistant
class ReadingAssistant {
  constructor() {
    this.readingSessions = JSON.parse(localStorage.getItem('readingSessions') || '{}');
    this.comprehensionScores = JSON.parse(localStorage.getItem('comprehensionScores') || '{}');
    this.currentSession = null;
  }

  // Start reading session
  startReadingSession(paperId) {
    this.currentSession = {
      paperId,
      startTime: Date.now(),
      questions: [],
      answers: [],
      comprehensionScore: 0,
      difficultyLevel: this.assessDifficulty(paperId)
    };
    
    this.generateQuestions(paperId);
    return this.currentSession;
  }

  // Assess paper difficulty
  assessDifficulty(paperId) {
    const paper = papers.find(p => p.id === paperId);
    if (!paper) return 'medium';

    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    const complexWords = ['algorithm', 'methodology', 'statistical', 'computational', 'theoretical'];
    const complexity = complexWords.filter(word => text.includes(word)).length;
    
    if (complexity >= 3) return 'hard';
    if (complexity >= 1) return 'medium';
    return 'easy';
  }

  // Generate comprehension questions
  generateQuestions(paperId) {
    const paper = papers.find(p => p.id === paperId);
    if (!paper) return;

    const questions = [
      {
        id: 1,
        type: 'multiple-choice',
        question: `What is the main focus of "${paper.title}"?`,
        options: [
          paper.topic || 'Research',
          'Data Analysis',
          'Machine Learning',
          'Software Development'
        ],
        correct: 0
      },
      {
        id: 2,
        type: 'short-answer',
        question: 'Summarize the key contribution of this paper in one sentence.',
        expectedKeywords: paper.tags || []
      },
      {
        id: 3,
        type: 'multiple-choice',
        question: 'Who are the authors of this paper?',
        options: [
          paper.authors,
          'Unknown Authors',
          'Multiple Contributors',
          'Anonymous'
        ],
        correct: 0
      }
    ];

    this.currentSession.questions = questions;
  }

  // Submit answer and calculate score
  submitAnswer(questionId, answer) {
    const question = this.currentSession.questions.find(q => q.id === questionId);
    if (!question) return;

    let score = 0;
    if (question.type === 'multiple-choice') {
      score = answer === question.correct ? 1 : 0;
    } else if (question.type === 'short-answer') {
      const keywords = question.expectedKeywords || [];
      const answerLower = answer.toLowerCase();
      const matchedKeywords = keywords.filter(keyword => 
        answerLower.includes(keyword.toLowerCase())
      );
      score = matchedKeywords.length / Math.max(keywords.length, 1);
    }

    this.currentSession.answers.push({ questionId, answer, score });
    return score;
  }

  // End reading session and calculate final score
  endReadingSession() {
    if (!this.currentSession) return;

    const totalScore = this.currentSession.answers.reduce((sum, ans) => sum + ans.score, 0);
    const maxScore = this.currentSession.questions.length;
    const comprehensionScore = (totalScore / maxScore) * 100;

    this.currentSession.comprehensionScore = comprehensionScore;
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    // Save session
    if (!this.readingSessions[this.currentSession.paperId]) {
      this.readingSessions[this.currentSession.paperId] = [];
    }
    this.readingSessions[this.currentSession.paperId].push(this.currentSession);
    
    // Update comprehension scores
    this.comprehensionScores[this.currentSession.paperId] = comprehensionScore;
    
    this.saveData();
    return this.currentSession;
  }

  // Get reading progress for a paper
  getReadingProgress(paperId) {
    const sessions = this.readingSessions[paperId] || [];
    const avgScore = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.comprehensionScore, 0) / sessions.length 
      : 0;
    
    return {
      sessionsCount: sessions.length,
      averageScore: avgScore,
      lastSession: sessions[sessions.length - 1],
      improvement: this.calculateImprovement(sessions)
    };
  }

  // Calculate improvement over time
  calculateImprovement(sessions) {
    if (sessions.length < 2) return 0;
    const first = sessions[0].comprehensionScore;
    const last = sessions[sessions.length - 1].comprehensionScore;
    return last - first;
  }

  // Get personalized recommendations
  getPersonalizedRecommendations() {
    const allScores = Object.values(this.comprehensionScores);
    const avgScore = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : 0;

    const recommendations = [];
    
    if (avgScore < 60) {
      recommendations.push('Focus on easier papers to build confidence');
      recommendations.push('Take more time to read abstracts thoroughly');
    } else if (avgScore < 80) {
      recommendations.push('Try papers with medium difficulty');
      recommendations.push('Practice active reading techniques');
    } else {
      recommendations.push('Challenge yourself with advanced papers');
      recommendations.push('Consider writing summaries to deepen understanding');
    }

    return recommendations;
  }

  // Save data to localStorage
  saveData() {
    localStorage.setItem('readingSessions', JSON.stringify(this.readingSessions));
    localStorage.setItem('comprehensionScores', JSON.stringify(this.comprehensionScores));
  }
}

// Initialize reading assistant
const readingAssistant = new ReadingAssistant();

// UI Functions
function startReadingMode(paperId) {
  const session = readingAssistant.startReadingSession(paperId);
  showReadingInterface(session);
}

function showReadingInterface(session) {
  const readingContainer = document.getElementById('readingInterface');
  readingContainer.innerHTML = `
    <div class="reading-session">
      <div class="session-header">
        <h3>Reading Session</h3>
        <span class="difficulty ${session.difficultyLevel}">${session.difficultyLevel.toUpperCase()}</span>
      </div>
      
      <div class="questions-container">
        ${session.questions.map((q, index) => `
          <div class="question-card" id="question-${q.id}">
            <h4>Question ${index + 1}</h4>
            <p>${q.question}</p>
            
            ${q.type === 'multiple-choice' ? `
              <div class="options">
                ${q.options.map((option, i) => `
                  <label>
                    <input type="radio" name="q${q.id}" value="${i}">
                    ${option}
                  </label>
                `).join('')}
              </div>
            ` : `
              <textarea id="answer-${q.id}" placeholder="Your answer..."></textarea>
            `}
            
            <button onclick="submitQuestionAnswer(${q.id}, '${q.type}')">Submit Answer</button>
          </div>
        `).join('')}
      </div>
      
      <button onclick="finishReadingSession()" class="finish-btn">Finish Session</button>
    </div>
  `;
}

function submitQuestionAnswer(questionId, type) {
  let answer;
  
  if (type === 'multiple-choice') {
    const selected = document.querySelector(`input[name="q${questionId}"]:checked`);
    answer = selected ? parseInt(selected.value) : -1;
  } else {
    answer = document.getElementById(`answer-${questionId}`).value;
  }
  
  const score = readingAssistant.submitAnswer(questionId, answer);
  
  // Show feedback
  const questionCard = document.getElementById(`question-${questionId}`);
  questionCard.innerHTML += `<div class="feedback">Score: ${(score * 100).toFixed(0)}%</div>`;
}

function finishReadingSession() {
  const session = readingAssistant.endReadingSession();
  showSessionResults(session);
}

function showSessionResults(session) {
  const resultsContainer = document.getElementById('sessionResults');
  resultsContainer.innerHTML = `
    <div class="session-results">
      <h3>Session Complete!</h3>
      <div class="score-display">
        <div class="score-circle">
          <span class="score">${session.comprehensionScore.toFixed(0)}%</span>
        </div>
      </div>
      
      <div class="session-stats">
        <p>Duration: ${Math.round(session.duration / 60000)} minutes</p>
        <p>Difficulty: ${session.difficultyLevel}</p>
        <p>Questions Answered: ${session.answers.length}</p>
      </div>
      
      <div class="recommendations">
        <h4>Recommendations</h4>
        ${readingAssistant.getPersonalizedRecommendations().map(rec => 
          `<p>• ${rec}</p>`
        ).join('')}
      </div>
    </div>
  `;
}