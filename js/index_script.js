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
let interestPanelTimeoutId = null; 

// Variáveis para o Pan (arrastar imagem com zoom)
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartImgX = 0;
let panStartImgY = 0;
let currentImgTranslateX = 0;
let currentImgTranslateY = 0;

const ZOOM_INCREMENT = 0.07; // Mais sutil
const MAX_ZOOM = 4;
const MIN_ZOOM = 0.2;

// =============================================
// FUNÇÃO AUXILIAR PARA VERIFICAR IMAGEM
// =============================================
function checkImage(url) {
    return new Promise((resolve) => {
        if (!url || typeof url !== "string") {
            resolve({ url: url, status: "invalid_url" });
            return;
        }
        const img = new Image();
        img.onload = () => resolve({ url: url, status: "loaded" });
        img.onerror = () => resolve({ url: url, status: "error" });
        img.src = url;
    });
}

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
    
    const validThumbnails = product.thumbnails ? product.thumbnails.filter(t => t && typeof t === "string") : [];
    let allPotentialImages = [];
    if (product.mainImage && typeof product.mainImage === "string") {
        allPotentialImages.push(product.mainImage);
    }
    allPotentialImages = [...allPotentialImages, ...validThumbnails];
    allPotentialImages = [...new Set(allPotentialImages)]; 

    const imageColumn = document.createElement("div");
    imageColumn.className = "image-column";
    const mainImgElement = document.createElement("img");
    if (product.mainImage && typeof product.mainImage === "string") {
        mainImgElement.src = product.mainImage;
        mainImgElement.alt = product.name;
        mainImgElement.className = "main-img";
        mainImgElement.addEventListener("click", () => {
          openModal(mainImgElement.src, allPotentialImages);
        });
    } else {
        mainImgElement.style.display = "none"; 
    }
    imageColumn.appendChild(mainImgElement);
    
    const thumbnailContainer = document.createElement("div");
    thumbnailContainer.className = "thumbnail-container";
    validThumbnails.forEach(thumbSrc => {
        const thumbImg = document.createElement("img");
        thumbImg.src = thumbSrc;
        thumbImg.alt = `Thumbnail de ${product.name}`;
        thumbImg.onerror = function() { 
          this.style.display="none"; 
          if(this.parentElement) this.parentElement.classList.add("has-broken-thumb"); 
        };
        thumbImg.addEventListener("click", () => {
          if (product.mainImage && typeof product.mainImage === "string") {
            mainImgElement.src = thumbSrc;
          }
        });
        thumbnailContainer.appendChild(thumbImg);
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
// CARROSSEL (código omitido para brevidade, mantido como antes)
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
// CONTROLE DE QUANTIDADE (código omitido, mantido como antes)
// =============================================
function changeQuantity(quantityInput, delta) {
  if(!quantityInput) return;
  let currentValue = parseInt(quantityInput.value);
  currentValue += delta;
  if (currentValue < 1) currentValue = 1;
  quantityInput.value = currentValue;
}

// =============================================
// MODAL DE IMAGEM COM PAN E ZOOM
// =============================================
async function openModal(clickedImageSrc, allPotentialImageUrls) {
    if (!imgModal || !modalImg) return;
    let uniquePotentialUrls = Array.isArray(allPotentialImageUrls) 
        ? [...new Set(allPotentialImageUrls.filter(url => url && typeof url === "string"))] 
        : [];
    if (clickedImageSrc && typeof clickedImageSrc === "string" && !uniquePotentialUrls.includes(clickedImageSrc)) {
        uniquePotentialUrls.unshift(clickedImageSrc);
        uniquePotentialUrls = [...new Set(uniquePotentialUrls)];
    }
    if (uniquePotentialUrls.length === 0) { closeModal(); return; }

    modalImg.src = ""; 
    modalImg.alt = "Carregando imagens...";
    imgModal.style.display = "block"; // Mostra o modal antes para o usuário ver o carregamento
    document.body.style.overflow = "hidden";

    const imageCheckPromises = uniquePotentialUrls.map(url => checkImage(url));
    const results = await Promise.all(imageCheckPromises);
    currentProductImages = results.filter(result => result.status === "loaded").map(result => result.url);

    if (currentProductImages.length === 0) {
        alert("Não foi possível carregar nenhuma imagem para este produto.");
        closeModal(); return;
    }

    currentImageIndex = currentProductImages.indexOf(clickedImageSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;
    
    // Configura a imagem e reseta o zoom/pan APÓS a imagem ser carregada
    const handleInitialImageLoad = () => {
        modalImg.alt = "Imagem ampliada";
        resetZoomAndPan();
        modalImg.removeEventListener("load", handleInitialImageLoad);
        modalImg.removeEventListener("error", handleInitialImageError);
    };
    const handleInitialImageError = () => {
        console.error("Erro ao carregar imagem inicial no modal:", currentProductImages[currentImageIndex]);
        alert("Erro ao carregar a imagem selecionada.");
        closeModal();
        modalImg.removeEventListener("load", handleInitialImageLoad);
        modalImg.removeEventListener("error", handleInitialImageError);
    };

    modalImg.addEventListener("load", handleInitialImageLoad);
    modalImg.addEventListener("error", handleInitialImageError);
    modalImg.src = currentProductImages[currentImageIndex];

    // Adiciona listeners de teclado uma vez ao abrir o modal
    document.removeEventListener("keydown", handleModalKeydown); // Garante que não haja duplicatas
    document.addEventListener("keydown", handleModalKeydown);
}

function closeModal() {
  if(!imgModal) return;
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; 
  document.removeEventListener("keydown", handleModalKeydown);
  // Listeners de mouse/touch para pan e zoom são adicionados/removidos no DOMContentLoaded e aqui
  // Não é necessário remover aqui se eles são sempre os mesmos no modalImg
}

function navigateModal(step) {
  if (currentProductImages.length <= 1 || !modalImg) return;
  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  
  modalImg.alt = "Carregando nova imagem..."; // Feedback visual
  // modalImg.src = ""; // Opcional: limpar src antes para evitar flash da imagem antiga

  const handleNewImageLoad = () => {
    modalImg.alt = "Imagem ampliada";
    resetZoomAndPan(); // Crucial: resetar zoom/pan APÓS a nova imagem carregar
    modalImg.removeEventListener("load", handleNewImageLoad);
    modalImg.removeEventListener("error", handleNewImageError);
  };

  const handleNewImageError = () => {
    console.error("Erro ao carregar imagem no modal via navegação:", currentProductImages[currentImageIndex]);
    modalImg.alt = "Erro ao carregar imagem";
    resetZoomAndPan(); // Resetar para um estado consistente mesmo em erro
    modalImg.removeEventListener("load", handleNewImageLoad);
    modalImg.removeEventListener("error", handleNewImageError);
    // Poderia tentar a próxima imagem ou mostrar um placeholder mais robusto
  };

  modalImg.addEventListener("load", handleNewImageLoad);
  modalImg.addEventListener("error", handleNewImageError);
  
  modalImg.src = currentProductImages[currentImageIndex];

  // Fallback para imagens em cache que podem não disparar 'load'
  // Esta verificação é um pouco arriscada se o evento 'load' ainda for disparar.
  // A remoção do listener dentro do handler é a principal proteção contra chamadas duplas.
  if (modalImg.complete && modalImg.naturalWidth > 0 && modalImg.src === currentProductImages[currentImageIndex]) {
      // Pequeno timeout para dar chance ao evento 'load' se ele for assíncrono mas rápido
      setTimeout(() => {
          // Verifica se o handler já não foi chamado pelo evento 'load'
          // Isso é difícil de garantir 100% sem um flag. A remoção do listener é a melhor aposta.
          // Se o src ainda é o que esperamos e o alt não é 
