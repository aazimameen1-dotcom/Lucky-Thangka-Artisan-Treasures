/**
 * Lucky Thangka — Admin Panel
 * Complete product management with image uploads and localStorage persistence
 */

// ============================================================
//  CONFIGURATION
// ============================================================

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

const STORAGE_KEYS = {
    isLoggedIn: 'lt_admin_logged_in',
    products: 'lt_products',
    settings: 'lt_settings',
    inquiries: 'lt_inquiries'
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Default sample products
const SAMPLE_PRODUCTS = [
    {
        id: 'sample_1',
        name: 'Green Tara Thangka',
        category: 'thangkas',
        description: 'Exquisite hand-painted deity of enlightened activity and abundance. Adorned with 24k gold detailing. Blessed by a Buddhist monk for spiritual protection.',
        badge: 'Prosperity Thangka',
        price: '₹12,000 - ₹25,000',
        image: '../images/hero.png',
        created_at: new Date().toISOString()
    },
    {
        id: 'sample_2',
        name: 'Medicine Buddha',
        category: 'thangkas',
        description: 'Masterpiece depicting the supreme healer. Blessed to bring physical and spiritual well-being. Hand-painted with natural mineral pigments.',
        badge: 'Healing Thangka',
        price: '₹15,000 - ₹30,000',
        image: 'https://images.unsplash.com/photo-1596707338006-c87515b88bdc?q=80&w=600&auto=format&fit=crop',
        created_at: new Date().toISOString()
    },
    {
        id: 'sample_3',
        name: 'Wheel of Life (Bhavachakra)',
        category: 'thangkas',
        description: 'Intricate representation of the cyclic existence, a profound meditation tool for spiritual protection and contemplation.',
        badge: 'Protection Thangka',
        price: '₹18,000 - ₹35,000',
        image: 'https://images.unsplash.com/photo-1614704383441-26b6807dba84?q=80&w=600&auto=format&fit=crop',
        created_at: new Date().toISOString()
    },
    {
        id: 'sample_4',
        name: 'Heart Chakra Singing Bowl',
        category: 'bowls',
        description: 'Hand-hammered seven-metal alloy singing bowl tuned to the Heart Chakra (F note). Produces deep, resonant tones for meditation and healing.',
        badge: 'Chakra Bowl',
        price: '₹3,500 - ₹8,000',
        image: '../images/bowl.png',
        created_at: new Date().toISOString()
    },
    {
        id: 'sample_5',
        name: 'Vintage Brass Statue Collection',
        category: 'antiques',
        description: 'Rare collection of old brass Buddhist statues, vintage copper urli, and traditional prayer artifacts. Each piece is authenticated.',
        badge: 'Antique',
        price: '₹8,000 - ₹50,000',
        image: '../images/antique.png',
        created_at: new Date().toISOString()
    },
    {
        id: 'sample_6',
        name: 'Kashmiri Miniature Painting',
        category: 'paintings',
        description: 'Original Kashmiri miniature painting depicting a serene Dal Lake scene. Rich detailed brushwork with gold leaf accents by master artisan.',
        badge: 'Original Art',
        price: '₹6,000 - ₹20,000',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
        created_at: new Date().toISOString()
    }
];

// ============================================================
//  UTILITY FUNCTIONS
// ============================================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getCategoryName(category) {
    const names = {
        'thangkas': 'Lucky Thangkas',
        'bowls': 'Singing Bowls',
        'antiques': 'Antique Treasures',
        'paintings': 'Original Paintings'
    };
    return names[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        'thangkas': 'fa-scroll',
        'bowls': 'fa-music',
        'antiques': 'fa-gem',
        'paintings': 'fa-palette'
    };
    return icons[category] || 'fa-box';
}

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ============================================================
//  PRODUCT CRUD (localStorage)
// ============================================================

function getProducts() {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    if (!stored) {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(SAMPLE_PRODUCTS));
        return [...SAMPLE_PRODUCTS];
    }
    return JSON.parse(stored);
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function addProduct(productData) {
    const products = getProducts();
    const newProduct = {
        ...productData,
        id: generateId(),
        created_at: new Date().toISOString()
    };
    products.unshift(newProduct); // Add to beginning
    saveProducts(products);
    return newProduct;
}

function updateProduct(id, updates) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = {
            ...products[index],
            ...updates,
            updated_at: new Date().toISOString()
        };
        saveProducts(products);
        return products[index];
    }
    return null;
}

function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    return true;
}

function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id) || null;
}

// ============================================================
//  INQUIRIES (from main site contact form)
// ============================================================

function getInquiries() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.inquiries) || '[]');
    } catch (e) {
        return [];
    }
}

function renderInquiries() {
    const list = document.getElementById('inquiriesList');
    if (!list) return;

    const inquiries = getInquiries();
    const navBadge = document.getElementById('navInquiryCount');
    if (navBadge) navBadge.textContent = inquiries.length;

    if (inquiries.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-envelope-open"></i>
                </div>
                <h3>No Inquiries Yet</h3>
                <p>Customer inquiries from the store will appear here.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = inquiries.map(i => {
        const dateStr = i.date ? new Date(i.date).toLocaleString() : '';
        const safe = (v) => escapeHtml((v || '').toString());
        return `
            <div class="inquiry-card" data-inquiry-id="${safe(i.id)}">
                <div class="inquiry-header">
                    <h4>${safe(i.name) || 'Customer Inquiry'}</h4>
                    <time>${safe(dateStr)}</time>
                </div>
                <div class="inquiry-body">
                    ${i.product ? `<p><strong>Product:</strong> ${safe(i.product)}</p>` : ''}
                    ${i.email ? `<p><strong>Email:</strong> <a href="mailto:${safe(i.email)}">${safe(i.email)}</a></p>` : ''}
                    ${i.phone ? `<p><strong>Phone:</strong> <a href="tel:${safe(i.phone)}">${safe(i.phone)}</a></p>` : ''}
                    ${i.message ? `<p><strong>Message:</strong> ${safe(i.message)}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
//  IMAGE HANDLING
// ============================================================

function handleImageUpload(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            reject('Image size must be less than 5MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            reject('Please upload a JPG, PNG, or WEBP image');
            return;
        }

        // Compress and convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 1200;
                let width = img.width;
                let height = img.height;

                if (width > MAX_DIM || height > MAX_DIM) {
                    if (width > height) {
                        height = (height / width) * MAX_DIM;
                        width = MAX_DIM;
                    } else {
                        width = (width / height) * MAX_DIM;
                        height = MAX_DIM;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Use 0.8 quality for compression
                const compressed = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressed);
            };
            img.onerror = () => reject('Failed to process image');
            img.src = e.target.result;
        };
        reader.onerror = () => reject('Failed to read image file');
        reader.readAsDataURL(file);
    });
}

// ============================================================
//  TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;

    toast.className = 'toast ' + type;
    const icon = toast.querySelector('i');
    if (icon) {
        if (type === 'success') icon.className = 'fa-solid fa-check-circle';
        else if (type === 'error') icon.className = 'fa-solid fa-exclamation-circle';
        else if (type === 'warning') icon.className = 'fa-solid fa-exclamation-triangle';
    }
    toastMessage.textContent = message;

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ============================================================
//  SECTION NAVIGATION
// ============================================================

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionName + 'Section');
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) navItem.classList.add('active');

    // Close mobile sidebar
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// ============================================================
//  MODAL HANDLING
// ============================================================

let currentEditId = null;
let currentDeleteId = null;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.admin-modal').forEach(m => m.classList.remove('active'));
}

function openAddModal() {
    currentEditId = null;
    const title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Add Product';
    
    const form = document.getElementById('productForm');
    if (form) form.reset();

    document.getElementById('productId').value = '';
    
    const preview = document.getElementById('imagePreview');
    const uploadContent = document.getElementById('uploadContent');
    if (preview) preview.style.display = 'none';
    if (uploadContent) uploadContent.style.display = 'block';

    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Product';

    openModal('productModal');
}

function openEditModal(id) {
    const product = getProductById(id);
    if (!product) return;

    currentEditId = id;
    const title = document.getElementById('modalTitle');
    if (title) title.innerHTML = '<i class="fa-solid fa-edit"></i> Edit Product';

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productPrice').value = product.price || '';

    // Handle image preview
    const preview = document.getElementById('imagePreview');
    const uploadContent = document.getElementById('uploadContent');
    const previewImg = document.getElementById('previewImg');
    const imageUrlInput = document.getElementById('productImageUrl');

    if (product.image) {
        if (previewImg) previewImg.src = product.image;
        if (preview) preview.style.display = 'block';
        if (uploadContent) uploadContent.style.display = 'none';
        
        if (product.image.startsWith('http') && imageUrlInput) {
            imageUrlInput.value = product.image;
        }
    } else {
        if (preview) preview.style.display = 'none';
        if (uploadContent) uploadContent.style.display = 'block';
    }

    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Update Product';

    openModal('productModal');
}

function openDeleteModal(id) {
    const product = getProductById(id);
    if (!product) return;

    currentDeleteId = id;
    const nameEl = document.getElementById('deleteProductName');
    if (nameEl) nameEl.textContent = product.name;

    openModal('deleteModal');
}

// ============================================================
//  PRODUCT RENDERING
// ============================================================

function renderProducts(searchTerm = '', categoryFilter = 'all') {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!grid) return;

    let products = getProducts();

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
        products = products.filter(p => p.category === categoryFilter);
    }

    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        products = products.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            (p.badge && p.badge.toLowerCase().includes(term))
        );
    }

    if (products.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = products.map(product => `
        <div class="product-admin-card" data-id="${product.id}">
            <div class="product-image-wrapper" onclick="viewImage('${escapeHtml(product.image || '')}')">
                <img src="${product.image || 'https://via.placeholder.com/400x300/F2EBE0/8B4513?text=No+Image'}" 
                     alt="${escapeHtml(product.name)}" 
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x300/F2EBE0/8B4513?text=No+Image'">
                ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}
            </div>
            <div class="product-admin-info">
                <h4>${escapeHtml(product.name)}</h4>
                <p class="product-category">${getCategoryName(product.category)}</p>
                ${product.price ? `<p class="product-price-tag">${escapeHtml(product.price)}</p>` : ''}
                <p class="product-desc">${escapeHtml(product.description)}</p>
            </div>
            <div class="product-admin-actions">
                <button class="btn-icon edit-btn" title="Edit Product" data-id="${product.id}">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button class="btn-icon delete-btn" title="Delete Product" data-id="${product.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Attach event listeners
    grid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(btn.dataset.id);
        });
    });

    grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDeleteModal(btn.dataset.id);
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
//  IMAGE VIEWER
// ============================================================

function viewImage(imageSrc) {
    if (!imageSrc) return;
    const modal = document.getElementById('imageViewerModal');
    const img = document.getElementById('imageViewerImg');
    if (modal && img) {
        img.src = imageSrc;
        modal.classList.add('active');
    }
}

// ============================================================
//  FORM HANDLING
// ============================================================

async function handleProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const badge = document.getElementById('productBadge').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const imageUrl = document.getElementById('productImageUrl').value.trim();
    const imageFile = document.getElementById('productImage').files[0];

    if (!name || !category || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Determine image source
    let image = imageUrl;

    if (imageFile) {
        try {
            const saveBtn = document.getElementById('saveProductBtn');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            }
            image = await handleImageUpload(imageFile);
            if (saveBtn) {
                saveBtn.disabled = false;
            }
        } catch (error) {
            const saveBtn = document.getElementById('saveProductBtn');
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Product';
            }
            showToast(error, 'error');
            return;
        }
    }

    // If editing and no new image, keep existing
    if (currentEditId && !image) {
        const existing = getProductById(currentEditId);
        if (existing) image = existing.image;
    }

    const productData = {
        name,
        category,
        description,
        badge,
        price,
        image: image || ''
    };

    if (currentEditId) {
        updateProduct(currentEditId, productData);
        showToast('Product updated successfully!');
    } else {
        addProduct(productData);
        showToast('Product added successfully!');
    }

    closeAllModals();
    renderProducts(
        document.getElementById('searchProducts')?.value || '',
        document.getElementById('categoryFilter')?.value || 'all'
    );
    updateDashboard();
}

// ============================================================
//  DASHBOARD
// ============================================================

function updateDashboard() {
    const products = getProducts();
    const inquiries = getInquiries();

    // Update stats
    const setCount = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    };

    setCount('totalProducts', products.length);
    setCount('totalThangkas', products.filter(p => p.category === 'thangkas').length);
    setCount('totalBowls', products.filter(p => p.category === 'bowls').length);
    setCount('totalAntiques', products.filter(p => p.category === 'antiques' || p.category === 'paintings').length);

    // Update nav badge
    setCount('navProductCount', products.length);
    setCount('navInquiryCount', inquiries.length);

    // Update category counts
    const setCatCount = (id, category) => {
        const el = document.getElementById(id);
        const count = products.filter(p => p.category === category).length;
        if (el) el.textContent = count + (count === 1 ? ' item' : ' items');
    };

    setCatCount('catThangkaCount', 'thangkas');
    setCatCount('catBowlCount', 'bowls');
    setCatCount('catAntiqueCount', 'antiques');
    setCatCount('catPaintingCount', 'paintings');

    // Recent products (last 5)
    const recentList = document.getElementById('recentProductsList');
    if (recentList) {
        const recent = products.slice(0, 5);
        if (recent.length === 0) {
            recentList.innerHTML = `
                <div class="empty-state-mini">
                    <p>No products yet. Click "Add Product" to get started!</p>
                </div>
            `;
        } else {
            recentList.innerHTML = recent.map(p => `
                <div class="recent-product-item">
                    <div class="recent-product-thumb">
                        <img src="${p.image || 'https://via.placeholder.com/48x48/F2EBE0/8B4513?text=?'}" 
                             alt="${escapeHtml(p.name)}"
                             onerror="this.src='https://via.placeholder.com/48x48/F2EBE0/8B4513?text=?'">
                    </div>
                    <div class="recent-product-info">
                        <h4>${escapeHtml(p.name)}</h4>
                        <span>${getCategoryName(p.category)}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

// ============================================================
//  AUTHENTICATION
// ============================================================

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // Password toggle
    const toggleBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            toggleBtn.querySelector('i').className = type === 'password'
                ? 'fa-solid fa-eye'
                : 'fa-solid fa-eye-slash';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username')?.value.trim();
            const password = document.getElementById('password')?.value.trim();

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
                window.location.href = 'admin.html';
            } else {
                if (loginError) {
                    loginError.style.display = 'flex';
                    loginError.querySelector('span').textContent = 'Invalid username or password';
                }
                // Shake the login card
                const card = document.querySelector('.login-card');
                if (card) {
                    card.style.animation = 'none';
                    requestAnimationFrame(() => {
                        card.style.animation = 'shake 0.5s ease';
                    });
                }
            }
        });
    }
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.isLoggedIn);
    window.location.href = 'index.html';
}

// ============================================================
//  DASHBOARD INITIALIZATION
// ============================================================

function initDashboard() {
    console.log('Initializing admin dashboard...');

    // Initialize products if empty
    if (!localStorage.getItem(STORAGE_KEYS.products)) {
        saveProducts(SAMPLE_PRODUCTS);
    }

    // --- Navigation ---
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(item.dataset.section);
        });
    });

    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) showSection(section);
        });
    });

    // --- Category cards → filter products ---
    document.querySelectorAll('.category-card-large').forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.dataset.filter;
            const filterSelect = document.getElementById('categoryFilter');
            if (filterSelect) filterSelect.value = filter;
            showSection('products');
            renderProducts('', filter);
        });
    });

    // --- Logout ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // --- Add Product ---
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', openAddModal);

    document.querySelector('.add-first-product')?.addEventListener('click', openAddModal);
    document.getElementById('quickAddProduct')?.addEventListener('click', () => {
        showSection('products');
        setTimeout(openAddModal, 200);
    });

    // --- Search ---
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const filter = document.getElementById('categoryFilter')?.value || 'all';
            renderProducts(searchInput.value, filter);
        });
    }

    // --- Category Filter ---
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            const search = document.getElementById('searchProducts')?.value || '';
            renderProducts(search, categoryFilter.value);
        });
    }

    // --- Product Form ---
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // --- Delete Confirmation ---
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (currentDeleteId) {
                deleteProduct(currentDeleteId);
                showToast('Product deleted successfully!');
                closeAllModals();
                renderProducts(
                    document.getElementById('searchProducts')?.value || '',
                    document.getElementById('categoryFilter')?.value || 'all'
                );
                updateDashboard();
                currentDeleteId = null;
            }
        });
    }

    // --- Modal Close ---
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    // --- Image Viewer ---
    document.getElementById('closeImageViewer')?.addEventListener('click', () => {
        closeModal('imageViewerModal');
    });

    // --- Image Upload Preview ---
    const imageInput = document.getElementById('productImage');
    const imageUrlInput = document.getElementById('productImageUrl');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const uploadContent = document.getElementById('uploadContent');
    const dropZone = document.getElementById('imageDropZone');

    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const base64 = await handleImageUpload(file);
                    if (previewImg) previewImg.src = base64;
                    if (preview) preview.style.display = 'block';
                    if (uploadContent) uploadContent.style.display = 'none';
                    if (imageUrlInput) imageUrlInput.value = '';
                } catch (error) {
                    showToast(error, 'error');
                }
            }
        });
    }

    // Drag and drop
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                try {
                    const base64 = await handleImageUpload(file);
                    if (previewImg) previewImg.src = base64;
                    if (preview) preview.style.display = 'block';
                    if (uploadContent) uploadContent.style.display = 'none';
                    if (imageUrlInput) imageUrlInput.value = '';
                } catch (error) {
                    showToast(error, 'error');
                }
            }
        });
    }

    // Remove image
    document.getElementById('removeImageBtn')?.addEventListener('click', () => {
        if (imageInput) imageInput.value = '';
        if (imageUrlInput) imageUrlInput.value = '';
        if (preview) preview.style.display = 'none';
        if (uploadContent) uploadContent.style.display = 'block';
    });

    // Image URL input
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', () => {
            const url = imageUrlInput.value.trim();
            if (url) {
                if (previewImg) previewImg.src = url;
                if (preview) preview.style.display = 'block';
                if (uploadContent) uploadContent.style.display = 'none';
                if (imageInput) imageInput.value = '';
            } else {
                if (preview) preview.style.display = 'none';
                if (uploadContent) uploadContent.style.display = 'block';
            }
        });
    }

    // --- Settings Form ---
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const settings = {
                name: document.getElementById('shopName')?.value,
                tagline: document.getElementById('shopTagline')?.value,
                phone: document.getElementById('shopPhone')?.value,
                email: document.getElementById('shopEmail')?.value,
                address: document.getElementById('shopAddress')?.value
            };
            localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
            showToast('Settings saved successfully!');
        });
    }

    // Load saved settings
    const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const fields = ['shopName', 'shopTagline', 'shopPhone', 'shopEmail', 'shopAddress'];
        const keys = ['name', 'tagline', 'phone', 'email', 'address'];
        fields.forEach((fieldId, i) => {
            const el = document.getElementById(fieldId);
            if (el && settings[keys[i]]) el.value = settings[keys[i]];
        });
    }

    // --- Export Data ---
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const products = getProducts();
            const dataStr = JSON.stringify(products, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lucky-thangka-products.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Products exported successfully!');
        });
    }

    document.getElementById('quickExport')?.addEventListener('click', () => {
        exportBtn?.click();
    });

    // --- Import Data ---
    const importInput = document.getElementById('importDataInput');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const imported = JSON.parse(ev.target.result);
                    if (Array.isArray(imported)) {
                        const products = getProducts();
                        const merged = [...products, ...imported.map(p => ({
                            ...p,
                            id: p.id || generateId(),
                            created_at: p.created_at || new Date().toISOString()
                        }))];
                        saveProducts(merged);
                        renderProducts();
                        updateDashboard();
                        showToast(`Imported ${imported.length} products!`);
                    } else {
                        showToast('Invalid file format', 'error');
                    }
                } catch (err) {
                    showToast('Failed to parse JSON file', 'error');
                }
            };
            reader.readAsText(file);
            importInput.value = ''; // Reset
        });
    }

    // --- Clear All Data ---
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('⚠️ Are you sure you want to delete ALL products?\n\nThis action cannot be undone!')) {
                localStorage.removeItem(STORAGE_KEYS.products);
                renderProducts();
                updateDashboard();
                showToast('All products cleared!', 'warning');
            }
        });
    }

    // --- Refresh Data ---
    document.getElementById('quickRefresh')?.addEventListener('click', () => {
        renderProducts();
        updateDashboard();
        showToast('Data refreshed!');
    });

    // --- Mobile Menu ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuToggle && adminSidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay && adminSidebar) {
        sidebarOverlay.addEventListener('click', () => {
            adminSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // --- Initial Render ---
    renderProducts();
    updateDashboard();
    renderInquiries();

    console.log('Admin dashboard initialized successfully!');
}

// ============================================================
//  MAIN INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.admin-login-body')) {
        initLogin();
    } else if (document.querySelector('.admin-body')) {
        initDashboard();
        // Load reviews after dashboard init
        loadAdminReviews();
    }
});

// ============================================================
//  SUPABASE CONFIG (for Reviews)
// ============================================================

const SUPABASE_URL = 'https://cqqrgodgzcyuiarfajhm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcXJnb2RnemN5dWlhcmZhamhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjA4MDUsImV4cCI6MjA5MDA5NjgwNX0.oYRHrJpOpRPnmJs6FcFzxTsBJTWN9bFyAs24Fj9Q9GE';

let supabaseAdmin = null;
try {
    supabaseAdmin = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
} catch (e) {
    console.warn('Supabase not available for admin');
}

// ============================================================
//  REVIEW MANAGEMENT
// ============================================================

async function loadAdminReviews() {
    if (!supabaseAdmin) {
        renderAdminReviews([]);
        return;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            renderAdminReviews(data);
        } else {
            console.warn('Failed to load reviews:', error);
            renderAdminReviews([]);
        }
    } catch (e) {
        console.warn('Error loading reviews:', e);
        renderAdminReviews([]);
    }
}

function renderAdminReviews(reviews) {
    const list = document.getElementById('adminReviewsList');
    const navBadge = document.getElementById('navReviewCount');
    const avgRatingEl = document.getElementById('adminAvgRating');
    const totalReviewsEl = document.getElementById('adminTotalReviews');

    if (navBadge) navBadge.textContent = reviews.length;
    if (totalReviewsEl) totalReviewsEl.textContent = reviews.length;

    if (avgRatingEl && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        avgRatingEl.textContent = avg.toFixed(1);
    }

    if (!list) return;

    if (reviews.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-star" style="font-size:3rem;color:#D4AF37;margin-bottom:1rem;"></i>
                <h3>No reviews yet</h3>
                <p>Customer reviews will appear here once submitted.</p>
            </div>`;
        return;
    }

    list.innerHTML = reviews.map(r => {
        const starsHtml = Array.from({length: 5}, (_, i) =>
            `<i class="fa-solid fa-star${i < r.rating ? '' : ' dim'}"></i>`
        ).join('');

        const dateStr = new Date(r.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        return `
            <div class="admin-review-card" data-review-id="${r.id}">
                <div class="review-card-content">
                    <div class="review-card-header">
                        <span class="review-card-name">${escapeHTML(r.name)}</span>
                        ${r.location ? `<span class="review-card-location">${escapeHTML(r.location)}</span>` : ''}
                        <span class="review-card-stars">${starsHtml}</span>
                    </div>
                    <p class="review-card-text">"${escapeHTML(r.text)}"</p>
                    <span class="review-card-date">${dateStr}</span>
                </div>
                <div class="review-card-actions">
                    <button class="btn-delete-review" onclick="deleteReview('${r.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) return;

    if (!supabaseAdmin) {
        showToast('Supabase not connected', 'error');
        return;
    }

    try {
        const { error } = await supabaseAdmin
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (!error) {
            showToast('Review deleted successfully');
            // Remove the card with animation
            const card = document.querySelector(`[data-review-id="${reviewId}"]`);
            if (card) {
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    card.remove();
                    loadAdminReviews(); // Refresh counts
                }, 300);
            } else {
                loadAdminReviews();
            }
        } else {
            console.warn('Delete error:', error);
            showToast('Failed to delete review: ' + error.message, 'error');
        }
    } catch (e) {
        console.warn('Delete failed:', e);
        showToast('Network error. Please try again.', 'error');
    }
}

// ============================================================
//  PUBLIC API (for main site access)
// ============================================================

window.AdminAPI = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getSettings: function () {
        const saved = localStorage.getItem(STORAGE_KEYS.settings);
        return saved ? JSON.parse(saved) : null;
    }
};
