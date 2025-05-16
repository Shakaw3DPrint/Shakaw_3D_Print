// JavaScript para a página Outros Projetos

document.addEventListener("DOMContentLoaded", function() {
    // Carregar dados dos projetos
    loadProjects();
    
    // Integrar o Instagram
    loadInstagramPosts();
    
    // Configurar eventos para o modal de imagem
    setupModalEvents();
    
    // Configurar o botão "Voltar ao Topo"
    setupBackToTopButton();
});

// Dados dos projetos (simulando um JSON que poderia vir de um arquivo externo)
const projectsData = [
    {
        id: 1,
        title: "Miniaturas de Personagens",
        description: "Coleção de miniaturas de personagens populares impressas em 3D com alto nível de detalhamento.",
        image: "assets/img/projects/project1.jpg"
    },
    {
        id: 2,
        title: "Acessórios para Cosplay",
        description: "Peças e acessórios personalizados para cosplayers, incluindo armas, armaduras e adereços.",
        image: "assets/img/projects/project2.jpg"
    },
    {
        id: 3,
        title: "Decoração Geek",
        description: "Itens decorativos inspirados em universos geek para deixar sua casa ou escritório mais divertidos.",
        image: "assets/img/projects/project3.jpg"
    },
    {
        id: 4,
        title: "Peças Funcionais",
        description: "Componentes e peças funcionais para diversos usos, desde suportes até engrenagens e mecanismos.",
        image: "assets/img/projects/project4.jpg"
    },
    {
        id: 5,
        title: "Modelos Arquitetônicos",
        description: "Maquetes e modelos arquitetônicos em escala, perfeitos para apresentações e visualização de projetos.",
        image: "assets/img/projects/project5.jpg"
    },
    {
        id: 6,
        title: "Protótipos Industriais",
        description: "Protótipos rápidos para validação de conceitos e testes de design em projetos industriais.",
        image: "assets/img/projects/project6.jpg"
    }
];

// Função para carregar os projetos na galeria
function loadProjects() {
    const galleryContainer = document.getElementById('projectsGallery');
    if (!galleryContainer) return;
    
    let galleryHTML = '';
    
    projectsData.forEach(project => {
        galleryHTML += `
            <div class="project-item">
                <div class="project-image-container">
                    <img src="${project.image}" alt="${project.title}" class="project-image" 
                         onclick="openProjectModal('${project.image}', [${projectsData.map(p => `'${p.image}'`).join(',')}])">
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                </div>
            </div>
        `;
    });
    
    galleryContainer.innerHTML = galleryHTML;
}

// Função para abrir o modal com a imagem do projeto
function openProjectModal(clickedImageSrc, allImages) {
    // Reutiliza a função openModal do index_script.js
    if (typeof openModal === 'function') {
        openModal(clickedImageSrc, allImages);
    } else {
        console.error('Função openModal não encontrada. Verifique se index_script.js está carregado corretamente.');
    }
}

// Configurar eventos para o modal de imagem
function setupModalEvents() {
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalPrevBtn = document.getElementById('modalPrevBtn');
    const modalNextBtn = document.getElementById('modalNextBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
        if (typeof closeModal === 'function') closeModal();
    });
    
    if (modalPrevBtn) modalPrevBtn.addEventListener('click', () => {
        if (typeof navigateModal === 'function') navigateModal(-1);
    });
    
    if (modalNextBtn) modalNextBtn.addEventListener('click', () => {
        if (typeof navigateModal === 'function') navigateModal(1);
    });
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => {
        if (typeof zoomImage === 'function') zoomImage(0.07);
    });
    
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => {
        if (typeof zoomImage === 'function') zoomImage(-0.07);
    });
    
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
        if (typeof resetZoomAndPan === 'function') resetZoomAndPan();
    });
}

// Configurar o botão "Voltar ao Topo"
function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    
    if (backToTopBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.style.display = "block";
            } else {
                backToTopBtn.style.display = "none";
            }
        };
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }
}

// Função para carregar as postagens do Instagram
function loadInstagramPosts() {
    const instagramContainer = document.querySelector('.instagram-embed-container');
    if (!instagramContainer) return;
    
    // Usando o widget de embed do Instagram
    instagramContainer.innerHTML = `
        <script src="https://www.instagram.com/embed.js"></script>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
            <!-- Primeira postagem recente -->
            <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/shakaw3dprint/feed/" 
                data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); 
                margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
            </blockquote>
            
            <!-- Segunda postagem recente -->
            <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/CqGK5N4OLvQ/" 
                data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); 
                margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
            </blockquote>
        </div>
    `;
    
    // Carregar o script do Instagram para processar os embeds
    const instagramScript = document.createElement('script');
    instagramScript.src = "//www.instagram.com/embed.js";
    document.body.appendChild(instagramScript);
    
    // Configurar o carrossel do Instagram (alternativa visual ao embed)
    setupInstagramCarousel();
}

// Configurar o carrossel do Instagram (alternativa visual)
function setupInstagramCarousel() {
    const instagramCarousel = document.getElementById('instagramCarousel');
    const instagramIndicators = document.getElementById('instagramCarouselIndicators');
    const instaPrevBtn = document.getElementById('instaPrevBtn');
    const instaNextBtn = document.getElementById('instaNextBtn');
    
    if (!instagramCarousel || !instagramIndicators) return;
    
    // Ocultar o carrossel alternativo, já que estamos usando o embed oficial
    document.querySelector('.instagram-carousel-container').style.display = 'none';
    
    // Caso queira implementar um carrossel personalizado no futuro, o código estaria aqui
}
