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
let currentProductImages = []; // Esta lista conterá apenas URLs de imagens VÁLIDAS
let currentZoomLevel = 1;
let interestPanelTimeoutId = null; // Timer para auto-hide do painel de interesses

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
    // Remove duplicatas caso a imagem principal também esteja nas thumbnails
    allPotentialImages = [...new Set(allPotentialImages)]; 

    const imageColumn = document.createElement("div");
    imageColumn.className = "image-column";
    const mainImgElement = document.createElement("img");
    if (product.mainImage && typeof product.mainImage === "string") {
        mainImgElement.src = product.mainImage;
        mainImgElement.alt = product.name;
        mainImgElement.className = "main-img";
        mainImgElement.addEventListener("click", () => {
          // Passa todas as imagens potenciais (principal + thumbs) para o openModal
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
// MODAL DE IMAGEM
// =============================================
async function openModal(clickedImageSrc, allPotentialImageUrls) {
    if (!imgModal || !modalImg) return;

    // Garante que allPotentialImageUrls seja um array de strings únicas e não nulas/vazias
    let uniquePotentialUrls = Array.isArray(allPotentialImageUrls) 
        ? [...new Set(allPotentialImageUrls.filter(url => url && typeof url === "string"))] 
        : [];

    if (clickedImageSrc && typeof clickedImageSrc === "string" && !uniquePotentialUrls.includes(clickedImageSrc)) {
        uniquePotentialUrls.unshift(clickedImageSrc); // Adiciona a imagem clicada no início se não estiver lá
        uniquePotentialUrls = [...new Set(uniquePotentialUrls)];
    }

    if (uniquePotentialUrls.length === 0) {
        console.warn("Nenhuma URL de imagem potencial fornecida para o modal.");
        closeModal();
        return;
    }

    // Mostra um loader no modal enquanto as imagens são verificadas
    modalImg.src = ""; // Limpa a imagem anterior
    modalImg.alt = "Carregando imagens...";
    // Você pode adicionar um estilo para um ícone de carregamento aqui se desejar

    const imageCheckPromises = uniquePotentialUrls.map(url => checkImage(url));
    const results = await Promise.all(imageCheckPromises);

    currentProductImages = results.filter(result => result.status === "loaded").map(result => result.url);

    if (currentProductImages.length === 0) {
        console.warn("Nenhuma imagem válida pôde ser carregada para o modal.");
        alert("Não foi possível carregar nenhuma imagem para este produto.");
        closeModal();
        return;
    }

    // Tenta encontrar a imagem clicada originalmente na lista de imagens válidas
    currentImageIndex = currentProductImages.indexOf(clickedImageSrc);
    if (currentImageIndex === -1) { // Se a imagem clicada não for válida ou não estiver na lista de válidas
        currentImageIndex = 0; // Começa com a primeira imagem válida
    }

    modalImg.src = currentProductImages[currentImageIndex];
    modalImg.alt = "Imagem ampliada"; // Restaura o alt text
    imgModal.style.display = "block";
    resetZoom();
    document.body.style.overflow = "hidden";
    document.removeEventListener("keydown", handleModalKeydown); // Remove listener antigo para evitar duplicação
    document.addEventListener("keydown", handleModalKeydown);
}

function closeModal() {
  if(!imgModal) return;
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; 
  document.removeEventListener("keydown", handleModalKeydown);
}

function navigateModal(step) {
  if (currentProductImages.length === 0 || !modalImg) return;
  if (currentProductImages.length === 1) return; // Não navega se só houver uma imagem válida

  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  modalImg.src = currentProductImages[currentImageIndex];
  modalImg.alt = "Imagem ampliada";
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
  if (!imgModal || imgModal.style.display !== "block") return;
  switch (event.key) {
    case "ArrowRight": navigateModal(1); break;
    case "ArrowLeft": navigateModal(-1); break;
    case "+": case "=": zoomImage(0.2); break;
    case "-": zoomImage(-0.2); break;
    case "0": resetZoom(); break;
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
  if (interestPanel) {
      interestPanel.classList.remove("visible"); 
      interestPanel.classList.add("hidden-fade");
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
      if(zoomInBtn) zoomInBtn.addEventListener("click", () => zoomImage(0.2));
      const zoomOutBtn = zoomControls.children[1]; 
      if(zoomOutBtn) zoomOutBtn.addEventListener("click", () => zoomImage(-0.2));
      const zoomResetBtn = zoomControls.children[2]; 
      if(zoomResetBtn) zoomResetBtn.addEventListener("click", resetZoom);
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


