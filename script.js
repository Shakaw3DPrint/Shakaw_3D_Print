document.addEventListener('DOMContentLoaded', () => {
    const interestList = JSON.parse(localStorage.getItem('shakawInterestList')) || [];
    const productGrid = document.querySelector('.product-grid');
    const viewInterestsBtn = document.getElementById('viewInterestsBtn');
    const contactModal = document.getElementById('contactModal');
    const closeContactModal = document.querySelector('.close-contact');
    const selectedItemsSummary = document.getElementById('selectedItemsSummary');
    const itemsDataInput = document.getElementById('itemsData');
    const contactForm = document.getElementById('contactForm');
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Função para salvar a lista no localStorage
    const saveInterestList = () => {
        localStorage.setItem('shakawInterestList', JSON.stringify(interestList));
        updateViewInterestsButton();
    };

    // Função para adicionar produto à lista
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

    // Event listener para os botões "Adicionar à Lista de Interesses"
    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-interest')) {
                const productId = event.target.dataset.productId;
                const productName = event.target.dataset.productName;
                addProductToInterest(productId, productName);
            }
        });
    }

    // Função para atualizar o botão "Ver Interesses"
    const updateViewInterestsButton = () => {
        if (viewInterestsBtn) {
            if (interestList.length > 0) {
                viewInterestsBtn.style.display = 'block'; // Mostra o botão se houver itens
                viewInterestsBtn.textContent = `Ver Interesses (${interestList.length})`;
            } else {
                viewInterestsBtn.style.display = 'none'; // Esconde o botão se não houver itens
            }
        }
    };

    // Abrir modal de interesses
    if (viewInterestsBtn) {
        viewInterestsBtn.addEventListener('click', () => {
            if (interestList.length === 0) {
                alert('Sua lista de interesses está vazia.');
                return;
            }
            selectedItemsSummary.innerHTML = ''; // Limpa o resumo anterior
            let itemsText = '';
            interestList.forEach((item, index) => {
                const p = document.createElement('p');
                p.textContent = `${index + 1}. ${item.name}`;
                selectedItemsSummary.appendChild(p);
                itemsText += `${index + 1}. ${item.name}\n`;
            });
            itemsDataInput.value = itemsText; // Preenche o campo hidden para o FormSubmit
            contactModal.style.display = 'block';
        });
    }

    // Fechar modal de interesses
    if (closeContactModal) {
        closeContactModal.addEventListener('click', () => {
            contactModal.style.display = 'none';
        });
    }

    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
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

    // Botão Voltar ao Topo
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { // Mostra o botão após rolar 300px
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Rolagem suave
            });
        });
    }

    // Inicializa o estado do botão "Ver Interesses"
    updateViewInterestsButton();
});
