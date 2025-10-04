// Research Impact Predictor
class ImpactPredictor {
  constructor() {
    this.impactScores = {};
    this.trendingTopics = [];
  }

  // Predict impact score for a paper
  predictImpact(paper) {
    let score = 0;
    const currentYear = new Date().getFullYear();
    
    // Recency factor (newer papers get slight boost)
    const yearDiff = currentYear - (parseInt(paper.year) || currentYear);
    score += Math.max(0, 10 - yearDiff);
    
    // Author reputation (simplified - based on number of papers by same author)
    const authorPapers = papers.filter(p => 
      p.authors.toLowerCase().includes(paper.authors.split(',')[0].toLowerCase())
    ).length;
    score += Math.min(authorPapers * 2, 20);
    
    // Topic trending factor
    const topicTrend = this.getTopicTrendScore(paper.topic);
    score += topicTrend;
    
    // Abstract quality (length and complexity)
    if (paper.abstract) {
      const abstractScore = Math.min(paper.abstract.length / 50, 15);
      score += abstractScore;
    }
    
    // Tag relevance
    const tagScore = this.calculateTagRelevance(paper.tags);
    score += tagScore;
    
    // Journal prestige (simplified)
    const journalScore = this.getJournalScore(paper.journal);
    score += journalScore;
    
    // Normalize to 0-100 scale
    const normalizedScore = Math.min(Math.max(score, 0), 100);
    
    this.impactScores[paper.id] = {
      overall: normalizedScore,
      factors: {
        recency: Math.max(0, 10 - yearDiff),
        author: Math.min(authorPapers * 2, 20),
        topic: topicTrend,
        abstract: paper.abstract ? Math.min(paper.abstract.length / 50, 15) : 0,
        tags: tagScore,
        journal: journalScore
      }
    };
    
    return this.impactScores[paper.id];
  }

  // Get topic trend score
  getTopicTrendScore(topic) {
    const trendingTopics = ['AI', 'Machine Learning', 'Deep Learning', 'Blockchain', 'Quantum'];
    const topicLower = (topic || '').toLowerCase();
    
    for (const trending of trendingTopics) {
      if (topicLower.includes(trending.toLowerCase())) {
        return 25;
      }
    }
    return 10;
  }

  // Calculate tag relevance score
  calculateTagRelevance(tags) {
    const hotKeywords = ['neural', 'deep', 'learning', 'ai', 'quantum', 'blockchain', 'covid', 'climate'];
    let score = 0;
    
    tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (hotKeywords.some(keyword => tagLower.includes(keyword))) {
        score += 5;
      }
    });
    
    return Math.min(score, 20);
  }

  // Get journal prestige score (simplified)
  getJournalScore(journal) {
    if (!journal) return 5;
    
    const prestigiousJournals = ['Nature', 'Science', 'Cell', 'NEJM', 'PNAS'];
    const journalLower = journal.toLowerCase();
    
    for (const prestigious of prestigiousJournals) {
      if (journalLower.includes(prestigious.toLowerCase())) {
        return 20;
      }
    }
    
    return 10;
  }

  // Compare paper against trending research
  compareWithTrends(paper) {
    const currentTrends = this.identifyCurrentTrends();
    const paperKeywords = this.extractKeywords(paper);
    
    let alignment = 0;
    currentTrends.forEach(trend => {
      if (paperKeywords.some(keyword => 
        keyword.toLowerCase().includes(trend.toLowerCase())
      )) {
        alignment += 1;
      }
    });
    
    return {
      alignmentScore: (alignment / currentTrends.length) * 100,
      matchingTrends: currentTrends.filter(trend =>
        paperKeywords.some(keyword => 
          keyword.toLowerCase().includes(trend.toLowerCase())
        )
      )
    };
  }

  // Identify current research trends
  identifyCurrentTrends() {
    return [
      'Artificial Intelligence',
      'Machine Learning',
      'Climate Change',
      'Quantum Computing',
      'Biotechnology',
      'Renewable Energy',
      'Cybersecurity',
      'Data Science'
    ];
  }

  // Extract keywords from paper
  extractKeywords(paper) {
    const text = `${paper.title} ${paper.abstract || ''} ${paper.tags.join(' ')}`;
    return text.match(/\b\w{4,}\b/g) || [];
  }

  // Suggest high-impact papers to read next
  suggestHighImpactPapers(userPapers, limit = 5) {
    // This would typically connect to external APIs
    // For now, we'll simulate recommendations based on user's collection
    
    const userTopics = [...new Set(userPapers.map(p => p.topic).filter(Boolean))];
    const userKeywords = userPapers.flatMap(p => p.tags);
    
    // Simulate external high-impact papers
    const simulatedPapers = [
      {
        title: 'Attention Is All You Need',
        authors: 'Vaswani et al.',
        topic: 'Machine Learning',
        predictedCitations: 15000,
        relevanceScore: this.calculateRelevance(userTopics, userKeywords, 'Machine Learning', ['attention', 'transformer'])
      },
      {
        title: 'BERT: Pre-training of Deep Bidirectional Transformers',
        authors: 'Devlin et al.',
        topic: 'Natural Language Processing',
        predictedCitations: 12000,
        relevanceScore: this.calculateRelevance(userTopics, userKeywords, 'NLP', ['bert', 'transformer'])
      },
      {
        title: 'Mastering the Game of Go with Deep Neural Networks',
        authors: 'Silver et al.',
        topic: 'Artificial Intelligence',
        predictedCitations: 8000,
        relevanceScore: this.calculateRelevance(userTopics, userKeywords, 'AI', ['reinforcement', 'neural'])
      }
    ];
    
    return simulatedPapers
      .sort((a, b) => (b.relevanceScore * b.predictedCitations) - (a.relevanceScore * a.predictedCitations))
      .slice(0, limit);
  }

  // Calculate relevance to user's research
  calculateRelevance(userTopics, userKeywords, paperTopic, paperKeywords) {
    let relevance = 0;
    
    // Topic match
    if (userTopics.some(topic => topic.toLowerCase().includes(paperTopic.toLowerCase()))) {
      relevance += 0.5;
    }
    
    // Keyword match
    const keywordMatches = userKeywords.filter(uk => 
      paperKeywords.some(pk => uk.toLowerCase().includes(pk.toLowerCase()))
    ).length;
    
    relevance += (keywordMatches / Math.max(userKeywords.length, 1)) * 0.5;
    
    return Math.min(relevance, 1);
  }

  // Generate impact report
  generateImpactReport(papers) {
    const predictions = papers.map(paper => ({
      paper,
      prediction: this.predictImpact(paper)
    }));
    
    const highImpact = predictions.filter(p => p.prediction.overall > 70);
    const mediumImpact = predictions.filter(p => p.prediction.overall > 40 && p.prediction.overall <= 70);
    const lowImpact = predictions.filter(p => p.prediction.overall <= 40);
    
    return {
      summary: {
        total: papers.length,
        highImpact: highImpact.length,
        mediumImpact: mediumImpact.length,
        lowImpact: lowImpact.length
      },
      topPapers: predictions
        .sort((a, b) => b.prediction.overall - a.prediction.overall)
        .slice(0, 5),
      recommendations: this.suggestHighImpactPapers(papers)
    };
  }
}

// Initialize impact predictor
const impactPredictor = new ImpactPredictor();

// UI Functions
function showImpactDashboard() {
  const report = impactPredictor.generateImpactReport(papers);
  const dashboardContainer = document.getElementById('impactDashboard');
  
  dashboardContainer.innerHTML = `
    <div class="impact-overview">
      <div class="impact-stats">
        <div class="stat-card high">
          <h3>${report.summary.highImpact}</h3>
          <p>High Impact Papers</p>
        </div>
        <div class="stat-card medium">
          <h3>${report.summary.mediumImpact}</h3>
          <p>Medium Impact Papers</p>
        </div>
        <div class="stat-card low">
          <h3>${report.summary.lowImpact}</h3>
          <p>Low Impact Papers</p>
        </div>
      </div>
    </div>

    <div class="top-papers">
      <h4>Your Highest Impact Papers</h4>
      ${report.topPapers.map(item => `
        <div class="impact-paper-card">
          <div class="paper-info">
            <strong>${item.paper.title}</strong>
            <p>${item.paper.authors}</p>
          </div>
          <div class="impact-score">
            <span class="score">${item.prediction.overall.toFixed(0)}</span>
            <span class="label">Impact Score</span>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="recommendations">
      <h4>Recommended High-Impact Papers</h4>
      ${report.recommendations.map(rec => `
        <div class="recommendation-card">
          <strong>${rec.title}</strong>
          <p>by ${rec.authors}</p>
          <div class="rec-stats">
            <span>Predicted Citations: ${rec.predictedCitations.toLocaleString()}</span>
            <span>Relevance: ${(rec.relevanceScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showPaperImpactDetails(paperId) {
  const paper = papers.find(p => p.id === paperId);
  const prediction = impactPredictor.predictImpact(paper);
  const trendComparison = impactPredictor.compareWithTrends(paper);
  
  const detailsContainer = document.getElementById('impactDetails');
  detailsContainer.innerHTML = `
    <div class="impact-details">
      <h3>Impact Analysis: ${paper.title}</h3>
      
      <div class="overall-score">
        <div class="score-circle">
          <span class="score">${prediction.overall.toFixed(0)}</span>
          <span class="label">Impact Score</span>
        </div>
      </div>
      
      <div class="factor-breakdown">
        <h4>Score Breakdown</h4>
        ${Object.entries(prediction.factors).map(([factor, score]) => `
          <div class="factor-item">
            <span class="factor-name">${factor.charAt(0).toUpperCase() + factor.slice(1)}</span>
            <div class="factor-bar">
              <div class="bar-fill" style="width: ${(score/25)*100}%"></div>
            </div>
            <span class="factor-score">${score.toFixed(1)}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="trend-alignment">
        <h4>Trend Alignment</h4>
        <p>Alignment Score: ${trendComparison.alignmentScore.toFixed(0)}%</p>
        <div class="matching-trends">
          ${trendComparison.matchingTrends.map(trend => 
            `<span class="trend-tag">${trend}</span>`
          ).join('')}
        </div>
      </div>
    </div>
  `;
}