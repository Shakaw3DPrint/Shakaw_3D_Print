// =============================================
// VARIÁVEIS GLOBAIS
// =============================================
const catalog = document.getElementById("catalog");
const loader = document.getElementById("loader");
const interests = []; // Armazena todos os itens de interesse
const backToTopBtn = document.getElementById("backToTopBtn");
const interestPanel = document.getElementById("interestPanel");
const interestList = document.getElementById("interestList");
// Adicionar referência ao elemento do total. Certifique-se que ele existe no HTML.
// Ex: <div id="interestPanel"> ... <ul id="interestList"></ul> <div id="interestTotal"></div> <button>...</button> </div>
const interestTotalElement = document.getElementById("interestTotal"); 
const imgModal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const contactModal = document.getElementById("contactModal");
const selectedItemsSummary = document.getElementById("selectedItemsSummary");
const itemsDataInput = document.getElementById("itemsData");

let currentImageIndex = 0;
let currentProductImages = []; 
let currentZoomLevel = 1;

// =============================================
// CARREGAMENTO DE PRODUTOS
// =============================================
async function loadProducts() {
  loader.style.display = "block";
  try {
    const response = await fetch("assets/json/products.json");
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Falha ao carregar produtos:", error);
    catalog.innerHTML = "<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>";
  } finally {
    loader.style.display = "none";
  }
}

// =============================================
// EXIBIÇÃO DE PRODUTOS (REFATORADO COM addEventListener)
// =============================================
function displayProducts(products) {
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
      openModal(product.mainImage, allProductImagesForModal);
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
        thumbImg.addEventListener("click", (event) => {
          // Atualiza a imagem principal no catálogo
          const currentMainImg = productDiv.querySelector('.main-img');
          if (currentMainImg) currentMainImg.src = thumbSrc;
          // Abre o modal com a miniatura clicada como imagem inicial
          openModal(thumbSrc, allProductImagesForModal);
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

// Removida handleChangeAndOpenModal pois a lógica foi incorporada no event listener da miniatura

// =============================================
// CARROSSEL (sem alterações)
// =============================================
const carousel = document.getElementById("carousel");
const carouselIndicators = document.getElementById("carouselIndicators");
let carouselImagesData = []; // Renomeado para evitar conflito
let currentCarouselIndex = 0;

async function loadCarouselImages() {
  try {
    const response = await fetch("assets/json/carousel.json");
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    carouselImagesData = await response.json();
    renderCarousel();
    startCarouselAutoPlay();
  } catch (error) {
    console.error("Falha ao carregar imagens do carrossel:", error);
  }
}

function renderCarousel() {
  carousel.innerHTML = "";
  carouselIndicators.innerHTML = "";
  carouselImagesData.forEach((image, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = image.src;
    imgElement.alt = image.alt;
    carousel.appendChild(imgElement);

    const indicator = document.createElement("div");
    indicator.className = "carousel-indicator";
    indicator.addEventListener("click", () => goToSlide(index)); // Usar addEventListener
    carouselIndicators.appendChild(indicator);
  });
  updateCarousel();
}

function updateCarousel() {
  if (carouselImagesData.length === 0) return;
  carousel.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
  const indicators = document.querySelectorAll(".carousel-indicator");
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentCarouselIndex);
  });
}

function moveSlide(step) {
  if (carouselImagesData.length === 0) return;
  currentCarouselIndex = (currentCarouselIndex + step + carouselImagesData.length) % carouselImagesData.length;
  updateCarousel();
}

function goToSlide(index) {
  currentCarouselIndex = index;
  updateCarousel();
}

function startCarouselAutoPlay() {
  if (carouselImagesData.length > 1) { // Só inicia se houver mais de uma imagem
    setInterval(() => {
      moveSlide(1);
    }, 5000); 
  }
}

// =============================================
// CONTROLE DE QUANTIDADE
// =============================================
function changeQuantity(quantityInput, delta) {
  let currentValue = parseInt(quantityInput.value);
  currentValue += delta;
  if (currentValue < 1) currentValue = 1;
  quantityInput.value = currentValue;
}

// =============================================
// MODAL DE IMAGEM
// =============================================
function openModal(imageSrc, imagesArray) {
  let validImages = [];
  if (Array.isArray(imagesArray)) {
    validImages = [...new Set(imagesArray.filter(img => img && typeof img === "string"))];
  }
  
  if (imageSrc && typeof imageSrc === "string" && !validImages.includes(imageSrc)) {
    validImages.unshift(imageSrc);
    validImages = [...new Set(validImages)];
  }
  currentProductImages = validImages;

  currentImageIndex = currentProductImages.indexOf(imageSrc);
  if (currentImageIndex === -1 && currentProductImages.length > 0) {
    currentImageIndex = 0; 
  }

  if (currentProductImages.length === 0 || currentImageIndex === -1) {
    console.error("Modal: Nenhuma imagem válida para exibir. Imagem inicial:", imageSrc, "Array de imagens:", imagesArray);
    imgModal.style.display = "none";
    document.body.style.overflow = "auto";
    return;
  }

  modalImg.src = currentProductImages[currentImageIndex];
  imgModal.style.display = "block";
  resetZoom(); 
  document.body.style.overflow = "hidden"; 
}

function closeModal() {
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; 
}

function navigateModal(step) {
  if (currentProductImages.length === 0) return;
  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  modalImg.src = currentProductImages[currentImageIndex];
  resetZoom(); 
}

// =============================================
// CONTROLES DE ZOOM NO MODAL
// =============================================
function zoomImage(amount) {
  currentZoomLevel += amount;
  if (currentZoomLevel < 0.2) currentZoomLevel = 0.2; 
  if (currentZoomLevel > 3) currentZoomLevel = 3;   
  modalImg.style.transform = `scale(${currentZoomLevel})`;
}

function resetZoom() {
  currentZoomLevel = 1;
  modalImg.style.transform = "scale(1)";
}

// =============================================
// BOTÃO VOLTAR AO TOPO
// =============================================
window.onscroll = function() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    if(backToTopBtn) backToTopBtn.style.display = "block";
  } else {
    if(backToTopBtn) backToTopBtn.style.display = "none";
  }
};

// =============================================
// FUNÇÃO AUXILIAR PARA CONVERTER PREÇO
// =============================================
function parsePrice(priceString) {
  if (typeof priceString !== 'string') return 0;
  return parseFloat(priceString.replace('R$', '').replace('.', '').replace(',', '.').trim());
}

// =============================================
// PAINEL DE INTERESSES
// =============================================
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
  if (interests.length > 0 && interestPanel) {
      interestPanel.style.display = "flex"; 
  }
}

function updateInterestPanel() {
  if (!interestList) return; // Sai se a lista não existir
  interestList.innerHTML = ""; 
  let totalValue = 0;

  if (interests.length === 0) {
    interestList.innerHTML = "<li>Nenhum item adicionado.</li>";
    if (interestTotalElement) interestTotalElement.innerHTML = ""; 
    if (interestPanel) interestPanel.style.display = "none"; 
    return;
  }

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
    // Remove event listener antigo para evitar duplicação se updateInterestPanel for chamado múltiplas vezes
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', function() {
      removeInterest(parseInt(this.dataset.index));
    });
  });

  if (interestTotalElement) {
    interestTotalElement.innerHTML = `<strong>Total: R$ ${totalValue.toFixed(2).replace('.', ',')}</strong>`;
  }
}

function removeInterest(index) {
  interests.splice(index, 1);
  updateInterestPanel();
  if (interests.length === 0 && interestPanel) {
      interestPanel.style.display = "none";
  }
}

function toggleInterestPanel() {
  if (!interestPanel) return;
  if (interestPanel.style.display === "flex") { 
      interestPanel.style.display = "none";
  } else {
    if (interests.length > 0) { 
      interestPanel.style.display = "flex"; 
    }
  }
}

// =============================================
// MODAL DE CONTATO 
// =============================================
function showContactModal() {
  if (interests.length === 0) {
    alert("Por favor, adicione itens à sua lista de interesses primeiro.");
    return;
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
  if(interestPanel) interestPanel.style.display = "none"; 
}

// Fechar modais se clicar fora
window.onclick = function(event) {
  if (imgModal && event.target == imgModal) {
    closeModal();
  }
  if (contactModal && event.target == contactModal) {
    contactModal.style.display = "none";
  }
}

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCarouselImages();
  updateInterestPanel(); 
  if (interestPanel && interests.length === 0) {
      interestPanel.style.display = "none";
  }

  // Adicionar event listeners para botões/elementos que não são gerados dinamicamente por produto
  const closeModalButton = document.querySelector("#imgModal .close");
  if(closeModalButton) closeModalButton.addEventListener("click", closeModal);
  
  const modalPrevButton = document.querySelector("#imgModal .modal-prev");
  if(modalPrevButton) modalPrevButton.addEventListener("click", () => navigateModal(-1));
  
  const modalNextButton = document.querySelector("#imgModal .modal-next");
  if(modalNextButton) modalNextButton.addEventListener("click", () => navigateModal(1));
  
  const zoomControls = document.querySelector(".zoom-controls");
  if(zoomControls){
      if(zoomControls.children[0]) zoomControls.children[0].addEventListener("click", () => zoomImage(0.2));
      if(zoomControls.children[1]) zoomControls.children[1].addEventListener("click", () => zoomImage(-0.2));
      if(zoomControls.children[2]) zoomControls.children[2].addEventListener("click", resetZoom);
  }
  
  if(backToTopBtn) backToTopBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}) );
  
  const interestBtnGlobal = document.querySelector('.interest-btn'); // Botão verde "Ver Interesses"
  if(interestBtnGlobal) interestBtnGlobal.addEventListener('click', toggleInterestPanel);
  
  const closeContactModalButton = document.querySelector('#contactModal .close-contact');
  if(closeContactModalButton) closeContactModalButton.addEventListener('click', () => { 
      if(contactModal) contactModal.style.display='none'; 
  });
  
  // O botão "Enviar Interesses" dentro do painel de interesses
  // Precisa ser selecionado com cuidado, pois o HTML original tinha onclick.
  // Assumindo que o HTML do painel de interesses é:
  // <div id="interestPanel">...<button id="showContactModalBtn">Enviar Interesses</button></div>
  // Se o botão não tiver ID, a seleção abaixo pode falhar ou pegar o errado.
  // A estrutura CSS anterior sugeria: #interestPanel > button[onclick*="showContactModal"]
  // Vamos tentar um seletor mais robusto se o HTML for conhecido ou se pudermos adicionar um ID.
  // Por agora, se o HTML original for mantido, o botão dentro do painel de interesses é o único botão filho direto.
  const showContactModalBtn = document.querySelector("#interestPanel > button");
  if(showContactModalBtn) showContactModalBtn.addEventListener('click', showContactModal);

});


