import { images } from './imageData.js';
import { db } from './firebase.js';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

const galleryGrid = document.getElementById('gallery-grid');
const searchInput = document.getElementById('searchInput');
const imageCount = document.getElementById('imageCount');

let refsData = {};
let initialized = false;
let currentFilter = '';

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
    const animationDelay = Math.min(index * 0.05, 1);

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
        <div class="ref-field">
          <label class="ref-label">Référence interne</label>
          <div class="ref-input-wrapper"></div>
        </div>
      </div>
    `;

    // Build input separately — filenames may contain quotes or special chars
    const refInput = document.createElement('input');
    refInput.type = 'text';
    refInput.className = 'ref-input';
    refInput.placeholder = 'Ajouter une référence...';
    refInput.value = refsData[img.fileName] || '';
    refInput.dataset.filename = img.fileName;

    const statusEl = document.createElement('span');
    statusEl.className = 'ref-status';

    card.querySelector('.ref-input-wrapper').append(refInput, statusEl);

    const imgElement = card.querySelector('img');
    if (imgElement.complete) {
      imgElement.classList.add('loaded');
    } else {
      imgElement.addEventListener('load', () => imgElement.classList.add('loaded'));
    }

    refInput.addEventListener('input', (e) => {
      const value = e.target.value;
      statusEl.textContent = '...';
      statusEl.className = 'ref-status saving';

      clearTimeout(refInput._saveTimer);
      refInput._saveTimer = setTimeout(async () => {
        try {
          await setDoc(doc(db, 'references', img.fileName), { ref: value }, { merge: true });
          statusEl.textContent = '✓';
          statusEl.className = 'ref-status saved';
          setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'ref-status';
          }, 2000);
        } catch {
          statusEl.textContent = '✗';
          statusEl.className = 'ref-status error';
        }
      }, 600);
    });

    galleryGrid.appendChild(card);
  });
}

function getFilteredImages() {
  return images.filter(img => img.fileName.toLowerCase().includes(currentFilter));
}

// Single real-time listener on the whole references collection
onSnapshot(collection(db, 'references'), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const fileName = change.doc.id;

    if (change.type === 'removed') {
      delete refsData[fileName];
    } else {
      refsData[fileName] = change.doc.data().ref || '';
    }

    // Live-update matching input without re-rendering the whole grid
    if (initialized) {
      galleryGrid.querySelectorAll('.ref-input').forEach(input => {
        if (input.dataset.filename === fileName && document.activeElement !== input) {
          input.value = refsData[fileName];
        }
      });
    }
  });

  if (!initialized) {
    initialized = true;
    renderGallery(getFilteredImages());
  }
});

searchInput.addEventListener('input', (e) => {
  currentFilter = e.target.value.toLowerCase();
  renderGallery(getFilteredImages());
});
