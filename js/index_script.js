// =============================================
// VARIÁVEIS GLOBAIS
// =============================================
const catalog = document.getElementById("catalog");
const loader = document.getElementById("loader");
const interests = []; // Armazena todos os itens de interesse
const backToTopBtn = document.getElementById("backToTopBtn");
const interestPanel = document.getElementById("interestPanel");
const interestList = document.getElementById("interestList");
const interestTotalElement = document.getElementById("interestTotal"); 
const imgModal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const contactModal = document.getElementById("contactModal");
const selectedItemsSummary = document.getElementById("selectedItemsSummary");
const itemsDataInput = document.getElementById("itemsData");

let currentImageIndex = 0;
let currentProductImages = []; 
let currentZoomLevel = 1;
let interestPanelTimeoutId = null; // Timer para auto-hide do painel de interesses

// =============================================
// CARREGAMENTO DE PRODUTOS
// =============================================
async function loadProducts() {
  if(loader) loader.style.display = "block";
  try {
    const response = await fetch("assets/json/products.json");
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Falha ao carregar produtos:", error);
    if(catalog) catalog.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
  } finally {
    if(loader) loader.style.display = "none";
  }
}

// =============================================
// EXIBIÇÃO DE PRODUTOS
// =============================================
function displayProducts(products) {
  if(!catalog) return;
  catalog.innerHTML = "";
  products.forEach(product => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    const allProductImagesForModal = [product.mainImage, ...product.thumbnails.filter(t => t && typeof t === 'string')];
    const imageColumn = document.createElement("div");
    imageColumn.className = "image-column";
    const mainImg = document.createElement("img");
    mainImg.src = product.mainImage;
    mainImg.alt = product.name;
    mainImg.className = "main-img";
    mainImg.addEventListener("click", () => {
      openModal(mainImg.src, allProductImagesForModal);
    });
    imageColumn.appendChild(mainImg);
    const thumbnailContainer = document.createElement("div");
    thumbnailContainer.className = "thumbnail-container";
    product.thumbnails.forEach(thumbSrc => {
      if (thumbSrc && typeof thumbSrc === 'string') {
        const thumbImg = document.createElement("img");
        thumbImg.src = thumbSrc;
        thumbImg.alt = `Thumbnail de ${product.name}`;
        thumbImg.onerror = function() { 
          this.style.display='none'; 
          if(this.parentElement) this.parentElement.classList.add('has-broken-thumb'); 
        };
        thumbImg.addEventListener("click", () => {
          mainImg.src = thumbSrc;
        });
        thumbnailContainer.appendChild(thumbImg);
      }
    });
    imageColumn.appendChild(thumbnailContainer);
    productDiv.appendChild(imageColumn);
    const productDetails = document.createElement("div");
    productDetails.className = "product-details";
    productDetails.innerHTML = `
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p class="price">${product.price}</p>
        <div class="quantity-control">
          <button class="qty-btn minus">-</button>
          <input type="number" class="quantity" value="1" min="1" readonly>
          <button class="qty-btn plus">+</button>
        </div>
        <button class="add-interest-btn">Tenho Interesse</button>
    `;
    productDiv.appendChild(productDetails);
    const quantityInput = productDetails.querySelector(".quantity");
    productDetails.querySelector(".qty-btn.minus").addEventListener("click", () => changeQuantity(quantityInput, -1));
    productDetails.querySelector(".qty-btn.plus").addEventListener("click", () => changeQuantity(quantityInput, 1));
    productDetails.querySelector(".add-interest-btn").addEventListener("click", () => {
        addInterest(product.name, product.price, quantityInput.value);
    });
    catalog.appendChild(productDiv);
  });
}

// =============================================
// CARROSSEL (sem alterações lógicas significativas)
// =============================================
const carousel = document.getElementById("carousel");
const carouselIndicators = document.getElementById("carouselIndicators");
let carouselImagesData = [];
let currentCarouselIndex = 0;
async function loadCarouselImages() {
  if(!carousel || !carouselIndicators) return;
  try {
    const response = await fetch("assets/json/carousel.json");
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    carouselImagesData = await response.json();
    renderCarousel();
    startCarouselAutoPlay();
  } catch (error) { console.error("Falha ao carregar imagens do carrossel:", error); }
}
function renderCarousel() {
  if(!carousel || !carouselIndicators) return;
  carousel.innerHTML = "";
  carouselIndicators.innerHTML = "";
  carouselImagesData.forEach((image, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = image.src; imgElement.alt = image.alt;
    carousel.appendChild(imgElement);
    const indicator = document.createElement("div");
    indicator.className = "carousel-indicator";
    indicator.addEventListener("click", () => goToSlide(index));
    carouselIndicators.appendChild(indicator);
  });
  updateCarousel();
}
function updateCarousel() {
  if (carouselImagesData.length === 0 || !carousel) return;
  carousel.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
  document.querySelectorAll(".carousel-indicator").forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentCarouselIndex);
  });
}
function moveSlide(step) {
  if (carouselImagesData.length === 0) return;
  currentCarouselIndex = (currentCarouselIndex + step + carouselImagesData.length) % carouselImagesData.length;
  updateCarousel();
}
function goToSlide(index) { currentCarouselIndex = index; updateCarousel(); }
function startCarouselAutoPlay() {
  if (carouselImagesData.length > 1) setInterval(() => moveSlide(1), 5000);
}

// =============================================
// CONTROLE DE QUANTIDADE (sem alterações)
// =============================================
function changeQuantity(quantityInput, delta) {
  if(!quantityInput) return;
  let currentValue = parseInt(quantityInput.value);
  currentValue += delta;
  if (currentValue < 1) currentValue = 1;
  quantityInput.value = currentValue;
}

// =============================================
// MODAL DE IMAGEM (sem alterações lógicas significativas)
// =============================================
function openModal(imageSrc, imagesArray) {
  if(!imgModal || !modalImg) return;
  let validImages = Array.isArray(imagesArray) ? [...new Set(imagesArray.filter(img => img && typeof img === 'string'))] : [];
  if (imageSrc && typeof imageSrc === 'string' && !validImages.includes(imageSrc)) {
    validImages.unshift(imageSrc);
    validImages = [...new Set(validImages)];
  }
  currentProductImages = validImages;
  currentImageIndex = currentProductImages.indexOf(imageSrc);
  if (currentImageIndex === -1 && currentProductImages.length > 0) currentImageIndex = 0;
  if (currentProductImages.length === 0 || currentImageIndex === -1) {
    imgModal.style.display = "none"; document.body.style.overflow = "auto"; return;
  }
  modalImg.src = currentProductImages[currentImageIndex];
  imgModal.style.display = "block";
  resetZoom(); 
  document.body.style.overflow = "hidden"; 
  document.addEventListener('keydown', handleModalKeydown);
}
function closeModal() {
  if(!imgModal) return;
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; 
  document.removeEventListener('keydown', handleModalKeydown);
}
function navigateModal(step) {
  if (currentProductImages.length === 0 || !modalImg) return;
  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  modalImg.src = currentProductImages[currentImageIndex];
  resetZoom(); 
}
function zoomImage(amount) {
  if(!modalImg) return;
  currentZoomLevel += amount;
  if (currentZoomLevel < 0.2) currentZoomLevel = 0.2; 
  if (currentZoomLevel > 3) currentZoomLevel = 3;   
  modalImg.style.transform = `scale(${currentZoomLevel})`;
}
function resetZoom() { if(!modalImg) return; currentZoomLevel = 1; modalImg.style.transform = "scale(1)";}
function handleModalKeydown(event) {
  if (!imgModal || imgModal.style.display !== 'block') return;
  switch (event.key) {
    case '+': case '=': zoomImage(0.2); break;
    case '-': zoomImage(-0.2); break;
    case '0': resetZoom(); break;
    case 'Escape': closeModal(); break;
  }
}

// =============================================
// BOTÃO VOLTAR AO TOPO (sem alterações)
// =============================================
window.onscroll = function() {
  if(backToTopBtn) backToTopBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
};

// =============================================
// FUNÇÃO AUXILIAR PARA CONVERTER PREÇO (sem alterações)
// =============================================
function parsePrice(priceString) {
  if (typeof priceString !== 'string') return 0;
  return parseFloat(priceString.replace('R$', '').replace('.', '').replace(',', '.').trim());
}

// =============================================
// PAINEL DE INTERESSES - LÓGICA DE AUTO-HIDE E TOGGLE
// =============================================
function showInterestPanel() {
    if (!interestPanel) return;
    interestPanel.classList.add("visible");
    interestPanel.classList.remove("hidden-fade"); // Garante que está visível para a animação
    resetInterestPanelAutoHideTimer();
}

function hideInterestPanel(immediate = false) {
    if (!interestPanel) return;
    clearTimeout(interestPanelTimeoutId);
    if (immediate) {
        interestPanel.classList.remove("visible");
        interestPanel.classList.add("hidden-fade"); // Para manter consistência se CSS usar isso
    } else {
        interestPanel.classList.add("hidden-fade"); // Adiciona classe para animar o fade-out
        // O CSS deve cuidar da transição para visibility: hidden / opacity: 0
        // E depois de um tempo, se necessário, remover a classe 'visible' completamente
        // Para simplificar, o CSS fará opacity 0 e visibility hidden.
        // A classe 'visible' é o estado 'deveria estar visível'.
        // A classe 'hidden-fade' é o estado 'está se escondendo ou escondido via fade'.
        // Vamos usar apenas 'visible' e o CSS faz o resto.
        interestPanel.classList.remove("visible"); 
    }
}

function resetInterestPanelAutoHideTimer() {
    if (!interestPanel) return;
    clearTimeout(interestPanelTimeoutId);
    // Só inicia o timer se o painel estiver marcado para ser visível e tiver itens
    // Ou se o usuário explicitamente clicou para ver (mesmo vazio)
    // A lógica atual é: se showInterestPanel é chamado, o timer é resetado.
    interestPanelTimeoutId = setTimeout(() => {
        // Verifica se o painel ainda deve estar visível (ex: não foi escondido manualmente)
        if (interestPanel.classList.contains("visible")) {
            hideInterestPanel();
        }
    }, 5000);
}

function addInterest(productName, productPriceString, quantityValue) {
  const quantity = parseInt(quantityValue);
  const price = parsePrice(productPriceString);
  const existingInterest = interests.find(item => item.name === productName);
  if (existingInterest) {
    existingInterest.quantity += quantity;
  } else {
    interests.push({ name: productName, price: price, quantity: quantity, originalPriceString: productPriceString });
  }
  updateInterestPanel();
  showInterestPanel(); // Mostra o painel e reseta o timer de auto-hide
}

function updateInterestPanel() {
  if (!interestList) return;
  interestList.innerHTML = ""; 
  let totalValue = 0;
  if (interests.length === 0) {
    interestList.innerHTML = "<li>Nenhum item adicionado.</li>";
    if (interestTotalElement) interestTotalElement.innerHTML = ""; 
    // Não esconde o painel aqui; o timer ou toggleInterestPanel cuidará disso.
    // Se o painel estiver visível e ficar vazio, o timer o esconderá.
  } else {
    interests.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        ${item.name} (Qtd: ${item.quantity}) - ${item.originalPriceString}
        <button class="remove-interest-item-btn" data-index="${index}">Remover</button>
      `;
      interestList.appendChild(listItem);
      totalValue += item.price * item.quantity;
    });
    document.querySelectorAll('.remove-interest-item-btn').forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener('click', function() {
        removeInterest(parseInt(this.dataset.index));
      });
    });
  }
  if (interestTotalElement) {
    interestTotalElement.innerHTML = interests.length > 0 ? `<strong>Total: R$ ${totalValue.toFixed(2).replace('.', ',')}</strong>` : "";
  }
}

function removeInterest(index) {
  interests.splice(index, 1);
  updateInterestPanel();
  // Se o painel estava visível e agora está vazio, o timer de auto-hide (se ativo) o esconderá.
  // Se o usuário acabou de remover o último item, e o painel está visível, ele deve permanecer visível
  // e o timer de 5s (que já estava correndo ou foi resetado por uma adição anterior) o fechará.
  // Se o painel estava visível e ainda tem itens, o timer continua.
  if (interestPanel.classList.contains("visible")) {
      resetInterestPanelAutoHideTimer(); // Reseta o timer para dar mais 5s antes de esconder se ficar vazio ou inativo.
  }
}

function toggleInterestPanel() {
  if (!interestPanel) return;
  if (interestPanel.classList.contains("visible")) {
    hideInterestPanel(); 
  } else {
    showInterestPanel(); // Mostra (mesmo vazio) e inicia o timer.
  }
}

// =============================================
// MODAL DE CONTATO (sem alterações lógicas significativas)
// =============================================
function showContactModal() {
  if (interests.length === 0) {
    alert("Por favor, adicione itens à sua lista de interesses primeiro."); return;
  }
  if(selectedItemsSummary) selectedItemsSummary.innerHTML = ""; 
  let itemsText = "";
  let totalFormValue = 0;
  interests.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `<strong>${item.quantity}x</strong> ${item.name} (${item.originalPriceString})`;
    if(selectedItemsSummary) selectedItemsSummary.appendChild(itemDiv);
    itemsText += `${item.quantity}x ${item.name} (${item.originalPriceString})\n`;
    totalFormValue += item.price * item.quantity;
  });
  itemsText += `\nTotal Geral: R$ ${totalFormValue.toFixed(2).replace('.', ',')}`;
  if(itemsDataInput) itemsDataInput.value = itemsText.trim(); 
  if(contactModal) contactModal.style.display = "block";
  hideInterestPanel(true); // Esconde painel de interesse imediatamente ao abrir modal de contato
}

// Fechar modais se clicar fora (sem alterações)
window.onclick = function(event) {
  if (imgModal && event.target == imgModal) closeModal();
  if (contactModal && event.target == contactModal) if(contactModal) contactModal.style.display = "none";
}

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCarouselImages();
  updateInterestPanel(); 
  if (interestPanel && interests.length === 0) {
    // Painel começa escondido se não houver itens e não marcado como 'visible'
    interestPanel.classList.remove("visible"); 
    interestPanel.classList.add("hidden-fade"); // Aplica estado inicial de escondido com fade
  } else if (interestPanel) {
    // Se houver itens (ex: de um estado salvo, não aplicável aqui) ou se deve começar visível
    // showInterestPanel(); // Descomente se o painel deve iniciar visível e com timer se tiver itens
  }

  const carouselBtnPrev = document.querySelector(".carousel-btn.prev");
  if(carouselBtnPrev) carouselBtnPrev.addEventListener("click", () => moveSlide(-1));
  const carouselBtnNext = document.querySelector(".carousel-btn.next");
  if(carouselBtnNext) carouselBtnNext.addEventListener("click", () => moveSlide(1));
  const closeModalButton = document.querySelector("#imgModal .close");
  if(closeModalButton) closeModalButton.addEventListener("click", closeModal);
  const modalPrevButton = document.querySelector("#imgModal .modal-prev");
  if(modalPrevButton) modalPrevButton.addEventListener("click", () => navigateModal(-1));
  const modalNextButton = document.querySelector("#imgModal .modal-next");
  if(modalNextButton) modalNextButton.addEventListener("click", () => navigateModal(1));
  const zoomControls = document.querySelector(".zoom-controls");
  if(zoomControls){
      const zoomInBtn = zoomControls.children[0]; if(zoomInBtn) zoomInBtn.addEventListener("click", () => zoomImage(0.2));
      const zoomOutBtn = zoomControls.children[1]; if(zoomOutBtn) zoomOutBtn.addEventListener("click", () => zoomImage(-0.2));
      const zoomResetBtn = zoomControls.children[2]; if(zoomResetBtn) zoomResetBtn.addEventListener("click", resetZoom);
  }
  const closeContactModalButton = document.querySelector('#contactModal .close-contact');
  if(closeContactModalButton) closeContactModalButton.addEventListener('click', () => { if(contactModal) contactModal.style.display='none'; });
  if(backToTopBtn) backToTopBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}) );
  const interestBtnGlobal = document.querySelector('.interest-btn'); 
  if(interestBtnGlobal) interestBtnGlobal.addEventListener('click', toggleInterestPanel);
  const showContactModalBtn = document.querySelector("#interestPanel > button:not(.remove-interest-item-btn)");
  if(showContactModalBtn) showContactModalBtn.addEventListener('click', showContactModal);
});


