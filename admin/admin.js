/**
 * Lucky Thangka Admin Panel with Supabase
 * Handles authentication, product CRUD, and cloud data management
 */

// Supabase configuration
const SUPABASE_URL = 'https://cqqrgodgzcyuiarfajhm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcXJnb2RnemN5dWlhcmZhamhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjA4MDUsImV4cCI6MjA5MDA5NjgwNX0.oYRHrJpOpRPnmJs6FcFzxTsBJTWN9bFyAs24Fj9Q9GE';

// Initialize Supabase client
let supabase = null;
if (window.supabase) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase connected');
    } catch (e) {
        console.warn('Supabase initialization failed:', e);
    }
} else {
    console.warn('Supabase library not loaded');
}

// Default admin credentials (fallback)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Storage keys
const STORAGE_KEYS = {
    isLoggedIn: 'lt_admin_logged_in',
    products: 'lt_products',
    settings: 'lt_settings'
};

// Sample products to initialize if none exist
const SAMPLE_PRODUCTS = [
    {
        id: '1',
        name: 'Green Tara Thangka',
        category: 'thangkas',
        description: 'Exquisite hand-painted deity of enlightened activity and abundance. Adorned with 24k gold detailing.',
        badge: 'Prosperity Thangka',
        image: '../images/hero.png'
    },
    {
        id: '2',
        name: 'Medicine Buddha',
        category: 'thangkas',
        description: 'Masterpiece depicting the supreme healer. Blessed to bring physical and spiritual well-being.',
        badge: 'Healing Thangka',
        image: 'https://images.unsplash.com/photo-1596707338006-c87515b88bdc?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: '3',
        name: 'Wheel of Life (Bhavachakra)',
        category: 'thangkas',
        description: 'Intricate representation of the cyclic existence, a profound meditation tool for protection.',
        badge: 'Protection Thangka',
        image: 'https://images.unsplash.com/photo-1614704383441-26b6807dba84?q=80&w=600&auto=format&fit=crop'
    }
];

// ============== SUPABASE PRODUCT OPERATIONS ==============

async function getProductsFromSupabase() {
    if (!supabase) return getProductsFromLocal();
    
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Cache locally for offline access
        if (data && data.length > 0) {
            localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(data));
        }
        
        return data || getProductsFromLocal();
    } catch (err) {
        console.warn('Supabase fetch failed, using localStorage:', err);
        return getProductsFromLocal();
    }
}

async function addProductToSupabase(product) {
    if (!supabase) return addProductToLocal(product);
    
    try {
        // Upload image to Supabase Storage if it's base64
        if (product.image && product.image.startsWith('data:')) {
            const imageUrl = await uploadImageToStorage(product.image, product.id);
            if (imageUrl) product.image = imageUrl;
        }
        
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();
        
        if (error) throw error;
        
        // Also save to localStorage as backup
        addProductToLocal(data || product);
        return data || product;
    } catch (err) {
        console.warn('Supabase insert failed, using localStorage:', err);
        return addProductToLocal(product);
    }
}

async function updateProductInSupabase(id, updates) {
    if (!supabase) return updateProductInLocal(id, updates);
    
    try {
        // Upload new image if provided as base64
        if (updates.image && updates.image.startsWith('data:')) {
            const imageUrl = await uploadImageToStorage(updates.image, id);
            if (imageUrl) updates.image = imageUrl;
        }
        
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        
        // Update localStorage too
        updateProductInLocal(id, data || updates);
        return data || updates;
    } catch (err) {
        console.warn('Supabase update failed, using localStorage:', err);
        return updateProductInLocal(id, updates);
    }
}

async function deleteProductFromSupabase(id) {
    if (!supabase) return deleteProductFromLocal(id);
    
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // Also delete from localStorage
        deleteProductFromLocal(id);
        return true;
    } catch (err) {
        console.warn('Supabase delete failed, using localStorage:', err);
        return deleteProductFromLocal(id);
    }
}

async function uploadImageToStorage(base64Image, productId) {
    if (!supabase) return null;
    
    try {
        // Convert base64 to blob
        const response = await fetch(base64Image);
        const blob = await response.blob();
        
        const fileName = `product-${productId}-${Date.now()}.jpg`;
        
        const { data, error } = await supabase
            .storage
            .from('products')
            .upload(fileName, blob, {
                contentType: 'image/jpeg',
                cacheControl: '3600'
            });
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase
            .storage
            .from('products')
            .getPublicUrl(fileName);
        
        return urlData.publicUrl;
    } catch (err) {
        console.error('Image upload failed:', err);
        return null;
    }
}

// ============== LOCAL FALLBACK OPERATIONS ==============

function getProductsFromLocal() {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    if (!stored) {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(SAMPLE_PRODUCTS));
        return SAMPLE_PRODUCTS;
    }
    return JSON.parse(stored);
}

function addProductToLocal(product) {
    const products = getProductsFromLocal();
    product.id = generateId();
    product.created_at = new Date().toISOString();
    products.push(product);
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    return product;
}

function updateProductInLocal(id, updates) {
    const products = getProductsFromLocal();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
        return products[index];
    }
    return null;
}

function deleteProductFromLocal(id) {
    const products = getProductsFromLocal();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(filtered));
    return true;
}

// Legacy functions for backward compatibility
function getProducts() { return getProductsFromLocal(); }
function saveProducts(products) { localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products)); }
function addProduct(product) { return addProductToLocal(product); }
function updateProduct(id, updates) { return updateProductInLocal(id, updates); }
function deleteProduct(id) { return deleteProductFromLocal(id); }

// ============== IMAGE HANDLING ==============

function handleImageUpload(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            reject('Image size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result); // Base64 string
        };
        reader.onerror = () => reject('Failed to read image');
        reader.readAsDataURL(file);
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============== UI RENDERING ==============

async function renderProducts(searchTerm = '') {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading products...</p></div>';

    let products = await getProductsFromSupabase();

    // Filter by search term
    if (searchTerm) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (products.length === 0 && !searchTerm) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = products.map(product => `
        <div class="product-admin-card" data-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image || '../images/placeholder.png'}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-admin-info">
                <h4>${product.name}</h4>
                <p class="product-category">${getCategoryName(product.category)}</p>
                <p class="product-desc">${product.description.substring(0, 80)}...</p>
            </div>
            <div class="product-admin-actions">
                <button class="btn-icon edit-btn" title="Edit" data-id="${product.id}">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button class="btn-icon delete-btn" title="Delete" data-id="${product.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Attach event listeners
    grid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
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

// ============== MODAL HANDLING ==============

let currentEditId = null;
let currentDeleteId = null;

function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productImage').value = '';
    openModal('productModal');
}

function openEditModal(id) {
    getProductsFromSupabase().then(products => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productPrice').value = product.price || '';

        // Handle image
        if (product.image) {
            if (product.image.startsWith('data:') || product.image.startsWith('http')) {
                document.getElementById('productImageUrl').value = product.image.startsWith('http') ? product.image : '';
                const preview = document.getElementById('imagePreview');
                preview.querySelector('img').src = product.image;
                preview.style.display = 'block';
            }
        }

        openModal('productModal');
    });
}

function openDeleteModal(id) {
    getProductsFromSupabase().then(products => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        currentDeleteId = id;
        document.getElementById('deleteProductName').textContent = product.name;
        openModal('deleteModal');
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ============== FORM HANDLING ==============

async function handleProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const description = document.getElementById('productDescription').value.trim();
    const badge = document.getElementById('productBadge').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const imageUrl = document.getElementById('productImageUrl').value.trim();
    const imageFile = document.getElementById('productImage').files[0];

    let image = imageUrl;

    // If file uploaded, convert to base64
    if (imageFile) {
        try {
            image = await handleImageUpload(imageFile);
        } catch (error) {
            showToast(error, 'error');
            return;
        }
    }

    const productData = {
        name,
        category,
        description,
        badge,
        price,
        image: image || '../images/placeholder.png'
    };

    if (currentEditId) {
        await updateProductInSupabase(currentEditId, productData);
        showToast('Product updated successfully');
    } else {
        await addProductToSupabase(productData);
        showToast('Product added successfully');
    }

    closeAllModals();
    renderProducts();
}

// ============== TOAST NOTIFICATIONS ==============

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toast.className = 'toast ' + type;
    toast.querySelector('i').className = type === 'success'
        ? 'fa-solid fa-check-circle'
        : 'fa-solid fa-exclamation-circle';
    toastMessage.textContent = message;

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============== SECTION NAVIGATION ==============

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

    // Update title
    const titles = {
        'products': 'Products',
        'categories': 'Categories',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
}

// ============== AUTHENTICATION ==============

function checkAuth() {
    // Check if user is logged in via localStorage
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
    
    if (!isLoggedIn) {
        // Redirect to login page
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const username = document.getElementById('username')?.value.trim();
                const password = document.getElementById('password')?.value.trim();
                
                // Validate credentials
                if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                    // Set login state
                    localStorage.setItem(STORAGE_KEYS.isLoggedIn, 'true');
                    
                    // Redirect to admin dashboard with absolute path
                    const currentPath = window.location.pathname;
                    const adminPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                    window.location.href = adminPath + 'admin.html';
                } else {
                    // Show error
                    if (loginError) {
                        loginError.textContent = 'Invalid username or password';
                        loginError.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('Login error:', err);
                if (loginError) {
                    loginError.textContent = 'An error occurred. Please try again.';
                    loginError.style.display = 'block';
                }
            }
        });
    }
}

function logout() {
    // Clear login state
    localStorage.removeItem(STORAGE_KEYS.isLoggedIn);
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// ============== INITIALIZATION ==============

function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Check auth but don't block - just redirect if not logged in
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
    if (!isLoggedIn) {
        console.log('Not logged in, redirecting to login...');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Dashboard initialized successfully');

    // Initialize products if empty
    if (!localStorage.getItem(STORAGE_KEYS.products)) {
        saveProducts(SAMPLE_PRODUCTS);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openAddModal);
    }

    // Search
    const searchProducts = document.getElementById('searchProducts');
    if (searchProducts) {
        searchProducts.addEventListener('input', (e) => {
            renderProducts(e.target.value);
        });
    }

    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (currentDeleteId) {
                await deleteProductFromSupabase(currentDeleteId);
                showToast('Product deleted successfully');
                closeAllModals();
                renderProducts();
                currentDeleteId = null;
            }
        });
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Close modal on outside click
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Image upload preview
    const imageInput = document.getElementById('productImage');
    const imageUrlInput = document.getElementById('productImageUrl');
    const preview = document.getElementById('imagePreview');

    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && preview) {
                try {
                    const base64 = await handleImageUpload(file);
                    preview.querySelector('img').src = base64;
                    preview.style.display = 'block';
                    if (imageUrlInput) imageUrlInput.value = '';
                } catch (error) {
                    showToast(error, 'error');
                }
            }
        });
    }

    // Remove image
    const removeImageBtn = document.querySelector('.remove-image');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            if (imageInput) imageInput.value = '';
            if (imageUrlInput) imageUrlInput.value = '';
            if (preview) preview.style.display = 'none';
        });
    }

    // Image URL input
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', (e) => {
            if (e.target.value && preview) {
                preview.querySelector('img').src = e.target.value;
                preview.style.display = 'block';
                if (imageInput) imageInput.value = '';
            }
        });
    }

    // Settings form
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
            showToast('Settings saved successfully');
        });
    }

    // Load settings
    const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const shopName = document.getElementById('shopName');
        const shopTagline = document.getElementById('shopTagline');
        const shopPhone = document.getElementById('shopPhone');
        const shopEmail = document.getElementById('shopEmail');
        const shopAddress = document.getElementById('shopAddress');
        
        if (shopName) shopName.value = settings.name || '';
        if (shopTagline) shopTagline.value = settings.tagline || '';
        if (shopPhone) shopPhone.value = settings.phone || '';
        if (shopEmail) shopEmail.value = settings.email || '';
        if (shopAddress) shopAddress.value = settings.address || '';
    }

    // Export data
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', async () => {
            const products = await getProductsFromSupabase();
            const dataStr = JSON.stringify(products, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lucky-thangka-products.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('Products exported successfully');
        });
    }

    // Clear all data
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL products? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEYS.products);
                renderProducts();
                showToast('All products cleared');
            }
        });
    }

    // Mobile menu toggle
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
    
    // Close sidebar when clicking nav items on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768 && adminSidebar && sidebarOverlay) {
                adminSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Initial render
    renderProducts();
}

// ============== MAIN INIT ==============

document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on
    if (document.querySelector('.admin-login-body')) {
        initLogin();
    } else if (document.querySelector('.admin-body')) {
        initDashboard();
    }
});

// ============== PUBLIC API ==============

window.AdminAPI = {
    getProducts: getProductsFromSupabase,
    addProduct: addProductToSupabase,
    updateProduct: updateProductInSupabase,
    deleteProduct: deleteProductFromSupabase,
    getSettings: function() {
        const saved = localStorage.getItem(STORAGE_KEYS.settings);
        return saved ? JSON.parse(saved) : null;
    }
};
