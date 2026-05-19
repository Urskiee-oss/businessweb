// Cart State
let cart = [];

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

// Product images mapping
const productImages = {
    'Revel Bars': 'assets/revel-bar.jpg',
    'Banana Loaf': 'assets/bananaloaf.jpg',
    'Cake': 'assets/cake.jpg',
    'Cupcake': 'assets/cupcake.jpg',
    'Coconut Macaroons': 'assets/macaroons.jpg',
    'Bento Cake': 'assets/bento-cake.jpg',
    'Banana Muffin': 'assets/banana-muffin.jpg'
};

// Set minimum pickup date to today
document.addEventListener('DOMContentLoaded', () => {
    const pickupDate = document.getElementById('pickupDate');
    if (pickupDate) {
        const today = new Date().toISOString().split('T')[0];
        pickupDate.setAttribute('min', today);
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

function addToCart(name, price) {
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
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
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

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isDelivery = document.querySelector('input[name="orderType"]:checked')?.value === 'delivery';
    const deliveryFee = isDelivery ? 5 : 0;
    const total = subtotal + deliveryFee;

    // Update order summary items
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
    // Clear cart
    cart = [];
    updateCartUI();
    // Reset form
    checkoutForm.reset();
}

// Event Listeners
cartBtn?.addEventListener('click', openCart);
closeCart?.addEventListener('click', closeCartFn);
cartOverlay?.addEventListener('click', closeCartFn);
checkoutBtn?.addEventListener('click', openCheckout);

closeCheckout?.addEventListener('click', closeCheckoutFn);
checkoutOverlay?.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) {
        closeCheckoutFn();
    }
});

closeConfirmation?.addEventListener('click', closeConfirmationFn);

// Order type toggle
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

// Add to cart buttons
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.name;
        const price = btn.dataset.price;
        addToCart(name, price);
    });
});

// Form submission
checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    // In a real app, you'd send this data to a server
    const formData = new FormData(checkoutForm);
    const orderData = {
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
        delivery: formData.get('orderType') === 'delivery' ? {
            street: formData.get('deliveryStreet'),
            city: formData.get('deliveryCity'),
            zip: formData.get('deliveryZip')
        } : null,
        payment: formData.get('paymentMethod'),
        instructions: formData.get('specialInstructions'),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
            (formData.get('orderType') === 'delivery' ? 5 : 0)
    };

    console.log('Order placed:', orderData);

    closeCheckoutFn();
    showOrderConfirmation();
});

// Close modals on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (orderConfirmation.classList.contains('active')) {
            closeConfirmationFn();
        } else if (checkoutModal.classList.contains('active')) {
            closeCheckoutFn();
        } else if (cartDrawer.classList.contains('active')) {
            closeCartFn();
        }
    }
});