/**
 * Lucky Thangka Main Site Script
 * Reads products from localStorage (managed by Admin Panel)
 */

// ============================================================
//  PRODUCT DATA
// ============================================================

const STORAGE_KEY = 'lt_products';

// Default products (fallback if admin hasn't added any yet)
const DEFAULT_PRODUCTS = [
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

function getProducts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
}

// ============================================================
//  DOM READY
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Navigation Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        if (mobileMenu) mobileMenu.classList.toggle('active');
    };

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (closeMenu) closeMenu.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));

    // 3. Intersection Observer for Scroll Animations
    const animatedElements = document.querySelectorAll('.transform-up, .pop-in');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => animationObserver.observe(el));

    // 4. Render Products
    renderProducts();

    // 5. Inquire Buttons
    setupInquiryButtons();

    // 6. Contact Form
    setupContactForm();

    // 7. Review System
    setupReviewSystem();
});

// ============================================================
//  PRODUCT RENDERING
// ============================================================

function renderProducts() {
    const products = getProducts();

    // Render Thangkas
    const thangkasGrid = document.getElementById('thangkasGrid');
    if (thangkasGrid) {
        const thangkas = products.filter(p => p.category === 'thangkas');
        if (thangkas.length > 0) {
            thangkasGrid.innerHTML = thangkas.map(p => createProductCard(p, 'light')).join('');
        } else {
            thangkasGrid.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 2rem;">Products coming soon...</p>';
        }
    }

    // Render Antiques & Paintings
    const antiquesGrid = document.getElementById('antiquesGrid');
    if (antiquesGrid) {
        const antiques = products.filter(p => p.category === 'antiques' || p.category === 'paintings');
        if (antiques.length > 0) {
            antiquesGrid.innerHTML = antiques.map(p => createProductCard(p, 'dark')).join('');
        } else {
            antiquesGrid.innerHTML = '<p style="text-align:center; color: rgba(255,255,255,0.5); padding: 2rem;">Products coming soon...</p>';
        }
    }

    // Render Singing Bowls (if bowls grid exists)
    const bowlsGrid = document.getElementById('bowlsGrid');
    if (bowlsGrid) {
        const bowls = products.filter(p => p.category === 'bowls');
        if (bowls.length > 0) {
            bowlsGrid.innerHTML = bowls.map(p => createProductCard(p, 'light')).join('');
        }
    }

    // Re-attach inquiry buttons
    setupInquiryButtons();
}

function createProductCard(product, theme) {
    const isDark = theme === 'dark';
    const badgeClass = isDark ? 'badge-gold' : (product.badge?.includes('Prosperity') ? 'badge-gold' : product.badge?.includes('Protection') ? 'badge-dark' : '');
    const textClass = isDark ? 'text-light' : '';
    const descClass = isDark ? 'text-light-muted' : 'product-desc';
    const btnClass = isDark ? 'btn-glass' : 'btn-outline';
    const cardClass = isDark ? 'bg-dark-card glass-effect' : '';

    // Fix relative image paths from admin (admin uses ../images, main site uses images/)
    let imageSrc = product.image || '';
    if (imageSrc.startsWith('../')) {
        imageSrc = imageSrc.substring(3);
    }

    return `
        <div class="product-card ${cardClass}">
            <div class="product-image">
                <img src="${imageSrc || 'images/placeholder.png'}" 
                     alt="${escapeHtml(product.name)}"
                     onerror="this.src='https://via.placeholder.com/400x350/F2EBE0/8B4513?text=Image+Coming+Soon'">
                ${product.badge ? `<div class="badge ${badgeClass}">${escapeHtml(product.badge)}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="${textClass}">${escapeHtml(product.name)}</h3>
                <p class="${descClass}">${escapeHtml(product.description)}</p>
                <button class="btn ${btnClass} btn-full inquire-btn" data-product="${escapeHtml(product.name)}">Inquire to Buy</button>
            </div>
        </div>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
//  INQUIRY BUTTONS
// ============================================================

function setupInquiryButtons() {
    const inquireButtons = document.querySelectorAll('.inquire-btn');
    const productInput = document.getElementById('product');
    const contactSection = document.getElementById('contact');

    inquireButtons.forEach(btn => {
        // Remove old listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const productName = newBtn.getAttribute('data-product');
            if (productName && productInput) {
                productInput.value = productName;
            }
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
            // Highlight the product input
            if (productInput) {
                productInput.style.borderColor = '#D4AF37';
                productInput.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.2)';
                setTimeout(() => {
                    productInput.style.borderColor = '';
                    productInput.style.boxShadow = '';
                }, 2000);
            }
        });
    });
}

// ============================================================
//  CONTACT FORM
// ============================================================

function setupContactForm() {
    const form = document.getElementById('inquiryForm');
    const modal = document.getElementById('inquiryModal');
    const closeModalElements = document.querySelectorAll('.close-modal, .close-modal-btn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Save inquiry to localStorage for admin to see
            const inquiry = {
                id: Date.now().toString(36),
                name: document.getElementById('name')?.value,
                email: document.getElementById('email')?.value,
                phone: document.getElementById('phone')?.value,
                product: document.getElementById('product')?.value,
                message: document.getElementById('message')?.value,
                date: new Date().toISOString()
            };

            const inquiries = JSON.parse(localStorage.getItem('lt_inquiries') || '[]');
            inquiries.unshift(inquiry);
            localStorage.setItem('lt_inquiries', JSON.stringify(inquiries));

            form.reset();
            if (modal) modal.classList.add('active');
        });
    }

    closeModalElements.forEach(el => {
        el.addEventListener('click', () => {
            if (modal) modal.classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ============================================================
//  PUBLIC API
// ============================================================

window.ProductAPI = {
    refreshProducts: renderProducts,
    getProducts: getProducts
};

// ============================================================
//  SUPABASE CONFIG
// ============================================================

const SUPABASE_URL = 'https://cqqrgodgzcyuiarfajhm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcXJnb2RnemN5dWlhcmZhamhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjA4MDUsImV4cCI6MjA5MDA5NjgwNX0.oYRHrJpOpRPnmJs6FcFzxTsBJTWN9bFyAs24Fj9Q9GE';

let supabaseClient = null;
try {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.warn('Supabase not available, using localStorage fallback');
}

// ============================================================
//  REVIEW SYSTEM (Supabase-powered)
// ============================================================

const REVIEWS_KEY = 'lt_reviews';

// Fallback reviews if Supabase is empty or unavailable
const DEFAULT_REVIEWS = [
    {
        id: 'r1',
        name: 'Sarah M.',
        location: 'USA',
        rating: 5,
        text: 'The vibration of my Heart Chakra singing bowl is profoundly deep. You can feel the authenticity, and their service was exceptional.',
        created_at: '2026-02-15T10:30:00Z'
    },
    {
        id: 'r2',
        name: 'Ananya R.',
        location: 'India',
        rating: 5,
        text: 'My White Tara Thangka arrived with its certificate of authenticity. The painting is mesmerizing and brings such a peaceful energy to our home.',
        created_at: '2026-03-01T14:20:00Z'
    },
    {
        id: 'r3',
        name: 'David L.',
        location: 'UK',
        rating: 5,
        text: 'Found an incredible vintage brass statue here. The packaging was extremely secure, a trustworthy destination for high-value antiques.',
        created_at: '2026-03-10T09:15:00Z'
    }
];

async function getReviews() {
    // Try Supabase first
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                // Cache in localStorage
                localStorage.setItem(REVIEWS_KEY, JSON.stringify(data));
                return data;
            }
        } catch (e) {
            console.warn('Supabase fetch failed, using cache:', e);
        }
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(REVIEWS_KEY);
    if (stored) return JSON.parse(stored);
    return [...DEFAULT_REVIEWS];
}

async function saveReview(reviewData) {
    // Save to Supabase
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert([{
                    name: reviewData.name,
                    location: reviewData.location,
                    rating: reviewData.rating,
                    text: reviewData.text
                }])
                .select();

            if (!error && data) {
                return true;
            }
            console.warn('Supabase insert error:', error);
        } catch (e) {
            console.warn('Supabase save failed:', e);
        }
    }

    // Fallback: save to localStorage
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    reviews.unshift({
        ...reviewData,
        id: 'r_' + Date.now().toString(36),
        created_at: new Date().toISOString()
    });
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    return true;
}

function renderReviewCards(reviews) {
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    if (reviews.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem;">No reviews yet. Be the first to share your experience!</p>';
        return;
    }

    grid.innerHTML = reviews.map(r => {
        const starsHtml = Array.from({length: 5}, (_, i) =>
            `<i class="fa-solid fa-star" style="color: ${i < r.rating ? 'var(--gold)' : '#ddd'}"></i>`
        ).join('');

        const dateStr = new Date(r.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });

        return `
            <div class="testimonial-card">
                <div class="stars">${starsHtml}</div>
                <p class="review-text">"${escapeHtml(r.text)}"</p>
                <div class="reviewer">
                    - ${escapeHtml(r.name)}${r.location ? `, <span class="reviewer-location">${escapeHtml(r.location)}</span>` : ''}
                </div>
                <div class="review-date">${dateStr}</div>
            </div>
        `;
    }).join('');

    updateReviewSummary(reviews);
}

function updateReviewSummary(reviews) {
    if (reviews.length === 0) return;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const avgRounded = avg.toFixed(1);

    const avgNumber = document.getElementById('avgNumber');
    const reviewCount = document.getElementById('reviewCount');
    const avgStars = document.getElementById('avgStars');

    if (avgNumber) avgNumber.textContent = avgRounded;
    if (reviewCount) reviewCount.textContent = `· ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;

    if (avgStars) {
        const fullStars = Math.floor(avg);
        const hasHalf = avg - fullStars >= 0.5;
        let html = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) html += '<i class="fa-solid fa-star"></i>';
            else if (i === fullStars && hasHalf) html += '<i class="fa-solid fa-star-half-stroke"></i>';
            else html += '<i class="fa-regular fa-star"></i>';
        }
        avgStars.innerHTML = html;
    }
}

async function setupReviewSystem() {
    // Load and render reviews from Supabase
    const reviews = await getReviews();
    renderReviewCards(reviews);

    // Toggle review form
    const toggleBtn = document.getElementById('toggleReviewForm');
    const formWrapper = document.getElementById('reviewFormWrapper');
    const cancelBtn = document.getElementById('cancelReview');

    if (toggleBtn && formWrapper) {
        toggleBtn.addEventListener('click', () => {
            formWrapper.style.display = formWrapper.style.display === 'none' ? 'block' : 'none';
            toggleBtn.style.display = formWrapper.style.display === 'none' ? 'inline-flex' : 'none';
            if (formWrapper.style.display === 'block') {
                formWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    if (cancelBtn && formWrapper && toggleBtn) {
        cancelBtn.addEventListener('click', () => {
            formWrapper.style.display = 'none';
            toggleBtn.style.display = 'inline-flex';
        });
    }

    // Star selector
    const starSelector = document.getElementById('starSelector');
    const ratingInput = document.getElementById('reviewRating');

    if (starSelector && ratingInput) {
        const stars = starSelector.querySelectorAll('i');
        let currentRating = 5;

        stars.forEach(s => s.classList.add('active'));

        stars.forEach(star => {
            star.addEventListener('click', () => {
                currentRating = parseInt(star.dataset.rating);
                ratingInput.value = currentRating;
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.rating) <= currentRating);
                });
            });

            star.addEventListener('mouseenter', () => {
                const hoverRating = parseInt(star.dataset.rating);
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.rating) <= hoverRating);
                });
            });
        });

        starSelector.addEventListener('mouseleave', () => {
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.rating) <= currentRating);
            });
        });
    }

    // Review form submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            const name = document.getElementById('reviewerName')?.value.trim();
            const location = document.getElementById('reviewerLocation')?.value.trim();
            const rating = parseInt(document.getElementById('reviewRating')?.value || '5');
            const text = document.getElementById('reviewText')?.value.trim();

            if (!name || !text) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            const success = await saveReview({ name, location, rating, text });

            if (success) {
                // Reload reviews from Supabase
                const updatedReviews = await getReviews();
                renderReviewCards(updatedReviews);

                reviewForm.reset();

                // Reset stars
                if (starSelector) {
                    starSelector.querySelectorAll('i').forEach(s => s.classList.add('active'));
                }
                if (ratingInput) ratingInput.value = 5;

                // Hide form, show button
                if (formWrapper) formWrapper.style.display = 'none';
                if (toggleBtn) toggleBtn.style.display = 'inline-flex';

                showReviewToast('Thank you! Your review has been submitted.');
            } else {
                showReviewToast('Something went wrong. Please try again.');
            }

            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }
}

function showReviewToast(message) {
    let toast = document.querySelector('.review-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'review-toast';
        toast.innerHTML = '<i class="fa-solid fa-check-circle"></i> <span></span>';
        document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}
