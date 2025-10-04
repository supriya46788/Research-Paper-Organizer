// Cross-Reference Intelligence
class CrossReferenceEngine {
  constructor() {
    this.citationNetwork = {};
    this.knowledgeGaps = [];
  }

  // Detect citations between papers in collection
  detectInternalCitations(papers) {
    const citations = [];
    
    papers.forEach(paper => {
      const text = `${paper.title} ${paper.abstract || ''} ${paper.notes || ''}`.toLowerCase();
      
      papers.forEach(otherPaper => {
        if (paper.id !== otherPaper.id) {
          // Check if paper cites another paper by author or title keywords
          const authorLastNames = otherPaper.authors.split(',').map(author => 
            author.trim().split(' ').pop().toLowerCase()
          );
          
          const titleKeywords = otherPaper.title.toLowerCase().split(' ')
            .filter(word => word.length > 4);
          
          let citationScore = 0;
          
          // Check author citations
          authorLastNames.forEach(lastName => {
            if (text.includes(lastName) && lastName.length > 3) {
              citationScore += 0.5;
            }
          });
          
          // Check title keyword matches
          titleKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
              citationScore += 0.3;
            }
          });
          
          if (citationScore > 0.7) {
            citations.push({
              citing: paper.id,
              cited: otherPaper.id,
              confidence: Math.min(citationScore, 1),
              type: 'internal'
            });
          }
        }
      });
    });
    
    return citations;
  }

  // Build citation network
  buildCitationNetwork(papers) {
    const citations = this.detectInternalCitations(papers);
    this.citationNetwork = {};
    
    papers.forEach(paper => {
      this.citationNetwork[paper.id] = {
        paper,
        cites: citations.filter(c => c.citing === paper.id),
        citedBy: citations.filter(c => c.cited === paper.id),
        influence: 0,
        centrality: 0
      };
    });
    
    // Calculate influence scores
    Object.values(this.citationNetwork).forEach(node => {
      node.influence = node.citedBy.length;
      node.centrality = node.cites.length + node.citedBy.length;
    });
    
    return this.citationNetwork;
  }

  // Identify knowledge gaps
  identifyKnowledgeGaps(papers) {
    const topics = {};
    const connections = {};
    
    // Analyze topic coverage
    papers.forEach(paper => {
      const topic = paper.topic || 'Unknown';
      if (!topics[topic]) {
        topics[topic] = { papers: [], keywords: new Set() };
      }
      topics[topic].papers.push(paper);
      
      // Collect keywords
      paper.tags.forEach(tag => topics[topic].keywords.add(tag.toLowerCase()));
      
      const titleWords = paper.title.toLowerCase().split(' ')
        .filter(word => word.length > 4);
      titleWords.forEach(word => topics[topic].keywords.add(word));
    });
    
    // Find gaps between topics
    const gaps = [];
    const topicNames = Object.keys(topics);
    
    for (let i = 0; i < topicNames.length; i++) {
      for (let j = i + 1; j < topicNames.length; j++) {
        const topic1 = topicNames[i];
        const topic2 = topicNames[j];
        
        const keywords1 = topics[topic1].keywords;
        const keywords2 = topics[topic2].keywords;
        
        const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
        const connectionStrength = intersection.size / Math.min(keywords1.size, keywords2.size);
        
        if (connectionStrength < 0.2 && keywords1.size > 2 && keywords2.size > 2) {
          gaps.push({
            topic1,
            topic2,
            connectionStrength,
            missingConnections: Math.max(keywords1.size, keywords2.size) - intersection.size,
            suggestedBridge: this.suggestBridgeTopic(topic1, topic2)
          });
        }
      }
    }
    
    this.knowledgeGaps = gaps.sort((a, b) => b.missingConnections - a.missingConnections);
    return this.knowledgeGaps;
  }

  // Suggest bridge topics
  suggestBridgeTopic(topic1, topic2) {
    const bridgeMap = {
      'Machine Learning,Data Science': 'Statistical Learning',
      'AI,Computer Vision': 'Deep Learning',
      'Biology,Computer Science': 'Bioinformatics',
      'Physics,Computer Science': 'Quantum Computing',
      'Psychology,AI': 'Cognitive Science'
    };
    
    const key1 = `${topic1},${topic2}`;
    const key2 = `${topic2},${topic1}`;
    
    return bridgeMap[key1] || bridgeMap[key2] || 'Interdisciplinary Research';
  }

  // Find influential papers
  findInfluentialPapers(limit = 5) {
    return Object.values(this.citationNetwork)
      .sort((a, b) => b.influence - a.influence)
      .slice(0, limit)
      .map(node => ({
        paper: node.paper,
        influence: node.influence,
        centrality: node.centrality,
        citedBy: node.citedBy.length,
        cites: node.cites.length
      }));
  }

  // Get citation path between two papers
  findCitationPath(startId, endId) {
    const visited = new Set();
    const queue = [{ id: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift();
      
      if (id === endId) {
        return path;
      }
      
      if (visited.has(id)) continue;
      visited.add(id);
      
      const node = this.citationNetwork[id];
      if (!node) continue;
      
      // Add cited papers to queue
      node.cites.forEach(citation => {
        if (!visited.has(citation.cited)) {
          queue.push({
            id: citation.cited,
            path: [...path, citation.cited]
          });
        }
      });
    }
    
    return null; // No path found
  }

  // Suggest papers to fill gaps
  suggestGapFillers(gap) {
    const suggestions = [
      {
        title: `Bridging ${gap.topic1} and ${gap.topic2}: A ${gap.suggestedBridge} Approach`,
        reason: 'Connects disconnected research areas',
        priority: 'high',
        type: 'bridge-paper'
      },
      {
        title: `Comparative Analysis of ${gap.topic1} vs ${gap.topic2} Methodologies`,
        reason: 'Provides comparative perspective',
        priority: 'medium',
        type: 'comparative-study'
      },
      {
        title: `Applications of ${gap.topic1} Techniques in ${gap.topic2}`,
        reason: 'Cross-domain application',
        priority: 'medium',
        type: 'application-paper'
      }
    ];
    
    return suggestions;
  }

  // Generate network statistics
  getNetworkStatistics() {
    const nodes = Object.values(this.citationNetwork);
    const totalCitations = nodes.reduce((sum, node) => sum + node.cites.length, 0);
    const totalNodes = nodes.length;
    
    const density = totalNodes > 1 ? totalCitations / (totalNodes * (totalNodes - 1)) : 0;
    const avgCitations = totalNodes > 0 ? totalCitations / totalNodes : 0;
    
    const isolatedNodes = nodes.filter(node => 
      node.cites.length === 0 && node.citedBy.length === 0
    ).length;
    
    return {
      totalPapers: totalNodes,
      totalCitations: totalCitations,
      networkDensity: (density * 100).toFixed(2),
      averageCitations: avgCitations.toFixed(1),
      isolatedPapers: isolatedNodes,
      knowledgeGaps: this.knowledgeGaps.length
    };
  }
}

// Initialize cross-reference engine
const crossRefEngine = new CrossReferenceEngine();

// UI Functions
function showCitationNetwork() {
  const network = crossRefEngine.buildCitationNetwork(papers);
  const gaps = crossRefEngine.identifyKnowledgeGaps(papers);
  const influential = crossRefEngine.findInfluentialPapers();
  const stats = crossRefEngine.getNetworkStatistics();
  
  const networkContainer = document.getElementById('citationNetwork');
  networkContainer.innerHTML = `
    <div class="network-stats">
      <div class="stat-grid">
        <div class="stat-item">
          <span class="stat-value">${stats.totalPapers}</span>
          <span class="stat-label">Papers</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${stats.totalCitations}</span>
          <span class="stat-label">Citations</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${stats.networkDensity}%</span>
          <span class="stat-label">Density</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${stats.knowledgeGaps}</span>
          <span class="stat-label">Gaps</span>
        </div>
      </div>
    </div>

    <div class="influential-papers">
      <h4>Most Influential Papers</h4>
      ${influential.map(item => `
        <div class="influential-paper">
          <div class="paper-info">
            <strong>${item.paper.title}</strong>
            <p>${item.paper.authors}</p>
          </div>
          <div class="influence-metrics">
            <span class="metric">Cited by: ${item.citedBy}</span>
            <span class="metric">Cites: ${item.cites}</span>
            <span class="metric">Centrality: ${item.centrality}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="knowledge-gaps">
      <h4>Knowledge Gaps</h4>
      ${gaps.slice(0, 5).map(gap => `
        <div class="gap-item">
          <div class="gap-info">
            <strong>${gap.topic1} ↔ ${gap.topic2}</strong>
            <p>Connection strength: ${(gap.connectionStrength * 100).toFixed(0)}%</p>
            <p>Suggested bridge: ${gap.suggestedBridge}</p>
          </div>
          <button onclick="showGapSuggestions('${gap.topic1}', '${gap.topic2}')" class="gap-btn">
            Fill Gap
          </button>
        </div>
      `).join('')}
    </div>

    <div class="citation-graph">
      <h4>Citation Network</h4>
      <div class="graph-container">
        ${Object.values(network).map(node => `
          <div class="network-node" data-paper-id="${node.paper.id}">
            <div class="node-title">${node.paper.title.substring(0, 30)}...</div>
            <div class="node-metrics">
              <span>In: ${node.citedBy.length}</span>
              <span>Out: ${node.cites.length}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function showGapSuggestions(topic1, topic2) {
  const gap = crossRefEngine.knowledgeGaps.find(g => 
    (g.topic1 === topic1 && g.topic2 === topic2) ||
    (g.topic1 === topic2 && g.topic2 === topic1)
  );
  
  if (!gap) return;
  
  const suggestions = crossRefEngine.suggestGapFillers(gap);
  const suggestionsContainer = document.getElementById('gapSuggestions');
  
  suggestionsContainer.innerHTML = `
    <div class="gap-suggestions">
      <h4>Suggested Papers to Fill Gap: ${topic1} ↔ ${topic2}</h4>
      ${suggestions.map(suggestion => `
        <div class="suggestion-card ${suggestion.priority}">
          <div class="suggestion-header">
            <strong>${suggestion.title}</strong>
            <span class="priority-badge">${suggestion.priority}</span>
          </div>
          <p class="suggestion-reason">${suggestion.reason}</p>
          <span class="suggestion-type">${suggestion.type}</span>
        </div>
      `).join('')}
    </div>
  `;
  suggestionsContainer.classList.remove('hidden');
}

function findCitationPath(startId, endId) {
  const path = crossRefEngine.findCitationPath(startId, endId);
  const pathContainer = document.getElementById('citationPath');
  
  if (path) {
    const pathPapers = path.map(id => papers.find(p => p.id === id));
    pathContainer.innerHTML = `
      <div class="citation-path">
        <h4>Citation Path</h4>
        ${pathPapers.map((paper, index) => `
          <div class="path-node">
            <span class="path-number">${index + 1}</span>
            <div class="path-paper">
              <strong>${paper.title}</strong>
              <p>${paper.authors}</p>
            </div>
            ${index < pathPapers.length - 1 ? '<div class="path-arrow">→</div>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  } else {
    pathContainer.innerHTML = '<p>No citation path found between these papers.</p>';
  }
}