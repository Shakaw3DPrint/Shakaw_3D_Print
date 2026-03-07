document.addEventListener('DOMContentLoaded', () => {

    // ── Estado
    const interestList = JSON.parse(localStorage.getItem('shakawInterestList')) || [];

    // ── Elementos
    const productGrid          = document.querySelector('.product-grid');
    const viewInterestsBtn     = document.getElementById('viewInterestsBtn');
    const interestSummaryModal = document.getElementById('interestSummaryModal');
    const contactFormModal     = document.getElementById('contactFormModal');
    const closeSummaryModal    = document.getElementById('closeSummaryModal');
    const closeContactFormModal= document.getElementById('closeContactFormModal');
    const selectedItemsList    = document.getElementById('selectedItemsList');
    const itemsDataInput       = document.getElementById('itemsData');
    const contactForm          = document.getElementById('contactForm');
    const registerInterestsBtn = document.getElementById('registerInterestsBtn');
    const backToTopBtn         = document.getElementById('backToTopBtn');
    const filterBtns           = document.querySelectorAll('.filter-btn');
    const productCards         = document.querySelectorAll('.product-card');

    // ── Lightbox
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev  = document.getElementById('lightbox-prev');
    const lightboxNext  = document.getElementById('lightbox-next');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const zoomInBtn     = document.getElementById('zoom-in');
    const zoomOutBtn    = document.getElementById('zoom-out');
    const zoomResetBtn  = document.getElementById('zoom-reset');
    const zoomLevelEl   = document.getElementById('zoom-level');

    let lightboxImages  = [];
    let lightboxIndex   = 0;
    let currentZoom     = 1;
    const ZOOM_STEP     = 0.25;
    const ZOOM_MAX      = 4;
    const ZOOM_MIN      = 0.5;

    // =============================================
    // FILTROS
    // =============================================
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                productCards.forEach(card => {
                    card.style.display =
                        (filter === 'all' || card.dataset.category === filter)
                        ? 'flex' : 'none';
                });
            });
        });
    }

    // =============================================
// LIGHTBOX
// =============================================
function openLightbox(images, startIndex) {
    lightboxImages = images;
    lightboxIndex = startIndex;
    currentZoom = 1;
    
    // Resetar posição e zoom
    lightboxImg.style.transform = 'scale(1) translate(0, 0)';
    lightboxImg.style.cursor = 'grab';
    
    updateLightboxImage();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    currentZoom = 1;
    lightboxImg.style.transform = 'scale(1) translate(0, 0)';
}

function updateLightboxImage() {
    lightboxImg.src = lightboxImages[lightboxIndex];
    currentZoom = 1;
    lightboxImg.style.transform = 'scale(1) translate(0, 0)';
    updateZoomLabel();
    lightboxPrev.style.display = lightboxImages.length > 1 ? 'block' : 'none';
    lightboxNext.style.display = lightboxImages.length > 1 ? 'block' : 'none';
}

function updateZoomLabel() {
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(currentZoom * 100) + '%';
}

// Variáveis para controle de pan (arrastar)
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;
let lastTranslateX = 0, lastTranslateY = 0;

function applyZoomAndPan() {
    lightboxImg.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
    updateZoomLabel();
}

// Eventos de mouse para arrastar a imagem
lightboxImg.addEventListener('mousedown', (e) => {
    if (currentZoom > 1) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.style.cursor = 'grabbing';
        e.preventDefault();
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging && currentZoom > 1) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        // Limitar o movimento para não sair da área visível
        const imgRect = lightboxImg.getBoundingClientRect();
        const containerRect = lightboxContainer.getBoundingClientRect();
        
        // Calcula limites baseados no zoom
        const maxX = (imgRect.width * (currentZoom - 1)) / 2;
        const maxY = (imgRect.height * (currentZoom - 1)) / 2;
        
        translateX = Math.min(Math.max(translateX, -maxX), maxX);
        translateY = Math.min(Math.max(translateY, -maxY), maxY);
        
        applyZoomAndPan();
        e.preventDefault();
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        lightboxImg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
        lastTranslateX = translateX;
        lastTranslateY = translateY;
    }
});

// Zoom com botões
if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < ZOOM_MAX) {
            currentZoom += ZOOM_STEP;
            // Resetar posição ao aumentar zoom
            translateX = 0;
            translateY = 0;
            lastTranslateX = 0;
            lastTranslateY = 0;
            applyZoomAndPan();
            lightboxImg.style.cursor = 'grab';
        }
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > ZOOM_MIN) {
            currentZoom -= ZOOM_STEP;
            translateX = 0;
            translateY = 0;
            lastTranslateX = 0;
            lastTranslateY = 0;
            applyZoomAndPan();
            lightboxImg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
        }
    });
}

if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
        applyZoomAndPan();
        lightboxImg.style.cursor = 'default';
    });
}

// Scroll do mouse para zoom (com posição baseada no cursor)
lightboxImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const rect = lightboxImg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calcula posição relativa do mouse na imagem (0 a 1)
    const relX = mouseX / rect.width;
    const relY = mouseY / rect.height;
    
    const oldZoom = currentZoom;
    
    if (e.deltaY < 0 && currentZoom < ZOOM_MAX) {
        currentZoom += ZOOM_STEP;
    }
    if (e.deltaY > 0 && currentZoom > ZOOM_MIN) {
        currentZoom -= ZOOM_STEP;
    }
    
    if (oldZoom !== currentZoom) {
        // Ajusta posição para manter o ponto sob o mouse
        translateX = (mouseX - rect.width / 2) * (1 - currentZoom / oldZoom);
        translateY = (mouseY - rect.height / 2) * (1 - currentZoom / oldZoom);
        
        lastTranslateX = translateX;
        lastTranslateY = translateY;
        
        applyZoomAndPan();
        lightboxImg.style.cursor = currentZoom > 1 ? 'grab' : 'default';
    }
}, { passive: false });

// Teclas de atalho no lightbox
document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'ArrowLeft') lightboxPrev && lightboxPrev.click();
        if (e.key === 'ArrowRight') lightboxNext && lightboxNext.click();
        if (e.key === 'Escape') closeLightbox();
        if (e.key === '+' || e.key === '=') zoomInBtn && zoomInBtn.click();
        if (e.key === '-' || e.key === '_') zoomOutBtn && zoomOutBtn.click();
        if (e.key === '0') zoomResetBtn && zoomResetBtn.click();
    }
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        updateLightboxImage();
        translateX = 0;
        translateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        updateLightboxImage();
        translateX = 0;
        translateY = 0;
        lastTranslateX = 0;
        lastTranslateY = 0;
    });
}
    

    // =============================================
    // LISTA DE INTERESSES
    // =============================================
    const saveInterestList = () => {
        localStorage.setItem('shakawInterestList', JSON.stringify(interestList));
        updateViewInterestsButton();
    };

    const getTotalItems = () =>
        interestList.reduce((total, item) => total + item.quantity, 0);

    const updateViewInterestsButton = () => {
        if (!viewInterestsBtn) return;
        const total = getTotalItems();
        if (total > 0) {
            viewInterestsBtn.style.display = 'flex';
            viewInterestsBtn.innerHTML = `<i class="fas fa-list"></i> Ver Interesses (${total})`;
        } else {
            viewInterestsBtn.style.display = 'none';
        }
    };

    const addProductToInterest = (productId, productName) => {
        const existing = interestList.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
            saveInterestList();
            showNotification(`"${productName}" — ${existing.quantity} un. na lista!`, 'success');
        } else {
            interestList.push({ id: productId, name: productName, quantity: 1 });
            saveInterestList();
            showNotification(`"${productName}" adicionado!`, 'success');
        }
    };

    const increaseQuantity = (productId) => {
        const item = interestList.find(i => i.id === productId);
        if (item) { item.quantity += 1; saveInterestList(); renderInterestSummary(); }
    };

    const decreaseQuantity = (productId) => {
        const item = interestList.find(i => i.id === productId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) interestList.splice(interestList.findIndex(i => i.id === productId), 1);
            saveInterestList();
            renderInterestSummary();
        }
    };

    const removeProductFromInterest = (productId) => {
        const index = interestList.findIndex(i => i.id === productId);
        if (index > -1) { interestList.splice(index, 1); saveInterestList(); renderInterestSummary(); }
    };

    // ── Notificações
    const showNotification = (message, type = 'success') => {
        const n = document.createElement('div');
        n.className = `notification ${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.classList.add('show'), 10);
        setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 400); }, 3000);
    };

    // ── Modal 1: Resumo
    const renderInterestSummary = () => {
        if (!selectedItemsList) return;
        selectedItemsList.innerHTML = '';

        if (interestList.length === 0) {
            selectedItemsList.innerHTML = '<li class="empty-list">Sua lista está vazia.</li>';
            if (registerInterestsBtn) registerInterestsBtn.style.display = 'none';
            if (interestSummaryModal) interestSummaryModal.style.display = 'none';
            return;
        }

        interestList.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-name">${item.name}</span>
                <div class="item-controls">
                    <button class="qty-btn decrease-btn" data-product-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="qty-btn increase-btn" data-product-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item-btn" data-product-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>`;
            selectedItemsList.appendChild(li);
        });

        if (registerInterestsBtn) registerInterestsBtn.style.display = 'flex';
    };

    if (viewInterestsBtn) {
        viewInterestsBtn.addEventListener('click', () => {
            renderInterestSummary();
            interestSummaryModal.style.display = 'flex';
        });
    }

    if (closeSummaryModal) {
        closeSummaryModal.addEventListener('click', () => {
            interestSummaryModal.style.display = 'none';
        });
    }

    if (selectedItemsList) {
        selectedItemsList.addEventListener('click', (e) => {
            const inc = e.target.closest('.increase-btn');
            const dec = e.target.closest('.decrease-btn');
            const rem = e.target.closest('.remove-item-btn');
            if (inc) increaseQuantity(inc.dataset.productId);
            if (dec) decreaseQuantity(dec.dataset.productId);
            if (rem) removeProductFromInterest(rem.dataset.productId);
        });
    }

    // ── Modal 2: Formulário
    if (registerInterestsBtn) {
        registerInterestsBtn.addEventListener('click', () => {
            let itemsText = '';
            interestList.forEach((item, i) => {
                itemsText += `${i + 1}. ${item.name} - Quantidade: ${item.quantity}\n`;
            });
            if (itemsDataInput) itemsDataInput.value = itemsText;
            interestSummaryModal.style.display = 'none';
            contactFormModal.style.display = 'flex';
        });
    }

    if (closeContactFormModal) {
        closeContactFormModal.addEventListener('click', () => {
            contactFormModal.style.display = 'none';
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            localStorage.removeItem('shakawInterestList');
            interestList.length = 0;
            updateViewInterestsButton();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === interestSummaryModal) interestSummaryModal.style.display = 'none';
        if (e.target === contactFormModal)     contactFormModal.style.display = 'none';
    });

    // ── Voltar ao topo
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    updateViewInterestsButton();
});
