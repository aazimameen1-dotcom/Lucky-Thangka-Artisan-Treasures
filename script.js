/**
 * Lucky Thangka Main Site Script with Supabase Integration
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

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        mobileMenu.classList.toggle('active');
    };

    menuToggle.addEventListener('click', toggleMenu);
    closeMenu.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // 3. Intersection Observer for Scroll Animations
    const animatedElements = document.querySelectorAll('.transform-up, .pop-in');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

    // 4. Dynamic Product Rendering from Supabase (with localStorage fallback)
    renderProductsFromSupabase();

    // 5. Inquire to Buy Buttons - Pre-fill Product Input
    setupInquiryButtons();

    // 6. Form Handling & Modal
    setupContactForm();
});

// ============== SUPABASE PRODUCT FETCHING ==============

async function getProductsFromSupabase() {
    // Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Cache locally
                localStorage.setItem('lt_products', JSON.stringify(data));
                return data;
            }
        } catch (err) {
            console.warn('Supabase fetch failed, using localStorage:', err);
        }
    }
    
    // Fallback to localStorage
    return getProductsFromStorage();
}

function getProductsFromStorage() {
    const stored = localStorage.getItem('lt_products');
    const defaultProducts = [
        {
            id: '1',
            name: 'Green Tara Thangka',
            category: 'thangkas',
            description: 'Exquisite hand-painted deity of enlightened activity and abundance. Adorned with 24k gold detailing.',
            badge: 'Prosperity Thangka',
            image: 'images/hero.png'
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
        },
        {
            id: '4',
            name: 'Vintage Artifacts',
            category: 'antiques',
            description: 'Rare collections including vintage copper urli, old brass statues, and handcrafted wooden meditation stools.',
            badge: 'Antique',
            image: 'images/antique.png'
        },
        {
            id: '5',
            name: 'Bodhi Seed Malas',
            category: 'antiques',
            description: 'Traditional 108-bead meditation malas, antique butter lamps, and ritualistic implements.',
            badge: 'Spiritual',
            image: 'https://images.unsplash.com/photo-1601618218764-106596956272?q=80&w=600&auto=format&fit=crop'
        },
        {
            id: '6',
            name: 'Kashmiri Miniatures',
            category: 'paintings',
            description: 'Original contemporary and traditional artworks featuring nature-themed pieces and modern Buddhist art.',
            badge: 'Original Art',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop'
        }
    ];
    
    if (!stored) {
        localStorage.setItem('lt_products', JSON.stringify(defaultProducts));
        return defaultProducts;
    }
    return JSON.parse(stored);
}

async function renderProductsFromSupabase() {
    const products = await getProductsFromSupabase();
    
    // Render Thangkas
    const thangkasGrid = document.getElementById('thangkasGrid');
    if (thangkasGrid) {
        const thangkas = products.filter(p => p.category === 'thangkas');
        thangkasGrid.innerHTML = thangkas.map(product => createProductCard(product, 'light')).join('');
    }
    
    // Render Antiques & Paintings
    const antiquesGrid = document.getElementById('antiquesGrid');
    if (antiquesGrid) {
        const antiques = products.filter(p => p.category === 'antiques' || p.category === 'paintings');
        antiquesGrid.innerHTML = antiques.map(product => createProductCard(product, 'dark')).join('');
    }
    
    // Re-attach inquiry button listeners after rendering
    setupInquiryButtons();
}

function createProductCard(product, theme) {
    const isDark = theme === 'dark';
    const badgeClass = isDark ? 'badge-gold' : (product.badge?.includes('Prosperity') ? 'badge-gold' : product.badge?.includes('Protection') ? 'badge-dark' : '');
    const textClass = isDark ? 'text-light' : '';
    const descClass = isDark ? 'text-light-muted' : 'product-desc';
    const btnClass = isDark ? 'btn-glass' : 'btn-outline';
    const cardClass = isDark ? 'bg-dark-card glass-effect' : '';
    
    return `
        <div class="product-card ${cardClass}">
            <div class="product-image">
                <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
                ${product.badge ? `<div class="badge ${badgeClass}">${product.badge}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="${textClass}">${product.name}</h3>
                <p class="${descClass}">${product.description}</p>
                <button class="btn ${btnClass} btn-full inquire-btn" data-product="${product.name}">Inquire to Buy</button>
            </div>
        </div>
    `;
}

// ============== INQUIRY BUTTONS ==============

function setupInquiryButtons() {
    const inquireButtons = document.querySelectorAll('.inquire-btn');
    const productInput = document.getElementById('product');
    const contactSection = document.getElementById('contact');

    inquireButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productName = btn.getAttribute('data-product');
            if (productName && productInput) {
                productInput.value = productName;
            }
            // Smooth scroll to contact
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Highlight the form slightly
            if (productInput && productInput.parentElement) {
                productInput.parentElement.style.animation = 'highlight 1s ease';
                setTimeout(() => {
                    productInput.parentElement.style.animation = '';
                }, 1000);
            }
        });
    });
}

// ============== CONTACT FORM ==============

function setupContactForm() {
    const form = document.getElementById('inquiryForm');
    const modal = document.getElementById('inquiryModal');
    const closeModalElements = document.querySelectorAll('.close-modal, .close-modal-btn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real scenario, an API call would be made here.
            // For now, reset form and show success modal.
            form.reset();
            if (modal) {
                modal.classList.add('active');
            }
        });
    }

    closeModalElements.forEach(el => {
        el.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close modal on click outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// Add dynamic highlight keyframe dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes highlight {
    0% { transform: scale(1); background: transparent; }
    50% { transform: scale(1.02); background: rgba(200, 90, 72, 0.1); border-radius: 4px; padding: 5px; }
    100% { transform: scale(1); background: transparent; }
}
`;
document.head.appendChild(style);

// ============== PUBLIC API FOR EXTERNAL ACCESS ==============

window.ProductAPI = {
    refreshProducts: renderProductsFromSupabase,
    getProducts: getProductsFromSupabase
};
