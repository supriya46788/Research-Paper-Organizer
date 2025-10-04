// Research Trend Analysis Dashboard
class TrendAnalyzer {
  constructor() {
    this.trends = [];
    this.timelineData = [];
  }

  // Analyze trends over time
  analyzeTrends(papers) {
    const yearlyData = {};
    const topicEvolution = {};
    
    papers.forEach(paper => {
      const year = paper.year || new Date().getFullYear();
      const topic = paper.topic || 'Unknown';
      
      if (!yearlyData[year]) yearlyData[year] = { count: 0, topics: {} };
      if (!topicEvolution[topic]) topicEvolution[topic] = {};
      
      yearlyData[year].count++;
      yearlyData[year].topics[topic] = (yearlyData[year].topics[topic] || 0) + 1;
      topicEvolution[topic][year] = (topicEvolution[topic][year] || 0) + 1;
    });

    this.trends = {
      yearly: yearlyData,
      topics: topicEvolution,
      emergingTopics: this.findEmergingTopics(topicEvolution),
      researchFocus: this.calculateResearchFocus(papers)
    };

    return this.trends;
  }

  // Find emerging topics (topics with increasing frequency)
  findEmergingTopics(topicEvolution) {
    const emerging = [];
    const currentYear = new Date().getFullYear();
    
    Object.entries(topicEvolution).forEach(([topic, years]) => {
      const recentYears = Object.entries(years)
        .filter(([year]) => parseInt(year) >= currentYear - 2)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);
      
      if (recentYears.length >= 2) {
        const growth = recentYears[recentYears.length - 1].count - recentYears[0].count;
        if (growth > 0) {
          emerging.push({ topic, growth, trend: 'rising' });
        }
      }
    });

    return emerging.sort((a, b) => b.growth - a.growth);
  }

  // Calculate research focus evolution
  calculateResearchFocus(papers) {
    const focus = {};
    const totalPapers = papers.length;
    
    papers.forEach(paper => {
      const topic = paper.topic || 'Unknown';
      focus[topic] = (focus[topic] || 0) + 1;
    });

    return Object.entries(focus)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: ((count / totalPapers) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Predict future research directions
  predictFutureDirections(papers) {
    const recentPapers = papers.filter(p => {
      const year = parseInt(p.year) || new Date().getFullYear();
      return year >= new Date().getFullYear() - 2;
    });

    const keywords = {};
    recentPapers.forEach(paper => {
      const text = `${paper.title} ${paper.abstract || ''} ${paper.tags.join(' ')}`.toLowerCase();
      const words = text.match(/\b\w{4,}\b/g) || [];
      
      words.forEach(word => {
        keywords[word] = (keywords[word] || 0) + 1;
      });
    });

    return Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, frequency]) => ({ keyword, frequency, trend: 'emerging' }));
  }

  // Generate insights
  generateInsights(papers) {
    const trends = this.analyzeTrends(papers);
    const predictions = this.predictFutureDirections(papers);
    
    return {
      totalPapers: papers.length,
      activeYears: Object.keys(trends.yearly).length,
      dominantTopic: trends.researchFocus[0]?.topic || 'None',
      emergingCount: trends.emergingTopics.length,
      predictions: predictions.slice(0, 5),
      recommendations: this.generateRecommendations(trends, predictions)
    };
  }

  // Generate research recommendations
  generateRecommendations(trends, predictions) {
    const recommendations = [];
    
    if (trends.emergingTopics.length > 0) {
      recommendations.push(`Explore ${trends.emergingTopics[0].topic} - showing ${trends.emergingTopics[0].growth}% growth`);
    }
    
    if (predictions.length > 0) {
      recommendations.push(`Consider research in ${predictions[0].keyword} - trending keyword`);
    }
    
    const underrepresented = trends.researchFocus.filter(f => parseFloat(f.percentage) < 10);
    if (underrepresented.length > 0) {
      recommendations.push(`Diversify into ${underrepresented[0].topic} for broader perspective`);
    }

    return recommendations;
  }
}

// Initialize trend analyzer
const trendAnalyzer = new TrendAnalyzer();

// UI Functions
function showTrendDashboard() {
  const insights = trendAnalyzer.generateInsights(papers);
  const trends = trendAnalyzer.analyzeTrends(papers);
  
  const dashboardContainer = document.getElementById('trendDashboard');
  dashboardContainer.innerHTML = `
    <div class="trend-overview">
      <div class="trend-stat">
        <h3>${insights.totalPapers}</h3>
        <p>Total Papers</p>
      </div>
      <div class="trend-stat">
        <h3>${insights.activeYears}</h3>
        <p>Active Years</p>
      </div>
      <div class="trend-stat">
        <h3>${insights.dominantTopic}</h3>
        <p>Dominant Topic</p>
      </div>
      <div class="trend-stat">
        <h3>${insights.emergingCount}</h3>
        <p>Emerging Topics</p>
      </div>
    </div>

    <div class="trend-charts">
      <div class="chart-section">
        <h4>Research Focus Distribution</h4>
        <div class="focus-chart">
          ${trends.researchFocus.map(item => `
            <div class="focus-bar">
              <span class="topic">${item.topic}</span>
              <div class="bar" style="width: ${item.percentage}%"></div>
              <span class="percentage">${item.percentage}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chart-section">
        <h4>Emerging Topics</h4>
        <div class="emerging-topics">
          ${trends.emergingTopics.map(topic => `
            <div class="emerging-topic">
              <span class="topic-name">${topic.topic}</span>
              <span class="growth">+${topic.growth} papers</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chart-section">
        <h4>Future Predictions</h4>
        <div class="predictions">
          ${insights.predictions.map(pred => `
            <div class="prediction-item">
              <span class="keyword">${pred.keyword}</span>
              <span class="frequency">${pred.frequency} mentions</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="chart-section">
        <h4>Recommendations</h4>
        <div class="recommendations">
          ${insights.recommendations.map(rec => `
            <div class="recommendation">${rec}</div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}