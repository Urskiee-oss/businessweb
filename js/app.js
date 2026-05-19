// Cart State
let cart = [];

// Default products
const defaultProducts = [
    { id: 1, name: 'Revel Bars', price: 4.50, image: 'revel-bar.jpg', stock: 'out-of-stock' },
    { id: 2, name: 'Banana Loaf', price: 12.00, image: 'bananaloaf.jpg', stock: 'out-of-stock' },
    { id: 3, name: 'Cake', price: 35.00, image: 'cake.jpg', stock: 'out-of-stock' },
    { id: 4, name: 'Cupcake', price: 3.50, image: 'cupcake.jpg', stock: 'out-of-stock' },
    { id: 5, name: 'Coconut Macaroons', price: 2.00, image: 'macaroons.jpg', stock: 'out-of-stock' },
    { id: 6, name: 'Bento Cake', price: 18.00, image: 'bento-cake.jpg', stock: 'out-of-stock' },
    { id: 7, name: 'Banana Muffin', price: 3.00, image: 'banana-muffin.jpg', stock: 'out-of-stock' },
    { id: 8, name: 'Coming Soon', price: 0, image: '', stock: 'coming-soon' }
];

// Initialize products from localStorage or use defaults
let products = JSON.parse(localStorage.getItem('jelsProducts')) || [...defaultProducts];

// Initialize orders from localStorage
let orders = JSON.parse(localStorage.getItem('jelsOrders')) || [];

// DOM Elements
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');

const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const deliveryAddress = document.getElementById('deliveryAddress');

const orderConfirmation = document.getElementById('orderConfirmation');
const closeConfirmation = document.getElementById('closeConfirmation');

const summarySubtotal = document.getElementById('summarySubtotal');
const summaryTotal = document.getElementById('summaryTotal');
const deliveryFeeLine = document.getElementById('deliveryFeeLine');

// Admin Elements
const adminBtn = document.getElementById('adminBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginOverlay = document.getElementById('adminLoginOverlay');
const loginForm = document.getElementById('loginForm');
const closeLogin = document.getElementById('closeLogin');

const adminPanel = document.getElementById('adminPanel');
const adminPanelOverlay = document.getElementById('adminPanelOverlay');
const closeAdmin = document.getElementById('closeAdmin');
const logoutBtn = document.getElementById('logoutBtn');

const addProductBtn = document.getElementById('addProductBtn');
const productsList = document.getElementById('productsList');
const ordersList = document.getElementById('ordersList');

const productModal = document.getElementById('productModal');
const productModalOverlay = document.getElementById('productModalOverlay');
const closeProductModalBtn = document.getElementById('closeProductModal');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const productForm = document.getElementById('productForm');
const productModalTitle = document.getElementById('productModalTitle');

const confirmModal = document.getElementById('confirmModal');
const confirmCancel = document.getElementById('confirmCancel');

let editingProductId = null;
let deleteProductId = null;

// Product images mapping
const productImages = {};
products.forEach(p => {
    if (p.image) productImages[p.name] = `assets/${p.image}`;
});

// Set minimum pickup date to today
document.addEventListener('DOMContentLoaded', () => {
    const pickupDate = document.getElementById('pickupDate');
    if (pickupDate) {
        const today = new Date().toISOString().split('T')[0];
        pickupDate.setAttribute('min', today);
    }
    renderProducts();

    // Logo Intro Animation
    const logoIntro = document.getElementById('logoIntro');
    if (logoIntro) {
        setTimeout(() => {
            logoIntro.classList.add('hidden');
            setTimeout(() => {
                logoIntro.remove();
            }, 800);
        }, 3000);
    }
});

// Cart Functions
function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartFn() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Toast notification for errors
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon');
    toastMessage.textContent = message;

    if (type === 'success') {
        toast.style.background = '#2e7d32';
        toast.style.boxShadow = '0 8px 24px rgba(46, 125, 50, 0.4)';
        toastIcon.innerHTML = '&#10003;';
    } else {
        toast.style.background = '#c62828';
        toast.style.boxShadow = '0 8px 24px rgba(198, 40, 40, 0.4)';
        toastIcon.innerHTML = '&#9888;';
    }

    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function addToCart(name, price, btnElement) {
    const product = products.find(p => p.name === name);

    if (!product || product.stock === 'out-of-stock') {
        showToast(`Sorry, ${name} is currently out of stock!`);
        return;
    }

    if (product.stock === 'coming-soon') {
        showToast(`${name} is not yet available!`);
        return;
    }

    if (!price || price === 0) {
        showToast(`${name} is not available!`);
        return;
    }

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price: parseFloat(price), quantity: 1 });
    }

    updateCartUI();
    openCart();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
}

function updateItemQuantity(name, delta) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${productImages[item.name] || 'assets/favicon.png'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateItemQuantity('${item.name}', -1)">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateItemQuantity('${item.name}', 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart('${item.name}')">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
        checkoutBtn.disabled = false;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isDelivery = document.querySelector('input[name="orderType"]:checked')?.value === 'delivery';
    const deliveryFee = isDelivery ? 5 : 0;
    const total = subtotal + deliveryFee;

    const orderSummaryItems = document.getElementById('orderSummaryItems');
    if (orderSummaryItems) {
        orderSummaryItems.innerHTML = cart.map(item => `
            <div class="summary-line">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;

    if (isDelivery) {
        deliveryFeeLine.style.display = 'flex';
    } else {
        deliveryFeeLine.style.display = 'none';
    }

    summaryTotal.textContent = `$${total.toFixed(2)}`;
}

// Checkout Functions
function openCheckout() {
    closeCartFn();
    updateOrderSummary();
    checkoutModal.classList.add('active');
    checkoutOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutFn() {
    checkoutModal.classList.remove('active');
    checkoutOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function showOrderConfirmation() {
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('orderNumber').textContent = orderNumber;
    orderConfirmation.classList.add('active');
}

function closeConfirmationFn() {
    orderConfirmation.classList.remove('active');
    checkoutOverlay.classList.remove('active');
    document.body.style.overflow = '';
    cart = [];
    updateCartUI();
    checkoutForm.reset();
}

// Admin Login Functions
function openLoginModal() {
    adminLoginModal.classList.add('active');
    adminLoginOverlay.classList.add('active');
    document.getElementById('ownerPassword').value = '';
}

function closeLoginModal() {
    adminLoginModal.classList.remove('active');
    adminLoginOverlay.classList.remove('active');
}

function openAdminPanel() {
    adminLoginModal.classList.remove('active');
    adminLoginOverlay.classList.remove('active');
    adminPanel.classList.add('active');
    adminPanelOverlay.classList.add('active');
    renderProductsList();
    renderOrdersList();
}

function closeAdminPanel() {
    adminPanel.classList.remove('active');
    adminPanelOverlay.classList.remove('active');
}

// Product Management
function renderProductsList() {
    const currentUserProducts = JSON.parse(localStorage.getItem('jelsProducts')) || products;

    productsList.innerHTML = currentUserProducts.map(product => `
        <div class="product-item">
            <div class="product-item-image">
                <img src="${product.image ? 'assets/' + product.image : 'assets/favicon.png'}" alt="${product.name}">
            </div>
            <div class="product-item-details">
                <p class="product-item-name">${product.name}</p>
                <p class="product-item-price">$${product.price.toFixed(2)}</p>
                <span class="product-item-status ${product.stock}">
                    ${product.stock === 'in-stock' ? 'In Stock' : product.stock === 'out-of-stock' ? 'Out of Stock' : 'Coming Soon'}
                </span>
            </div>
            <div class="product-item-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                <button class="delete-btn" onclick="confirmDeleteProduct(${product.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function openProductModal(product = null) {
    productModal.classList.add('active');
    productModalOverlay.classList.add('active');

    if (product) {
        editingProductId = product.id;
        productModalTitle.textContent = 'Edit Product';
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productStatus').value = product.stock;
    } else {
        editingProductId = null;
        productModalTitle.textContent = 'Add New Product';
        productForm.reset();
    }
}

function closeProductModal() {
    productModal.classList.remove('active');
    productModalOverlay.classList.remove('active');
    productForm.reset();
    editingProductId = null;
}

function saveProduct(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const stock = document.getElementById('productStatus').value;

    if (!name || isNaN(price)) {
        showToast('Please fill in all required fields');
        return;
    }

    // Refresh products from localStorage
    let currentProducts = JSON.parse(localStorage.getItem('jelsProducts')) || [...defaultProducts];

    if (editingProductId) {
        const index = currentProducts.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            currentProducts[index] = { ...currentProducts[index], name, price, image, stock };
        }
    } else {
        const newId = Math.max(...currentProducts.map(p => p.id), 0) + 1;
        currentProducts.push({ id: newId, name, price, image, stock });
    }

    localStorage.setItem('jelsProducts', JSON.stringify(currentProducts));
    products = currentProducts;

    // Update product images mapping
    if (image) productImages[name] = `assets/${image}`;

    closeProductModal();
    renderProductsList();
    renderProducts();
    showToast(editingProductId ? 'Product updated!' : 'Product added!', 'success');
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        openProductModal(product);
    }
}

function confirmDeleteProduct(id) {
    deleteProductId = id;
    const product = products.find(p => p.id === id);
    document.getElementById('confirmMessage').textContent = `Are you sure you want to delete "${product.name}"?`;
    confirmModal.classList.add('active');
}

function deleteProduct() {
    if (deleteProductId) {
        let currentProducts = JSON.parse(localStorage.getItem('jelsProducts')) || [...defaultProducts];
        currentProducts = currentProducts.filter(p => p.id !== deleteProductId);
        localStorage.setItem('jelsProducts', JSON.stringify(currentProducts));
        products = currentProducts;

        confirmModal.classList.remove('active');
        renderProductsList();
        renderProducts();
        showToast('Product deleted!', 'success');
        deleteProductId = null;
    }
}

function renderProducts() {
    const cardsGrid = document.querySelector('.cards-grid');
    const currentProducts = JSON.parse(localStorage.getItem('jelsProducts')) || products;

    // Keep the grid but update products
    cardsGrid.innerHTML = currentProducts.map(product => {
        const isInStock = product.stock === 'in-stock';
        const isComingSoon = product.stock === 'coming-soon' || product.price === 0;

        return `
            <div class="product-card" data-name="${product.name}" data-price="${product.price}">
                <div class="product-image">
                    ${product.image ? `<img src="assets/${product.image}" alt="${product.name}">` : '?'}
                </div>
                <h3>${product.name}</h3>
                <p class="price ${!isInStock && !isComingSoon ? 'out-of-stock' : ''}">
                    ${isComingSoon ? 'Coming Soon' : `$${product.price.toFixed(2)}`}
                </p>
                ${!isComingSoon ? `<button class="add-to-cart-btn" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>` : ''}
            </div>
        `;
    }).join('');

    // Re-attach event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const name = btn.dataset.name;
            const price = btn.dataset.price;
            addToCart(name, price, btn);
        });
    });
}

// Orders
function renderOrdersList() {
    const currentOrders = JSON.parse(localStorage.getItem('jelsOrders')) || [];

    if (currentOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders yet</p>';
        return;
    }

    ordersList.innerHTML = currentOrders.reverse().map(order => `
        <div class="order-item">
            <div class="order-item-header">
                <span class="order-item-number">Order #${order.orderNumber}</span>
                <span class="order-item-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <p class="order-item-customer">${order.customer.name} | ${order.customer.phone}</p>
            <p class="order-item-items">${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
            <p class="order-item-total">Total: $${order.total.toFixed(2)}</p>
        </div>
    `).join('');
}

// Event Listeners
cartBtn?.addEventListener('click', openCart);
closeCart?.addEventListener('click', closeCartFn);
cartOverlay?.addEventListener('click', closeCartFn);
checkoutBtn?.addEventListener('click', openCheckout);

closeCheckout?.addEventListener('click', closeCheckoutFn);
checkoutOverlay?.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckoutFn();
});

closeConfirmation?.addEventListener('click', closeConfirmationFn);

orderTypeRadios?.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'delivery') {
            deliveryAddress.style.display = 'block';
            document.getElementById('deliveryStreet').required = true;
            document.getElementById('deliveryCity').required = true;
            document.getElementById('deliveryZip').required = true;
        } else {
            deliveryAddress.style.display = 'none';
            document.getElementById('deliveryStreet').required = false;
            document.getElementById('deliveryCity').required = false;
            document.getElementById('deliveryZip').required = false;
        }
        updateOrderSummary();
    });
});

checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isDelivery = formData.get('orderType') === 'delivery';
    const total = subtotal + (isDelivery ? 5 : 0);

    // Create new order
    const newOrder = {
        orderNumber: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString(),
        customer: {
            name: formData.get('customerName'),
            email: formData.get('customerEmail'),
            phone: formData.get('customerPhone')
        },
        orderType: formData.get('orderType'),
        pickup: {
            date: formData.get('pickupDate'),
            time: formData.get('pickupTime')
        },
        delivery: isDelivery ? {
            street: formData.get('deliveryStreet'),
            city: formData.get('deliveryCity'),
            zip: formData.get('deliveryZip')
        } : null,
        payment: formData.get('paymentMethod'),
        instructions: formData.get('specialInstructions'),
        items: [...cart],
        subtotal: subtotal,
        deliveryFee: isDelivery ? 5 : 0,
        total: total
    };

    // Save order
    let currentOrders = JSON.parse(localStorage.getItem('jelsOrders')) || [];
    currentOrders.push(newOrder);
    localStorage.setItem('jelsOrders', JSON.stringify(currentOrders));
    orders = currentOrders;

    closeCheckoutFn();
    showOrderConfirmation();
});

// Admin Event Listeners
if (adminBtn) {
    adminBtn.addEventListener('click', openLoginModal);
    console.log('Admin button listener attached');
} else {
    console.error('Admin button not found!');
}

if (closeLogin) {
    closeLogin.addEventListener('click', closeLoginModal);
}
if (adminLoginOverlay) {
    adminLoginOverlay.addEventListener('click', closeLoginModal);
}

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('ownerPassword').value;

    // Simple password check (in production, use proper auth)
    if (password === 'jelskitchen2024') {
        localStorage.setItem('jelsAdminLoggedIn', 'true');
        openAdminPanel();
    } else {
        showToast('Incorrect password');
    }
});

logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('jelsAdminLoggedIn');
    closeAdminPanel();
});

closeAdmin?.addEventListener('click', closeAdminPanel);
adminPanelOverlay?.addEventListener('click', closeAdminPanel);

// Admin tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');

        if (tab.dataset.tab === 'orders') {
            renderOrdersList();
        }
    });
});

// Product modal events
addProductBtn?.addEventListener('click', () => openProductModal());
closeProductModalBtn?.addEventListener('click', closeProductModal);
cancelProductBtn?.addEventListener('click', closeProductModal);
productModalOverlay?.addEventListener('click', closeProductModal);
productForm?.addEventListener('submit', saveProduct);

// Confirm modal events
confirmCancel?.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    deleteProductId = null;
});

document.getElementById('confirmDelete')?.addEventListener('click', deleteProduct);

// Close modals on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (orderConfirmation.classList.contains('active')) {
            closeConfirmationFn();
        } else if (checkoutModal.classList.contains('active')) {
            closeCheckoutFn();
        } else if (cartDrawer.classList.contains('active')) {
            closeCartFn();
        } else if (productModal.classList.contains('active')) {
            closeProductModal();
        } else if (confirmModal.classList.contains('active')) {
            confirmModal.classList.remove('active');
        } else if (adminPanel.classList.contains('active')) {
            closeAdminPanel();
        } else if (adminLoginModal.classList.contains('active')) {
            closeLoginModal();
        }
    }
});

// Check if admin was previously logged in
if (localStorage.getItem('jelsAdminLoggedIn') === 'true') {
    setTimeout(() => openAdminPanel(), 100);
}