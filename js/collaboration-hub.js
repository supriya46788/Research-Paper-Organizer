// Research Collaboration Hub
class CollaborationHub {
  constructor() {
    this.collaborations = JSON.parse(localStorage.getItem('collaborations') || '{}');
    this.sharedSpaces = JSON.parse(localStorage.getItem('sharedSpaces') || '{}');
    this.annotations = JSON.parse(localStorage.getItem('collaborativeAnnotations') || '{}');
    this.discussions = JSON.parse(localStorage.getItem('discussions') || '{}');
  }

  // Create shared research space
  createSharedSpace(name, description, members = []) {
    const spaceId = Date.now().toString();
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    const space = {
      id: spaceId,
      name,
      description,
      owner: currentUser.email,
      members: [currentUser.email, ...members],
      papers: [],
      created: Date.now(),
      lastActivity: Date.now(),
      permissions: {
        [currentUser.email]: 'admin'
      }
    };
    
    // Set default permissions for members
    members.forEach(member => {
      space.permissions[member] = 'collaborator';
    });
    
    this.sharedSpaces[spaceId] = space;
    this.saveData();
    return space;
  }

  // Add paper to shared space
  addPaperToSpace(spaceId, paperId) {
    const space = this.sharedSpaces[spaceId];
    if (!space) return false;
    
    if (!space.papers.includes(paperId)) {
      space.papers.push(paperId);
      space.lastActivity = Date.now();
      this.saveData();
    }
    return true;
  }

  // Add collaborative annotation
  addAnnotation(paperId, spaceId, annotation, position) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const annotationId = Date.now().toString();
    
    if (!this.annotations[paperId]) {
      this.annotations[paperId] = {};
    }
    
    this.annotations[paperId][annotationId] = {
      id: annotationId,
      spaceId,
      author: currentUser.email,
      authorName: currentUser.name,
      text: annotation,
      position,
      timestamp: Date.now(),
      replies: []
    };
    
    this.saveData();
    return annotationId;
  }

  // Reply to annotation
  replyToAnnotation(paperId, annotationId, reply) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (this.annotations[paperId] && this.annotations[paperId][annotationId]) {
      this.annotations[paperId][annotationId].replies.push({
        id: Date.now().toString(),
        author: currentUser.email,
        authorName: currentUser.name,
        text: reply,
        timestamp: Date.now()
      });
      this.saveData();
      return true;
    }
    return false;
  }

  // Start discussion thread
  startDiscussion(spaceId, paperId, title, content) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const discussionId = Date.now().toString();
    
    if (!this.discussions[spaceId]) {
      this.discussions[spaceId] = {};
    }
    
    this.discussions[spaceId][discussionId] = {
      id: discussionId,
      paperId,
      title,
      author: currentUser.email,
      authorName: currentUser.name,
      content,
      timestamp: Date.now(),
      replies: [],
      status: 'open'
    };
    
    this.saveData();
    return discussionId;
  }

  // Add discussion reply
  addDiscussionReply(spaceId, discussionId, content) {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (this.discussions[spaceId] && this.discussions[spaceId][discussionId]) {
      this.discussions[spaceId][discussionId].replies.push({
        id: Date.now().toString(),
        author: currentUser.email,
        authorName: currentUser.name,
        content,
        timestamp: Date.now()
      });
      this.saveData();
      return true;
    }
    return false;
  }

  // Get shared spaces for current user
  getUserSpaces() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    return Object.values(this.sharedSpaces).filter(space => 
      space.members.includes(currentUser.email)
    );
  }

  // Get space activity feed
  getSpaceActivity(spaceId, limit = 10) {
    const space = this.sharedSpaces[spaceId];
    if (!space) return [];
    
    const activities = [];
    
    // Add paper additions
    space.papers.forEach(paperId => {
      const paper = papers.find(p => p.id === paperId);
      if (paper) {
        activities.push({
          type: 'paper_added',
          timestamp: paper.dateAdded ? new Date(paper.dateAdded).getTime() : Date.now(),
          content: `Paper "${paper.title}" was added to the space`,
          paperId
        });
      }
    });
    
    // Add annotations
    Object.values(this.annotations).forEach(paperAnnotations => {
      Object.values(paperAnnotations).forEach(annotation => {
        if (annotation.spaceId === spaceId) {
          activities.push({
            type: 'annotation',
            timestamp: annotation.timestamp,
            content: `${annotation.authorName} added an annotation`,
            author: annotation.authorName
          });
        }
      });
    });
    
    // Add discussions
    if (this.discussions[spaceId]) {
      Object.values(this.discussions[spaceId]).forEach(discussion => {
        activities.push({
          type: 'discussion',
          timestamp: discussion.timestamp,
          content: `${discussion.authorName} started discussion: "${discussion.title}"`,
          author: discussion.authorName
        });
      });
    }
    
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Invite member to space
  inviteMember(spaceId, email, permission = 'collaborator') {
    const space = this.sharedSpaces[spaceId];
    if (!space) return false;
    
    if (!space.members.includes(email)) {
      space.members.push(email);
      space.permissions[email] = permission;
      space.lastActivity = Date.now();
      this.saveData();
    }
    return true;
  }

  // Remove member from space
  removeMember(spaceId, email) {
    const space = this.sharedSpaces[spaceId];
    if (!space) return false;
    
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (space.permissions[currentUser.email] !== 'admin') return false;
    
    space.members = space.members.filter(member => member !== email);
    delete space.permissions[email];
    space.lastActivity = Date.now();
    this.saveData();
    return true;
  }

  // Get collaboration statistics
  getCollaborationStats(spaceId) {
    const space = this.sharedSpaces[spaceId];
    if (!space) return null;
    
    const spaceAnnotations = Object.values(this.annotations).reduce((count, paperAnnotations) => {
      return count + Object.values(paperAnnotations).filter(ann => ann.spaceId === spaceId).length;
    }, 0);
    
    const spaceDiscussions = this.discussions[spaceId] ? 
      Object.keys(this.discussions[spaceId]).length : 0;
    
    return {
      members: space.members.length,
      papers: space.papers.length,
      annotations: spaceAnnotations,
      discussions: spaceDiscussions,
      lastActivity: space.lastActivity
    };
  }

  // Save data to localStorage
  saveData() {
    localStorage.setItem('collaborations', JSON.stringify(this.collaborations));
    localStorage.setItem('sharedSpaces', JSON.stringify(this.sharedSpaces));
    localStorage.setItem('collaborativeAnnotations', JSON.stringify(this.annotations));
    localStorage.setItem('discussions', JSON.stringify(this.discussions));
  }
}

// Initialize collaboration hub
const collaborationHub = new CollaborationHub();

// UI Functions
function showCollaborationHub() {
  const userSpaces = collaborationHub.getUserSpaces();
  const hubContainer = document.getElementById('collaborationHub');
  
  hubContainer.innerHTML = `
    <div class="collaboration-header">
      <h3>Research Collaboration Hub</h3>
      <button onclick="showCreateSpaceModal()" class="create-space-btn">Create Space</button>
    </div>
    
    <div class="spaces-grid">
      ${userSpaces.map(space => {
        const stats = collaborationHub.getCollaborationStats(space.id);
        return `
          <div class="space-card" onclick="openSpace('${space.id}')">
            <div class="space-header">
              <h4>${space.name}</h4>
              <span class="space-role">${space.permissions[JSON.parse(localStorage.getItem('current_user')).email]}</span>
            </div>
            <p class="space-description">${space.description}</p>
            <div class="space-stats">
              <span>${stats.members} members</span>
              <span>${stats.papers} papers</span>
              <span>${stats.annotations} annotations</span>
            </div>
            <div class="space-activity">
              Last activity: ${new Date(space.lastActivity).toLocaleDateString()}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showCreateSpaceModal() {
  const modalContainer = document.getElementById('createSpaceModal');
  modalContainer.innerHTML = `
    <div class="modal-content">
      <h3>Create Shared Research Space</h3>
      <form id="createSpaceForm">
        <input type="text" id="spaceName" placeholder="Space Name" required>
        <textarea id="spaceDescription" placeholder="Description" required></textarea>
        <input type="email" id="memberEmails" placeholder="Member emails (comma-separated)">
        
        <div class="modal-buttons">
          <button type="submit">Create Space</button>
          <button type="button" onclick="closeCreateSpaceModal()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  modalContainer.classList.remove('hidden');
}

function closeCreateSpaceModal() {
  document.getElementById('createSpaceModal').classList.add('hidden');
}

function openSpace(spaceId) {
  const space = collaborationHub.sharedSpaces[spaceId];
  const activity = collaborationHub.getSpaceActivity(spaceId);
  const discussions = collaborationHub.discussions[spaceId] || {};
  
  const spaceContainer = document.getElementById('spaceView');
  spaceContainer.innerHTML = `
    <div class="space-header">
      <h3>${space.name}</h3>
      <div class="space-actions">
        <button onclick="showInviteModal('${spaceId}')">Invite Member</button>
        <button onclick="showAddPaperModal('${spaceId}')">Add Paper</button>
        <button onclick="startDiscussionModal('${spaceId}')">Start Discussion</button>
      </div>
    </div>
    
    <div class="space-content">
      <div class="space-papers">
        <h4>Shared Papers (${space.papers.length})</h4>
        ${space.papers.map(paperId => {
          const paper = papers.find(p => p.id === paperId);
          return paper ? `
            <div class="shared-paper" onclick="viewCollaborativePaper('${paperId}', '${spaceId}')">
              <strong>${paper.title}</strong>
              <p>${paper.authors}</p>
              <div class="paper-collaboration-stats">
                <span>${getAnnotationCount(paperId, spaceId)} annotations</span>
              </div>
            </div>
          ` : '';
        }).join('')}
      </div>
      
      <div class="space-discussions">
        <h4>Discussions</h4>
        ${Object.values(discussions).map(discussion => `
          <div class="discussion-item" onclick="openDiscussion('${spaceId}', '${discussion.id}')">
            <strong>${discussion.title}</strong>
            <p>by ${discussion.authorName}</p>
            <span>${discussion.replies.length} replies</span>
          </div>
        `).join('')}
      </div>
      
      <div class="space-activity">
        <h4>Recent Activity</h4>
        ${activity.map(item => `
          <div class="activity-item">
            <span class="activity-time">${new Date(item.timestamp).toLocaleDateString()}</span>
            <span class="activity-content">${item.content}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  spaceContainer.classList.remove('hidden');
}

function getAnnotationCount(paperId, spaceId) {
  const paperAnnotations = collaborationHub.annotations[paperId] || {};
  return Object.values(paperAnnotations).filter(ann => ann.spaceId === spaceId).length;
}

function viewCollaborativePaper(paperId, spaceId) {
  const paper = papers.find(p => p.id === paperId);
  const annotations = collaborationHub.annotations[paperId] || {};
  const spaceAnnotations = Object.values(annotations).filter(ann => ann.spaceId === spaceId);
  
  const paperContainer = document.getElementById('collaborativePaper');
  paperContainer.innerHTML = `
    <div class="collaborative-paper-view">
      <div class="paper-content">
        <h3>${paper.title}</h3>
        <p><strong>Authors:</strong> ${paper.authors}</p>
        ${paper.abstract ? `<div class="abstract"><strong>Abstract:</strong> ${paper.abstract}</div>` : ''}
      </div>
      
      <div class="annotations-panel">
        <div class="annotations-header">
          <h4>Collaborative Annotations</h4>
          <button onclick="addAnnotationModal('${paperId}', '${spaceId}')">Add Annotation</button>
        </div>
        
        <div class="annotations-list">
          ${spaceAnnotations.map(annotation => `
            <div class="annotation-item">
              <div class="annotation-header">
                <strong>${annotation.authorName}</strong>
                <span class="annotation-time">${new Date(annotation.timestamp).toLocaleDateString()}</span>
              </div>
              <div class="annotation-text">${annotation.text}</div>
              <div class="annotation-replies">
                ${annotation.replies.map(reply => `
                  <div class="reply-item">
                    <strong>${reply.authorName}:</strong> ${reply.text}
                  </div>
                `).join('')}
                <button onclick="replyToAnnotationModal('${paperId}', '${annotation.id}')">Reply</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  paperContainer.classList.remove('hidden');
}

// Handle form submissions
document.addEventListener('submit', function(e) {
  if (e.target.id === 'createSpaceForm') {
    e.preventDefault();
    
    const name = document.getElementById('spaceName').value;
    const description = document.getElementById('spaceDescription').value;
    const emails = document.getElementById('memberEmails').value
      .split(',').map(email => email.trim()).filter(email => email);
    
    collaborationHub.createSharedSpace(name, description, emails);
    closeCreateSpaceModal();
    showCollaborationHub();
  }
});