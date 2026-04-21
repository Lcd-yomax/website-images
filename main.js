import { images } from './imageData.js';

const galleryGrid = document.getElementById('gallery-grid');
const searchInput = document.getElementById('searchInput');
const imageCount = document.getElementById('imageCount');

// Render function
function renderGallery(imagesToRender) {
  galleryGrid.innerHTML = '';
  
  if (imagesToRender.length === 0) {
    galleryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p>No images found matching your search.</p>
      </div>
    `;
    imageCount.textContent = `0 / ${images.length} images`;
    return;
  }
  
  imageCount.textContent = `${imagesToRender.length} images`;
  
  imagesToRender.forEach((img, index) => {
    // Staggered animation delay
    const animationDelay = Math.min(index * 0.05, 1); // Max 1s delay
    
    const card = document.createElement('div');
    card.className = 'image-card';
    card.style.animationDelay = `${animationDelay}s`;
    
    card.innerHTML = `
      <div class="image-container">
        <img src="${img.url}" alt="${img.displayName}" loading="lazy" />
      </div>
      <div class="image-info">
        <h3 class="image-name" title="${img.displayName}">${img.displayName}</h3>
        <span class="image-ext">.${img.extension}</span>
      </div>
    `;
    
    // Add load event listener to fade in image
    const imgElement = card.querySelector('img');
    if (imgElement.complete) {
      imgElement.classList.add('loaded');
    } else {
      imgElement.addEventListener('load', () => {
        imgElement.classList.add('loaded');
      });
    }
    
    galleryGrid.appendChild(card);
  });
}

// Initial render
renderGallery(images);

// Search functionality
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  const filteredImages = images.filter(img => 
    img.fileName.toLowerCase().includes(searchTerm)
  );
  
  renderGallery(filteredImages);
});
