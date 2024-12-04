const upload = document.getElementById('upload');
const box1 = document.getElementById('box1');
const backgroundImage = box1.querySelector('.background-image');

function createPoint() {
    const point = document.createElement('div');
    point.classList.add('resize-point');
    return point;
}

function createCropWindow() {
    const cropWindow = document.createElement('div');
    cropWindow.classList.add('crop-window');
    
    // Create corner points
    const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
    corners.forEach(position => {
        const point = createPoint();
        point.classList.add(position);
        cropWindow.appendChild(point);
    });
    
    // Create containers for edge points
    const edges = ['top', 'right', 'bottom', 'left'];
    edges.forEach(edge => {
        const container = document.createElement('div');
        container.classList.add(`${edge}-edge-points`);
        cropWindow.appendChild(container);
    });
    
    return cropWindow;
}

function updateEdgePoints(cropWindow) {
    const width = cropWindow.offsetWidth;
    const height = cropWindow.offsetHeight;
    const threshold = 100; // Distance threshold for adding new points
    
    // Update top and bottom edge points
    ['top', 'bottom'].forEach(edge => {
        const container = cropWindow.querySelector(`.${edge}-edge-points`);
        const numPoints = Math.floor(width / threshold) - 1;
        
        // Remove existing points
        container.innerHTML = '';
        
        // Add new points
        for (let i = 1; i <= numPoints; i++) {
            const point = createPoint();
            const position = (i * threshold) / width * 100;
            point.style.left = `${position}%`;
            container.appendChild(point);
        }
    });
    
    // Update left and right edge points
    ['left', 'right'].forEach(edge => {
        const container = cropWindow.querySelector(`.${edge}-edge-points`);
        const numPoints = Math.floor(height / threshold) - 1;
        
        // Remove existing points
        container.innerHTML = '';
        
        // Add new points
        for (let i = 1; i <= numPoints; i++) {
            const point = createPoint();
            const position = (i * threshold) / height * 100;
            point.style.top = `${position}%`;
            container.appendChild(point);
        }
    });
}

function enableDragAndResize(cropWindow, box) {
    let isDragging = false, startX, startY, offsetX, offsetY, isResizing = false, initialWidth, initialHeight;

    cropWindow.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-point')) {
            if (e.target.classList.contains('top-left') || 
                e.target.classList.contains('top-right') || 
                e.target.classList.contains('bottom-left') || 
                e.target.classList.contains('bottom-right')) {
                isResizing = true;
                initialWidth = cropWindow.offsetWidth;
                initialHeight = cropWindow.offsetHeight;
                startX = e.clientX;
                startY = e.clientY;
            }
        } else {
            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            startX = e.clientX;
            startY = e.clientY;
        }
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const boxRect = box.getBoundingClientRect();
            let newX = e.clientX - boxRect.left - offsetX;
            let newY = e.clientY - boxRect.top - offsetY;
            
            // Constrain movement within box boundaries
            newX = Math.max(0, Math.min(newX, box.offsetWidth - cropWindow.offsetWidth));
            newY = Math.max(0, Math.min(newY, box.offsetHeight - cropWindow.offsetHeight));
            
            cropWindow.style.left = `${newX}px`;
            cropWindow.style.top = `${newY}px`;
        }

        if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // Calculate new dimensions
            let newWidth = initialWidth + dx;
            let newHeight = initialHeight + dy;
            
            // Apply minimum size constraint
            const minSize = 50;
            newWidth = Math.max(minSize, newWidth);
            newHeight = Math.max(minSize, newHeight);
            
            // Constrain resize within box boundaries
            const maxWidth = box.offsetWidth - cropWindow.offsetLeft;
            const maxHeight = box.offsetHeight - cropWindow.offsetTop;
            newWidth = Math.min(newWidth, maxWidth);
            newHeight = Math.min(newHeight, maxHeight);
            
            cropWindow.style.width = `${newWidth}px`;
            cropWindow.style.height = `${newHeight}px`;
            
            // Update edge points
            updateEdgePoints(cropWindow);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
    });
}

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        // Set background image
        backgroundImage.style.backgroundImage = `url(${reader.result})`;
        
        // Clear existing crop window if any
        const existingCropWindow = box1.querySelector('.crop-window');
        if (existingCropWindow) {
            existingCropWindow.remove();
        }
        
        // Create and add new crop window
        const cropWindow = createCropWindow();
        box1.appendChild(cropWindow);
        
        // Set initial size and position
        cropWindow.style.width = '200px';
        cropWindow.style.height = '200px';
        cropWindow.style.left = `${(box1.offsetWidth - 200) / 2}px`;
        cropWindow.style.top = `${(box1.offsetHeight - 200) / 2}px`;
        
        // Initialize edge points
        updateEdgePoints(cropWindow);
        
        // Enable drag and resize functionality
        enableDragAndResize(cropWindow, box1);
    };
    reader.readAsDataURL(file);
});