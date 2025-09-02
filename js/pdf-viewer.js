// PDF Viewer and Annotation System
class PDFAnnotator {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.scale = 1.0;
        this.currentTool = 'highlight';
        this.currentColor = '#ffff00';
        this.annotations = [];
        this.undoStack = [];
        this.redoStack = [];
        this.isDrawing = false;
        this.lastPosition = null;
        this.currentPenPoints = []; // Track pen drawing points
        
        // Wait for DOM to be fully loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeElements());
        } else {
            this.initializeElements();
        }
    }

    initializeElements() {
        // Get canvas elements
        this.canvas = document.getElementById('pdf-canvas');
        this.annotationCanvas = document.getElementById('annotation-canvas');
        this.notesContainer = document.getElementById('notes-container');
        
        // Check if elements exist
        if (!this.canvas || !this.annotationCanvas) {
            console.error('Canvas elements not found!');
            console.log('Available elements:');
            console.log('pdf-canvas:', document.getElementById('pdf-canvas'));
            console.log('annotation-canvas:', document.getElementById('annotation-canvas'));
            console.log('pdf-upload:', document.getElementById('pdf-upload'));
            console.log('pdf-upload-main:', document.getElementById('pdf-upload-main'));
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.annotationCtx = this.annotationCanvas.getContext('2d');
        
        console.log('Canvas elements initialized successfully');
        
        this.initializeEventListeners();
        this.loadSavedAnnotations();
    }

    initializeEventListeners() {
        // File upload handlers - check if elements exist first
        const pdfUpload = document.getElementById('pdf-upload');
        const pdfUploadMain = document.getElementById('pdf-upload-main');
        
        if (pdfUpload) {
            pdfUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        if (pdfUploadMain) {
            pdfUploadMain.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTool(e.target.closest('.tool-btn').dataset.tool));
        });
        
        // Color picker
        const colorPicker = document.getElementById('annotation-color');
        if (colorPicker) {
            colorPicker.addEventListener('change', (e) => {
                this.currentColor = e.target.value;
            });
        }
        
        // Page navigation
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
        
        // Zoom controls
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        if (zoomIn) zoomIn.addEventListener('click', () => this.zoomIn());
        if (zoomOut) zoomOut.addEventListener('click', () => this.zoomOut());
        
        // Action buttons
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        const clearBtn = document.getElementById('clear-all');
        const saveBtn = document.getElementById('save-annotations');
        const exportBtn = document.getElementById('export-annotations');
        
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearAllAnnotations());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveAnnotations());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportAnnotations());
        
        // Canvas interactions
        if (this.annotationCanvas) {
            this.annotationCanvas.addEventListener('mousedown', (e) => this.startAnnotation(e));
            this.annotationCanvas.addEventListener('mousemove', (e) => this.continueAnnotation(e));
            this.annotationCanvas.addEventListener('mouseup', (e) => this.endAnnotation(e));
            this.annotationCanvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            
            // Touch support for mobile
            this.annotationCanvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'));
            this.annotationCanvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'));
            this.annotationCanvas.addEventListener('touchend', (e) => this.handleTouch(e, 'end'));
        }
        
        // Note modal handlers
        const closeModal = document.getElementById('close-note-modal');
        const cancelNote = document.getElementById('cancel-note');
        const saveNote = document.getElementById('save-note');
        
        if (closeModal) closeModal.addEventListener('click', () => this.closeNoteModal());
        if (cancelNote) cancelNote.addEventListener('click', () => this.closeNoteModal());
        if (saveNote) saveNote.addEventListener('click', () => this.saveNote());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async handleFileUpload(event) {
        console.log('File upload triggered');
        const file = event.target.files[0];
        
        if (!file) {
            console.log('No file selected');
            return;
        }
        
        console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }

        try {
            console.log('Starting PDF processing...');
            const arrayBuffer = await file.arrayBuffer();
            console.log('File converted to array buffer');
            
            this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            console.log('PDF document loaded:', this.pdfDoc);
            
            // Update UI elements
            const totalPagesElement = document.getElementById('total-pages');
            const placeholderElement = document.getElementById('pdf-placeholder');
            
            if (totalPagesElement) {
                totalPagesElement.textContent = this.pdfDoc.numPages;
            }
            
            if (placeholderElement) {
                placeholderElement.style.display = 'none';
            }
            
            // Show the canvas container
            const canvasContainer = document.getElementById('pdf-canvas-container');
            if (canvasContainer) {
                canvasContainer.classList.add('show');
                canvasContainer.style.display = 'block';
                console.log('Canvas container shown');
            } else {
                console.error('Canvas container not found!');
            }
            
            this.currentPage = 1;
            await this.renderPage();
            this.clearAnnotations();
            
            console.log('PDF loaded successfully!');
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF file. Please try again. Error: ' + error.message);
        }
    }

    async renderPage() {
        if (!this.pdfDoc) {
            console.log('No PDF document loaded');
            return;
        }

        try {
            console.log('Rendering page:', this.currentPage);
            const page = await this.pdfDoc.getPage(this.currentPage);
            const viewport = page.getViewport({ scale: this.scale });

            console.log('Viewport dimensions:', viewport.width, 'x', viewport.height);

            // Set canvas dimensions
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;
            this.annotationCanvas.width = viewport.width;
            this.annotationCanvas.height = viewport.height;

            // Set canvas display dimensions for proper scaling
            this.canvas.style.width = viewport.width + 'px';
            this.canvas.style.height = viewport.height + 'px';
            this.annotationCanvas.style.width = viewport.width + 'px';
            this.annotationCanvas.style.height = viewport.height + 'px';

            // Clear canvases
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.annotationCtx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);

            // Set white background for PDF canvas
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Render PDF page
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            console.log('Starting page render...');
            const renderTask = page.render(renderContext);
            
            renderTask.promise.then(() => {
                console.log('Page rendered successfully');
                
                // Verify canvas has content
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                const hasContent = imageData.data.some(pixel => pixel !== 0);
                console.log('Canvas has content:', hasContent);
                
                if (!hasContent) {
                    console.warn('Canvas appears empty, trying alternative rendering...');
                    // Try rendering with different parameters
                    this.alternativeRender(page, viewport);
                }
            }).catch((error) => {
                console.error('Render promise failed:', error);
                throw error;
            });

            // Center the canvas wrapper
            const canvasWrapper = document.getElementById('canvas-wrapper');
            if (canvasWrapper) {
                canvasWrapper.style.display = 'block';
                canvasWrapper.style.textAlign = 'center';
                canvasWrapper.style.width = '100%';
            }
            
            // Update page info
            const currentPageElement = document.getElementById('current-page');
            if (currentPageElement) {
                currentPageElement.textContent = this.currentPage;
            }
            
            // Render annotations for current page
            this.renderAnnotations();
            
        } catch (error) {
            console.error('Error rendering page:', error);
            alert('Error rendering PDF page: ' + error.message);
        }
    }

    async alternativeRender(page, viewport) {
        try {
            console.log('Attempting alternative rendering...');
            
            // Clear canvas and set background
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Try rendering with different settings
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport,
                enableWebGL: false,
                renderTextLayer: false
            };
            
            await page.render(renderContext).promise;
            console.log('Alternative rendering completed');
            
        } catch (error) {
            console.error('Alternative rendering failed:', error);
            
            // Last resort: draw a placeholder
            this.drawPlaceholder();
        }
    }

    drawPlaceholder() {
        console.log('Drawing placeholder content...');
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PDF Content Loading...', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Page ' + this.currentPage, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    clearAnnotations() {
        if (this.annotationCtx) {
            this.annotationCtx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);
            console.log('Cleared annotation canvas');
        }
        if (this.notesContainer) {
            this.notesContainer.innerHTML = '';
        }
    }

    selectTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Update cursor
        this.updateCursor();
    }

    updateCursor() {
        const canvas = this.annotationCanvas;
        switch (this.currentTool) {
            case 'highlight':
                canvas.style.cursor = 'text';
                break;
            case 'pen':
                canvas.style.cursor = 'crosshair';
                break;
            case 'note':
                canvas.style.cursor = 'pointer';
                break;
            default:
                canvas.style.cursor = 'default';
        }
    }

    getCanvasPosition(event) {
        const rect = this.annotationCanvas.getBoundingClientRect();
        const scaleX = this.annotationCanvas.width / rect.width;
        const scaleY = this.annotationCanvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    startAnnotation(event) {
        if (this.currentTool === 'note') return;
        
        this.isDrawing = true;
        const pos = this.getCanvasPosition(event);
        this.lastPosition = pos;
        
        // Save state for undo
        this.saveState();
        
        if (this.currentTool === 'pen') {
            // Initialize pen drawing
            this.currentPenPoints = [pos]; // Start with first point
            this.annotationCtx.beginPath();
            this.annotationCtx.moveTo(pos.x, pos.y);
            this.annotationCtx.strokeStyle = this.currentColor;
            this.annotationCtx.lineWidth = 2;
            this.annotationCtx.lineCap = 'round';
            this.annotationCtx.lineJoin = 'round';
            console.log('Started pen drawing at:', pos);
        }
    }

    continueAnnotation(event) {
        if (!this.isDrawing || this.currentTool === 'note') return;
        
        const pos = this.getCanvasPosition(event);
        
        if (this.currentTool === 'pen') {
            // Add point to current pen stroke
            this.currentPenPoints.push(pos);
            this.annotationCtx.lineTo(pos.x, pos.y);
            this.annotationCtx.stroke();
        } else if (['highlight', 'underline', 'strikethrough'].includes(this.currentTool)) {
            // Show preview rectangle
            this.redrawAnnotations();
            this.drawSelectionPreview(this.lastPosition, pos);
        }
    }

    endAnnotation(event) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        const pos = this.getCanvasPosition(event);
        
        if (this.currentTool === 'pen') {
            // Save pen stroke with all collected points
            if (this.currentPenPoints && this.currentPenPoints.length > 0) {
                const annotation = {
                    type: 'pen',
                    page: this.currentPage,
                    color: this.currentColor,
                    points: [...this.currentPenPoints], // Copy the points array
                    lineWidth: 2,
                    timestamp: Date.now()
                };
                this.addAnnotation(annotation);
                console.log('Pen annotation saved with', this.currentPenPoints.length, 'points');
            }
            // Clear current pen points
            this.currentPenPoints = [];
        } else if (['highlight', 'underline', 'strikethrough'].includes(this.currentTool)) {
            // Save selection annotation
            const rect = {
                x: Math.min(this.lastPosition.x, pos.x),
                y: Math.min(this.lastPosition.y, pos.y),
                width: Math.abs(pos.x - this.lastPosition.x),
                height: Math.abs(pos.y - this.lastPosition.y)
            };
            
            if (rect.width > 5 && rect.height > 5) { // Minimum size
                const annotation = {
                    type: this.currentTool,
                    page: this.currentPage,
                    color: this.currentColor,
                    rect: rect,
                    timestamp: Date.now()
                };
                this.addAnnotation(annotation);
            }
        }
        
        this.renderAnnotations();
    }

    handleCanvasClick(event) {
        if (this.currentTool === 'note') {
            const pos = this.getCanvasPosition(event);
            this.showNoteModal(pos);
        }
    }

    showNoteModal(position) {
        this.pendingNotePosition = position;
        const modal = document.getElementById('note-modal');
        modal.classList.add('show');
        document.getElementById('note-text').focus();
    }

    closeNoteModal() {
        const modal = document.getElementById('note-modal');
        modal.classList.remove('show');
        document.getElementById('note-text').value = '';
        this.pendingNotePosition = null;
    }

    saveNote() {
        const text = document.getElementById('note-text').value.trim();
        if (!text || !this.pendingNotePosition) return;
        
        const annotation = {
            type: 'note',
            page: this.currentPage,
            position: this.pendingNotePosition,
            text: text,
            timestamp: Date.now()
        };
        
        this.addAnnotation(annotation);
        this.closeNoteModal();
        this.renderAnnotations();
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation);
        this.updateAnnotationsList();
        this.clearRedoStack();
        console.log('Added annotation:', annotation.type, 'Total annotations:', this.annotations.length);
        
        // Force re-render to ensure annotation appears
        this.renderAnnotations();
    }

    renderAnnotations() {
        // Clear annotation canvas
        this.annotationCtx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);
        
        // Clear notes container
        this.notesContainer.innerHTML = '';
        
        // Render annotations for current page
        this.annotations.filter(ann => ann.page === this.currentPage).forEach(annotation => {
            this.renderAnnotation(annotation);
        });
    }

    renderAnnotation(annotation) {
        switch (annotation.type) {
            case 'highlight':
                this.annotationCtx.fillStyle = this.hexToRgba(annotation.color, 0.3);
                this.annotationCtx.fillRect(annotation.rect.x, annotation.rect.y, annotation.rect.width, annotation.rect.height);
                break;
                
            case 'underline':
                this.annotationCtx.strokeStyle = annotation.color;
                this.annotationCtx.lineWidth = 2;
                this.annotationCtx.beginPath();
                this.annotationCtx.moveTo(annotation.rect.x, annotation.rect.y + annotation.rect.height);
                this.annotationCtx.lineTo(annotation.rect.x + annotation.rect.width, annotation.rect.y + annotation.rect.height);
                this.annotationCtx.stroke();
                break;
                
            case 'strikethrough':
                this.annotationCtx.strokeStyle = annotation.color;
                this.annotationCtx.lineWidth = 2;
                this.annotationCtx.beginPath();
                this.annotationCtx.moveTo(annotation.rect.x, annotation.rect.y + annotation.rect.height / 2);
                this.annotationCtx.lineTo(annotation.rect.x + annotation.rect.width, annotation.rect.y + annotation.rect.height / 2);
                this.annotationCtx.stroke();
                break;
                
            case 'pen':
                if (annotation.points && annotation.points.length > 0) {
                    this.annotationCtx.strokeStyle = annotation.color;
                    this.annotationCtx.lineWidth = annotation.lineWidth || 2;
                    this.annotationCtx.lineCap = 'round';
                    this.annotationCtx.lineJoin = 'round';
                    this.annotationCtx.beginPath();
                    
                    // Move to first point
                    this.annotationCtx.moveTo(annotation.points[0].x, annotation.points[0].y);
                    
                    // Draw lines to subsequent points
                    for (let i = 1; i < annotation.points.length; i++) {
                        this.annotationCtx.lineTo(annotation.points[i].x, annotation.points[i].y);
                    }
                    
                    this.annotationCtx.stroke();
                    console.log('Rendered pen annotation with', annotation.points.length, 'points');
                }
                break;
                
            case 'note':
                this.renderStickyNote(annotation);
                break;
        }
    }

    renderStickyNote(annotation) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'sticky-note';
        noteDiv.style.left = `${annotation.position.x}px`;
        noteDiv.style.top = `${annotation.position.y}px`;
        
        noteDiv.innerHTML = `
            <div class="note-content">${this.escapeHtml(annotation.text)}</div>
            <div class="note-actions">
                <button class="note-btn" onclick="pdfAnnotator.editNote(${annotation.timestamp})">Edit</button>
                <button class="note-btn" onclick="pdfAnnotator.deleteAnnotation(${annotation.timestamp})">Delete</button>
            </div>
        `;
        
        this.notesContainer.appendChild(noteDiv);
    }

    drawSelectionPreview(start, end) {
        const rect = {
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y)
        };
        
        this.annotationCtx.strokeStyle = this.currentColor;
        this.annotationCtx.lineWidth = 1;
        this.annotationCtx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }

    redrawAnnotations() {
        this.annotationCtx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);
        this.annotations.filter(ann => ann.page === this.currentPage).forEach(annotation => {
            this.renderAnnotation(annotation);
        });
    }

    updateAnnotationsList() {
        const list = document.getElementById('annotations-list');
        
        if (this.annotations.length === 0) {
            list.innerHTML = '<p class="no-annotations">No annotations yet. Start highlighting or adding notes!</p>';
            return;
        }
        
        list.innerHTML = '';
        
        // Group annotations by page
        const annotationsByPage = {};
        this.annotations.forEach(ann => {
            if (!annotationsByPage[ann.page]) {
                annotationsByPage[ann.page] = [];
            }
            annotationsByPage[ann.page].push(ann);
        });
        
        // Render annotations list
        Object.keys(annotationsByPage).sort((a, b) => parseInt(a) - parseInt(b)).forEach(page => {
            annotationsByPage[page].forEach(annotation => {
                const item = document.createElement('div');
                item.className = 'annotation-item fade-in';
                
                let content = '';
                switch (annotation.type) {
                    case 'note':
                        content = annotation.text;
                        break;
                    case 'highlight':
                        content = 'Highlighted text';
                        break;
                    case 'underline':
                        content = 'Underlined text';
                        break;
                    case 'strikethrough':
                        content = 'Strikethrough text';
                        break;
                    case 'pen':
                        content = 'Pen drawing';
                        break;
                }
                
                item.innerHTML = `
                    <div class="annotation-main" onclick="pdfAnnotator.goToAnnotation(${annotation.timestamp})">
                        <div class="annotation-type">${annotation.type.charAt(0).toUpperCase() + annotation.type.slice(1)}</div>
                        <div class="annotation-content">${this.escapeHtml(content)}</div>
                        <div class="annotation-page">Page ${annotation.page}</div>
                    </div>
                    <div class="annotation-actions">
                        ${annotation.type === 'note' ? `
                            <button class="annotation-edit-btn" onclick="pdfAnnotator.editNote(${annotation.timestamp})" title="Edit note">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        <button class="annotation-delete-btn" onclick="pdfAnnotator.deleteAnnotation(${annotation.timestamp})" title="Delete annotation">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                list.appendChild(item);
            });
        });
    }

    goToAnnotation(timestamp) {
        const annotation = this.annotations.find(ann => ann.timestamp === timestamp);
        if (!annotation) return;
        
        if (this.currentPage !== annotation.page) {
            this.currentPage = annotation.page;
            this.renderPage();
        }
        
        // Highlight the annotation briefly
        // Implementation for visual feedback
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPage();
        }
    }

    nextPage() {
        if (this.pdfDoc && this.currentPage < this.pdfDoc.numPages) {
            this.currentPage++;
            this.renderPage();
        }
    }

    zoomIn() {
        this.scale = Math.min(this.scale * 1.2, 3.0);
        document.getElementById('zoom-level').textContent = Math.round(this.scale * 100) + '%';
        this.renderPage();
    }

    zoomOut() {
        this.scale = Math.max(this.scale / 1.2, 0.5);
        document.getElementById('zoom-level').textContent = Math.round(this.scale * 100) + '%';
        this.renderPage();
    }

    saveState() {
        this.undoStack.push(JSON.parse(JSON.stringify(this.annotations)));
        if (this.undoStack.length > 50) { // Limit undo stack size
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length > 0) {
            this.redoStack.push(JSON.parse(JSON.stringify(this.annotations)));
            this.annotations = this.undoStack.pop();
            this.renderAnnotations();
            this.updateAnnotationsList();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            this.undoStack.push(JSON.parse(JSON.stringify(this.annotations)));
            this.annotations = this.redoStack.pop();
            this.renderAnnotations();
            this.updateAnnotationsList();
        }
    }

    clearRedoStack() {
        this.redoStack = [];
    }

    clearAllAnnotations() {
        if (confirm('Are you sure you want to clear all annotations? This action cannot be undone.')) {
            this.saveState();
            this.annotations = [];
            this.renderAnnotations();
            this.updateAnnotationsList();
        }
    }

    deleteAnnotation(timestamp) {
        // Find the annotation to show confirmation
        const annotation = this.annotations.find(ann => ann.timestamp === timestamp);
        if (!annotation) return;
        
        const confirmMessage = `Delete this ${annotation.type}${annotation.text ? ` note: "${annotation.text.substring(0, 50)}${annotation.text.length > 50 ? '...' : ''}"` : ''}?`;
        
        if (confirm(confirmMessage)) {
            this.saveState();
            this.annotations = this.annotations.filter(ann => ann.timestamp !== timestamp);
            this.renderAnnotations();
            this.updateAnnotationsList();
            this.showMessage('Annotation deleted successfully', 'success');
        }
    }

    editNote(timestamp) {
        const annotation = this.annotations.find(ann => ann.timestamp === timestamp);
        if (annotation && annotation.type === 'note') {
            document.getElementById('note-text').value = annotation.text;
            this.pendingNotePosition = annotation.position;
            this.pendingNoteTimestamp = timestamp;
            document.getElementById('note-modal').classList.add('show');
        }
    }

    saveAnnotations() {
        const data = {
            annotations: this.annotations,
            timestamp: Date.now()
        };
        
        localStorage.setItem('pdf_annotations', JSON.stringify(data));
        
        // Show success message
        this.showMessage('Annotations saved successfully!', 'success');
    }

    loadSavedAnnotations() {
        const saved = localStorage.getItem('pdf_annotations');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.annotations = data.annotations || [];
                this.updateAnnotationsList();
            } catch (error) {
                console.error('Error loading saved annotations:', error);
            }
        }
    }

    async exportAnnotations() {
        console.log('Export annotations called');
        
        if (!this.pdfDoc) {
            this.showMessage('Please load a PDF first before exporting', 'error');
            return;
        }

        try {
            this.showMessage('Generating annotated PDF...', 'info');
            console.log('Starting PDF generation with html2canvas approach');
            
            // Create a temporary container for each page
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = '-9999px';
            tempContainer.style.left = '-9999px';
            tempContainer.style.background = 'white';
            document.body.appendChild(tempContainer);
            
            // Initialize jsPDF
            const { jsPDF } = window.jspdf || { jsPDF: window.jsPDF };
            if (!jsPDF) {
                throw new Error('jsPDF library not available');
            }
            
            const pdf = new jsPDF();
            pdf.deletePage(1); // Remove default page
            
            // Process each page
            for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
                console.log(`Processing page ${pageNum} of ${this.pdfDoc.numPages}`);
                
                const page = await this.pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                
                // Create canvas for this page
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = viewport.width + 'px';
                canvas.style.height = viewport.height + 'px';
                
                // Set white background
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                // Render PDF page
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                // Add annotations overlay
                const pageAnnotations = this.annotations.filter(ann => ann.page === pageNum);
                if (pageAnnotations.length > 0) {
                    this.renderAnnotationsToCanvas(context, pageAnnotations, viewport.width, viewport.height, 1.5);
                }
                
                // Add canvas to temp container
                tempContainer.innerHTML = '';
                tempContainer.appendChild(canvas);
                
                // Convert to image using html2canvas
                const canvasImage = await html2canvas(tempContainer, {
                    backgroundColor: 'white',
                    scale: 1,
                    useCORS: true,
                    allowTaint: true
                });
                
                // Get image data
                const imgData = canvasImage.toDataURL('image/jpeg', 0.95);
                
                // Calculate PDF dimensions
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvasImage.height * imgWidth) / canvasImage.width;
                
                // Add page to PDF
                pdf.addPage([imgWidth, imgHeight]);
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
                
                console.log(`Page ${pageNum} added to PDF`);
            }
            
            // Clean up
            document.body.removeChild(tempContainer);
            
            // Save the PDF
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `annotated_pdf_${timestamp}.pdf`;
            
            pdf.save(filename);
            
            this.showMessage('Annotated PDF exported successfully!', 'success');
            console.log('PDF export completed successfully');
            
        } catch (error) {
            console.error('Error exporting annotated PDF:', error);
            this.showMessage('PDF export failed, trying alternative method...', 'warning');
            
            // Always try simple PDF approach - NEVER JSON
            this.simpleExportPDF();
        }
    }

    simpleExportPDF() {
        try {
            console.log('Trying simple PDF export method');
            
            // Check for jsPDF
            const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
            if (!jsPDF) {
                throw new Error('jsPDF not available');
            }
            
            const pdf = new jsPDF();
            
            // Add title page with annotation summary
            pdf.setFontSize(20);
            pdf.text('PDF Annotations Export', 20, 20);
            
            pdf.setFontSize(12);
            pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 40);
            pdf.text(`Total Annotations: ${this.annotations.length}`, 20, 50);
            
            let yPosition = 70;
            
            // Add annotation details
            this.annotations.forEach((annotation, index) => {
                if (yPosition > 280) {
                    pdf.addPage();
                    yPosition = 20;
                }
                
                pdf.text(`${index + 1}. Page ${annotation.page} - ${annotation.type}`, 20, yPosition);
                
                if (annotation.text) {
                    const lines = pdf.splitTextToSize(annotation.text, 170);
                    pdf.text(lines, 25, yPosition + 10);
                    yPosition += lines.length * 5 + 15;
                } else {
                    yPosition += 15;
                }
            });
            
            // Save the PDF
            const timestamp = new Date().toISOString().split('T')[0];
            pdf.save(`annotations_summary_${timestamp}.pdf`);
            
            this.showMessage('Annotations summary exported as PDF!', 'success');
            
        } catch (error) {
            console.error('Simple PDF export also failed:', error);
            this.showMessage('PDF export failed. Creating basic PDF with annotation text...', 'warning');
            this.createBasicPDF();
        }
    }

    createBasicPDF() {
        try {
            console.log('Creating basic PDF as final fallback');
            
            // Force create a PDF no matter what
            const doc = document.createElement('div');
            doc.innerHTML = `
                <h1>PDF Annotations Export</h1>
                <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Total Annotations:</strong> ${this.annotations.length}</p>
                <hr>
            `;
            
            if (this.annotations.length > 0) {
                this.annotations.forEach((annotation, index) => {
                    doc.innerHTML += `
                        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc;">
                            <strong>Annotation ${index + 1}</strong><br>
                            Page: ${annotation.page}<br>
                            Type: ${annotation.type}<br>
                            ${annotation.text ? `Text: ${annotation.text}` : ''}
                            ${annotation.color ? `Color: ${annotation.color}` : ''}
                        </div>
                    `;
                });
            } else {
                doc.innerHTML += '<p>No annotations found in this document.</p>';
            }
            
            // Use browser's print functionality to save as PDF
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>PDF Annotations Export</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        hr { margin: 20px 0; }
                        div { page-break-inside: avoid; }
                    </style>
                </head>
                <body>
                    ${doc.innerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
            
            this.showMessage('Please use browser Print > Save as PDF to download', 'info');
            
        } catch (error) {
            console.error('Even basic PDF creation failed:', error);
            // As absolute last resort, force a simple PDF download
            this.forceSimplePDF();
        }
    }

    forceSimplePDF() {
        try {
            // Create the simplest possible PDF using data URI
            const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(PDF Export - ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
279
%%EOF`;

            const blob = new Blob([pdfContent], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `annotations_export_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Basic PDF exported successfully!', 'success');
            
        } catch (error) {
            console.error('All PDF methods failed:', error);
            this.showMessage('PDF export not available. Please try refreshing the page.', 'error');
        }
    }

    renderAnnotationsToCanvas(ctx, annotations, canvasWidth, canvasHeight, scale = 1.0) {
        annotations.forEach(annotation => {
            switch (annotation.type) {
                case 'highlight':
                    ctx.fillStyle = this.hexToRgba(annotation.color, 0.3);
                    ctx.fillRect(
                        annotation.rect.x * scale, 
                        annotation.rect.y * scale, 
                        annotation.rect.width * scale, 
                        annotation.rect.height * scale
                    );
                    break;
                    
                case 'underline':
                    ctx.strokeStyle = annotation.color;
                    ctx.lineWidth = 2 * scale;
                    ctx.beginPath();
                    ctx.moveTo(
                        annotation.rect.x * scale, 
                        (annotation.rect.y + annotation.rect.height) * scale
                    );
                    ctx.lineTo(
                        (annotation.rect.x + annotation.rect.width) * scale, 
                        (annotation.rect.y + annotation.rect.height) * scale
                    );
                    ctx.stroke();
                    break;
                    
                case 'strikethrough':
                    ctx.strokeStyle = annotation.color;
                    ctx.lineWidth = 2 * scale;
                    ctx.beginPath();
                    ctx.moveTo(
                        annotation.rect.x * scale, 
                        (annotation.rect.y + annotation.rect.height / 2) * scale
                    );
                    ctx.lineTo(
                        (annotation.rect.x + annotation.rect.width) * scale, 
                        (annotation.rect.y + annotation.rect.height / 2) * scale
                    );
                    ctx.stroke();
                    break;
                    
                case 'pen':
                    if (annotation.points && annotation.points.length > 0) {
                        ctx.strokeStyle = annotation.color;
                        ctx.lineWidth = (annotation.lineWidth || 2) * scale;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.beginPath();
                        
                        ctx.moveTo(annotation.points[0].x * scale, annotation.points[0].y * scale);
                        for (let i = 1; i < annotation.points.length; i++) {
                            ctx.lineTo(annotation.points[i].x * scale, annotation.points[i].y * scale);
                        }
                        ctx.stroke();
                    }
                    break;
                    
                case 'note':
                    // Draw note icon
                    const noteX = annotation.position.x * scale;
                    const noteY = annotation.position.y * scale;
                    const noteSize = 20 * scale;
                    
                    // Note background
                    ctx.fillStyle = annotation.color || '#fbbf24';
                    ctx.fillRect(noteX, noteY, noteSize, noteSize);
                    
                    // Note border
                    ctx.strokeStyle = '#92400e';
                    ctx.lineWidth = 1 * scale;
                    ctx.strokeRect(noteX, noteY, noteSize, noteSize);
                    
                    // Note text (simplified - just first few characters)
                    ctx.fillStyle = '#92400e';
                    ctx.font = `${10 * scale}px Arial`;
                    const noteText = annotation.text.substring(0, 2);
                    ctx.fillText(noteText, noteX + 2 * scale, noteY + 12 * scale);
                    break;
            }
        });
    }

    showMessage(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = '#10b981';
                break;
            case 'error':
                backgroundColor = '#ef4444';
                break;
            case 'warning':
                backgroundColor = '#f59e0b';
                break;
            default:
                backgroundColor = '#3b82f6';
        }
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${backgroundColor};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000); // Show errors longer
    }

    // Touch event handlers for mobile support
    handleTouch(event, phase) {
        event.preventDefault();
        
        const touch = event.touches[0] || event.changedTouches[0];
        const mouseEvent = new MouseEvent(phase === 'start' ? 'mousedown' : phase === 'move' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        
        this.annotationCanvas.dispatchEvent(mouseEvent);
    }

    // Keyboard shortcuts
    handleKeyboard(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 's':
                    event.preventDefault();
                    this.saveAnnotations();
                    break;
            }
        }
        
        // Tool shortcuts
        switch (event.key) {
            case '1':
                this.selectTool('highlight');
                break;
            case '2':
                this.selectTool('underline');
                break;
            case '3':
                this.selectTool('strikethrough');
                break;
            case '4':
                this.selectTool('pen');
                break;
            case '5':
                this.selectTool('note');
                break;
        }
    }

    // Helper functions
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the PDF Annotator when the page loads
let pdfAnnotator;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing PDF Annotator');
    
    // Check if PDF.js is loaded
    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library not loaded!');
        alert('PDF.js library failed to load. Please refresh the page and try again.');
        return;
    }
    
    // Check if jsPDF is loaded
    setTimeout(() => {
        console.log('Checking jsPDF availability...');
        console.log('window.jspdf:', typeof window.jspdf);
        console.log('window.jsPDF:', typeof window.jsPDF);
        
        if (window.jspdf && window.jspdf.jsPDF) {
            console.log('✅ jsPDF loaded successfully via window.jspdf.jsPDF');
        } else if (window.jsPDF) {
            console.log('✅ jsPDF loaded successfully via window.jsPDF');
        } else {
            console.warn('⚠️ jsPDF library not detected - PDF export will fall back to summary');
        }
        
        // Test html2canvas
        if (typeof html2canvas !== 'undefined') {
            console.log('✅ html2canvas loaded successfully');
        } else {
            console.warn('⚠️ html2canvas not loaded - using fallback method');
        }
    }, 2000); // Check after 2 seconds to allow libraries to load
    
    // Set PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js worker configured');
    
    // Initialize the annotator
    try {
        pdfAnnotator = new PDFAnnotator();
        console.log('PDF Annotator initialized successfully');
    } catch (error) {
        console.error('Error initializing PDF Annotator:', error);
        alert('Failed to initialize PDF Annotator. Please refresh the page.');
    }
    
    // Add CSS for toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .sticky-note {
            pointer-events: auto !important;
        }
        .note-content {
            pointer-events: auto !important;
        }
    `;
    document.head.appendChild(style);
});
// js/pdf-viewer.js me, end me ya annotation logic ke paas paste karein

// Example: annotations array
let annotations = []; // Use your actual annotation data structure

// Export Annotations
document.getElementById('export-annotations').onclick = function() {
    const data = JSON.stringify(annotations, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    a.click();
    URL.revokeObjectURL(url);
};

// Import Annotations
document.getElementById('import-annotations').onclick = function() {
    document.getElementById('import-annotations-file').click();
};

document.getElementById('import-annotations-file').onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (Array.isArray(data)) {
                annotations = data;
                // TODO: Render annotations on PDF
                alert('Annotations imported!');
            } else {
                alert('Invalid file format!');
            }
        } catch (err) {
            alert('Invalid file!');
        }
    };
    reader.readAsText(file);
};


async function saveAnnotationsToServer(paperId, annotations) {
  try {
    const response = await fetch(`/api/research-papers/${paperId}/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotations })
    });
    if (!response.ok) throw new Error("Failed to save annotations");
    return await response.json();
  } catch (err) {
    alert("Error saving annotations: " + err.message);
  }
}