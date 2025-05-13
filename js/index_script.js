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
let currentProductImages = [];
let currentZoomLevel = 1;

// =============================================
// CARREGAMENTO DE PRODUTOS
// =============================================
async function loadProducts() {
  loader.style.display = "block";
  try {
    const response = await fetch("https://shakaw3dprint.github.io/Shakaw_3D_Print/assets/json/products.json");
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
    productDiv.innerHTML = `
      <div class="image-column">
        <img src="${product.mainImage}" alt="${product.name}" class="main-img" onclick="openModal(\'${product.mainImage}\', ['${product.mainImage}', ...${JSON.stringify(product.thumbnails)}])">
        <div class="thumbnail-container">
          ${product.thumbnails.map(thumb => `<img src="${thumb}" alt="Thumbnail de ${product.name}" onclick="changeMainImage(this, '${thumb}')">`).join("")}
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
        <button onclick="addInterest('${product.name}', '${product.price}', this)">Tenho Interesse</button>
      </div>
    `;
    catalog.appendChild(productDiv);
  });
}

// =============================================
// CARROSSEL
// =============================================
const carousel = document.getElementById("carousel");
const carouselIndicators = document.getElementById("carouselIndicators");
let carouselImages = [];
let currentCarouselIndex = 0;

async function loadCarouselImages() {
  try {
    const response = await fetch("https://shakaw3dprint.github.io/Shakaw_3D_Print/assets/json/carousel.json");
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
  }, 5000); // Muda a cada 5 segundos
}

// =============================================
// CONTROLE DE QUANTIDADE
// =============================================
function changeQuantity(button, delta) {
  const quantityInput = button.parentElement.querySelector(".quantity");
  let currentValue = parseInt(quantityInput.value);
  currentValue += delta;
  if (currentValue < 1) currentValue = 1;
  quantityInput.value = currentValue;
}

// =============================================
// MODAL DE IMAGEM
// =============================================
function openModal(imageSrc, imagesArray) {
  currentImageIndex = imagesArray.indexOf(imageSrc);
  currentProductImages = imagesArray;
  modalImg.src = imageSrc;
  imgModal.style.display = "block";
  resetZoom(); // Reseta o zoom ao abrir uma nova imagem
  document.body.style.overflow = "hidden"; // Impede scroll do body
}

function closeModal() {
  imgModal.style.display = "none";
  document.body.style.overflow = "auto"; // Restaura scroll do body
}

function navigateModal(step) {
  currentImageIndex = (currentImageIndex + step + currentProductImages.length) % currentProductImages.length;
  modalImg.src = currentProductImages[currentImageIndex];
  resetZoom(); // Reseta o zoom ao navegar
}

// =============================================
// CONTROLES DE ZOOM NO MODAL
// =============================================
function zoomImage(amount) {
  currentZoomLevel += amount;
  if (currentZoomLevel < 0.2) currentZoomLevel = 0.2; // Zoom mínimo
  if (currentZoomLevel > 3) currentZoomLevel = 3;   // Zoom máximo
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
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
};

// =============================================
// PAINEL DE INTERESSES
// =============================================
function addInterest(productName, productPrice, button) {
  const quantityInput = button.parentElement.querySelector(".quantity");
  const quantity = parseInt(quantityInput.value);

  const existingInterest = interests.find(item => item.name === productName);
  if (existingInterest) {
    existingInterest.quantity += quantity;
  } else {
    interests.push({ name: productName, price: productPrice, quantity: quantity });
  }
  updateInterestPanel();
  interestPanel.style.display = "block"; // Mostra o painel ao adicionar
}

function updateInterestPanel() {
  interestList.innerHTML = ""; // Limpa a lista
  if (interests.length === 0) {
    interestList.innerHTML = "<li>Nenhum item adicionado.</li>";
    interestPanel.style.display = "none"; // Esconde se vazio
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
}

function toggleInterestPanel() {
  if (interests.length > 0) { // Só alterna se houver itens
      interestPanel.style.display = interestPanel.style.display === "block" ? "none" : "block";
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
  
  selectedItemsSummary.innerHTML = ""; // Limpa o resumo
  let itemsText = "";
  interests.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `<strong>${item.quantity}x</strong> ${item.name} (${item.price})`;
    selectedItemsSummary.appendChild(itemDiv);
    itemsText += `${item.quantity}x ${item.name} (${item.price})\n`;
  });
  itemsDataInput.value = itemsText.trim(); // Adiciona ao campo hidden do formulário
  
  contactModal.style.display = "block";
  interestPanel.style.display = "none"; // Esconde o painel de interesses
}

// Fechar modal de contato se clicar fora
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
  updateInterestPanel(); // Para garantir que o painel esteja correto no carregamento
});

// =============================================
// FUNÇÕES AUXILIARES PARA IMAGENS DE PRODUTO
// =============================================
function changeMainImage(thumbnailElement, newImageSrc) {
  const productDiv = thumbnailElement.closest('.product');
  const mainImg = productDiv.querySelector('.main-img');
  mainImg.src = newImageSrc;
  // Atualiza o source do modal se a imagem principal for alterada
  mainImg.onclick = () => openModal(newImageSrc, currentProductImages);
}

