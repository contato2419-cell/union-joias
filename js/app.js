document.addEventListener('DOMContentLoaded', () => {
    // 1. Hero Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    const indicatorsContainer = document.getElementById('hero-indicators');
    let currentSlide = 0;
    let slideInterval;

    // Create indicators
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('indicator');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(dot);
    });

    const indicators = document.querySelectorAll('.indicator');

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
        resetInterval();
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    slideInterval = setInterval(nextSlide, 5000);

    // 2. Drag to Scroll for Product Catalogs
    const sliders = document.querySelectorAll('.drag-scroll');
    let isDown = false;
    let startX;
    let scrollLeft;

    sliders.forEach(slider => {
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            slider.scrollLeft = scrollLeft - walk;
        });
    });

    // 3. Smart Cart Logic
    const cartToggleBtn = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    let cart = [];

    // Toggle Cart
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }
    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Format Currency
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    };

    // Update Cart UI
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Sua sacola está vazia.</div>';
            cartBadge.textContent = '0';
            cartTotalPrice.textContent = 'R$ 0,00';
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;

            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatMoney(item.price)}</div>
                        <div class="qty-controls">
                            <button class="qty-btn dec" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn inc" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="icon-btn remove-item" data-id="${item.id}">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });

        cartBadge.textContent = totalItems;
        cartTotalPrice.textContent = formatMoney(total);
        bindCartEvents();
    }

    // Add to Cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const img = btn.dataset.img;

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, img, quantity: 1 });
            }
            renderCart();
            openCart();
        });
    });

    // Cart Events (Inc, Dec, Remove)
    function bindCartEvents() {
        document.querySelectorAll('.qty-btn.inc').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item) item.quantity++;
                renderCart();
            });
        });

        document.querySelectorAll('.qty-btn.dec').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else {
                    cart = cart.filter(i => i.id !== id);
                }
                renderCart();
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                cart = cart.filter(i => i.id !== id);
                renderCart();
            });
        });
    }

    // 4. WhatsApp Integration
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const phone = "5531982923791"; // Union Joias WhatsApp number
        let message = "Olá Union Joias! Gostaria de finalizar meu pedido:%0A%0A";
        
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (${formatMoney(item.price * item.quantity)})%0A`;
        });
        
        const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        message += `%0A*Total: ${formatMoney(totalAmount)}*%0A%0A`;
        message += "Poderiam me ajudar com o pagamento e entrega?";

        const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    });

    // 5. Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Initial render
    renderCart();
});
