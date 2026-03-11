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
    const isMobile = () => {
        return window.innerWidth <= 768;
    };

    // =============================================
    // FILTROS
    // =============================================
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isMobile()) {
                    const filter = btn.dataset.filter;
                    if (filter === 'all') {
                        window.location.href = 'catalogo.html';
                    } else {
                        window.location.href = `catalogo.html?filter=${filter}`;
                    }
                } else {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const filter = btn.dataset.filter;
                    productCards.forEach(card => {
                        card.style.display =
                            (filter === 'all' || card.dataset.category === filter)
                            ? 'flex' : 'none';
                    });
                    
                    const catalogoSection = document.getElementById('catalogo');
                    if (catalogoSection) {
                        catalogoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
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
            filterBtns.forEach(btn => {
                if (btn.dataset.filter === filter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            productCards.forEach(card => {
                card.style.display =
                    (filter === 'all' || card.dataset.category === filter)
                    ? 'flex' : 'none';
            });
        }
    };

    if (window.location.pathname.includes('catalogo.html')) {
        applyFilterFromUrl();
    }

    // =============================================
    // DESCRIÇÕES EXPANSÍVEIS (CORRIGIDO)
    // =============================================
    const createExpandableDescriptions = () => {
        document.querySelectorAll('.product-card').forEach(card => {
            const descriptionEl = card.querySelector('.description');
            const cardBody = card.querySelector('.card-body');
            
            // Remover botões existentes para não duplicar
            const existingBtn = card.querySelector('.expand-description-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            if (descriptionEl && cardBody) {
                // Remover classe expanded se existir
                descriptionEl.classList.remove('expanded');
                
                // Verificar se precisa de botão (se tem mais de 2 linhas)
                const lineHeight = parseInt(window.getComputedStyle(descriptionEl).lineHeight) || 20;
                const maxHeight = lineHeight * 2.5; // 2.5 linhas
                
                // Forçar um pequeno delay para garantir que o scrollHeight esteja correto
                setTimeout(() => {
                    if (descriptionEl.scrollHeight > maxHeight) {
                        const expandBtn = document.createElement('button');
                        expandBtn.className = 'expand-description-btn';
                        expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver mais';
                        
                        // Inserir antes do preço
                        const priceEl = cardBody.querySelector('.price');
                        if (priceEl) {
                            cardBody.insertBefore(expandBtn, priceEl);
                        } else {
                            cardBody.appendChild(expandBtn);
                        }
                        
                        let expanded = false;
                        
                        expandBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            
                            if (!expanded) {
                                descriptionEl.classList.add('expanded');
                                expandBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Ver menos';
                            } else {
                                descriptionEl.classList.remove('expanded');
                                expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver mais';
                            }
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
        lightboxIndex  = startIndex;
        currentZoom    = 1;
        updateLightboxImage();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
   
