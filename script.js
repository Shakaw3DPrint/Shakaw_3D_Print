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
    // DETECTAR SE É MOBILE
    // =============================================
    const isMobile = () => window.innerWidth <= 768;

    // =============================================
    // FILTROS
    // =============================================
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isMobile()) {
                    const filter = btn.dataset.filter;
                    window.location.href = filter === 'all' ? 'catalogo.html' : `catalogo.html?filter=${filter}`;
                } else {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const filter = btn.dataset.filter;
                    productCards.forEach(card => {
                        card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'flex' : 'none';
                    });
                    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // =============================================
    // APLICAR FILTRO DA URL
    // =============================================
    const applyFilterFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter');
        if (filter && filterBtns.length > 0 && productCards.length > 0) {
            filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
            productCards.forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'flex' : 'none';
            });
        }
    };
    if (window.location.pathname.includes('catalogo.html')) applyFilterFromUrl();

    // =============================================
    // DESCRIÇÕES EXPANSÍVEIS
    // =============================================
    const createExpandableDescriptions = () => {
        document.querySelectorAll('.product-card').forEach(card => {
            const descriptionEl = card.querySelector('.description');
            const cardBody = card.querySelector('.card-body');
            const existingBtn = card.querySelector('.expand-description-btn');
            if (existingBtn) existingBtn.remove();
            
            if (descriptionEl && cardBody) {
                descriptionEl.classList.remove('expanded');
                const lineHeight = parseInt(window.getComputedStyle(descriptionEl).lineHeight) || 20;
                setTimeout(() => {
                    if (descriptionEl.scrollHeight > lineHeight * 2.5) {
                        const expandBtn = document.createElement('button');
                        expandBtn.className = 'expand-description-btn';
                        expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver mais';
                        const priceEl = cardBody.querySelector('.price');
                        if (priceEl) cardBody.insertBefore(expandBtn, priceEl);
                        else cardBody.appendChild(expandBtn);
                        
                        let expanded = false;
                        expandBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            descriptionEl.classList.toggle('expanded');
                            expandBtn.innerHTML = expanded 
                                ? '<i class="fas fa-chevron-down"></i> Ver mais' 
                                : '<i class="fas fa-chevron-up"></i> Ver menos';
                            expanded = !expanded;
                        });
                    }
                }, 50);
            }
        });
    };

    // =============================================
    // LIGHTBOX
    // =============================================
    function openLightbox(images, startIndex) {
        lightboxImages = images;
        lightboxIndex = startIndex;
        currentZoom = 1;
        updateLightboxImage();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } // <--- CHAVE DE FECHAMENTO CORRIGIDA

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        currentZoom = 1;
        lightboxImg.style.transform = 'scale(1)';
    }

    function updateLightboxImage() {
        if (lightboxImages?.length) lightboxImg.src = lightboxImages[lightboxIndex];
        currentZoom = 1;
        lightboxImg.style.transform = 'scale(1)';
        updateZoomLabel();
        if (lightboxPrev) lightboxPrev.style.display = lightboxImages.length > 1 ? 'block' : 'none';
        if (lightboxNext) lightboxNext.style.display = lightboxImages.length > 1 ? 'block' : 'none';
    }

    function updateZoomLabel() {
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(currentZoom * 100) + '%';
    }

    function applyZoom() {
        lightboxImg.style.transform = `scale(${currentZoom})`;
        updateZoomLabel();
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            if (lightboxImages.length) {
                lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
                updateLightboxImage();
            }
        });
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            if (lightboxImages.length) {
                lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
                updateLightboxImage();
            }
        });
    }

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => { if (currentZoom < ZOOM_MAX) { currentZoom += ZOOM_STEP; applyZoom(); } });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { if (currentZoom > ZOOM_MIN) { currentZoom -= ZOOM_STEP; applyZoom(); } });
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => { currentZoom = 1; applyZoom(); });

    if (lightboxImg) {
        lightboxImg.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0 && currentZoom < ZOOM_MAX) currentZoom += ZOOM_STEP;
            if (e.deltaY > 0 && currentZoom > ZOOM_MIN) currentZoom -= ZOOM_STEP;
            applyZoom();
        }, { passive: false });
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox?.style.display === 'flex') {
            if (e.key === 'ArrowLeft') lightboxPrev?.click();
            if (e.key === 'ArrowRight') lightboxNext?.click();
            if (e.key === 'Escape') closeLightbox();
            if (e.key === '+' || e.key === '=') zoomInBtn?.click();
            if (e.key === '-' || e.key === '_') zoomOutBtn?.click();
            if (e.key === '0') zoomResetBtn?.click();
        }
    });

    // Clique nos cards
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const cardImg = e.target.closest('.card-image');
            if (cardImg) {
                const card = cardImg.closest('.product-card');
                const allImgs = [cardImg.src];
                card.querySelectorAll('.thumb-img-data').forEach(t => { if (t.dataset.src) allImgs.push(t.dataset.src); });
                openLightbox(allImgs, 0);
                return;
            }

            const addBtn = e.target.closest('.add-to-interest');
            if (addBtn) {
                e.stopPropagation();
                const priceElement = addBtn.closest('.product-card').querySelector('.price');
                let price = 0;
                if (priceElement) {
                    const priceText = priceElement.textContent.trim();
                    if (!priceText.includes('Sob consulta')) {
                        const match = priceText.match(/R\$\s*([\d.,]+)/);
                        if (match) price = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
                    }
                }
                addProductToInterest(addBtn.dataset.productId, addBtn.dataset.productName, price);
            }
        });
    }

    // =============================================
    // LISTA DE INTERESSES
    // =============================================
    const saveInterestList = () => {
        localStorage.setItem('shakawInterestList', JSON.stringify(interestList));
        updateViewInterestsButton();
    };

    const getTotalItems = () => interestList.reduce((total, item) => total + (item.quantity || 0), 0);
    const getTotalValue = () => interestList.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

    const formatCurrency = (value) => {
        if (isNaN(value) || value == null) return 'R$ 0,00';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const updateViewInterestsButton = () => {
        if (!viewInterestsBtn) return;
        const total = getTotalItems();
        if (total > 0) {
            viewInterestsBtn.style.display = 'flex';
            viewInterestsBtn.innerHTML = `<i class="fas fa-list"></i> Ver Interesses (${total}) - ${formatCurrency(getTotalValue())}`;
        } else {
            viewInterestsBtn.style.display = 'none';
        }
    };

    const addProductToInterest = (productId, productName, productPrice) => {
        const existing = interestList.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
            saveInterestList();
            showNotification(`"${productName}" — ${existing.quantity} un. (${formatCurrency((existing.price || 0) * existing.quantity)})`, 'success');
        } else {
            interestList.push({ id: productId, name: productName, price: productPrice || 0, quantity: 1 });
            saveInterestList();
            showNotification(`"${productName}" adicionado! (${formatCurrency(productPrice || 0)})`, 'success');
        }
        if (interestSummaryModal.style.display === 'flex') renderInterestSummary();
    };

    const increaseQuantity = (productId) => {
        const item = interestList.find(i => i.id === productId);
        if (item) { item.quantity++; saveInterestList(); renderInterestSummary(); }
    };

    const decreaseQuantity = (productId) => {
        const item = interestList.find(i => i.id === productId);
        if (item) {
            item.quantity--;
            if (item.quantity <= 0) {
                const index = interestList.findIndex(i => i.id === productId);
                if (index > -1) interestList.splice(index, 1);
            }
            saveInterestList();
            renderInterestSummary();
        }
    };

    const removeProductFromInterest = (productId) => {
        const index = interestList.findIndex(i => i.id === productId);
        if (index > -1) { interestList.splice(index, 1); saveInterestList(); renderInterestSummary(); }
    };

    const showNotification = (message, type = 'success') => {
        const n = document.createElement('div');
        n.className = `notification ${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.classList.add('show'), 10);
        setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 400); }, 3000);
    };

    const renderInterestSummary = () => {
        if (!selectedItemsList) return;
        selectedItemsList.innerHTML = '';

        if (interestList.length === 0) {
            selectedItemsList.innerHTML = '<li class="empty-list">Sua lista está vazia.</li>';
            if (registerInterestsBtn) registerInterestsBtn.style.display = 'none';
            return;
        }

        interestList.forEach(item => {
            const li = document.createElement('li');
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            li.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="item-name"><strong>${item.name}</strong></span>
                        <span class="item-price">${formatCurrency(item.price || 0)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="item-controls">
                            <button class="qty-btn decrease-btn" data-product-id="${item.id}"><i class="fas fa-minus"></i></button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="qty-btn increase-btn" data-product-id="${item.id}"><i class="fas fa-plus"></i></button>
                            <button class="remove-item-btn" data-product-id="${item.id}"><i class="fas fa-times"></i></button>
                        </div>
                        <span class="item-total">${formatCurrency(itemTotal)}</span>
                    </div>
                </div>`;
            selectedItemsList.appendChild(li);
        });

        const totalLi = document.createElement('li');
        totalLi.style.backgroundColor = 'rgba(0, 198, 255, 0.1)';
        totalLi.style.fontWeight = 'bold';
        totalLi.style.borderTop = '2px solid #00c6ff';
        totalLi.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 0;">
                <span style="color: #00c6ff;">VALOR TOTAL GERAL:</span>
                <span style="color: #ffc107;">${formatCurrency(getTotalValue())}</span>
            </div>
        `;
        selectedItemsList.appendChild(totalLi);
        if (registerInterestsBtn) registerInterestsBtn.style.display = 'flex';
    };

    if (viewInterestsBtn) {
        viewInterestsBtn.addEventListener('click', () => {
            renderInterestSummary();
            interestSummaryModal.style.display = 'flex';
        });
    }

    if (closeSummaryModal) closeSummaryModal.addEventListener('click', () => interestSummaryModal.style.display = 'none');
    if (closeContactFormModal) closeContactFormModal.addEventListener('click', () => contactFormModal.style.display = 'none');

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

    if (registerInterestsBtn) {
        registerInterestsBtn.addEventListener('click', () => {
            let itemsText = '';
            let totalGeral = 0;
            interestList.forEach((item, i) => {
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                totalGeral += itemTotal;
                itemsText += `${i + 1}. ${item.name}\n   Preço unitário: ${formatCurrency(item.price || 0)}\n   Quantidade: ${item.quantity}\n   Total do item: ${formatCurrency(itemTotal)}\n\n`;
            });
            itemsText += `================================\nVALOR TOTAL GERAL: ${formatCurrency(totalGeral)}`;
            if (itemsDataInput) itemsDataInput.value = itemsText;
            interestSummaryModal.style.display = 'none';
            contactFormModal.style.display = 'flex';
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            setTimeout(() => {
                localStorage.removeItem('shakawInterestList');
                interestList.length = 0;
                updateViewInterestsButton();
            }, 100);
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === interestSummaryModal) interestSummaryModal.style.display = 'none';
        if (e.target === contactFormModal) contactFormModal.style.display = 'none';
    });

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    setTimeout(createExpandableDescriptions, 200);
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(createExpandableDescriptions, 250);
    });

    updateViewInterestsButton();
});
<script>
  const INTERESSES_WEBAPP_URL = "COLE_AQUI_A_URL_DO_SEU_WEB_APP";

  async function enviarInteresseAppsScript(event) {
    event.preventDefault();

    const form = document.getElementById("contactForm");
    const msgBox = document.getElementById("interestFormMsg");

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      whatsapp: document.getElementById("whatsapp").value.trim(),
      message: document.getElementById("message").value.trim(),
      itens_de_interesse: document.getElementById("itemsData").value.trim(),
      origem: "Catálogo",
      fonte_url: window.location.href
    };

    msgBox.style.display = "none";
    msgBox.innerHTML = "";

    try {
      const response = await fetch(INTERESSES_WEBAPP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Erro ao registrar interesse.");
      }

      msgBox.style.display = "block";
      msgBox.style.color = "#9ff0b3";
      msgBox.innerHTML = "Interesse enviado com sucesso! Retornaremos em breve.";

      form.reset();

      if (typeof selectedItems !== "undefined") {
        selectedItems.length = 0;
      }

      const selectedItemsList = document.getElementById("selectedItemsList");
      if (selectedItemsList) selectedItemsList.innerHTML = "";

      const viewBtn = document.getElementById("viewInterestsBtn");
      if (viewBtn) viewBtn.innerHTML = '<i class="fas fa-list"></i> Ver Interesses (0)';

      setTimeout(() => {
        const modal = document.getElementById("contactFormModal");
        if (modal) modal.style.display = "none";
        msgBox.style.display = "none";
      }, 1800);

    } catch (error) {
      msgBox.style.display = "block";
      msgBox.style.color = "#ffb2bb";
      msgBox.innerHTML = "Erro ao enviar interesse: " + error.message;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", enviarInteresseAppsScript);
    }
  });
</script>
