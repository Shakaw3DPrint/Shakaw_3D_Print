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

const ZOOM_INCREMENT = 0.07; // Mantido conforme preferência do usuário
const MAX_ZOOM = 4;          // Mantido conforme preferência do usuário
const MIN_ZOOM = 0.5;          // CORRIGIDO: Revertido para 1, valor menor que 1 quebra a lógica

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
// CARROSSEL 
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
// CONTROLE DE QUANTIDADE 
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
    imgModal.style.display = "block"; 
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

    document.removeEventListener("keydown", handleModalKeydown); 
    document.addEventListener("keydown", handleModalKeydown);
}

function closeModal() {
  if(!imgModal) return;
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; 
  document.removeEventListener("keydown", handleModalKeydown);
}

function navigateModal(step) {
  if (currentProductImages.length <= 1 || !modalImg) return;
  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  
  modalImg.alt = "Carregando nova imagem..."; 

  const handleNewImageLoad = () => {
    modalImg.alt = "Imagem ampliada";
    resetZoomAndPan(); 
    modalImg.removeEventListener("load", handleNewImageLoad);
    modalImg.removeEventListener("error", handleNewImageError);
  };

  const handleNewImageError = () => {
    console.error("Erro ao carregar imagem no modal via navegação:", currentProductImages[currentImageIndex]);
    modalImg.alt = "Erro ao carregar imagem";
    resetZoomAndPan(); 
    modalImg.removeEventListener("load", handleNewImageLoad);
    modalImg.removeEventListener("error", handleNewImageError);
  };

  modalImg.addEventListener("load", handleNewImageLoad);
  modalImg.addEventListener("error", handleNewImageError);
  modalImg.src = currentProductImages[currentImageIndex];

  if (modalImg.complete && modalImg.naturalWidth > 0 && modalImg.src === currentProductImages[currentImageIndex]) {
      setTimeout(() => {
          if (modalImg.alt !== "Imagem ampliada" && modalImg.alt !== "Erro ao carregar imagem") { 
            handleNewImageLoad();
          }
      }, 50); 
  }
}

function applyTransform() {
    if (!modalImg) return;
    modalImg.style.transform = `translate(${currentImgTranslateX}px, ${currentImgTranslateY}px) scale(${currentZoomLevel})`;
    modalImg.style.cursor = currentZoomLevel > MIN_ZOOM ? (isPanning ? "grabbing" : "grab") : "default";
}

function constrainPan() {
    if (!modalImg || !imgModal) return;
    const imgRect = modalImg.getBoundingClientRect(); // Dimensões da imagem *após* o scale do transform
    const modalRect = imgModal.getBoundingClientRect(); // Dimensões do contêiner do modal

    let newTranslateX = currentImgTranslateX;
    let newTranslateY = currentImgTranslateY;

    // Se a imagem escalada for menor ou igual ao modal em largura, centraliza X
    if (imgRect.width <= modalRect.width) {
        newTranslateX = 0;
    } else {
        // Limita o pan para que a borda esquerda da imagem não passe da borda esquerda do modal
        if (currentImgTranslateX - (imgRect.width - modalRect.width) / 2 > 0) {
            newTranslateX = (imgRect.width - modalRect.width) / 2;
        }
        // Limita o pan para que a borda direita da imagem não fique antes da borda direita do modal
        if (currentImgTranslateX + (imgRect.width - modalRect.width) / 2 < 0) {
            newTranslateX = -(imgRect.width - modalRect.width) / 2;
        }
    }

    // Se a imagem escalada for menor ou igual ao modal em altura, centraliza Y
    if (imgRect.height <= modalRect.height) {
        newTranslateY = 0;
    } else {
        if (currentImgTranslateY - (imgRect.height - modalRect.height) / 2 > 0) {
            newTranslateY = (imgRect.height - modalRect.height) / 2;
        }
        if (currentImgTranslateY + (imgRect.height - modalRect.height) / 2 < 0) {
            newTranslateY = -(imgRect.height - modalRect.height) / 2;
        }
    }
    currentImgTranslateX = newTranslateX;
    currentImgTranslateY = newTranslateY;
}

function zoomImage(amount, focalPoint = null) { 
  if(!modalImg || !imgModal) return;
  const oldZoomLevel = currentZoomLevel;
  currentZoomLevel += amount;
  if (currentZoomLevel < MIN_ZOOM) currentZoomLevel = MIN_ZOOM;
  if (currentZoomLevel > MAX_ZOOM) currentZoomLevel = MAX_ZOOM;

  if (currentZoomLevel === MIN_ZOOM && oldZoomLevel === MIN_ZOOM && amount < 0) {
      // Se já está no zoom mínimo e tenta diminuir, não faz nada (evita recálculos desnecessários)
      return;
  }

  if (currentZoomLevel === MIN_ZOOM) {
      resetZoomAndPan(); 
      return;
  }

  const modalRect = imgModal.getBoundingClientRect();
  let targetX_viewport, targetY_viewport;

  if (focalPoint) {
      targetX_viewport = focalPoint.x - modalRect.left;
      targetY_viewport = focalPoint.y - modalRect.top;
  } else { 
      targetX_viewport = modalRect.width / 2;
      targetY_viewport = modalRect.height / 2;
  }

  const imgPointX = (targetX_viewport - currentImgTranslateX) / oldZoomLevel;
  const imgPointY = (targetY_viewport - currentImgTranslateY) / oldZoomLevel;

  currentImgTranslateX = targetX_viewport - imgPointX * currentZoomLevel;
  currentImgTranslateY = targetY_viewport - imgPointY * currentZoomLevel;
  
  // constrainPan(); // constrainPan será chamado implicitamente por applyTransform se necessário, ou explicitamente se o pan estiver ativo
  applyTransform(); 
}

function resetZoomAndPan() { 
    if(!modalImg) return; 
    currentZoomLevel = MIN_ZOOM; 
    currentImgTranslateX = 0;
    currentImgTranslateY = 0;
    isPanning = false; 
    applyTransform();
}

function handlePanStart(e) {
    if (!modalImg || currentZoomLevel <= MIN_ZOOM || (e.type === "mousedown" && e.button !== 0)) return; 
    e.preventDefault();
    isPanning = true;
    if (e.type === "touchstart") {
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY;
    } else {
        panStartX = e.clientX;
        panStartY = e.clientY;
    }
    panStartImgX = currentImgTranslateX;
    panStartImgY = currentImgTranslateY;
    applyTransform(); 

    document.addEventListener("mousemove", handlePanMove);
    document.addEventListener("touchmove", handlePanMove, { passive: false });
    document.addEventListener("mouseup", handlePanEnd);
    document.addEventListener("touchend", handlePanEnd);
    document.addEventListener("mouseleave", handlePanEnd); 
}

function handlePanMove(e) {
    if (!isPanning || !modalImg) return;
    e.preventDefault(); 
    let currentX, currentY;
    if (e.type === "touchmove") {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
    } else {
        currentX = e.clientX;
        currentY = e.clientY;
    }
    const deltaX = currentX - panStartX;
    const deltaY = currentY - panStartY;
    currentImgTranslateX = panStartImgX + deltaX;
    currentImgTranslateY = panStartImgY + deltaY;
    constrainPan(); 
    applyTransform(); 
}

function handlePanEnd() {
    if (!isPanning) return;
    isPanning = false;
    applyTransform(); 
    document.removeEventListener("mousemove", handlePanMove);
    document.removeEventListener("touchmove", handlePanMove);
    document.removeEventListener("mouseup", handlePanEnd);
    document.removeEventListener("touchend", handlePanEnd);
    document.removeEventListener("mouseleave", handlePanEnd);
}

function handleMouseZoom(e) {
    if (!modalImg || !imgModal.contains(e.target) || isPanning) return; 
    e.preventDefault();
    const increment = e.button === 0 ? ZOOM_INCREMENT : (e.button === 2 ? -ZOOM_INCREMENT : 0);
    if (increment === 0) return;
    zoomImage(increment, { x: e.clientX, y: e.clientY });
}

function preventContextMenu(e) { e.preventDefault(); }

function handleModalKeydown(event) {
  if (!imgModal || imgModal.style.display !== "block") return;
  switch (event.key) {
    case "ArrowRight": navigateModal(1); break;
    case "ArrowLeft": navigateModal(-1); break;
    case "+": case "=": zoomImage(ZOOM_INCREMENT); break;
    case "-": zoomImage(-ZOOM_INCREMENT); break;
    case "0": resetZoomAndPan(); break;
    case "Escape": closeModal(); break;
  }
}

// =============================================
// BOTÃO VOLTAR AO TOPO 
// =============================================
window.onscroll = function() {
  if(backToTopBtn) backToTopBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
};

// =============================================
// FUNÇÃO AUXILIAR PARA CONVERTER PREÇO 
// =============================================
function parsePrice(priceString) {
  if (typeof priceString !== "string") return 0;
  return parseFloat(priceString.replace("R$", "").replace(".", "").replace(",", ".").trim());
}

// =============================================
// PAINEL DE INTERESSES 
// =============================================
function showInterestPanel(startAutoHideTimer = false) {
    if (!interestPanel) return;
    interestPanel.classList.add("visible");
    interestPanel.classList.remove("hidden-fade");
    clearTimeout(interestPanelTimeoutId); 
    if (startAutoHideTimer && interests.length > 0) { 
        resetInterestPanelAutoHideTimer();
    }
}
function hideInterestPanel(immediate = false) {
    if (!interestPanel) return;
    clearTimeout(interestPanelTimeoutId); 
    if (immediate) {
        interestPanel.classList.remove("visible");
        interestPanel.classList.add("hidden-fade"); 
    } else {
        interestPanel.classList.remove("visible"); 
        interestPanel.classList.add("hidden-fade");
    }
}
function resetInterestPanelAutoHideTimer() {
    if (!interestPanel) return;
    clearTimeout(interestPanelTimeoutId);
    interestPanelTimeoutId = setTimeout(() => {
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
  showInterestPanel(true); 
}
function updateInterestPanel() {
  if (!interestList) return;
  interestList.innerHTML = ""; 
  let totalValue = 0;
  if (interests.length === 0) {
    interestList.innerHTML = "<li>Nenhum item adicionado.</li>";
    if (interestTotalElement) interestTotalElement.innerHTML = ""; 
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
    document.querySelectorAll(".remove-interest-item-btn").forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      newButton.addEventListener("click", function() {
        removeInterest(parseInt(this.dataset.index));
      });
    });
  }
  if (interestTotalElement) {
    interestTotalElement.innerHTML = interests.length > 0 ? `<strong>Total: R$ ${totalValue.toFixed(2).replace(".", ",")}</strong>` : "";
  }
}
function removeInterest(index) {
  interests.splice(index, 1);
  updateInterestPanel();
  if (interestPanel.classList.contains("visible")) {
      showInterestPanel(true); 
  }
}
function toggleInterestPanel() {
  if (!interestPanel) return;
  if (interestPanel.classList.contains("visible")) {
    hideInterestPanel(); 
  } else {
    showInterestPanel(false); 
  }
}

// =============================================
// MODAL DE CONTATO 
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
  itemsText += `\nTotal Geral: R$ ${totalFormValue.toFixed(2).replace(".", ",")}`;
  if(itemsDataInput) itemsDataInput.value = itemsText.trim(); 
  if(contactModal) contactModal.style.display = "block";
  hideInterestPanel(true); 
}

// Fechar modais se clicar fora
window.onclick = function(event) {
  if (imgModal && event.target == imgModal && !modalImg.contains(event.target)) closeModal();
  if (contactModal && event.target == contactModal) if(contactModal) contactModal.style.display = "none";
}

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCarouselImages();
  updateInterestPanel(); 
  if (interestPanel) {
      interestPanel.classList.remove("visible"); 
      interestPanel.classList.add("hidden-fade");
  }

  if (modalImg) {
      modalImg.addEventListener("mousedown", handlePanStart);
      modalImg.addEventListener("touchstart", handlePanStart, { passive: false });
      modalImg.addEventListener("mousedown", handleMouseZoom);
      modalImg.addEventListener("contextmenu", preventContextMenu);
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
      const zoomInBtn = zoomControls.children[0]; 
      if(zoomInBtn) zoomInBtn.addEventListener("click", () => zoomImage(ZOOM_INCREMENT));
      const zoomOutBtn = zoomControls.children[1]; 
      if(zoomOutBtn) zoomOutBtn.addEventListener("click", () => zoomImage(-ZOOM_INCREMENT));
      const zoomResetBtn = zoomControls.children[2]; 
      if(zoomResetBtn) zoomResetBtn.addEventListener("click", resetZoomAndPan);
  }
  
  const closeContactModalButton = document.querySelector("#contactModal .close-contact");
  if(closeContactModalButton) closeContactModalButton.addEventListener("click", () => { if(contactModal) contactModal.style.display="none"; });
  
  if(backToTopBtn) backToTopBtn.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}) );
  
  const interestBtnGlobal = document.querySelector(".interest-btn"); 
  if(interestBtnGlobal) interestBtnGlobal.addEventListener("click", toggleInterestPanel);
  
  const showContactModalBtn = document.querySelector("#interestPanel .btn-submit-interest");
  if(showContactModalBtn) showContactModalBtn.addEventListener("click", showContactModal);

  const closeInterestPanelBtn = document.getElementById("closeInterestPanelBtn");
  if(closeInterestPanelBtn) closeInterestPanelBtn.addEventListener("click", () => hideInterestPanel(false)); 
});

