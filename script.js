document.addEventListener('DOMContentLoaded', () => {
    const interestList = JSON.parse(localStorage.getItem('shakawInterestList')) || [];
    const productGrid = document.querySelector('.product-grid');
    const viewInterestsBtn = document.getElementById('viewInterestsBtn');

    // Modais
    const interestSummaryModal = document.getElementById('interestSummaryModal'); // Primeiro modal: lista de itens
    const contactFormModal = document.getElementById('contactFormModal');     // Segundo modal: formulário de contato

    // Botões de fechar modais
    const closeSummaryModal = document.querySelector('#interestSummaryModal .close-modal');
    const closeContactFormModal = document.querySelector('#contactFormModal .close-modal');

    // Conteúdo dos modais
    const selectedItemsList = document.getElementById('selectedItemsList'); // Onde a lista de itens será exibida no 1º modal
    const itemsDataInput = document.getElementById('itemsData');            // Campo hidden para o FormSubmit no 2º modal
    const contactForm = document.getElementById('contactForm');

    // Botão para ir do 1º modal para o 2º
    const registerInterestsBtn = document.getElementById('registerInterestsBtn');

    // Botão Voltar ao Topo
    const backToTopBtn = document.getElementById('backToTopBtn');

    // --- Funções de Gerenciamento da Lista de Interesses ---

    const saveInterestList = () => {
        localStorage.setItem('shakawInterestList', JSON.stringify(interestList));
        updateViewInterestsButton();
    };

    const addProductToInterest = (productId, productName) => {
        const existingItem = interestList.find(item => item.id === productId);
        if (existingItem) {
            alert(`"${productName}" já está na sua lista de interesses!`);
        } else {
            interestList.push({ id: productId, name: productName });
            saveInterestList();
            alert(`"${productName}" adicionado à sua lista de interesses!`);
        }
    };

    const removeProductFromInterest = (productId) => {
        const index = interestList.findIndex(item => item.id === productId);
        if (index > -1) {
            const removedItem = interestList.splice(index, 1);
            saveInterestList();
            alert(`"${removedItem[0].name}" removido da sua lista.`);
            renderInterestSummary(); // Atualiza a lista no modal de resumo
        }
    };

    // --- Event Listeners para Adicionar/Remover Itens ---

    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-interest')) {
                const productId = event.target.dataset.productId;
                const productName = event.target.dataset.productName;
                addProductToInterest(productId, productName);
            }
        });
    }

    // --- Funções e Event Listeners para Modais ---

    const updateViewInterestsButton = () => {
        if (viewInterestsBtn) {
            if (interestList.length > 0) {
                viewInterestsBtn.style.display = 'block';
                viewInterestsBtn.textContent = `Ver Interesses (${interestList.length})`;
            } else {
                viewInterestsBtn.style.display = 'none';
            }
        }
    };

    const renderInterestSummary = () => {
        selectedItemsList.innerHTML = ''; // Limpa a lista anterior
        if (interestList.length === 0) {
            selectedItemsList.innerHTML = '<p>Sua lista de interesses está vazia.</p>';
            registerInterestsBtn.style.display = 'none'; // Esconde o botão se não houver itens
        } else {
            interestList.forEach((item) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.name}</span>
                    <button class="remove-item-btn" data-product-id="${item.id}">&times;</button>
                `;
                selectedItemsList.appendChild(li);
            });
            registerInterestsBtn.style.display = 'block'; // Mostra o botão
        }
    };

    // Abrir o primeiro modal (Resumo de Interesses)
    if (viewInterestsBtn) {
        viewInterestsBtn.addEventListener('click', () => {
            renderInterestSummary();
            interestSummaryModal.style.display = 'flex'; // Usa flex para centralizar
        });
    }

    // Fechar o primeiro modal
    if (closeSummaryModal) {
        closeSummaryModal.addEventListener('click', () => {
            interestSummaryModal.style.display = 'none';
        });
    }

    // Remover item da lista de interesses no primeiro modal
    if (selectedItemsList) {
        selectedItemsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-item-btn')) {
                const productId = event.target.dataset.productId;
                removeProductFromInterest(productId);
            }
        });
    }

    // Abrir o segundo modal (Formulário de Contato) a partir do primeiro modal
    if (registerInterestsBtn) {
        registerInterestsBtn.addEventListener('click', () => {
            if (interestList.length === 0) {
                alert('Sua lista de interesses está vazia. Adicione itens antes de registrar.');
                return;
            }
            // Prepara os dados para o FormSubmit
            let itemsText = 'Itens de Interesse:\n';
            interestList.forEach((item, index) => {
                itemsText += `${index + 1}. ${item.name}\n`;
            });
            itemsDataInput.value = itemsText;

            interestSummaryModal.style.display = 'none'; // Fecha o primeiro modal
            contactFormModal.style.display = 'flex';     // Abre o segundo modal
        });
    }

    // Fechar o segundo modal
    if (closeContactFormModal) {
        closeContactFormModal.addEventListener('click', () => {
            contactFormModal.style.display = 'none';
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

    // Limpar lista de interesses após envio do formulário (simulado)
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            // Limpa a lista de interesses após o envio
            localStorage.removeItem('shakawInterestList');
            interestList.length = 0; // Esvazia o array
            saveInterestList(); // Atualiza o estado do botão
            // O FormSubmit já cuida do redirecionamento para 'obrigado.html'
        });
    }

    // --- Botão Voltar ao Topo ---

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex'; // Usa flex para centralizar o ícone
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Inicializa o estado do botão "Ver Interesses"
    updateViewInterestsButton();
});
