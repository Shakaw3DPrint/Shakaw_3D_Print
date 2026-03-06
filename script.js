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

    // Conta o total de itens (somando quantidades)
    const getTotalItems = () => {
        return interestList.reduce((total, item) => total + item.quantity, 0);
    };

    const updateViewInterestsButton = () => {
        if (viewInterestsBtn) {
            const total = getTotalItems();
            if (total > 0) {
                viewInterestsBtn.style.display = 'flex';
                viewInterestsBtn.innerHTML = `<i class="fas fa-list"></i> Ver Interesses (${total})`;
            } else {
                viewInterestsBtn.style.display = 'none';
            }
        }
    };

    const addProductToInterest = (productId, productName) => {
        const existingItem = interestList.find(item => item.id === productId);
        if (existingItem) {
            // Se já existe, apenas aumenta a quantidade
            existingItem.quantity += 1;
            saveInterestList();
            showNotification(`"${productName}" adicionado! (${existingItem.quantity} unidades)`, 'success');
        } else {
            // Se não existe, adiciona com quantidade 1
            interestList.push({ id: productId, name: productName, quantity: 1 });
            saveInterestList();
            showNotification(`"${productName}" adicionado à lista!`, 'success');
        }
    };

    const increaseQuantity = (productId) => {
        const item = interestList.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            saveInterestList();
            renderInterestSummary();
        }
    };

    const decreaseQuantity = (productId) => {
        const item = interestList.find(item => item.id === productId);
        if (item) {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                // Remove o item se a quantidade chegar a 0
                const index = interestList.findIndex(i => i.id === productId);
                interestList.splice(index, 1);
            }
            saveInterestList();
            renderInterestSummary();
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
    // NOTIFICAÇÕES
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

            // Fecha o modal automaticamente se a lista ficar vazia
            if (interestSummaryModal) interestSummaryModal.style.display = 'none';
        } else {
            interestList.forEach((item) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <div class="item-controls">
                        <button class="qty-btn decrease-btn" data-product-id="${item.id}" title="Diminuir">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="qty-btn increase-btn" data-product-id="${item.id}" title="Aumentar">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item-btn" data-product-id="${item.id}" title="Remover">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                selectedItemsList.appendChild(li);
            });
            if (registerInterestsBtn) registerInterestsBtn.style.display = 'flex';
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

    // Controles dentro da lista (aumentar, diminuir, remover)
    if (selectedItemsList) {
        selectedItemsList.addEventListener('click', (event) => {
            const increaseBtn = event.target.closest('.increase-btn');
            const decreaseBtn = event.target.closest('.decrease-btn');
            const removeBtn = event.target.closest('.remove-item-btn');

            if (increaseBtn) increaseQuantity(increaseBtn.dataset.productId);
            if (decreaseBtn) decreaseQuantity(decreaseBtn.dataset.productId);
            if (removeBtn) removeProductFromInterest(removeBtn.dataset.productId);
        });
    }

    // =============================================
    // SEGUNDO MODAL: FORMULÁRIO DE CONTATO
    // =============================================

    if (registerInterestsBtn) {
        registerInterestsBtn.addEventListener('click', () => {
            let itemsText = '';
            interestList.forEach((item, index) => {
                itemsText += `${index + 1}. ${item.name} - Quantidade: ${item.quantity}\n`;
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

    // Fechar modais clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === interestSummaryModal) interestSummaryModal.style.display = 'none';
        if (event.target === contactFormModal) contactFormModal.style.display = 'none';
    });

    // =============================================
    // BOTÃO VOLTAR AO TOPO
    // =============================================

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
