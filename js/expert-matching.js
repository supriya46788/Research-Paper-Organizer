// Expert Matching System
class ExpertMatcher {
  constructor() {
    this.experts = JSON.parse(localStorage.getItem('experts') || '[]');
    this.userProfile = this.buildUserProfile();
  }

  buildUserProfile() {
    const topics = {};
    const keywords = new Set();
    
    papers.forEach(paper => {
      const topic = paper.topic || 'General';
      topics[topic] = (topics[topic] || 0) + 1;
      paper.tags.forEach(tag => keywords.add(tag.toLowerCase()));
    });

    return {
      primaryTopics: Object.entries(topics).sort((a,b) => b[1] - a[1]).slice(0,3),
      keywords: Array.from(keywords),
      paperCount: papers.length,
      expertise: this.calculateExpertiseLevel()
    };
  }

  calculateExpertiseLevel() {
    const count = papers.length;
    if (count > 50) return 'expert';
    if (count > 20) return 'intermediate';
    return 'beginner';
  }

  findMatchingExperts(limit = 5) {
    return this.experts
      .map(expert => ({
        ...expert,
        matchScore: this.calculateMatchScore(expert)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  calculateMatchScore(expert) {
    let score = 0;
    
    // Topic overlap
    this.userProfile.primaryTopics.forEach(([topic]) => {
      if (expert.topics.includes(topic)) score += 30;
    });
    
    // Keyword overlap
    const keywordOverlap = expert.keywords.filter(k => 
      this.userProfile.keywords.includes(k)
    ).length;
    score += keywordOverlap * 5;
    
    // Experience level compatibility
    if (expert.level === 'expert' && this.userProfile.expertise !== 'expert') score += 20;
    
    return Math.min(score, 100);
  }

  addExpert(name, email, topics, keywords, level, bio) {
    const expert = {
      id: Date.now(),
      name, email, topics, keywords, level, bio,
      connections: 0,
      rating: 0,
      reviews: []
    };
    
    this.experts.push(expert);
    this.saveData();
    return expert;
  }

  saveData() {
    localStorage.setItem('experts', JSON.stringify(this.experts));
  }
}

const expertMatcher = new ExpertMatcher();

function showExpertMatching() {
  const matches = expertMatcher.findMatchingExperts();
  const container = document.getElementById('expertMatching');
  
  container.innerHTML = `
    <div class="expert-header">
      <h3>Expert Matching</h3>
      <button onclick="showAddExpertModal()">Add Expert</button>
    </div>
    
    <div class="user-profile">
      <h4>Your Research Profile</h4>
      <p>Expertise: ${expertMatcher.userProfile.expertise}</p>
      <p>Primary Topics: ${expertMatcher.userProfile.primaryTopics.map(([topic]) => topic).join(', ')}</p>
    </div>
    
    <div class="expert-matches">
      ${matches.map(expert => `
        <div class="expert-card">
          <div class="expert-info">
            <h4>${expert.name}</h4>
            <p>${expert.bio}</p>
            <div class="expert-topics">
              ${expert.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
            </div>
          </div>
          <div class="match-score">
            <span class="score">${expert.matchScore}%</span>
            <button onclick="connectWithExpert('${expert.id}')">Connect</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}