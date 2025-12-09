// State
let products = [];
let currentProductId = null;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const quantityModal = document.getElementById('quantityModal');
const productForm = document.getElementById('productForm');
const quantityForm = document.getElementById('quantityForm');
const searchInput = document.getElementById('searchInput');
const modalTitle = document.getElementById('modalTitle');

// Stats
const totalProductsEl = document.getElementById('totalProducts');
const totalItemsEl = document.getElementById('totalItems');
const totalValueEl = document.getElementById('totalValue');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  addProductBtn.addEventListener('click', () => openAddProductModal());
  
  // Close modals
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
  });
  
  document.getElementById('cancelBtn').addEventListener('click', closeModals);
  document.getElementById('cancelQuantityBtn').addEventListener('click', closeModals);
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModals();
    }
  });
  
  // Forms
  productForm.addEventListener('submit', handleProductSubmit);
  quantityForm.addEventListener('submit', handleQuantitySubmit);
  
  // Search
  searchInput.addEventListener('input', handleSearch);
}

// API Calls
async function loadProducts() {
  try {
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
    const response = await fetch('/api/products');
    products = await response.json();
    renderProducts(products);
    updateStats();
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<div class="empty-state"><h3>Error loading products</h3></div>';
  }
}

async function addProduct(productData) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (response.ok) {
      await loadProducts();
      closeModals();
      productForm.reset();
    } else {
      alert('Error adding product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Error adding product');
  }
}

async function updateQuantity(productId, quantity) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: parseInt(quantity) })
    });
    
    if (response.ok) {
      await loadProducts();
      closeModals();
    } else {
      alert('Error updating quantity');
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    alert('Error updating quantity');
  }
}

async function deleteProduct(productId, productName) {
  if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      await loadProducts();
    } else {
      alert('Error deleting product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product');
  }
}

// UI Functions
function renderProducts(productsToRender) {
  if (productsToRender.length === 0) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Add your first product to get started!</p>
      </div>
    `;
    return;
  }
  
  productsGrid.innerHTML = productsToRender.map(product => `
    <div class="product-card">
      <div class="product-header">
        <div class="product-name">${escapeHtml(product.name)}</div>
        ${product.category ? `<span class="product-category">${escapeHtml(product.category)}</span>` : ''}
      </div>
      <div class="product-description">${escapeHtml(product.description || 'No description')}</div>
      <div class="product-info">
        <div class="info-item">
          <div class="info-label">Quantity</div>
          <div class="info-value">${product.quantity}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Price</div>
          <div class="info-value">$${product.price.toFixed(2)}</div>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-small" onclick="openUpdateQuantityModal(${product.id}, ${product.quantity})">
          Update Qty
        </button>
        <button class="btn btn-danger btn-small" onclick="deleteProduct(${product.id}, '${escapeHtml(product.name)}')">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  
  totalProductsEl.textContent = totalProducts;
  totalItemsEl.textContent = totalItems;
  totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
}

function openAddProductModal() {
  modalTitle.textContent = 'Add New Product';
  productForm.reset();
  productModal.style.display = 'block';
}

function openUpdateQuantityModal(productId, currentQuantity) {
  currentProductId = productId;
  document.getElementById('newQuantity').value = currentQuantity;
  quantityModal.style.display = 'block';
}

function closeModals() {
  productModal.style.display = 'none';
  quantityModal.style.display = 'none';
  currentProductId = null;
}

function handleProductSubmit(e) {
  e.preventDefault();
  
  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    quantity: parseInt(document.getElementById('productQuantity').value),
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value
  };
  
  addProduct(productData);
}

function handleQuantitySubmit(e) {
  e.preventDefault();
  
  const newQuantity = document.getElementById('newQuantity').value;
  updateQuantity(currentProductId, newQuantity);
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  
  if (!searchTerm) {
    renderProducts(products);
    return;
  }
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
    (product.category && product.category.toLowerCase().includes(searchTerm))
  );
  
  renderProducts(filteredProducts);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
