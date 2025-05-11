// --- Product Data & Cart ---
const products = [
    { id: 1, name: "Wireless Headphones", price: 59.99, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" },
    { id: 2, name: "Smart Watch", price: 109.99, image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&q=80" },
    { id: 3, name: "Bluetooth Speaker", price: 39.99, image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=400&q=80" },
    { id: 4, name: "Gaming Mouse", price: 27.49, image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=400&q=80" },
    { id: 5, name: "USB-C Charger", price: 18.99, image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&q=80" }
];
let cart = JSON.parse(localStorage.getItem('cart2')||'{}') || {};
let currentUser = localStorage.getItem('currentUser') || null;

// --- AUTH SYSTEM ---
function getUsers() {
    return JSON.parse(localStorage.getItem('accounts') || '{}');
}
function saveUser(username, password) {
    const users = getUsers();
    users[username] = {username, password};
    localStorage.setItem('accounts', JSON.stringify(users));
}
function validateUser(username, password) {
    const users = getUsers();
    return users[username] && users[username].password === password;
}
function userExists(username) {
    const users = getUsers();
    return !!users[username];
}
// Auth modal handlers
function showAuthModal(type='login') {
    document.getElementById('auth-modal').style.display = 'flex';
    if(type==='login') {
        document.getElementById('login-form-wrap').style.display='block';
        document.getElementById('signup-form-wrap').style.display='none';
        document.getElementById('login-error').textContent='';
    } else {
        document.getElementById('login-form-wrap').style.display='none';
        document.getElementById('signup-form-wrap').style.display='block';
        document.getElementById('signup-error').textContent='';
    }
    setTimeout(() => {
        document.querySelector('.modal-content').scrollTop=0;
        document.querySelector('#auth-modal input')?.focus();
    }, 70);
}
function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

// --- UI NAVIGATION ---
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}
function updateUserGreeting() {
    const greeting = document.getElementById('nav-greeting');
    if(currentUser) {
        greeting.textContent = `Hi, ${currentUser}`;
        document.getElementById('user-dropdown').innerHTML =
            `<li><a href="#" id="logout-link">Log Out</a></li>`;
        document.getElementById('logout-link').onclick = function() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateUserGreeting();
            showSection('home-section');
        }
    } else {
        greeting.textContent='Account';
        document.getElementById('user-dropdown').innerHTML =
            `<li><a href="#" id="open-login">Log In</a></li>
            <li><a href="#" id="open-signup">Sign Up</a></li>`;
        // Add handlers again
        document.getElementById('open-login').onclick = (e)=>{e.preventDefault(); showAuthModal('login');};
        document.getElementById('open-signup').onclick = (e)=>{e.preventDefault(); showAuthModal('signup');};
    }
}

function renderProducts() {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '';
    products.forEach((product, i) => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.style.animationDelay = (i*0.13) + "s";
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-title">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button onclick="addToCartAnim(${product.id}, this)">Add to Cart</button>
        `;
        productsList.appendChild(div);
    });
}
function addToCartAnim(id, btn) {
    if(!currentUser) {
        showAuthModal('login');
        document.getElementById('login-error').textContent = "You must log in to add to cart.";
        return;
    }
    addToCart(id);

    // Animation feedback
    const div = btn.closest('.product-card');
    let fb = document.createElement('div');
    fb.className = 'card-added-feedback';
    fb.textContent = "Added!";
    div.appendChild(fb);
    setTimeout(()=>{ fb.style.opacity=0; }, 700);
    setTimeout(()=>{ fb && fb.remove(); }, 1100);

    btn.disabled = true;
    btn.textContent = "Added!";
    btn.style.background = '#29ef8e';
    btn.style.color = '#1b3c2d';
    setTimeout(()=>{
        btn.disabled = false;
        btn.textContent = "Add to Cart";
        btn.removeAttribute('style');
    }, 1100);
}

function renderCart() {
    const cartList = document.getElementById('cart-list');
    const cartSummary = document.getElementById('cart-summary');
    let cartItems = Object.keys(cart).map(id => {
        const product = products.find(p => p.id == id);
        return { ...product, quantity: cart[id] };
    });
    cartList.innerHTML = '';
    let subtotal = 0;
    if (cartItems.length === 0) {
        cartList.innerHTML = "<p>Your cart is empty.</p>";
        cartSummary.innerHTML = '';
        return;
    }
    cartItems.forEach((item,i) => {
        subtotal += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.animationDelay = (i*0.13)+"s";
        div.innerHTML = `
            <div class="cart-details">
                <div class="cart-item-title">${item.name}</div>
                <div>Price: $${item.price.toFixed(2)}</div>
                <div>Quantity: ${item.quantity}</div>
            </div>
            <button class="remove-btn" onclick="removeFromCartAnim(${item.id},this)">Remove</button>
        `;
        cartList.appendChild(div);
    });
    cartSummary.innerHTML = `
        <div>Subtotal: $${subtotal.toFixed(2)}</div>
        <div>Items: ${cartItems.reduce((sum, i) => sum + i.quantity, 0)}</div>
        <button class="remove-btn" onclick="clearCart()">Clear Cart</button>
        <button class="checkout-btn" disabled>Checkout (demo)</button>
    `;
}
function removeFromCartAnim(id, btn) {
    removeFromCart(id);
    const par = btn.closest('.cart-item');
    par.style.background = "#ef6e4c";
    par.style.color = "#fff";
    par.style.transform = "scale(0.97) translateX(50px)";
    par.style.opacity = "0";
    setTimeout(()=>par && par.remove(), 700);
}

function updateCartCount() {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    document.getElementById('cart-count').textContent = count;
    localStorage.setItem('cart2', JSON.stringify(cart));
}
window.addToCart = function(id) {
    cart[id] = (cart[id] || 0) + 1;
    updateCartCount();
    renderCart();
};
window.removeFromCart = function(id) {
    if (cart[id]) {
        cart[id] -= 1;
        if (cart[id] <= 0) delete cart[id];
        updateCartCount();
        renderCart();
    }
};
window.clearCart = function() {
    cart = {};
    updateCartCount();
    renderCart();
};

// Enhanced Navigation/Dropdowns
function setupNavigation() {
    function showNavSection(sectionId) {
        document.querySelectorAll('nav ul li a').forEach(a=>a.classList.remove('active'));
        const navId = {
            "home-section":'nav-home',
            "products-section":'nav-products',
            "cart-section":'nav-cart'
        }[sectionId];
        if(navId) document.getElementById(navId).classList.add('active');
        showSection(sectionId)
    }

    document.getElementById('nav-home').addEventListener('click', (e) => {e.preventDefault(); showNavSection('home-section');});
    document.getElementById('nav-products').addEventListener('click', (e) => {e.preventDefault(); renderProducts(); showNavSection('products-section');});
    document.getElementById('nav-cart').addEventListener('click', (e) => {e.preventDefault(); renderCart(); showNavSection('cart-section');});

    // User dropdown improved logic
    const navUserDropdown = document.getElementById('nav-user-dropdown');
    const navUserBtn = document.getElementById('nav-user-btn');
    const userDropdown = document.getElementById('user-dropdown');

    let dropdownOpen = false;
    let closeDropdownTimer = null;

    function openDropdown() {
        userDropdown.classList.add('open');
        dropdownOpen = true;
    }
    function closeDropdown() {
        userDropdown.classList.remove('open');
        dropdownOpen = false;
    }

    // Toggle on button click
    navUserBtn.onclick = function (e) {
        e.preventDefault();
        if (!dropdownOpen) {
            openDropdown();
        } else {
            closeDropdown();
        }
    };

    // Keep open on hover
    navUserDropdown.addEventListener('mouseenter', () => {
        clearTimeout(closeDropdownTimer);
        openDropdown();
    });

    navUserDropdown.addEventListener('mouseleave', () => {
        closeDropdownTimer = setTimeout(closeDropdown, 200);
    });

    document.addEventListener('mousedown', function(e){
        if (!navUserDropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    showNavSection('home-section');
}

// --- Modal Auth Logic
function setupAuthForms() {
    // Login
    document.getElementById('login-form').onsubmit = function(e) {
        e.preventDefault();
        const u = document.getElementById('login-username').value.trim();
        const p = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        if (!u || !p) {
            errorDiv.textContent = "Please fill out all fields.";
            return;
        }
        if (!validateUser(u,p)) {
            errorDiv.textContent = "Invalid credentials.";
            return;
        }
        // Success
        currentUser = u;
        localStorage.setItem('currentUser', u);
        errorDiv.textContent = "";
        closeAuthModal();
        updateUserGreeting();
        showSection('home-section');
    };
    // Signup
    document.getElementById('signup-form').onsubmit = function(e) {
        e.preventDefault();
        const u = document.getElementById('signup-username').value.trim();
        const p1 = document.getElementById('signup-password').value;
        const p2 = document.getElementById('signup-password2').value;
        const errorDiv = document.getElementById('signup-error');
        if (!u || !p1 || !p2) {
            errorDiv.textContent = "Please fill out all fields.";
            return;
        }
        if (p1 !== p2) {
            errorDiv.textContent = "Passwords do not match.";
            return;
        }
        if (userExists(u)) {
            errorDiv.textContent = "Username already exists.";
            return;
        }
        saveUser(u, p1);
        errorDiv.textContent = "";
        closeAuthModal();
        currentUser = u;
        localStorage.setItem('currentUser', u);
        updateUserGreeting();
        showSection('home-section');
    };
    // Modal navigation
    document.getElementById('to-login').onclick = function(e) {
        e.preventDefault();
        showAuthModal('login');
    };
    document.getElementById('to-signup').onclick = function(e) {
        e.preventDefault();
        showAuthModal('signup');
    };
    document.getElementById('close-auth-modal').onclick = function() {
        closeAuthModal();
    };
    // Allow closing modal by clicking outside
    document.getElementById('auth-modal').addEventListener('click', function(e){
        if(e.target === this) closeAuthModal();
    });
}

// --- Initialization
window.onload = function() {
    updateUserGreeting();
    setupNavigation();
    setupAuthForms();
    renderProducts();
    renderCart();
    updateCartCount();
};