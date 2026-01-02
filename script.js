// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const cartIcon = document.querySelector('.cart-icon');
    const closeCart = document.querySelector('.close-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const lihatHargaBtns = document.querySelectorAll('.lihat-harga-btn');
    const hargaModal = document.querySelector('.harga-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalBeliBtn = document.querySelector('.modal-beli-btn');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalHargaElement = document.getElementById('total-harga');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const formPesan = document.getElementById('form-pesan');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const durasiContainer = document.querySelector('.durasi-container');
    const modalTitle = document.getElementById('modal-title');
    const navLinksAll = document.querySelectorAll('.nav-link');
    const footerLinks = document.querySelectorAll('.footer-link');
    const pages = document.querySelectorAll('.page');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Cart State
    let cart = [];
    let totalHarga = 0;
    
    // Harga produk berdasarkan durasi (sesuai permintaan)
    const hargaProduk = {
        internal: {
            name: "V2S PANEL INTERNAL",
            prices: {
                "1day": { 
                    idr: 15000, 
                    usd: 1, 
                    label: "1 DAY" 
                },
                "7day": { 
                    idr: 50000, 
                    usd: 3, 
                    label: "7 DAY" 
                },
                "30day": { 
                    idr: 150000, 
                    usd: 9, 
                    label: "30 DAY" 
                },
                "lifetime": { 
                    idr: 350000, 
                    usd: 21, 
                    label: "LIFETIME" 
                }
            }
        },
        external: {
            name: "V2S PANEL EXTERNAL",
            prices: {
                "1day": { 
                    idr: 10000, 
                    usd: 1, 
                    label: "1 DAY" 
                },
                "7day": { 
                    idr: 40000, 
                    usd: 3, 
                    label: "7 DAY" 
                },
                "30day": { 
                    idr: 100000, 
                    usd: 6, 
                    label: "30 DAY" 
                },
                "lifetime": { 
                    idr: 300000, 
                    usd: 18, 
                    label: "LIFETIME" 
                }
            }
        },
        streamer: {
            name: "V2S PANEL STREAMER REMOTE",
            prices: {
                "1day": { 
                    idr: 20000, 
                    usd: 1.5, 
                    label: "1 DAY" 
                },
                "7day": { 
                    idr: 100000, 
                    usd: 6, 
                    label: "7 DAY" 
                },
                "30day": { 
                    idr: 200000, 
                    usd: 12, 
                    label: "30 DAY" 
                },
                "lifetime": { 
                    idr: 450000, 
                    usd: 27, 
                    label: "LIFETIME" 
                }
            }
        }
    };
    
    // State untuk produk yang sedang dipilih
    let produkAktif = null;
    let durasiAktif = null;
    
    // Load cart from localStorage
    loadCart();
    
    // Fungsi untuk mengganti halaman
    function showPage(pageId) {
        // Sembunyikan semua halaman
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Tampilkan halaman yang dipilih
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) {
            activePage.classList.add('active');
        }
        
        // Update menu aktif
        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            }
        });
        
        // Tutup menu mobile jika terbuka
        navLinks.classList.remove('active');
        
        // Scroll ke atas
        window.scrollTo(0, 0);
    }
    
    // Event listener untuk navigasi
    navLinksAll.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Event listener untuk footer links
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Event listener untuk CTA button
    document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // FAQ Toggle
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            item.classList.toggle('active');
        });
    });
    
    // Toggle Mobile Menu
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
    
    // Open Cart
    cartIcon.addEventListener('click', openCart);
    
    // Close Cart
    closeCart.addEventListener('click', closeCartFunc);
    cartOverlay.addEventListener('click', closeCartFunc);
    
    // Open Modal Harga
    lihatHargaBtns.forEach(button => {
        button.addEventListener('click', function() {
            produkAktif = this.getAttribute('data-produk');
            openHargaModal(produkAktif);
        });
    });
    
    // Close Modal Harga
    closeModal.addEventListener('click', closeHargaModal);
    hargaModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeHargaModal();
        }
    });
    
    // Beli dari Modal
    modalBeliBtn.addEventListener('click', function() {
        if (produkAktif && durasiAktif) {
            const produk = hargaProduk[produkAktif];
            const durasi = produk.prices[durasiAktif];
            
            addToCart(produkAktif, produk.name, durasi.idr, durasi.label, durasi.usd);
            updateCartUI();
            closeHargaModal();
            openCart();
            
            showNotification(`${produk.name} (${durasi.label}) berhasil ditambahkan ke keranjang!`);
        }
    });
    
    // Checkout Button
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Keranjang Anda kosong. Tambahkan produk V2S terlebih dahulu.');
            return;
        }
        
        // Tampilkan pilihan WhatsApp
        showWhatsAppSelector();
    });
    
    // Contact Form Submit
    formPesan.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const subject = this.querySelectorAll('input[type="text"]')[1].value;
        const message = this.querySelector('textarea').value;
        
        // Create message for WhatsApp
        let contactMessage = `Halo V2S FREE FIRE CHEAT AND TOOLS,\n\nNama: ${name}\nEmail: ${email}\nSubjek: ${subject}\n\nPesan:\n${message}\n\nSaya ingin tahu lebih lanjut tentang panel V2S.`;
        
        // Encode message for WhatsApp
        const encodedMessage = encodeURIComponent(contactMessage);
        
        // Tentukan WhatsApp owner yang mana (random atau owner 1)
        const whatsappNumber = '6282114750136';
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Reset form
        this.reset();
        
        // Show confirmation
        showNotification('Pesan Anda akan dibuka di WhatsApp. Terima kasih telah menghubungi V2S!');
    });
    
    // Functions
    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }
    
    function closeCartFunc() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }
    
    function openHargaModal(produkId) {
        const produk = hargaProduk[produkId];
        
        // Set modal title
        modalTitle.textContent = produk.name;
        
        // Clear previous options
        durasiContainer.innerHTML = '';
        
        // Reset selected durasi
        durasiAktif = null;
        modalBeliBtn.disabled = true;
        modalBeliBtn.textContent = "TAMBAH KE KERANJANG";
        
        // Create durasi options
        Object.entries(produk.prices).forEach(([key, value]) => {
            const durasiOption = document.createElement('div');
            durasiOption.className = 'durasi-option';
            durasiOption.dataset.durasi = key;
            
            durasiOption.innerHTML = `
                <span class="durasi-label">${value.label}</span>
                <div class="durasi-harga">Rp ${value.idr.toLocaleString('id-ID')}</div>
                <div class="usd-harga">${value.usd}$</div>
            `;
            
            durasiOption.addEventListener('click', function() {
                // Remove selected class from all options
                document.querySelectorAll('.durasi-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Set active durasi
                durasiAktif = key;
                modalBeliBtn.disabled = false;
            });
            
            durasiContainer.appendChild(durasiOption);
        });
        
        // Show modal
        hargaModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeHargaModal() {
        hargaModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Fungsi untuk menampilkan pilihan WhatsApp
    function showWhatsAppSelector() {
        // Buat modal WhatsApp selector
        const modal = document.createElement('div');
        modal.className = 'whatsapp-selector-modal';
        modal.innerHTML = `
            <div class="whatsapp-modal-content">
                <div class="modal-header">
                    <h3><i class="fab fa-whatsapp"></i> Pilih WhatsApp Owner</h3>
                    <button class="close-whatsapp-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="owner-options">
                        <div class="owner-option" data-owner="1">
                            <input type="radio" name="whatsapp-owner" id="owner1">
                            <div class="owner-info">
                                <div class="owner-name">Owner 1</div>
                                <div class="owner-number">+62 821-1475-0136</div>
                            </div>
                            <span class="owner-status status-available">🟢 Online</span>
                        </div>
                        
                        <div class="owner-option" data-owner="2">
                            <input type="radio" name="whatsapp-owner" id="owner2">
                            <div class="owner-info">
                                <div class="owner-name">Owner 2</div>
                                <div class="owner-number">+62 856-5686-3541</div>
                            </div>
                            <span class="owner-status status-available">🟢 Online</span>
                        </div>
                        
                        <div class="owner-option" data-owner="3">
                            <input type="radio" name="whatsapp-owner" id="owner3">
                            <div class="owner-info">
                                <div class="owner-name">Owner 3</div>
                                <div class="owner-number">+62 813-XXXX-XXXX</div>
                            </div>
                            <span class="owner-status status-soon">🟡 Segera</span>
                        </div>
                    </div>
                    
                    <div class="modal-note">
                        <p><i class="fas fa-info-circle"></i> Pilih owner yang ingin dihubungi. Owner 1,2 dan 3 tersedia 24 jam.</p>
                    </div>
                    
                    <button class="confirm-whatsapp-btn" disabled>
                        <i class="fab fa-whatsapp"></i> Lanjutkan ke WhatsApp
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Event listeners untuk modal WhatsApp
        const closeBtn = modal.querySelector('.close-whatsapp-modal');
        const ownerOptions = modal.querySelectorAll('.owner-option');
        const confirmBtn = modal.querySelector('.confirm-whatsapp-btn');
        let selectedOwner = null;
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });
        
        // Owner selection
        ownerOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all
                ownerOptions.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.querySelector('input').checked = false;
                });
                
                // Add selected class to clicked
                this.classList.add('selected');
                this.querySelector('input').checked = true;
                selectedOwner = this.getAttribute('data-owner');
                confirmBtn.disabled = false;
                
                // Jika owner 3 dipilih, tampilkan warning
                if (selectedOwner === '3') {
                    confirmBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Owner 3 Belum Aktif';
                    confirmBtn.style.background = 'linear-gradient(45deg, #666, #888)';
                } else {
                    confirmBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Lanjutkan ke WhatsApp';
                    confirmBtn.style.background = 'linear-gradient(45deg, #25D366, #128C7E)';
                }
            });
        });
        
        // Confirm button
        confirmBtn.addEventListener('click', function() {
            if (!selectedOwner || selectedOwner === '3') {
                alert('Silakan pilih Owner 1 atau 2. Owner 3 belum aktif.');
                return;
            }
            
            // Buat pesan order
            let orderMessage = `Halo V2S FREE FIRE CHEAT AND TOOLS, saya ingin memesan:\n\n`;
            cart.forEach(item => {
                orderMessage += `- ${item.name} (${item.durasi}): Rp ${item.harga.toLocaleString('id-ID')} (${item.usd}$)\n`;
            });
            orderMessage += `\nTotal: Rp ${totalHarga.toLocaleString('id-ID')}`;
            orderMessage += "\n\nSaya sudah siap transfer. Bagaimana cara pembayarannya?";
            
            // Encode message for WhatsApp
            const encodedMessage = encodeURIComponent(orderMessage);
            
            // Tentukan nomor WhatsApp berdasarkan owner yang dipilih
            let whatsappNumber;
            if (selectedOwner === '1') {
                whatsappNumber = '6282114750136';
            } else if (selectedOwner === '2') {
                whatsappNumber = '6285656863541';
            }
            
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp
            window.open(whatsappURL, '_blank');
            
            // Clear cart setelah checkout
            cart = [];
            saveCart();
            updateCartUI();
            closeCartFunc();
            modal.remove();
            document.body.style.overflow = 'auto';
            
            showNotification('Pesanan Anda sedang diproses! Silakan lanjutkan di WhatsApp.');
        });
        
        // Add CSS for modal
        const style = document.createElement('style');
        style.textContent = `
            .whatsapp-selector-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 3000;
                backdrop-filter: blur(10px);
            }
            
            .whatsapp-modal-content {
                background: linear-gradient(145deg, rgba(20, 20, 40, 0.95), rgba(10, 10, 22, 0.95));
                width: 90%;
                max-width: 500px;
                border-radius: 20px;
                border: 2px solid rgba(37, 211, 102, 0.5);
                box-shadow: 0 20px 50px rgba(37, 211, 102, 0.3);
                overflow: hidden;
            }
            
            .whatsapp-modal-content .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                background: rgba(37, 211, 102, 0.1);
                border-bottom: 1px solid rgba(37, 211, 102, 0.3);
            }
            
            .whatsapp-modal-content .modal-header h3 {
                color: #00e5ff;
                font-size: 1.5rem;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .close-whatsapp-modal {
                background: none;
                border: none;
                color: #ff4655;
                font-size: 2rem;
                cursor: pointer;
                line-height: 1;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .close-whatsapp-modal:hover {
                background: rgba(255, 70, 85, 0.1);
            }
            
            .whatsapp-modal-content .modal-body {
                padding: 2rem;
            }
            
            .owner-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .owner-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid transparent;
            }
            
            .owner-option:hover {
                background: rgba(255, 70, 85, 0.1);
                border-color: rgba(255, 70, 85, 0.3);
            }
            
            .owner-option.selected {
                background: rgba(0, 229, 255, 0.1);
                border-color: #00e5ff;
            }
            
            .owner-option input[type="radio"] {
                margin: 0;
            }
            
            .owner-info {
                flex: 1;
            }
            
            .owner-name {
                color: #fff;
                font-weight: 600;
                margin-bottom: 0.2rem;
            }
            
            .owner-number {
                color: #a0a0c0;
                font-size: 0.9rem;
            }
            
            .owner-status {
                font-size: 0.8rem;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .status-available {
                background: rgba(0, 229, 255, 0.1);
                color: #00e5ff;
            }
            
            .status-soon {
                background: rgba(255, 222, 89, 0.1);
                color: #ffde59;
            }
            
            .modal-note {
                background: rgba(0, 229, 255, 0.1);
                padding: 1rem;
                border-radius: 10px;
                margin: 1.5rem 0;
                border: 1px solid rgba(0, 229, 255, 0.2);
            }
            
            .modal-note p {
                color: #a0a0c0;
                font-size: 0.9rem;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .confirm-whatsapp-btn {
                width: 100%;
                padding: 1.2rem;
                background: linear-gradient(45deg, #25D366, #128C7E);
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .confirm-whatsapp-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .confirm-whatsapp-btn:not(:disabled):hover {
                transform: scale(1.03);
                box-shadow: 0 10px 20px rgba(37, 211, 102, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
    
    function addToCart(produkId, name, harga, durasi, usd) {
        // Create unique ID combining produk and durasi
        const id = `${produkId}-${durasiAktif}`;
        
        // Check if item already in cart
        const existingItemIndex = cart.findIndex(item => item.id === id);
        
        if (existingItemIndex !== -1) {
            // Item already in cart, increase quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item to cart
            cart.push({
                id: id,
                produkId: produkId,
                name: name,
                harga: harga,
                durasi: durasi,
                usd: usd,
                quantity: 1
            });
        }
        
        saveCart();
    }
    
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
        
        showNotification('Produk V2S dihapus dari keranjang!');
    }
    
    function updateCartUI() {
        // Clear cart items container
        cartItemsContainer.innerHTML = '';
        
        // Reset total
        totalHarga = 0;
        
        // If cart is empty
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Keranjang belanja V2S kosong</p>';
            totalHargaElement.textContent = '0';
            cartCountElement.textContent = '0';
            return;
        }
        
        // Add each item to cart UI
        cart.forEach(item => {
            const itemTotal = item.harga * item.quantity;
            totalHarga += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="durasi-item">${item.durasi}</p>
                    <p>Rp ${item.harga.toLocaleString('id-ID')} x ${item.quantity}</p>
                </div>
                <div>
                    <p>Rp ${itemTotal.toLocaleString('id-ID')}</p>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        // Update total and cart count
        totalHargaElement.textContent = totalHarga.toLocaleString('id-ID');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
            });
        });
    }
    
    function saveCart() {
        localStorage.setItem('v2s-cart', JSON.stringify(cart));
    }
    
    function loadCart() {
        const savedCart = localStorage.getItem('v2s-cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartUI();
        }
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(to right, #ff4655, #ff6b6b);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 3000;
            font-weight: 500;
            box-shadow: 0 5px 15px rgba(255, 70, 85, 0.4);
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS for notification animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Handle CTA button di halaman home
    const homeCtaButton = document.querySelector('.hero .cta-button');
    if (homeCtaButton) {
        homeCtaButton.addEventListener('click', function(e) {
            e.preventDefault();
            showPage('produk');
        });
    }
    
    // Add WhatsApp quick buttons
    function addWhatsAppQuickButtons() {
        const whatsappQuick = document.createElement('div');
        whatsappQuick.className = 'whatsapp-quick';
        whatsappQuick.innerHTML = `
            <a href="https://wa.me/6282114750136?text=Halo%20V2S%20FREE%20FIRE%20CHEAT%20AND%20TOOLS,%20saya%20mau%20tanya%20tentang%20panel%20FreeFire" class="whatsapp-btn" target="_blank">
                <i class="fab fa-whatsapp"></i>
                <span class="whatsapp-tooltip">Hubungi Owner 1</span>
            </a>
            <a href="https://wa.me/6285656863541?text=Halo%20V2S%20FREE%20FIRE%20CHEAT%20AND%20TOOLS,%20saya%20mau%20tanya%20tentang%20panel%20FreeFire" class="whatsapp-btn owner2" target="_blank">
                <i class="fab fa-whatsapp"></i>
                <span class="whatsapp-tooltip">Hubungi Owner 2</span>
            </a>
            <a href="#" class="whatsapp-btn owner3" onclick="alert('Owner 3 belum aktif. Silakan hubungi Owner 1 atau 2.')">
                <i class="fab fa-whatsapp"></i>
                <span class="whatsapp-tooltip">Owner 3 (Segera)</span>
            </a>
        `;
        document.body.appendChild(whatsappQuick);
    }
    
    // Panggil fungsi ini
    addWhatsAppQuickButtons();
    
    // Initialize - Show home page by default
    showPage('home');
});