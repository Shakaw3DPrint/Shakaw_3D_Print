// =============================================
// VARIÁVEIS GLOBAIS
// =============================================
const catalog = document.getElementById("catalog");
const loader = document.getElementById("loader");
const interests = []; // Armazena todos os itens de interesse
const backToTopBtn = document.getElementById("backToTopBtn");
const interestPanel = document.getElementById("interestPanel");
const interestList = document.getElementById("interestList");
const imgModal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const contactModal = document.getElementById("contactModal");
const selectedItemsSummary = document.getElementById("selectedItemsSummary");
const itemsDataInput = document.getElementById("itemsData");

let currentImageIndex = 0;
let currentProductImages = []; // Este será o array de imagens para o modal atual
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
// EXIBIÇÃO DE PRODUTOS
// =============================================
function displayProducts(products) {
  catalog.innerHTML = ""; // Limpa o catálogo antes de adicionar novos produtos
  products.forEach(product => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    
    // Prepara o array de todas as imagens do produto para o modal
    const allProductImagesForModal = [product.mainImage, ...product.thumbnails];

    productDiv.innerHTML = `
      <div class="image-column">
        <img 
          src="${product.mainImage}" 
          alt="${product.name}" 
          class="main-img" 
          onclick="openModal(\'${product.mainImage}\', ${JSON.stringify(allProductImagesForModal)})"
        >
        <div class="thumbnail-container">
          ${product.thumbnails.map(thumb => `
            <img 
              src="${thumb}" 
              alt="Thumbnail de ${product.name}" 
              onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'has-broken-thumb\');" 
              onclick="handleChangeAndOpenModal(this, \'${product.mainImage}\', ${JSON.stringify(product.thumbnails)}, \'${thumb}\')"
            >
          `).join("")}
        </div>
      </div>
      <div class="product-details">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p class="price">${product.price}</p>
        <div class="quantity-control">
          <button class="qty-btn" onclick="changeQuantity(this, -1)">-</button>
          <input type="number" class="quantity" value="1" min="1" readonly>
          <button class="qty-btn" onclick="changeQuantity(this, 1)">+</button>
        </div>
        <button onclick="addInterest(\'${product.name}\', \'${product.price}\', this)">Tenho Interesse</button>
      </div>
    `;
    catalog.appendChild(productDiv);
  });
}

// =============================================
// FUNÇÃO PARA LIDAR COM CLIQUE NA MINIATURA E ABRIR MODAL
// =============================================
function handleChangeAndOpenModal(thumbnailElement, mainImageForProduct, allThumbnailsForProduct, clickedThumbSrc) {
    const productDiv = thumbnailElement.closest(".product");
    if (productDiv) {
        const mainImgElement = productDiv.querySelector(".main-img");
        if (mainImgElement) {
            mainImgElement.src = clickedThumbSrc; // Atualiza a imagem principal na visualização do catálogo
        }
    }

    // Prepara o array de imagens para o modal: inclui a imagem principal original e todas as miniaturas.
    let modalImages = [mainImageForProduct, ...allThumbnailsForProduct];
    
    openModal(clickedThumbSrc, modalImages);
}


// =============================================
// CARROSSEL (sem alterações nesta seção)
// =============================================
const carousel = document.getElementById("carousel");
const carouselIndicators = document.getElementById("carouselIndicators");
let carouselImages = [];
let currentCarouselIndex = 0;

async function loadCarouselImages() {
  try {
    const response = await fetch("assets/json/carousel.json");
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    carouselImages = await response.json();
    renderCarousel();
    startCarouselAutoPlay();
  } catch (error) {
    console.error("Falha ao carregar imagens do carrossel:", error);
  }
}

function renderCarousel() {
  carousel.innerHTML = "";
  carouselIndicators.innerHTML = "";
  carouselImages.forEach((image, index) => {
    const imgElement = document.createElement("img");
    imgElement.src = image.src;
    imgElement.alt = image.alt;
    carousel.appendChild(imgElement);

    const indicator = document.createElement("div");
    indicator.className = "carousel-indicator";
    indicator.onclick = () => goToSlide(index);
    carouselIndicators.appendChild(indicator);
  });
  updateCarousel();
}

function updateCarousel() {
  carousel.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
  const indicators = document.querySelectorAll(".carousel-indicator");
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle("active", index === currentCarouselIndex);
  });
}

function moveSlide(step) {
  currentCarouselIndex = (currentCarouselIndex + step + carouselImages.length) % carouselImages.length;
  updateCarousel();
}

function goToSlide(index) {
  currentCarouselIndex = index;
  updateCarousel();
}

function startCarouselAutoPlay() {
  setInterval(() => {
    moveSlide(1);
  }, 5000); 
}

// =============================================
// CONTROLE DE QUANTIDADE (sem alterações)
// =============================================
function changeQuantity(button, delta) {
  const quantityInput = button.parentElement.querySelector(".quantity");
  let currentValue = parseInt(quantityInput.value);
  currentValue += delta;
  if (currentValue < 1) currentValue = 1;
  quantityInput.value = currentValue;
}

// =============================================
// MODAL DE IMAGEM (REVISADO PARA ZOOM E NAVEGAÇÃO)
// =============================================
function openModal(imageSrc, imagesArray) {
  let validImages = [];
  if (Array.isArray(imagesArray)) {
    // Filtra apenas strings válidas e não vazias e remove duplicatas
    validImages = [...new Set(imagesArray.filter(img => img && typeof img === "string"))];
  }
  
  // Adiciona imageSrc ao início da lista se não estiver presente e for válida
  if (imageSrc && typeof imageSrc === "string" && !validImages.includes(imageSrc)) {
    validImages.unshift(imageSrc);
     // Garante que não haja duplicatas novamente após unshift
    validImages = [...new Set(validImages)];
  }
  currentProductImages = validImages;

  currentImageIndex = currentProductImages.indexOf(imageSrc);
  if (currentImageIndex === -1 && currentProductImages.length > 0) {
    currentImageIndex = 0; // Se a imagem clicada não estiver na lista (improvável), mostra a primeira
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
// CONTROLES DE ZOOM NO MODAL (sem alterações na lógica principal)
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
// BOTÃO VOLTAR AO TOPO (sem alterações)
// =============================================
window.onscroll = function() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
};

// =============================================
// PAINEL DE INTERESSES (AJUSTADO PARA DISPLAY FLEX)
// =============================================
function addInterest(productName, productPrice, button) {
  const quantityInput = button.closest(".product-details").querySelector(".quantity");
  const quantity = parseInt(quantityInput.value);

  const existingInterest = interests.find(item => item.name === productName);
  if (existingInterest) {
    existingInterest.quantity += quantity;
  } else {
    interests.push({ name: productName, price: productPrice, quantity: quantity });
  }
  updateInterestPanel();
  if (interests.length > 0) {
      interestPanel.style.display = "flex"; // Alterado para flex
  }
}

function updateInterestPanel() {
  interestList.innerHTML = ""; 
  if (interests.length === 0) {
    interestList.innerHTML = "<li>Nenhum item adicionado.</li>";
    interestPanel.style.display = "none"; 
    return;
  }
  interests.forEach((item, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${item.name} (Qtd: ${item.quantity}) - ${item.price}
      <button onclick="removeInterest(${index})" style="margin-left: 10px; background: #ff4d4d; color: white; border: none; border-radius: 3px; cursor: pointer;">Remover</button>
    `;
    interestList.appendChild(listItem);
  });
}

function removeInterest(index) {
  interests.splice(index, 1);
  updateInterestPanel();
  if (interests.length === 0) {
      interestPanel.style.display = "none";
  }
}

function toggleInterestPanel() {
  if (interests.length > 0) { 
      if (interestPanel.style.display === "flex") { 
          interestPanel.style.display = "none";
      } else {
          interestPanel.style.display = "flex"; 
      }
  } else {
      interestPanel.style.display = "none";
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
  
  selectedItemsSummary.innerHTML = ""; 
  let itemsText = "";
  interests.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `<strong>${item.quantity}x</strong> ${item.name} (${item.price})`;
    selectedItemsSummary.appendChild(itemDiv);
    itemsText += `${item.quantity}x ${item.name} (${item.price})\n`;
  });
  itemsDataInput.value = itemsText.trim(); 
  
  contactModal.style.display = "block";
  interestPanel.style.display = "none"; 
}

// Fechar modais se clicar fora
window.onclick = function(event) {
  if (event.target == imgModal) {
    closeModal();
  }
  if (event.target == contactModal) {
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
  if (interests.length === 0) {
      interestPanel.style.display = "none";
  }
});


