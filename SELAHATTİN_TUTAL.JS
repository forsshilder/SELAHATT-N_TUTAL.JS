(() => {
  const PRODUCTS_URL = "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json";
  const LOCAL_STORAGE_PRODUCTS = "carouselProducts";
  const LOCAL_STORAGE_LIKEDS_PRODUCTS = "carouselLikeds";

  const init = async () => {
    const productDetailElement = document.querySelector(".product-detail");
    if (productDetailElement) {
      addCarouselStyles();
      const products = await fetchProducts();
      if (products) {
        createCarousel(products);
      }
    }
  };

  const addCarouselStyles = () => {
    const styles = `
            .carousel-container { margin: 20px auto; max-width: 1200px; overflow: hidden; position: relative; }
            .carousel-title { font-size: 24px; text-align: center; margin-bottom: 15px; }
            .carousel { display: flex; align-items: center; position: relative; }
            .carousel-slider { overflow: hidden; width: 100%; }
            .carousel-track { display: flex; gap: 10px; transition: transform 0.3s ease-in-out; }
            .carousel-slide { flex: 0 0 calc((100% - 60px) / 6.5); box-sizing: border-box; }
            .product-card { background: #fff; border-radius: 8px; text-align: center; position: relative; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .product-card img { width: 100%; height: auto; border-bottom: 1px solid #ddd; }
            .product-info { padding: 10px; }
            .favorite-btn { position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 16px; color: #ccc; z-index: 10; }
            .favorite-btn.active { color: blue; }
            .carousel-arrow { position: absolute; top: 50%; font-size: 24px; background: none; border: none; cursor: pointer; z-index: 10; }
            .carousel-arrow-left { left: 10px; transform: translateY(-50%); }
            .carousel-arrow-right { right: 10px; transform: translateY(-50%); }
        `;
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  };

  const fetchProducts = async () => {
    let products = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
    if (!products) {
      const response = await fetch(PRODUCTS_URL);
      products = await response.json();
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
    }
    return JSON.parse(products);
  };

  const getLikeds = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIKEDS_PRODUCTS)) || [];
  const saveLikeds = (favorites) => localStorage.setItem(LOCAL_STORAGE_LIKEDS_PRODUCTS, JSON.stringify(favorites));

  const createCarousel = (products) => {
    const container = document.querySelector(".product-detail");
    if (!container || container.querySelector(".carousel-container")) return; // Prevent duplicate rendering

    const carouselWrapper = document.createElement("div");
    carouselWrapper.className = "carousel-container";
    carouselWrapper.innerHTML = `
            <p class="carousel-title">You Might Also Like</p>
            <div class="carousel">
                <button class="carousel-arrow carousel-arrow-left">&lt;</button>
                <div class="carousel-slider">
                    <div class="carousel-track"></div>
                </div>
                <button class="carousel-arrow carousel-arrow-right">&gt;</button>
            </div>
        `;
    container.appendChild(carouselWrapper);

    const track = carouselWrapper.querySelector(".carousel-track");
    displayProducts(track, products);
    addCarouselArrows(carouselWrapper, track, products);
  };

  const displayProducts = (track, products) => {
    const favorites = getLikeds();
    track.innerHTML = ""; // Clear previous content
    products.forEach((product) => {
      const isLiked = favorites.includes(product.id);
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      slide.innerHTML = `
                <div class="product-card">
                    <a href="${product.url}" target="_blank">
                        <img src="${product.img}" alt="${product.name}">
                    </a>
                    <div class="favorite-btn ${isLiked ? "active" : ""}" data-id="${product.id}">❤</div>
                    <div class="product-info">
                        <p>${product.name}</p>
                        <p>${product.price.toFixed(2)} TL</p>
                    </div>
                </div>
            `;
      slide.querySelector(".favorite-btn").addEventListener("click", (event) => {
        toggleFavorite(product.id, event.target);
      });
      track.appendChild(slide);
    });
  };

  const toggleFavorite = (id, button) => {
    const favorites = getLikeds();
    const index = favorites.indexOf(id);
    if (index === -1) {
      favorites.push(id);
      button.classList.add("active");
    } else {
      favorites.splice(index, 1);
      button.classList.remove("active");
    }
    saveLikeds(favorites);
  };

  const addCarouselArrows = (wrapper, track) => {
    const leftArrow = wrapper.querySelector(".carousel-arrow-left");
    const rightArrow = wrapper.querySelector(".carousel-arrow-right");
    const slides = Array.from(track.children);
    const visibleItems = 6.5;
    const slideWidth = wrapper.querySelector(".carousel-slide").offsetWidth;

    let currentIndex = 0;
    const updateSliderPosition = () => {
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };

    leftArrow.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
      }
    });

    rightArrow.addEventListener("click", () => {
      if (currentIndex < slides.length - visibleItems) {
        currentIndex++;
        updateSliderPosition();
      }
    });
  };

  init();
})();
