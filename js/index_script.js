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

const ZOOM_INCREMENT = 0.06; // Mais sutil
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.07;

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

    const imageCheckPromises = uniquePotentialUrls.map(url => checkImage(url));
    const results = await Promise.all(imageCheckPromises);
    currentProductImages = results.filter(result => result.status === "loaded").map(result => result.url);

    if (currentProductImages.length === 0) {
        alert("Não foi possível carregar nenhuma imagem para este produto.");
        closeModal(); return;
    }

    currentImageIndex = currentProductImages.indexOf(clickedImageSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;

    modalImg.src = currentProductImages[currentImageIndex];
    modalImg.alt = "Imagem ampliada";
    imgModal.style.display = "block";
    resetZoomAndPan(); 
    document.body.style.overflow = "hidden";
    document.removeEventListener("keydown", handleModalKeydown);
    document.addEventListener("keydown", handleModalKeydown);
}

function closeModal() {
  if(!imgModal) return;
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; 
  document.removeEventListener("keydown", handleModalKeydown);
  modalImg.removeEventListener("mousedown", handlePanStart);
  modalImg.removeEventListener("touchstart", handlePanStart);
  modalImg.removeEventListener("mousedown", handleMouseZoom);
  modalImg.removeEventListener("contextmenu", preventContextMenu);
}

function navigateModal(step) {
  if (currentProductImages.length <= 1 || !modalImg) return;
  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  modalImg.src = currentProductImages[currentImageIndex];
  modalImg.alt = "Imagem ampliada";
  resetZoomAndPan(); 
}

function applyTransform() {
    if (!modalImg) return;
    modalImg.style.transform = `translate(${currentImgTranslateX}px, ${currentImgTranslateY}px) scale(${currentZoomLevel})`;
    modalImg.style.cursor = currentZoomLevel > MIN_ZOOM ? (isPanning ? "grabbing" : "grab") : "default";
}

function constrainPan() {
    if (!modalImg || !imgModal) return;

    const scaledWidth = modalImg.offsetWidth * currentZoomLevel;
    const scaledHeight = modalImg.offsetHeight * currentZoomLevel;
    const modalViewportRect = imgModal.getBoundingClientRect();

    let constrainedX = currentImgTranslateX;
    let constrainedY = currentImgTranslateY;

    if (scaledWidth <= modalViewportRect.width) {
        constrainedX = 0; // Centraliza se menor ou igual ao viewport
    } else {
        if (constrainedX > 0) constrainedX = 0;
        if (constrainedX + scaledWidth < modalViewportRect.width) {
            constrainedX = modalViewportRect.width - scaledWidth;
        }
    }

    if (scaledHeight <= modalViewportRect.height) {
        constrainedY = 0; // Centraliza se menor ou igual ao viewport
    } else {
        if (constrainedY > 0) constrainedY = 0;
        if (constrainedY + scaledHeight < modalViewportRect.height) {
            constrainedY = modalViewportRect.height - scaledHeight;
        }
    }
    currentImgTranslateX = constrainedX;
    currentImgTranslateY = constrainedY;
}

function zoomImage(amount, focalPoint = null) { // focalPoint = {x, y} em coordenadas do viewport
  if(!modalImg || !imgModal) return;
  const oldZoomLevel = currentZoomLevel;
  currentZoomLevel += amount;
  if (currentZoomLevel < MIN_ZOOM) currentZoomLevel = MIN_ZOOM;
  if (currentZoomLevel > MAX_ZOOM) currentZoomLevel = MAX_ZOOM;

  if (currentZoomLevel === MIN_ZOOM) {
      resetZoomAndPan(); // Reseta tudo se voltou ao zoom mínimo
      return;
  }

  const modalRect = imgModal.getBoundingClientRect();
  let targetX_viewport, targetY_viewport;

  if (focalPoint) {
      targetX_viewport = focalPoint.x - modalRect.left;
      targetY_viewport = focalPoint.y - modalRect.top;
  } else { // Zoom centralizado se não houver focalPoint
      targetX_viewport = modalRect.width / 2;
      targetY_viewport = modalRect.height / 2;
  }

  // Ponto na imagem (não escalada) que estava sob o focalPoint
  const imgPointX = (targetX_viewport - currentImgTranslateX) / oldZoomLevel;
  const imgPointY = (targetY_viewport - currentImgTranslateY) / oldZoomLevel;

  // Nova translação para manter imgPointX, imgPointY sob o targetX_viewport, targetY_viewport
  currentImgTranslateX = targetX_viewport - imgPointX * currentZoomLevel;
  currentImgTranslateY = targetY_viewport - imgPointY * currentZoomLevel;
  
  constrainPan(); // Ajusta translações para limites e aplica o transform
  applyTransform(); // Garante que o cursor seja atualizado após constrainPan
}

function resetZoomAndPan() { 
    if(!modalImg) return; 
    currentZoomLevel = MIN_ZOOM; 
    currentImgTranslateX = 0;
    currentImgTranslateY = 0;
    isPanning = false; // Garante que o estado de pan seja resetado
    applyTransform();
}

function handlePanStart(e) {
    if (!modalImg || currentZoomLevel <= MIN_ZOOM || (e.type === "mousedown" && e.button !== 0)) return; // Pan só com botão esquerdo
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
    applyTransform(); // Atualiza cursor para grabbing

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
    applyTransform(); // Atualiza cursor para grab se zoom > 1
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
// BOTÃO VOLTAR AO TOPO (código omitido, mantido como antes)
// =============================================
window.onscroll = function() {
  if(backToTopBtn) backToTopBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
};

// =============================================
// FUNÇÃO AUXILIAR PARA CONVERTER PREÇO (código omitido, mantido como antes)
// =============================================
function parsePrice(priceString) {
  if (typeof priceString !== "string") return 0;
  return parseFloat(priceString.replace("R$", "").replace(".", "").replace(",", ".").trim());
}

// =============================================
// PAINEL DE INTERESSES (código omitido, mantido como antes)
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
// MODAL DE CONTATO (código omitido, mantido como antes)
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


