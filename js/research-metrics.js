// Personal Research Metrics Dashboard
class ResearchMetrics {
  constructor() {
    this.metrics = JSON.parse(localStorage.getItem('researchMetrics') || '{}');
    this.goals = JSON.parse(localStorage.getItem('researchGoals') || '[]');
    this.readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
  }

  // Track reading session
  trackReadingSession(paperId, duration, comprehensionScore) {
    const session = {
      paperId,
      date: new Date().toISOString().split('T')[0],
      duration, // in minutes
      comprehensionScore,
      timestamp: Date.now()
    };
    
    this.readingHistory.push(session);
    this.updateMetrics();
    this.saveData();
  }

  // Calculate reading velocity (papers per week)
  calculateReadingVelocity() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSessions = this.readingHistory.filter(s => s.timestamp > oneWeekAgo);
    const uniquePapers = new Set(recentSessions.map(s => s.paperId));
    return uniquePapers.size;
  }

  // Calculate average comprehension score
  calculateAverageComprehension() {
    if (this.readingHistory.length === 0) return 0;
    const totalScore = this.readingHistory.reduce((sum, s) => sum + (s.comprehensionScore || 0), 0);
    return totalScore / this.readingHistory.length;
  }

  // Calculate total reading time
  calculateTotalReadingTime() {
    return this.readingHistory.reduce((sum, s) => sum + (s.duration || 0), 0);
  }

  // Identify knowledge gaps
  identifyKnowledgeGaps() {
    const topicScores = {};
    const topicCounts = {};
    
    this.readingHistory.forEach(session => {
      const paper = papers.find(p => p.id === session.paperId);
      if (paper && paper.topic) {
        if (!topicScores[paper.topic]) {
          topicScores[paper.topic] = 0;
          topicCounts[paper.topic] = 0;
        }
        topicScores[paper.topic] += session.comprehensionScore || 0;
        topicCounts[paper.topic]++;
      }
    });
    
    const gaps = [];
    Object.keys(topicScores).forEach(topic => {
      const avgScore = topicScores[topic] / topicCounts[topic];
      if (avgScore < 70) {
        gaps.push({
          topic,
          averageScore: avgScore,
          paperCount: topicCounts[topic],
          severity: avgScore < 50 ? 'high' : 'medium'
        });
      }
    });
    
    return gaps.sort((a, b) => a.averageScore - b.averageScore);
  }

  // Update overall metrics
  updateMetrics() {
    this.metrics = {
      totalPapers: papers.length,
      readingSessions: this.readingHistory.length,
      readingVelocity: this.calculateReadingVelocity(),
      averageComprehension: this.calculateAverageComprehension(),
      totalReadingTime: this.calculateTotalReadingTime(),
      knowledgeGaps: this.identifyKnowledgeGaps(),
      lastUpdated: Date.now()
    };
  }

  // Set research goals
  setGoal(type, target, deadline) {
    const goal = {
      id: Date.now(),
      type, // 'papers_per_week', 'comprehension_score', 'reading_time'
      target,
      deadline,
      created: Date.now(),
      completed: false
    };
    
    this.goals.push(goal);
    this.saveData();
    return goal;
  }

  // Check goal progress
  checkGoalProgress() {
    return this.goals.map(goal => {
      let progress = 0;
      let current = 0;
      
      switch (goal.type) {
        case 'papers_per_week':
          current = this.calculateReadingVelocity();
          progress = (current / goal.target) * 100;
          break;
        case 'comprehension_score':
          current = this.calculateAverageComprehension();
          progress = (current / goal.target) * 100;
          break;
        case 'reading_time':
          const weeklyTime = this.getWeeklyReadingTime();
          current = weeklyTime;
          progress = (current / goal.target) * 100;
          break;
      }
      
      return {
        ...goal,
        progress: Math.min(progress, 100),
        current,
        status: progress >= 100 ? 'completed' : progress >= 75 ? 'on-track' : 'behind'
      };
    });
  }

  // Get weekly reading time
  getWeeklyReadingTime() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentSessions = this.readingHistory.filter(s => s.timestamp > oneWeekAgo);
    return recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  }

  // Generate productivity report
  generateProductivityReport() {
    const lastMonth = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyHistory = this.readingHistory.filter(s => s.timestamp > lastMonth);
    
    const dailyStats = {};
    monthlyHistory.forEach(session => {
      const date = session.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { sessions: 0, time: 0, papers: new Set() };
      }
      dailyStats[date].sessions++;
      dailyStats[date].time += session.duration || 0;
      dailyStats[date].papers.add(session.paperId);
    });
    
    const productiveDays = Object.keys(dailyStats).length;
    const avgSessionsPerDay = monthlyHistory.length / Math.max(productiveDays, 1);
    const avgTimePerDay = this.calculateTotalReadingTime() / Math.max(productiveDays, 1);
    
    return {
      period: '30 days',
      productiveDays,
      totalSessions: monthlyHistory.length,
      avgSessionsPerDay: avgSessionsPerDay.toFixed(1),
      avgTimePerDay: avgTimePerDay.toFixed(0),
      mostProductiveDay: this.findMostProductiveDay(dailyStats),
      trends: this.calculateTrends(dailyStats)
    };
  }

  // Find most productive day
  findMostProductiveDay(dailyStats) {
    let maxDay = null;
    let maxScore = 0;
    
    Object.entries(dailyStats).forEach(([date, stats]) => {
      const score = stats.sessions + (stats.time / 60); // sessions + hours
      if (score > maxScore) {
        maxScore = score;
        maxDay = { date, ...stats, score };
      }
    });
    
    return maxDay;
  }

  // Calculate productivity trends
  calculateTrends(dailyStats) {
    const dates = Object.keys(dailyStats).sort();
    if (dates.length < 7) return { trend: 'insufficient-data' };
    
    const recentWeek = dates.slice(-7);
    const previousWeek = dates.slice(-14, -7);
    
    const recentAvg = recentWeek.reduce((sum, date) => 
      sum + dailyStats[date].sessions, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, date) => 
      sum + (dailyStats[date]?.sessions || 0), 0) / previousWeek.length;
    
    const change = ((recentAvg - previousAvg) / Math.max(previousAvg, 1)) * 100;
    
    return {
      trend: change > 10 ? 'improving' : change < -10 ? 'declining' : 'stable',
      change: change.toFixed(1)
    };
  }

  // Save data to localStorage
  saveData() {
    localStorage.setItem('researchMetrics', JSON.stringify(this.metrics));
    localStorage.setItem('researchGoals', JSON.stringify(this.goals));
    localStorage.setItem('readingHistory', JSON.stringify(this.readingHistory));
  }
}

// Initialize research metrics
const researchMetrics = new ResearchMetrics();

// UI Functions
function showMetricsDashboard() {
  researchMetrics.updateMetrics();
  const metrics = researchMetrics.metrics;
  const goals = researchMetrics.checkGoalProgress();
  const report = researchMetrics.generateProductivityReport();
  
  const dashboardContainer = document.getElementById('metricsDashboard');
  dashboardContainer.innerHTML = `
    <div class="metrics-overview">
      <div class="metric-card">
        <h3>${metrics.totalPapers}</h3>
        <p>Total Papers</p>
      </div>
      <div class="metric-card">
        <h3>${metrics.readingVelocity}</h3>
        <p>Papers/Week</p>
      </div>
      <div class="metric-card">
        <h3>${metrics.averageComprehension.toFixed(0)}%</h3>
        <p>Avg Comprehension</p>
      </div>
      <div class="metric-card">
        <h3>${Math.round(metrics.totalReadingTime / 60)}h</h3>
        <p>Total Reading Time</p>
      </div>
    </div>

    <div class="goals-section">
      <div class="section-header">
        <h4>Research Goals</h4>
        <button onclick="showGoalModal()" class="add-goal-btn">Add Goal</button>
      </div>
      <div class="goals-list">
        ${goals.map(goal => `
          <div class="goal-card ${goal.status}">
            <div class="goal-info">
              <strong>${goal.type.replace('_', ' ').toUpperCase()}</strong>
              <p>Target: ${goal.target} | Current: ${goal.current.toFixed(1)}</p>
            </div>
            <div class="goal-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.progress}%"></div>
              </div>
              <span>${goal.progress.toFixed(0)}%</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="knowledge-gaps">
      <h4>Knowledge Gaps</h4>
      ${metrics.knowledgeGaps.map(gap => `
        <div class="gap-item ${gap.severity}">
          <span class="topic">${gap.topic}</span>
          <span class="score">${gap.averageScore.toFixed(0)}% avg</span>
          <span class="papers">${gap.paperCount} papers</span>
        </div>
      `).join('')}
    </div>

    <div class="productivity-report">
      <h4>Productivity Report (${report.period})</h4>
      <div class="report-stats">
        <div class="stat">
          <span class="label">Productive Days:</span>
          <span class="value">${report.productiveDays}</span>
        </div>
        <div class="stat">
          <span class="label">Avg Sessions/Day:</span>
          <span class="value">${report.avgSessionsPerDay}</span>
        </div>
        <div class="stat">
          <span class="label">Trend:</span>
          <span class="value ${report.trends.trend}">${report.trends.trend}</span>
        </div>
      </div>
    </div>
  `;
}

function showGoalModal() {
  const modalContainer = document.getElementById('goalModal');
  modalContainer.innerHTML = `
    <div class="modal-content">
      <h3>Set Research Goal</h3>
      <form id="goalForm">
        <select id="goalType" required>
          <option value="">Select Goal Type</option>
          <option value="papers_per_week">Papers per Week</option>
          <option value="comprehension_score">Comprehension Score</option>
          <option value="reading_time">Weekly Reading Time (minutes)</option>
        </select>
        
        <input type="number" id="goalTarget" placeholder="Target Value" required>
        <input type="date" id="goalDeadline" required>
        
        <div class="modal-buttons">
          <button type="submit">Set Goal</button>
          <button type="button" onclick="closeGoalModal()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  modalContainer.classList.remove('hidden');
}

function closeGoalModal() {
  document.getElementById('goalModal').classList.add('hidden');
}

// Handle goal form submission
document.addEventListener('submit', function(e) {
  if (e.target.id === 'goalForm') {
    e.preventDefault();
    
    const type = document.getElementById('goalType').value;
    const target = parseFloat(document.getElementById('goalTarget').value);
    const deadline = document.getElementById('goalDeadline').value;
    
    researchMetrics.setGoal(type, target, deadline);
    closeGoalModal();
    showMetricsDashboard();
  }
});