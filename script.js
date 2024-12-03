const upload = document.getElementById('upload');
const box1 = document.getElementById('box1');
const box2 = document.getElementById('box2');

// Add input for multiple images
const multipleUpload = document.createElement('input');
multipleUpload.type = 'file';
multipleUpload.multiple = true;
multipleUpload.id = 'multipleUpload';
box2.parentElement.insertBefore(multipleUpload, box2);

const createImageWrapper = (readerResult) => {
  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('image-wrapper');
  imgWrapper.innerHTML = `
    <img src="${readerResult}" alt="Uploaded">
    <div class="delete-button">×</div>
    <div class="resize-handle top-left"></div>
    <div class="resize-handle top-right"></div>
    <div class="resize-handle bottom-left"></div>
    <div class="resize-handle bottom-right"></div>
  `;
  
  // Add delete functionality
  const deleteButton = imgWrapper.querySelector('.delete-button');
  deleteButton.addEventListener('click', () => {
    imgWrapper.remove();
  });
  
  return imgWrapper;
};

function enableDragAndResize(imgWrapper, box) {
  let isDragging = false, startX, startY, offsetX, offsetY, isResizing = false, initialWidth, initialHeight;

  imgWrapper.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resize-handle')) {
      isResizing = true;
      initialWidth = imgWrapper.offsetWidth;
      initialHeight = imgWrapper.offsetHeight;
      startX = e.clientX;
      startY = e.clientY;
    } else if (!e.target.classList.contains('delete-button')) {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      startX = e.clientX;
      startY = e.clientY;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const boxRect = box.getBoundingClientRect();
      const newX = e.clientX - boxRect.left - offsetX;
      const newY = e.clientY - boxRect.top - offsetY;
      
      imgWrapper.style.left = `${newX}px`;
      imgWrapper.style.top = `${newY}px`;
    }

    if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newWidth = initialWidth + dx;
      const newHeight = initialHeight + dy;
      
      imgWrapper.style.width = `${newWidth}px`;
      imgWrapper.style.height = `${newHeight}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });
}

// Single image upload handler
upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imgWrapper = createImageWrapper(reader.result);
    box1.innerHTML = '';
    box1.appendChild(imgWrapper);

    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let defaultWidth, defaultHeight;
      if (aspectRatio > 1) {
        defaultWidth = 200;
        defaultHeight = 200 / aspectRatio;
      } else {
        defaultHeight = 200;
        defaultWidth = 200 * aspectRatio;
      }

      imgWrapper.style.width = `${defaultWidth}px`;
      imgWrapper.style.height = `${defaultHeight}px`;
      imgWrapper.querySelector('img').style.width = '100%';
      imgWrapper.querySelector('img').style.height = '100%';
    };
    img.src = reader.result;

    enableDragAndResize(imgWrapper, box1);
  };
  reader.readAsDataURL(file);
});

// Multiple image upload handler
multipleUpload.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  let xOffset = 10;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const imgWrapper = createImageWrapper(reader.result);

      imgWrapper.style.width = '200px';
      imgWrapper.style.height = '200px';
      imgWrapper.style.left = `${xOffset}px`;
      imgWrapper.style.top = '10px';
      
      xOffset += 210;

      box2.appendChild(imgWrapper);

      const img = imgWrapper.querySelector('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';

      enableDragAndResize(imgWrapper, box2);
    };
    reader.readAsDataURL(file);
  });
});