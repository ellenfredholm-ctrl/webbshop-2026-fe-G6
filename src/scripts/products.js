import { getProducts } from "../utils/productsApi.js";

// TEMP: Default products for rendering when backend is unavailable
const TEMP_PRODUCTS = [
  { name: "Organic Tomatoes", price: 4.99, image: null, slug: "organic-tomatoes" },
  { name: "Fresh Milk", price: 2.49, image: null, slug: "fresh-milk" },
  { name: "Whole Grain Bread", price: 3.99, image: null, slug: "whole-grain-bread" },
  { name: "Free Range Eggs", price: 5.49, image: null, slug: "free-range-eggs" },
  { name: "Bananas", price: 1.29, image: null, slug: "bananas" },
  { name: "Greek Yogurt", price: 3.79, image: null, slug: "greek-yoghurt" },
];

document.addEventListener("DOMContentLoaded", loadProducts);

async function loadProducts() {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "<p>Loading products...</p>";

  try {
    const products = await getProducts();
    productsContainer.innerHTML = "";

    const toRender = products.length > 0 ? products : TEMP_PRODUCTS;
    if (products.length === 0) {
      productsContainer.dataset.temp = "true";
      const notice = document.createElement("p");
      notice.className = "temp-notice";
      notice.textContent = "Showing demo products (backend unavailable)";
      productsContainer.appendChild(notice);
    }

    toRender.forEach((product) => {
      const productCard = createProductCard(product);
      productsContainer.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    productsContainer.innerHTML = "";
    productsContainer.dataset.temp = "true";
    const notice = document.createElement("p");
    notice.className = "temp-notice";
    notice.textContent = "Showing demo products (backend unavailable)";
    productsContainer.appendChild(notice);
    TEMP_PRODUCTS.forEach((product) => {
      productsContainer.appendChild(createProductCard(product));
    });
  }
}

// Function to create an individual product card
function createProductCard(product) {
  const eventCard = document.createElement("div");
  eventCard.className = "product-card";

  const imageSection = product.image
    ? `<img class="product-card__image" src="${product.image}" alt="${product.name}" loading="lazy" />`
    : `<div class="product-card__image-placeholder">🥬</div>`;

  eventCard.innerHTML = `
    ${imageSection}
    <div class="product-card__body">
      <h3>${product.name}</h3>
      <p class="product-card__price">$${product.price.toFixed(2)}</p>
      <p>Plats: Globen</p>
      <button class="see-details-btn">Boka (?)</button>
    </div>
  `;

   eventCard.querySelector(".see-details-btn").addEventListener("click", () => {
    window.location.href = `product.html?slug=${product.slug}`;
  });

  // eventCard.querySelector(".add-to-cart-btn").addEventListener("click", () => {
  //   alert(`Adding ${product.name} to cart\nFunctionality not implemented yet`);
  // });

  return eventCard;
}
