document.addEventListener('DOMContentLoaded', () => {

    // Lista de interesses (armazenada no localStorage)
    const interestList = JSON.parse(localStorage.getItem('shakawInterestList')) || [];

    // Elementos do DOM
    const productGrid = document.querySelector('.product-grid');
    const viewInterestsBtn = document.getElementById('viewInterestsBtn');
    const interestSummaryModal = document.getElementById('interestSummaryModal');
    const contactFormModal = document.getElementById('contactFormModal');
    const closeSummaryModal = document.getElementById('closeSummaryModal');
    const closeContactFormModal = document.getElementById('closeContactFormModal');
    const selectedItemsList = document.getElementById('selectedItemsList');
    const itemsDataInput = document.getElementById('itemsData');
    const contactForm = document.getElementById('contactForm');
    const registerInterestsBtn = document.getElementById('registerInterestsBtn');
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Filtros do catálogo
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // =============================================
    // FILTROS DO CATÁLOGO
    // =============================================
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                productCards.forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // =============================================
    // GERENCIAMENTO DA LISTA DE INTERESSES
    // =============================================

    const saveInterestList = () => {
        localStorage.setItem('shakawInterestList', JSON.stringify(interestList));
        updateViewInterestsButton();
    };

    const updateViewInterestsButton = () => {
        if (viewInterestsBtn) {
            if (interestList.length > 0) {
                viewInterestsBtn.style.display = 'flex';
                viewInterestsBtn.innerHTML = `<i class="fas fa-list"></i> Ver Interesses (${interestList.length})`;
            } else {
                viewInterestsBtn.style.display = 'none';
            }
        }
    };

    const addProductToInterest = (productId, productName) => {
        const existingItem = interestList.find(item => item.id === productId);
        if (existingItem) {
            showNotification(`"${productName}" já está na sua lista!`, 'warning');
        } else {
            interestList.push({ id: productId, name: productName });
            saveInterestList();
            showNotification(`"${productName}" adicionado à lista!`, 'success');
        }
    };

    const removeProductFromInterest = (productId) => {
        const index = interestList.findIndex(item => item.id === productId);
        if (index > -1) {
            interestList.splice(index, 1);
            saveInterestList();
            renderInterestSummary();
        }
    };

    // Adicionar produto ao clicar no botão
    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            const btn = event.target.closest('.add-to-interest');
            if (btn) {
                const productId = btn.dataset.productId;
                const productName = btn.dataset.productName;
                addProductToInterest(productId, productName);
            }
        });
    }

    // =============================================
    // NOTIFICAÇÃO (substitui o alert)
    // =============================================
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    };

    // =============================================
    // PRIMEIRO MODAL: RESUMO DE INTERESSES
    // =============================================

    const renderInterestSummary = () => {
        if (!selectedItemsList) return;
        selectedItemsList.innerHTML = '';

        if (interestList.length === 0) {
            selectedItemsList.innerHTML = '<li class="empty-list">Sua lista de interesses está vazia.</li>';
            if (registerInterestsBtn) registerInterestsBtn.style.display = 'none';
        } else {
            interestList.forEach((item) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <button class="remove-item-btn" data-product-id="${item.id}" title="Remover">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                selectedItemsList.appendChild(li);
            });
            if (registerInterestsBtn) registerInterestsBtn.style.display = 'block';
        }
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
        selectedItemsList.addEventListener('click', (event) => {
            const btn = event.target.closest('.remove-item-btn');
            if (btn) {
                removeProductFromInterest(btn.dataset.productId);
            }
        });
    }

    // =============================================
    // SEGUNDO MODAL: FORMULÁRIO DE CONTATO
    // =============================================

    if (registerInterestsBtn) {
        registerInterestsBtn.addEventListener('click', () => {
            let itemsText = '';
            interestList.forEach((item, index) => {
                itemsText += `${index + 1}. ${item.name}\n`;
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

    // Limpar lista após envio
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            localStorage.removeItem('shakawInterestList');
            interestList.length = 0;
            updateViewInterestsButton();
        });
    }

    // Fechar modais clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === interestSummaryModal) {
            interestSummaryModal.style.display = 'none';
        }
        if (event.target === contactFormModal) {
            contactFormModal.style.display = 'none';
        }
    });

    // =============================================
    // BOTÃO VOLTAR AO TOPO
    // =============================================

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Inicializa o botão Ver Interesses
    updateViewInterestsButton();
});
