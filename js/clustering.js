// Smart Paper Clustering & Relationship Mapping
class PaperClusteringEngine {
  constructor() {
    this.clusters = [];
    this.relationships = [];
  }

  // Calculate semantic similarity between two papers
  calculateSimilarity(paper1, paper2) {
    const text1 = `${paper1.title} ${paper1.abstract || ''} ${paper1.tags.join(' ')}`.toLowerCase();
    const text2 = `${paper2.title} ${paper2.abstract || ''} ${paper2.tags.join(' ')}`.toLowerCase();
    
    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  // Cluster papers using similarity threshold
  clusterPapers(papers, threshold = 0.3) {
    this.clusters = [];
    const visited = new Set();

    papers.forEach(paper => {
      if (visited.has(paper.id)) return;

      const cluster = {
        id: Date.now() + Math.random(),
        papers: [paper],
        centroid: paper,
        topic: this.extractMainTopic(paper)
      };

      papers.forEach(otherPaper => {
        if (paper.id !== otherPaper.id && !visited.has(otherPaper.id)) {
          const similarity = this.calculateSimilarity(paper, otherPaper);
          if (similarity > threshold) {
            cluster.papers.push(otherPaper);
            visited.add(otherPaper.id);
          }
        }
      });

      visited.add(paper.id);
      this.clusters.push(cluster);
    });

    return this.clusters;
  }

  // Extract main topic from paper
  extractMainTopic(paper) {
    const commonWords = ['machine', 'learning', 'deep', 'neural', 'network', 'algorithm', 'data', 'analysis'];
    const text = `${paper.title} ${paper.abstract || ''}`.toLowerCase();
    
    for (const word of commonWords) {
      if (text.includes(word)) return word;
    }
    return paper.topic || 'general';
  }

  // Build relationship network
  buildRelationshipNetwork(papers) {
    this.relationships = [];
    
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const similarity = this.calculateSimilarity(papers[i], papers[j]);
        if (similarity > 0.2) {
          this.relationships.push({
            source: papers[i].id,
            target: papers[j].id,
            strength: similarity,
            type: similarity > 0.5 ? 'strong' : 'weak'
          });
        }
      }
    }
    return this.relationships;
  }

  // Get related papers for a specific paper
  getRelatedPapers(paperId, papers, limit = 5) {
    const targetPaper = papers.find(p => p.id === paperId);
    if (!targetPaper) return [];

    const similarities = papers
      .filter(p => p.id !== paperId)
      .map(paper => ({
        paper,
        similarity: this.calculateSimilarity(targetPaper, paper)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities;
  }
}

// Initialize clustering engine
const clusteringEngine = new PaperClusteringEngine();

// UI Functions
function showClusterView() {
  const clusters = clusteringEngine.clusterPapers(papers);
  const clusterContainer = document.getElementById('clusterView');
  
  clusterContainer.innerHTML = clusters.map(cluster => `
    <div class="cluster-card">
      <h3>Cluster: ${cluster.topic} (${cluster.papers.length} papers)</h3>
      <div class="cluster-papers">
        ${cluster.papers.map(paper => `
          <div class="mini-paper-card" onclick="selectPaper(${paper.id})">
            <strong>${paper.title}</strong>
            <p>${paper.authors}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function showRelationshipNetwork() {
  const relationships = clusteringEngine.buildRelationshipNetwork(papers);
  const networkContainer = document.getElementById('networkView');
  
  // Simple network visualization
  networkContainer.innerHTML = `
    <div class="network-stats">
      <p>Total Connections: ${relationships.length}</p>
      <p>Strong Connections: ${relationships.filter(r => r.type === 'strong').length}</p>
    </div>
    <div class="network-graph">
      ${relationships.map(rel => {
        const source = papers.find(p => p.id === rel.source);
        const target = papers.find(p => p.id === rel.target);
        return `
          <div class="connection ${rel.type}">
            <span>${source?.title.substring(0, 30)}...</span>
            <span class="arrow">→</span>
            <span>${target?.title.substring(0, 30)}...</span>
            <span class="strength">${(rel.strength * 100).toFixed(1)}%</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showRelatedPapers(paperId) {
  const related = clusteringEngine.getRelatedPapers(paperId, papers);
  const relatedContainer = document.getElementById('relatedPapers');
  
  relatedContainer.innerHTML = `
    <h4>Related Papers</h4>
    ${related.map(item => `
      <div class="related-paper" onclick="selectPaper(${item.paper.id})">
        <strong>${item.paper.title}</strong>
        <span class="similarity">${(item.similarity * 100).toFixed(1)}% similar</span>
      </div>
    `).join('')}
  `;
}