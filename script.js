document.addEventListener('DOMContentLoaded', () => {

    // ── Estado (modificado para incluir preço)
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
                
                // Rolar suavemente para o início do catálogo (melhoria para mobile)
                const catalogoSection = document.getElementById('catalogo');
                if (catalogoSection) {
                    catalogoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // =============================================
    // LIGHTBOX
    // =============================================
    function openLightbox(images, startIndex) {
        lightboxImages = images;
        lightboxIndex  = startIndex;
        currentZoom    = 1;
        updateLightboxImage();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        currentZoom = 1;
        lightboxImg.style.transform = 'scale(1)';
    }

    function updateLightboxImage() {
        lightboxImg.src = lightboxImages[lightboxIndex];
        currentZoom = 1;
        lightboxImg.style.transform = 'scale(1)';
        updateZoomLabel();
        lightboxPrev.style.display = lightboxImages.length > 1 ? 'block' : 'none';
        lightboxNext.style.display = lightboxImages.length > 1 ? 'block' : 'none';
    }

    function updateZoomLabel() {
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(currentZoom * 100) + '%';
    }

    function applyZoom() {
        lightboxImg.style.transform = `scale(${currentZoom})`;
        updateZoomLabel();
    }

    if (lightboxClose)   lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
            updateLightboxImage();
        });
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
            updateLightboxImage();
        });
    }

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => {
        if (currentZoom < ZOOM_MAX) { currentZoom += ZOOM_STEP; applyZoom(); }
    });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > ZOOM_MIN) { currentZoom -= ZOOM_STEP; applyZoom(); }
    });
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
        currentZoom = 1; applyZoom();
    });

    // Scroll do mouse para zoom
    if (lightboxImg) {
        lightboxImg.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0 && currentZoom < ZOOM_MAX) currentZoom += ZOOM_STEP;
            if (e.deltaY > 0 && currentZoom > ZOOM_MIN) currentZoom -= ZOOM_STEP;
            applyZoom();
        }, { passive: false });
    }

    // Teclas de atalho no lightbox
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft')  lightboxPrev && lightboxPrev.click();
            if (e.key === 'ArrowRight') lightboxNext && lightboxNext.click();
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === '+')          zoomInBtn && zoomInBtn.click();
            if (e.key === '-')          zoomOutBtn && zoomOutBtn.click();
        }
    });

    // Clique na imagem principal do card abre o lightbox (modificado para capturar preço)
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            const cardImg = e.target.closest('.card-image');
            if (cardImg) {
                const card = cardImg.closest('.product-card');
                const allImgs = [cardImg.src];
                card.querySelectorAll('.thumb-img-data').forEach(t => allImgs.push(t.dataset.src));
                openLightbox(allImgs, 0);
                return;
            }

            const addBtn = e.target.closest('.add-to-interest');
            if (addBtn) {
                e.stopPropagation(); // Evitar propagação do evento
                
                // Capturar o preço do produto
                const cardBody = addBtn.closest('.product-card').querySelector('.card-body');
                const priceElement = cardBody ? cardBody.querySelector('.price') : null;
                let price = 0;
                
                // Extrair o valor numérico do preço
                if (priceElement) {
                    const priceText = priceElement.textContent.trim();
                    console.log('Texto do preço:', priceText); // Para debug
                    
                    // Se for "Sob consulta", definir como 0
                    if (priceText.includes('Sob consulta')) {
                        price = 0;
                    } else {
                        // Extrair números do preço (formato R$ 120,00)
                        const priceMatch = priceText.match(/R\$\s*([\d.,]+)/);
                        if (priceMatch) {
                            // Converter para número (substituir vírgula por ponto)
                            let priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.');
                            price = parseFloat(priceStr);
                            console.log('Preço convertido:', price); // Para debug
                        }
                    }
                }
                
                addProductToInterest(
                    addBtn.dataset.productId, 
                    addBtn.dataset.productName,
                    price
                );
            }
        });
    }

    // =============================================
    // LISTA DE INTERESSES (MODIFICADO PARA INCLUIR PREÇO)
    // =============================================
    const saveInterestList = () => {
        localStorage.setItem('shakawInterestList', JSON.stringify(interestList));
        updateViewInterestsButton();
    };

    const getTotalItems = () =>
        interestList.reduce((total, item) => total + item.quantity, 0);

    // NOVA FUNÇÃO: Calcular valor total da lista
    const getTotalValue = () => {
        return interestList.reduce((total, item) => {
            const itemPrice = item.price || 0;
            return total + (itemPrice * item.quantity);
        }, 0);
    };

    // NOVA FUNÇÃO: Formatar valor em reais
    const formatCurrency = (value) => {
        if (isNaN(value) || value === null || value === undefined) {
            return 'R$ 0,00';
        }
        return value.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const updateViewInterestsButton = () => {
        if (!viewInterestsBtn) return;
        const total = getTotalItems();
        const totalValue = getTotalValue();
        
        if (total > 0) {
            viewInterestsBtn.style.display = 'flex';
            viewInterestsBtn.innerHTML = `<i class="fas fa-list"></i> Ver Interesses (${total}) - ${formatCurrency(totalValue)}`;
        } else {
            viewInterestsBtn.style.display = 'none';
            viewInterestsBtn.innerHTML = `<i class="fas fa-list"></i> Ver Interesses (0)`;
        }
    };

    // MODIFICADO: Incluir preço
    const addProductToInterest = (productId, productName, productPrice) => {
        const existing = interestList.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
            saveInterestList();
            const itemTotal = (existing.price || 0) * existing.quantity;
            showNotification(`"${productName}" — ${existing.quantity} un. (${formatCurrency(itemTotal)}) na lista!`, 'success');
        } else {
            interestList.push({ 
                id: productId, 
                name: productName, 
                price: productPrice || 0, 
                quantity: 1 
            });
            saveInterestList();
            showNotification(`"${productName}" adicionado! (${formatCurrency(productPrice || 0)})`, 'success');
        }
        renderInterestSummary(); // Atualizar o modal se estiver aberto
    };

    const increaseQuantity = (productId) => {
        const item = interestList.find(i => i.id === productId);
        if (item) { 
            item.quantity += 1; 
            saveInterestList(); 
            renderInterestSummary(); 
        }
    };

    const decreaseQuantity = (productId) => {
        const item = interestList.find(i => i.id === productId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                interestList.splice(interestList.findIndex(i => i.id === productId), 1);
            }
            saveInterestList();
            renderInterestSummary();
        }
    };

    const removeProductFromInterest = (productId) => {
        const index = interestList.findIndex(i => i.id === productId);
        if (index > -1) { 
            interestList.splice(index, 1); 
            saveInterestList(); 
            renderInterestSummary(); 
        }
    };

    // ── Notificações
    const showNotification = (message, type = 'success') => {
        const n = document.createElement('div');
        n.className = `notification ${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.classList.add('show'), 10);
        setTimeout(() => { 
            n.classList.remove('show'); 
            setTimeout(() => n.remove(), 400); 
        }, 3000);
    };

    // ── Modal 1: Resumo (MODIFICADO para incluir preços e totais)
    const renderInterestSummary = () => {
        if (!selectedItemsList) return;
        selectedItemsList.innerHTML = '';

        if (interestList.length === 0) {
            selectedItemsList.innerHTML = '<li class="empty-list">Sua lista está vazia.</li>';
            if (registerInterestsBtn) registerInterestsBtn.style.display = 'none';
            return;
        }

        // Criar elementos da lista
        interestList.forEach(item => {
            const li = document.createElement('li');
            const itemPrice = item.price || 0;
            const itemTotal = itemPrice * item.quantity;
            
            li.innerHTML = `
                <div style="display: flex; flex-direction: column; width: 100%; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span class="item-name"><strong>${item.name}</strong></span>
                        <span class="item-price" style="color: #28a745; font-weight: bold; font-size: 1rem;">${formatCurrency(itemPrice)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div class="item-controls" style="display: flex; gap: 8px; align-items: center;">
                            <button class="qty-btn decrease-btn" data-product-id="${item.id}" style="width: 30px; height: 30px;">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="item-quantity" style="font-size: 1rem; min-width: 25px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn increase-btn" data-product-id="${item.id}" style="width: 30px; height: 30px;">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-item-btn" data-product-id="${item.id}" style="width: 30px; height: 30px;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <span class="item-total" style="color: #ffc107; font-weight: bold; font-size: 1rem;">
                            ${formatCurrency(itemTotal)}
                        </span>
                    </div>
                </div>`;
            selectedItemsList.appendChild(li);
        });

        // Adicionar linha com valor total geral
        const totalLi = document.createElement('li');
        totalLi.style.backgroundColor = 'rgba(0, 198, 255, 0.1)';
        totalLi.style.fontWeight = 'bold';
        totalLi.style.borderTop = '2px solid #00c6ff';
        totalLi.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 0;">
                <span style="color: #00c6ff; font-size: 1.1rem; font-weight: bold;">VALOR TOTAL GERAL:</span>
                <span style="color: #ffc107; font-size: 1.2rem; font-weight: bold;">${formatCurrency(getTotalValue())}</span>
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

    // ── Modal 2: Formulário (MODIFICADO para incluir valores no email)
    if (registerInterestsBtn) {
        registerInterestsBtn.addEventListener('click', () => {
            let itemsText = '';
            let totalGeral = 0;
            
            interestList.forEach((item, i) => {
                const itemPrice = item.price || 0;
                const itemTotal = itemPrice * item.quantity;
                totalGeral += itemTotal;
                const priceFormatted = formatCurrency(itemPrice);
                const totalFormatted = formatCurrency(itemTotal);
                
                itemsText += `${i + 1}. ${item.name}\n`;
                itemsText += `   Preço unitário: ${priceFormatted}\n`;
                itemsText += `   Quantidade: ${item.quantity}\n`;
                itemsText += `   Total do item: ${totalFormatted}\n\n`;
            });
            
            itemsText += `================================\n`;
            itemsText += `VALOR TOTAL GERAL: ${formatCurrency(totalGeral)}`;
            
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

    // Adicionar smooth scroll para links de navegação (melhoria mobile)
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Se for link interno (mesma página)
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            // Para links externos, deixar o comportamento padrão
        });
    });

    updateViewInterestsButton();
});
