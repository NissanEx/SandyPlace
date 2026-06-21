// ============================================
// MAIN.JS - Sandy Place Marketplace
// Semua JavaScript digabung menjadi satu file
// Menggunakan Supabase sebagai database
// ============================================

// ============================================
// 1. SUPABASE INITIALIZATION
// ============================================

const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// 2. GLOBAL STATE
// ============================================

let currentUser = null;
let currentSession = null;
let cart = [];
let currentSlide = 0;
const totalSlides = 5;
let autoSlideInterval;
let authMode = 'signin';
let currentQuoteIndex = 0;
let quoteInterval;
let searchMode = 'produk';
let currentChatShopId = null;
let editingProductIndex = null;
let pendingProductPhoto = null;
let brandPool = [];
let tokoData = { brand: null, products: [] };
let profileData = {};

// ============================================
// 3. QUOTES DATA (untuk auth page)
// ============================================

const quotesRepository = [
    {
        book: "Madilog",
        quote: `"Bila kaum muda yang telah belajar di sekolah dan menganggap dirinya terlalu tinggi dan pintar untuk melebur dengan masyarakat yang bekerja dengan cangkul dan hanya memiliki cita-cita yang sederhana, maka lebih baik pendidikan itu tidak diberikan sama sekali."`,
        author: "Tan Malaka"
    },
    {
        book: "Bumi Manusia",
        quote: `"Kalian boleh maju dalam pelajaran, mungkin mendapat pangkat atau gelar setinggi-langit, tapi tanpa mencintai sastra, kalian hanya akan menjadi hewan yang pandai."`,
        author: "Pramoedya Ananta Toer"
    },
    {
        book: "Catatan Seorang Demonstran",
        quote: `"Hanya ada dua pilihan, menjadi apatis atau mengabdi. Karena dunia ini milik mereka yang berani melangkah, bukan mereka yang hanya diam mengeluh."`,
        author: "Soe Hok Gie"
    }
];

// ============================================
// 4. DUMMY PRODUCTS (seed data awal)
// ============================================

const dummyProducts = [
    { id: 1, name: "Komputer Gaming Ryzen 5 Premium", desc: "PC Gaming handal, RAM 16GB, SSD 512GB, Nvidia GTX 1650 Super, Cocok untuk gaming berat dan render.", price: 7850000, tag: "pc", location: "DKI Jakarta", mall: true, power: false, condNew: true, photo: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=300", brandId: "cyberbyte-pc" },
    { id: 2, name: "Keyboard Mechanical SandyPro RGB", desc: "Switch biru responsif, backlit RGB, build metal kokoh untuk kompetisi eSports terbaik Anda.", price: 549000, tag: "pc", location: "Bandung", mall: true, power: true, condNew: true, photo: "https://images.unsplash.com/photo-1618384887929-16ec33faf9c1?auto=format&fit=crop&q=80&w=300", brandId: "cyberbyte-pc" },
    { id: 3, name: "Mouse Gaming Wireless Ultimate 16000 DPI", desc: "Akurasi ultra presisi tanpa hambatan kabel. Pengisian daya nirkabel dengan baterai ekstra hemat.", price: 890000, tag: "pc", location: "Surabaya", mall: false, power: true, condNew: true, photo: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=300", brandId: "cyberbyte-pc" },
    { id: 4, name: "Kaos Polos Cotton Combed 30s Premium", desc: "Bahan sangat halus, adem saat dipakai, tidak melar setelah dicuci berkali-kali.", price: 75000, tag: "baju", location: "Bandung", mall: false, power: true, condNew: true, photo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300", brandId: "macys-fashion" },
    { id: 5, name: "Jaket Bomber Canvas Retro Edition", desc: "Gaya klasik luar ruangan dengan material kanvas tebal tahan angin, lapisan furing nyaman.", price: 295000, tag: "baju", location: "DKI Jakarta", mall: true, power: true, condNew: true, photo: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=300", brandId: "macys-fashion" },
    { id: 6, name: "Celana Chino Slim Fit Stretch", desc: "Tampil kasual namun tetap rapi. Material katun elastis premium untuk mobilitas tinggi.", price: 185000, tag: "baju", location: "Medan", mall: false, power: false, condNew: true, photo: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=300", brandId: "ebay-premium" },
    { id: 7, name: "Sepatu Sneakers Sandy Jogger Classic", desc: "Alas kaki super empuk, anti slip, desain modern minimalis yang cocok dipadukan dengan baju apa saja.", price: 420000, tag: "sepatu", location: "Jabodetabek", mall: true, power: true, condNew: true, photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300", brandId: "ebay-premium" },
    { id: 8, name: "Sepatu Running Sport Breathable Pro", desc: "Ringan digunakan, sirkulasi udara optimal meminimalkan bau keringat saat latihan lari marathon.", price: 580000, tag: "sepatu", location: "Surabaya", mall: true, power: false, condNew: true, photo: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300", brandId: "runfaster" },
    { id: 9, name: "Meja Laptop Kayu Jati Minimalis", desc: "Sempurna untuk WFH. Desain ergonomis dengan kaki lipat kokoh dari kayu jati alami.", price: 349000, tag: "peralatan", location: "Bandung", mall: false, power: true, condNew: true, photo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300", brandId: "woodcraft" }
];

// ============================================
// 5. BRAND DATABASE (pool untuk marketplace)
// ============================================

const defaultBrandPool = [
    {
        id: "user-shop",
        name: "Toko Saya",
        owner: "Pengguna",
        avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_cab_portrait.jpg/330px-Albert_Camus%2C_cab_portrait.jpg",
        banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600",
        badge: "Verified Brand",
        badgeColor: "bg-indigo-600/90 text-white",
        desc: "Halaman toko mandiri Anda. Kelola produk berkualitas & dekorasi toko Anda.",
        followers: "125",
        rating: "5.0 / 5"
    },
    {
        id: "ebay-premium",
        name: "eBay Premium",
        owner: "eBay Global Partner",
        avatar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150",
        banner: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
        badge: "Official Store",
        badgeColor: "bg-red-600/90 text-white",
        desc: "Temukan koleksi apparel, sepatu eksklusif, dan aksesoris hobi terlengkap.",
        followers: "154.2k",
        rating: "4.8 / 5"
    },
    {
        id: "macys-fashion",
        name: "Macy's Fashion",
        owner: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=150",
        banner: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600",
        badge: "Power Merchant",
        badgeColor: "bg-pink-600/90 text-white",
        desc: "Gaya busana modern berkualitas tinggi untuk menunjang aktivitas elegan harian Anda.",
        followers: "89.4k",
        rating: "4.7 / 5"
    },
    {
        id: "cyberbyte-pc",
        name: "CyberByte Electronics",
        owner: "Rian Hidayat",
        avatar: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=150",
        banner: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=600",
        badge: "Tech Pro Store",
        badgeColor: "bg-cyan-600/90 text-white",
        desc: "Komputer kustom rakitan, peripheral mechanical keyboard, & aksesoris eSports.",
        followers: "12.3k",
        rating: "4.9 / 5"
    },
    {
        id: "woodcraft",
        name: "WoodCraft Co.",
        owner: "Siti Rahma",
        avatar: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=150",
        banner: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=600",
        badge: "Local Artisan",
        badgeColor: "bg-amber-600/90 text-white",
        desc: "Dekorasi estetik dan furnitur ramah lingkungan terbuat dari kayu jati pilihan.",
        followers: "4.2k",
        rating: "4.6 / 5"
    },
    {
        id: "runfaster",
        name: "RunFaster Store",
        owner: "Andre Wijaya",
        avatar: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=150",
        banner: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
        badge: "Sport Specialist",
        badgeColor: "bg-emerald-600/90 text-white",
        desc: "Dukungan alas kaki bersirkulasi optimal untuk lari marathon maupun harian.",
        followers: "28.1k",
        rating: "4.8 / 5"
    }
];

// ============================================
// 6. SUPABASE DATABASE FUNCTIONS
// ============================================

// 6.1 AUTHENTICATION
async function signUpUser(email, password, username) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    full_name: username
                }
            }
        });
        
        if (error) throw error;
        
        // Buat profil user di tabel profiles
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        username: username,
                        email: email,
                        name: username,
                        phone: '',
                        address: '',
                        message: 'Selamat datang di profil saya!',
                        avatar: null,
                        followers: 0,
                        following: 0
                    }
                ]);
            
            if (profileError) throw profileError;
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { success: true, session: session };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 6.2 PROFILE FUNCTIONS
async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return { success: true, profile: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateProfile(userId, profileData) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId);
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 6.3 TOKO / STORE FUNCTIONS
async function getStore(userId) {
    try {
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Store belum ada, buat baru
            return await createStore(userId);
        }
        
        if (error) throw error;
        return { success: true, store: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function createStore(userId) {
    try {
        const { data, error } = await supabase
            .from('stores')
            .insert([
                {
                    user_id: userId,
                    name: 'Toko Saya',
                    brand: null,
                    description: 'Selamat datang di toko saya!'
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, store: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateStore(userId, storeData) {
    try {
        const { data, error } = await supabase
            .from('stores')
            .update(storeData)
            .eq('user_id', userId);
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 6.4 PRODUCT FUNCTIONS
async function getProducts(userId = null) {
    try {
        let query = supabase.from('products').select('*');
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, products: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function addProduct(userId, productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    user_id: userId,
                    ...productData
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, product: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateProduct(productId, productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', productId);
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteProduct(productId) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 6.5 ORDERS FUNCTIONS
async function getOrders(userId, isBuyer = true) {
    try {
        let query = supabase.from('orders').select('*');
        
        if (isBuyer) {
            query = query.eq('buyer_id', userId);
        } else {
            query = query.eq('seller_id', userId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, orders: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function createOrder(orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, order: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateOrder(orderId, orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update(orderData)
            .eq('id', orderId);
        
        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 6.6 CART FUNCTIONS
async function getCart(userId) {
    try {
        const { data, error } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        return { success: true, cart: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function addToCartDB(userId, productId, quantity = 1) {
    try {
        // Cek apakah produk sudah ada di cart
        const { data: existing, error: checkError } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();
        
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (existing) {
            // Update quantity
            const { data, error } = await supabase
                .from('cart')
                .update({ quantity: existing.quantity + quantity })
                .eq('id', existing.id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, cart: data };
        } else {
            // Insert new cart item
            const { data, error } = await supabase
                .from('cart')
                .insert([
                    {
                        user_id: userId,
                        product_id: productId,
                        quantity: quantity
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, cart: data };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateCartQuantity(cartId, quantity) {
    try {
        const { data, error } = await supabase
            .from('cart')
            .update({ quantity: quantity })
            .eq('id', cartId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function removeFromCart(cartId) {
    try {
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('id', cartId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// 7. AUTH FUNCTIONS (UI)
// ============================================

async function handleSignUp(event) {
    event.preventDefault();
    
    const username = document.getElementById('userName')?.value.trim();
    const email = document.getElementById('userEmail')?.value.trim();
    const password = document.getElementById('userPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    
    if (!username || !email || !password || !confirmPass) {
        showToast('Semua field harus diisi!', '#dc2626');
        return;
    }
    
    if (password !== confirmPass) {
        showToast('Konfirmasi kata sandi tidak cocok!', '#dc2626');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password minimal 6 karakter!', '#dc2626');
        return;
    }
    
    const result = await signUpUser(email, password, username);
    
    if (result.success) {
        showToast('Pendaftaran sukses! Silakan verifikasi email Anda.', '#10b981');
        setMode('signin');
    } else {
        showToast('Gagal mendaftar: ' + result.error, '#dc2626');
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('userEmail')?.value.trim();
    const password = document.getElementById('userPassword')?.value;
    
    if (!email || !password) {
        showToast('Email dan password harus diisi!', '#dc2626');
        return;
    }
    
    const result = await signInUser(email, password);
    
    if (result.success) {
        currentUser = result.user;
        currentSession = result.session;
        showToast('Selamat datang kembali!', '#10b981');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showToast('Gagal masuk: ' + result.error, '#dc2626');
    }
}

async function handleGoogleSignIn() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });
        
        if (error) throw error;
        showToast('Menghubungkan akun Google...', '#4285F4');
    } catch (error) {
        showToast('Gagal login dengan Google: ' + error.message, '#dc2626');
    }
}

async function handleLogout(event) {
    if (event) event.preventDefault();
    
    showToast('Sedang keluar...', '#dc2626');
    const result = await signOutUser();
    
    if (result.success) {
        currentUser = null;
        currentSession = null;
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1000);
    } else {
        showToast('Gagal keluar: ' + result.error, '#dc2626');
    }
}

function setMode(mode) {
    if (authMode === mode) return;
    authMode = mode;
    
    const header = document.getElementById('formHeader');
    const emailRow = document.getElementById('emailRow');
    const confirmRow = document.getElementById('confirmRow');
    const signUpBtn = document.getElementById('signUpBtn');
    const signInBtn = document.getElementById('signInBtn');
    const userNameLabel = document.getElementById('userNameLabel');
    const userNameInput = document.getElementById('userName');
    const googleRow = document.getElementById('googleRow');
    const authForm = document.getElementById('authForm');
    
    if (mode === 'signup') {
        if (header) header.innerText = 'Sign Up';
        if (emailRow) emailRow.classList.add('show');
        if (confirmRow) confirmRow.classList.add('show');
        if (googleRow) googleRow.style.display = 'none';
        if (userNameLabel) userNameLabel.innerText = 'User Name :';
        if (userNameInput) userNameInput.placeholder = 'Masukkan nama pengguna';
        
        const emailInput = document.getElementById('userEmail');
        if (emailInput) emailInput.setAttribute('required', 'true');
        const confirmInput = document.getElementById('confirmPassword');
        if (confirmInput) confirmInput.setAttribute('required', 'true');
        
        if (signUpBtn) {
            signUpBtn.className = 'btn-auth active';
            signUpBtn.setAttribute('type', 'submit');
            signUpBtn.onclick = null;
        }
        
        if (signInBtn) {
            signInBtn.className = 'btn-auth inactive';
            signInBtn.setAttribute('type', 'button');
            signInBtn.onclick = () => setMode('signin');
        }
        
        if (authForm) {
            authForm.onsubmit = handleSignUp;
        }
    } else {
        if (header) header.innerText = 'Sign In';
        if (emailRow) emailRow.classList.remove('show');
        if (confirmRow) confirmRow.classList.remove('show');
        if (googleRow) googleRow.style.display = 'grid';
        if (userNameLabel) userNameLabel.innerText = 'User Name :';
        if (userNameInput) userNameInput.placeholder = 'Masukkan nama pengguna';
        
        const emailInput = document.getElementById('userEmail');
        if (emailInput) emailInput.removeAttribute('required');
        const confirmInput = document.getElementById('confirmPassword');
        if (confirmInput) confirmInput.removeAttribute('required');
        
        if (signInBtn) {
            signInBtn.className = 'btn-auth active';
            signInBtn.setAttribute('type', 'submit');
            signInBtn.onclick = null;
        }
        
        if (signUpBtn) {
            signUpBtn.className = 'btn-auth inactive';
            signUpBtn.setAttribute('type', 'button');
            signUpBtn.onclick = () => setMode('signup');
        }
        
        if (authForm) {
            authForm.onsubmit = handleSignIn;
        }
    }
}

// ============================================
// 8. QUOTE CAROUSEL (Auth Page)
// ============================================

function renderQuote(index) {
    const wrapper = document.getElementById('quoteWrapper');
    const titleEl = document.getElementById('bookTitle');
    const bodyEl = document.getElementById('quoteBody');
    const authorEl = document.getElementById('bookAuthor');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!wrapper || !titleEl || !bodyEl || !authorEl) return;
    
    wrapper.classList.add('fade-out');
    
    setTimeout(() => {
        const target = quotesRepository[index];
        titleEl.innerText = target.book;
        bodyEl.innerText = target.quote;
        authorEl.innerText = target.author;
        
        dots.forEach((dot, dIdx) => {
            dot.classList.toggle('active', dIdx === index);
        });
        
        wrapper.classList.remove('fade-out');
    }, 350);
}

function rotateQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotesRepository.length;
    renderQuote(currentQuoteIndex);
}

function jumpToQuote(index) {
    clearInterval(quoteInterval);
    currentQuoteIndex = index;
    renderQuote(currentQuoteIndex);
    startQuoteCarousel();
}

function startQuoteCarousel() {
    quoteInterval = setInterval(rotateQuote, 6500);
}

// ============================================
// 9. PROFILE FUNCTIONS (UI)
// ============================================

async function loadProfile() {
    const result = await getCurrentUser();
    
    if (!result.success || !result.user) {
        // Tidak login, redirect ke auth
        if (window.location.pathname.includes('profil.html')) {
            window.location.href = 'auth.html';
        }
        return;
    }
    
    currentUser = result.user;
    
    // Load profile data
    const profileResult = await getProfile(currentUser.id);
    
    if (profileResult.success && profileResult.profile) {
        profileData = profileResult.profile;
        renderProfileValues();
        renderAvatar();
    }
}

function renderProfileValues() {
    const elements = {
        dispName: document.getElementById('dispName'),
        dispEmail: document.getElementById('dispEmail'),
        dispAddress: document.getElementById('dispAddress'),
        dispPhone: document.getElementById('dispPhone'),
        dispMessage: document.getElementById('dispMessage'),
        dispFollowers: document.getElementById('dispFollowers'),
        dispFollowing: document.getElementById('dispFollowing')
    };
    
    if (elements.dispName) elements.dispName.innerText = profileData.name || profileData.username || 'Pengguna';
    if (elements.dispEmail) elements.dispEmail.innerText = profileData.email || '';
    if (elements.dispAddress) elements.dispAddress.innerText = profileData.address || 'Belum diisi';
    if (elements.dispPhone) elements.dispPhone.innerText = profileData.phone || 'Belum diisi';
    if (elements.dispMessage) elements.dispMessage.innerText = profileData.message ? `"${profileData.message}"` : '""';
    if (elements.dispFollowers) elements.dispFollowers.innerText = Number(profileData.followers || 0).toLocaleString('id-ID');
    if (elements.dispFollowing) elements.dispFollowing.innerText = Number(profileData.following || 0).toLocaleString('id-ID');
}

function renderAvatar() {
    const fallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_cab_portrait.jpg/330px-Albert_Camus%2C_cab_portrait.jpg';
    const src = profileData.avatar || fallback;
    
    const elements = [
        document.getElementById('profileImage'),
        document.getElementById('profileImageDesktop'),
        document.getElementById('profileImageMobile'),
        document.getElementById('navbarAvatar'),
        document.querySelector('.navbarAvatarMobile')
    ];
    
    elements.forEach(el => {
        if (el) {
            if (el.tagName === 'IMG') {
                el.src = src;
            } else {
                el.innerHTML = `<img src="${src}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
            }
        }
    });
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    document.getElementById('editName').value = profileData.name || '';
    document.getElementById('editEmail').value = profileData.email || '';
    document.getElementById('editPhone').value = profileData.phone || '';
    document.getElementById('editMessage').value = profileData.message || '';
    document.getElementById('editAddress').value = profileData.address || '';
    
    modal.style.display = 'flex';
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
}

async function saveProfileChanges(event) {
    event.preventDefault();
    
    const updatedProfile = {
        name: document.getElementById('editName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        message: document.getElementById('editMessage').value.trim(),
        address: document.getElementById('editAddress').value.trim()
    };
    
    const result = await updateProfile(currentUser.id, updatedProfile);
    
    if (result.success) {
        Object.assign(profileData, updatedProfile);
        renderProfileValues();
        closeEditModal();
        showToast('Profil berhasil diperbarui!', '#10b981');
    } else {
        showToast('Gagal memperbarui profil: ' + result.error, '#dc2626');
    }
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Convert to base64 untuk storage sementara
    const reader = new FileReader();
    reader.onload = async function(e) {
        const avatarData = e.target.result;
        
        const result = await updateProfile(currentUser.id, { avatar: avatarData });
        
        if (result.success) {
            profileData.avatar = avatarData;
            renderAvatar();
            showToast('Foto profil berhasil diunggah!', '#10b981');
        } else {
            showToast('Gagal mengunggah foto: ' + result.error, '#dc2626');
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// 10. TOKO / STORE FUNCTIONS (UI)
// ============================================

async function loadToko() {
    if (!currentUser) return;
    
    const result = await getStore(currentUser.id);
    
    if (result.success && result.store) {
        tokoData = result.store;
        renderBrand();
    }
    
    // Load products
    loadProducts();
}

function renderBrand() {
    const bannerImg = document.getElementById('brandBannerImg');
    const placeholder = document.getElementById('brandPlaceholder');
    
    if (tokoData.brand) {
        if (bannerImg) {
            bannerImg.src = tokoData.brand;
            bannerImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
    }
}

async function handleBrandUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const brandData = e.target.result;
        
        const result = await updateStore(currentUser.id, { brand: brandData });
        
        if (result.success) {
            tokoData.brand = brandData;
            renderBrand();
            showToast('Banner toko berhasil diunggah!', '#10b981');
        } else {
            showToast('Gagal mengunggah banner: ' + result.error, '#dc2626');
        }
    };
    reader.readAsDataURL(file);
}

function formatRupiah(num) {
    if (!num && num !== 0) return 'Rp 0';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

async function loadProducts() {
    if (!currentUser) return;
    
    const result = await getProducts(currentUser.id);
    
    if (result.success) {
        tokoData.products = result.products || [];
        renderProducts();
    }
}

function renderProducts() {
    const list = document.getElementById('productList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (!tokoData.products || tokoData.products.length === 0) {
        list.innerHTML = '<p style="font-family:Lora,serif;color:#aaa;font-style:italic;text-align:center;padding:24px 0;">Belum ada produk. Tekan + untuk menambahkan.</p>';
        return;
    }
    
    tokoData.products.forEach(function(p, i) {
        const item = document.createElement('div');
        item.className = 'product-item';
        item.innerHTML = `
            <div class="product-thumb">
                ${p.photo
                    ? `<img src="${p.photo}" alt="${p.name}">`
                    : `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
                }
            </div>
            <div class="product-info">
                <span class="product-name">${p.name || 'Produk'}</span>
                <span class="product-desc">${p.desc || 'Deskripsi'}</span>
                <span class="product-price">${formatRupiah(p.price)}</span>
            </div>
            <button class="btn-edit-product" onclick="openEditProductModal(${i})">Edit</button>
        `;
        list.appendChild(item);
    });
}

function openAddProductModal() {
    editingProductIndex = null;
    pendingProductPhoto = null;
    
    document.getElementById('productModalTitle').innerText = 'Tambah Produk';
    document.getElementById('productNameInput').value = '';
    document.getElementById('productDescInput').value = '';
    document.getElementById('productPriceInput').value = '';
    document.getElementById('productPhotoImgPreview').style.display = 'none';
    document.getElementById('productPhotoImgPreview').src = '';
    document.getElementById('productPhotoHint').style.display = 'flex';
    document.getElementById('deleteProductBtn').style.display = 'none';
    document.getElementById('productModal').style.display = 'flex';
}

function openEditProductModal(index) {
    editingProductIndex = index;
    pendingProductPhoto = null;
    const p = tokoData.products[index];
    
    document.getElementById('productModalTitle').innerText = 'Edit Produk';
    document.getElementById('productNameInput').value = p.name || '';
    document.getElementById('productDescInput').value = p.desc || '';
    document.getElementById('productPriceInput').value = p.price || '';
    
    if (p.photo) {
        document.getElementById('productPhotoImgPreview').src = p.photo;
        document.getElementById('productPhotoImgPreview').style.display = 'block';
        document.getElementById('productPhotoHint').style.display = 'none';
    } else {
        document.getElementById('productPhotoImgPreview').style.display = 'none';
        document.getElementById('productPhotoHint').style.display = 'flex';
    }
    
    document.getElementById('deleteProductBtn').style.display = 'inline-flex';
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function handleProductPhotoPreview(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        pendingProductPhoto = e.target.result;
        document.getElementById('productPhotoImgPreview').src = pendingProductPhoto;
        document.getElementById('productPhotoImgPreview').style.display = 'block';
        document.getElementById('productPhotoHint').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function saveProduct() {
    const name = document.getElementById('productNameInput').value.trim();
    const desc = document.getElementById('productDescInput').value.trim();
    const price = document.getElementById('productPriceInput').value;
    
    if (!name) {
        showToast('Nama produk wajib diisi!', '#dc2626');
        return;
    }
    
    const productData = {
        name: name,
        desc: desc,
        price: parseFloat(price) || 0,
        photo: pendingProductPhoto || null,
        tag: name.toLowerCase(),
        location: 'DKI Jakarta',
        mall: false,
        power: true,
        condNew: true
    };
    
    let result;
    
    if (editingProductIndex !== null) {
        const product = tokoData.products[editingProductIndex];
        result = await updateProduct(product.id, productData);
    } else {
        result = await addProduct(currentUser.id, productData);
    }
    
    if (result.success) {
        await loadProducts();
        closeProductModal();
        showToast(editingProductIndex !== null ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!', '#10b981');
    } else {
        showToast('Gagal menyimpan produk: ' + result.error, '#dc2626');
    }
}

async function deleteCurrentProduct() {
    if (editingProductIndex === null) return;
    
    const product = tokoData.products[editingProductIndex];
    const result = await deleteProduct(product.id);
    
    if (result.success) {
        await loadProducts();
        closeProductModal();
        showToast('Produk berhasil dihapus.', '#dc2626');
    } else {
        showToast('Gagal menghapus produk: ' + result.error, '#dc2626');
    }
}

// ============================================
// 11. ORDERS FUNCTIONS (UI)
// ============================================

async function loadOrders() {
    if (!currentUser) return;
    
    const result = await getOrders(currentUser.id, false);
    
    if (result.success) {
        updateOrderBadge(result.orders);
        renderSellerOrders(result.orders);
    }
}

function updateOrderBadge(orders) {
    const badge = document.getElementById('orderBadge');
    if (!badge) return;
    
    const pendingOrders = (orders || []).filter(o => o.status === 'Menunggu Konfirmasi').length;
    
    if (pendingOrders > 0) {
        badge.innerText = pendingOrders;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderSellerOrders(orders) {
    const container = document.getElementById('ordersContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p style="font-family:Lora,serif;color:#aaa;font-style:italic;text-align:center;padding:24px 0;">Belum ada pesanan masuk dari pembeli.</p>';
        return;
    }
    
    orders.forEach((order) => {
        const isPending = order.status === 'Menunggu Konfirmasi';
        const items = order.items || [];
        
        const itemsHtml = items.map(item => `
            <div class="flex justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0">
                <span class="text-zinc-700">${item.name} <strong class="text-zinc-950 font-bold">x${item.qty || 1}</strong></span>
                <span class="font-bold text-zinc-900">${formatRupiah((item.price || 0) * (item.qty || 1))}</span>
            </div>
        `).join('');
        
        const card = document.createElement('div');
        card.className = `border p-5 rounded-2xl flex flex-col gap-4 bg-white transition ${isPending ? 'border-amber-300 shadow-sm bg-amber-50/10' : 'border-zinc-200'}`;
        
        card.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">${order.date || 'Hari ini'}</span>
                    <h5 class="text-sm font-bold text-zinc-950">${order.id}</h5>
                </div>
                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                    isPending 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }">
                    ${order.status}
                </span>
            </div>
            
            <div class="bg-zinc-50 p-4 rounded-xl text-xs space-y-1.5 border border-zinc-100">
                <div><strong class="text-zinc-800">Nama Penerima:</strong> ${order.buyer || 'Pembeli'}</div>
                <div><strong class="text-zinc-800">No. Telepon:</strong> ${order.phone || '-'}</div>
                <div><strong class="text-zinc-800">Alamat Tujuan:</strong> ${order.address || '-'}</div>
            </div>
            
            <div class="space-y-1">
                <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Ringkasan Produk</span>
                <div class="bg-white border border-zinc-200/60 rounded-xl px-4 py-2">
                    ${itemsHtml}
                </div>
            </div>
            
            <div class="flex items-center justify-between border-t border-zinc-100 pt-3 mt-1">
                <div>
                    <span class="text-[10px] text-zinc-400 block">Total Pembayaran</span>
                    <span class="text-base font-serif font-bold text-zinc-950">${formatRupiah(order.total)}</span>
                </div>
                ${isPending ? `
                    <button onclick="confirmOrder('${order.id}')" class="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition shadow-md">
                        Konfirmasi & Kirim
                    </button>
                ` : `
                    <span class="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="inline-block"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Dikirim & Diproses
                    </span>
                `}
            </div>
        `;
        container.appendChild(card);
    });
}

async function confirmOrder(orderId) {
    const result = await updateOrder(orderId, { status: 'Sedang Dikirim' });
    
    if (result.success) {
        showToast(`Pesanan ${orderId} berhasil dikonfirmasi dan siap kirim!`, '#10b981');
        await loadOrders();
        updateMyOrdersBadge();
    } else {
        showToast('Gagal mengkonfirmasi pesanan: ' + result.error, '#dc2626');
    }
}

// ============================================
// 12. MY ORDERS (Buyer) FUNCTIONS (UI)
// ============================================

async function openMyOrdersModal() {
    document.getElementById('myOrdersModal').style.display = 'flex';
    await renderMyOrders();
}

function closeMyOrdersModal() {
    document.getElementById('myOrdersModal').style.display = 'none';
}

async function renderMyOrders() {
    const container = document.getElementById('myOrdersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="text-center py-12 text-neutral-400">
                <p class="font-semibold text-zinc-800">Silakan login terlebih dahulu</p>
            </div>
        `;
        return;
    }
    
    const result = await getOrders(currentUser.id, true);
    
    if (!result.success) {
        container.innerHTML = `<p class="text-center text-red-500">Gagal memuat pesanan</p>`;
        return;
    }
    
    const orders = result.orders || [];
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-neutral-400">
                <svg class="mx-auto w-12 h-12 text-zinc-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p class="font-semibold text-zinc-800">Belum Ada Pesanan</p>
                <p class="text-xs mt-1">Anda belum melakukan pembelian produk apa pun di Sandy Place.</p>
            </div>
        `;
        return;
    }
    
    orders.forEach(order => {
        const isPending = order.status === 'Menunggu Konfirmasi';
        const isShipping = order.status === 'Sedang Dikirim';
        
        let statusColorClass = 'bg-amber-100 text-amber-700';
        if (isShipping) {
            statusColorClass = 'bg-indigo-100 text-indigo-700';
        } else if (order.status === 'Selesai') {
            statusColorClass = 'bg-emerald-100 text-emerald-700';
        }
        
        const items = order.items || [];
        const itemsHtml = items.map(item => `
            <div class="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <img src="${item.photo || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=100'}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/80x80/000000/ffffff?text=Product'">
                </div>
                <div class="flex-grow">
                    <span class="text-xs font-bold text-zinc-900 block">${item.name}</span>
                    <span class="text-[10px] text-zinc-500">Kuantitas: ${item.qty || 1}</span>
                </div>
                <span class="text-xs font-bold text-zinc-900">${formatRupiah((item.price || 0) * (item.qty || 1))}</span>
            </div>
        `).join('');
        
        const orderCard = document.createElement('div');
        orderCard.className = 'border border-zinc-200 p-4 rounded-2xl bg-zinc-50/50 space-y-3';
        orderCard.innerHTML = `
            <div class="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div>
                    <span class="text-[9px] text-zinc-400 font-bold block">${order.date || 'Hari ini'}</span>
                    <span class="text-xs font-bold text-zinc-800">${order.id}</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColorClass}">
                    ${order.status}
                </span>
            </div>
            <div class="space-y-1">
                ${itemsHtml}
            </div>
            <div class="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs">
                <span class="text-zinc-500 font-medium">Total Pembayaran</span>
                <span class="font-serif font-bold text-zinc-900">${formatRupiah(order.total)}</span>
            </div>
        `;
        container.appendChild(orderCard);
    });
}

async function updateMyOrdersBadge() {
    if (!currentUser) return;
    
    const result = await getOrders(currentUser.id, true);
    if (!result.success) return;
    
    const orders = result.orders || [];
    const activeOrders = orders.filter(o => o.status !== 'Selesai').length;
    const badge = document.getElementById('myOrdersBadge');
    
    if (badge) {
        if (activeOrders > 0) {
            badge.innerText = activeOrders;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// ============================================
// 13. TOKO TAB FUNCTIONS
// ============================================

function switchTokoTab(tabName) {
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'products') {
        const panel = document.getElementById('tabContentProducts');
        const btn = document.getElementById('btnTabProducts');
        if (panel) panel.classList.remove('hidden');
        if (btn) btn.classList.add('active');
    } else if (tabName === 'orders') {
        const panel = document.getElementById('tabContentOrders');
        const btn = document.getElementById('btnTabOrders');
        if (panel) panel.classList.remove('hidden');
        if (btn) btn.classList.add('active');
        loadOrders();
    }
}

// ============================================
// 14. CART FUNCTIONS (UI)
// ============================================

async function loadCart() {
    if (!currentUser) return;
    
    const result = await getCart(currentUser.id);
    
    if (result.success) {
        cart = result.cart || [];
        updateCartBadge();
    }
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const content = document.getElementById('cartDrawerContent');
    
    if (!drawer || !content) return;
    
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('translate-x-full');
        }, 50);
        renderCartItems();
    } else {
        content.classList.add('translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    }
}

async function addToCartUI(product) {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu!', '#dc2626');
        return;
    }
    
    const result = await addToCartDB(currentUser.id, product.id, 1);
    
    if (result.success) {
        await loadCart();
        renderCartItems();
        updateCartBadge();
        showToast(`"${product.name}" ditambahkan ke keranjang.`, '#10b981');
    } else {
        showToast('Gagal menambahkan ke keranjang: ' + result.error, '#dc2626');
    }
}

async function updateCartQty(cartId, amount) {
    const item = cart.find(i => i.id === cartId);
    if (!item) return;
    
    const newQty = item.quantity + amount;
    
    if (newQty <= 0) {
        await removeFromCartDB(cartId);
    } else {
        await updateCartQuantity(cartId, newQty);
    }
    
    await loadCart();
    renderCartItems();
    updateCartBadge();
}

async function removeFromCartDB(cartId) {
    const result = await removeFromCart(cartId);
    
    if (result.success) {
        await loadCart();
        renderCartItems();
        updateCartBadge();
        showToast('Produk dihapus dari keranjang.', '#f59e0b');
    } else {
        showToast('Gagal menghapus: ' + result.error, '#dc2626');
    }
}

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    
    if (!container) return;
    container.innerHTML = '';
    
    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-zinc-400">
                <svg class="mx-auto w-12 h-12 text-zinc-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p class="font-semibold text-zinc-800">Keranjang Kosong</p>
                <p class="text-xs mt-1">Belum ada barang belanjaan yang dimasukkan.</p>
            </div>
        `;
        if (subtotalEl) subtotalEl.innerText = 'Rp 0';
        return;
    }
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const price = item.products?.price || item.price || 0;
        const qty = item.quantity || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'flex items-center gap-4 bg-zinc-50 border border-zinc-100 p-3 rounded-2xl';
        itemRow.innerHTML = `
            <img src="${item.products?.photo || item.photo || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=150'}" class="w-16 h-16 object-cover rounded-xl bg-zinc-200">
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-xs text-zinc-900 truncate">${item.products?.name || item.name || 'Produk'}</h4>
                <div class="text-xs text-indigo-600 font-bold mt-0.5">${formatRupiah(price)}</div>
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded-md bg-white border border-zinc-200 text-xs font-bold hover:bg-zinc-100">-</button>
                    <span class="text-xs font-bold text-zinc-800">${qty}</span>
                    <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded-md bg-white border border-zinc-200 text-xs font-bold hover:bg-zinc-100">+</button>
                </div>
            </div>
            <button onclick="removeFromCartDB('${item.id}')" class="text-zinc-400 hover:text-red-500 p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        container.appendChild(itemRow);
    });
    
    if (subtotalEl) subtotalEl.innerText = formatRupiah(subtotal);
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    badges.forEach(badge => {
        if (totalQty > 0) {
            badge.innerText = totalQty;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// ============================================
// 15. CHECKOUT & ORDER FUNCTIONS
// ============================================

async function checkoutOrder() {
    if (!currentUser) {
        showToast('Silakan login terlebih dahulu!', '#dc2626');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Keranjang Anda kosong!', '#dc2626');
        return;
    }
    
    const total = cart.reduce((sum, item) => {
        const price = item.products?.price || item.price || 0;
        const qty = item.quantity || 1;
        return sum + (price * qty);
    }, 0);
    
    const orderId = 'SP-' + Math.floor(1000 + Math.random() * 9000);
    
    const orderData = {
        id: orderId,
        buyer_id: currentUser.id,
        buyer: profileData.name || currentUser.email || 'Pembeli',
        phone: profileData.phone || '-',
        address: profileData.address || '-',
        items: cart.map(item => ({
            id: item.product_id || item.id,
            name: item.products?.name || item.name || 'Produk',
            price: item.products?.price || item.price || 0,
            qty: item.quantity || 1,
            photo: item.products?.photo || item.photo || null
        })),
        total: total,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Menunggu Konfirmasi',
        seller_id: currentUser.id
    };
    
    const result = await createOrder(orderData);
    
    if (result.success) {
        toggleCartDrawer();
        
        document.getElementById('invoiceTotal').innerText = formatRupiah(total);
        document.getElementById('invoiceNum').innerText = orderId;
        document.getElementById('orderSuccessModal').classList.remove('hidden');
        
        // Hapus cart
        for (const item of cart) {
            await removeFromCart(item.id);
        }
        await loadCart();
        updateCartBadge();
        
        await updateMyOrdersBadge();
    } else {
        showToast('Gagal membuat pesanan: ' + result.error, '#dc2626');
    }
}

function closeOrderSuccessModal() {
    document.getElementById('orderSuccessModal').classList.add('hidden');
}

// ============================================
// 16. SEARCH FUNCTIONS
// ============================================

let activeSearchTag = '';

function triggerSearch() {
    const query = document.getElementById('searchInput')?.value.trim().toLowerCase();
    if (query) {
        activeSearchTag = query;
        showSearchResults(query);
    } else {
        showToast('Silakan masukkan kata kunci pencarian!', '#cc1a1a');
    }
}

function searchByTag(tag) {
    const input = document.getElementById('searchInput');
    if (input) input.value = tag;
    activeSearchTag = tag;
    showSearchResults(tag);
}

function showSearchResults(query) {
    const homeView = document.getElementById('homeView');
    const searchResultsView = document.getElementById('searchResultsView');
    const shopDetailView = document.getElementById('shopDetailView');
    
    if (homeView) homeView.style.display = 'none';
    if (shopDetailView) shopDetailView.style.display = 'none';
    if (searchResultsView) searchResultsView.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    applyFilters();
}

function switchSearchMode(mode) {
    searchMode = mode;
    const tabProduk = document.getElementById('searchTabProduk');
    const tabToko = document.getElementById('searchTabToko');
    const sortContainer = document.getElementById('sortSelectContainer');
    
    if (mode === 'produk') {
        if (tabProduk) {
            tabProduk.className = 'px-4 py-1.5 rounded-full bg-black text-white font-semibold text-xs md:text-sm';
        }
        if (tabToko) {
            tabToko.className = 'px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold text-xs md:text-sm transition';
        }
        if (sortContainer) sortContainer.classList.remove('hidden');
    } else {
        if (tabProduk) {
            tabProduk.className = 'px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold text-xs md:text-sm transition';
        }
        if (tabToko) {
            tabToko.className = 'px-4 py-1.5 rounded-full bg-black text-white font-semibold text-xs md:text-sm';
        }
        if (sortContainer) sortContainer.classList.add('hidden');
    }
    applyFilters();
}

async function applyFilters() {
    const query = activeSearchTag;
    const resultsCountText = document.getElementById('resultsCountText');
    const productGrid = document.getElementById('productGrid');
    
    if (!productGrid) return;
    
    if (searchMode === 'produk') {
        if (resultsCountText) resultsCountText.innerText = `Menampilkan hasil produk untuk "${query}"`;
        
        // Ambil semua produk dari database
        const result = await getProducts();
        let products = result.success ? result.products : [];
        
        // Tambahkan dummy products jika belum ada
        if (products.length === 0) {
            // Seed dummy products ke database
            for (const p of dummyProducts) {
                await addProduct('system', p);
            }
            const refreshResult = await getProducts();
            products = refreshResult.success ? refreshResult.products : [];
        }
        
        let filtered = products.filter(p => {
            if (!p) return false;
            const name = (p.name || '').toLowerCase();
            const desc = (p.desc || '').toLowerCase();
            const tag = (p.tag || '').toLowerCase();
            return name.includes(query) || desc.includes(query) || tag.includes(query);
        });
        
        const sortVal = document.getElementById('sortSelect')?.value || 'sesuai';
        if (sortVal === 'terendah') {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortVal === 'tertinggi') {
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
        
        renderFilteredProducts(filtered);
    } else {
        if (resultsCountText) resultsCountText.innerText = `Menampilkan hasil toko untuk "${query}"`;
        
        let filteredToko = brandPool.filter(brand => {
            return (brand.name || '').toLowerCase().includes(query) || 
                   (brand.owner || '').toLowerCase().includes(query) || 
                   (brand.desc || '').toLowerCase().includes(query);
        });
        
        renderFilteredToko(filteredToko);
    }
}

function renderFilteredProducts(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-gray-500">
                <svg class="mx-auto w-12 h-12 text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p class="font-semibold text-lg text-black">Maaf, produk tidak ditemukan</p>
                <p class="text-sm mt-1">Coba gunakan filter lain atau ketik kata kunci yang berbeda.</p>
            </div>
        `;
        return;
    }
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetail(p.id);
        
        const defaultPhoto = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300';
        const imageSrc = p.photo || defaultPhoto;
        
        card.innerHTML = `
            <div class="product-card-img">
                <img src="${imageSrc}" alt="${p.name}" onerror="this.src='${defaultPhoto}'">
            </div>
            <div class="product-card-body">
                <div class="flex flex-wrap gap-1">
                    ${p.mall ? '<span class="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Mall</span>' : ''}
                    ${p.power ? '<span class="bg-purple-100 text-purple-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Power Shop</span>' : ''}
                    <span class="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-semibold font-mono">${p.location || 'Online'}</span>
                </div>
                <h4 class="product-card-title text-zinc-900">${p.name || 'Produk'}</h4>
                <p class="product-card-desc">${p.desc || 'Deskripsi produk'}</p>
                <div class="product-card-price">${formatRupiah(p.price)}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderFilteredToko(tokos) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!tokos || tokos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-gray-500">
                <svg class="mx-auto w-12 h-12 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 21V9H15V21"></path>
                </svg>
                <p class="font-semibold text-lg text-black">Toko tidak ditemukan</p>
                <p class="text-sm mt-1">Coba gunakan nama toko atau pemilik toko yang berbeda.</p>
            </div>
        `;
        return;
    }
    
    tokos.forEach(t => {
        const card = document.createElement('div');
        card.className = 'bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer hover:scale-[1.02] duration-200';
        card.onclick = () => openShopDetail(t.id);
        
        card.innerHTML = `
            <div class="h-24 bg-zinc-900 relative">
                <img src="${t.banner}" class="w-full h-full object-cover opacity-75" onerror="this.src='https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600'">
                <div class="absolute -bottom-6 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-zinc-800 shadow">
                    <img src="${t.avatar}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/150x150/000000/ffffff?text=Shop'">
                </div>
            </div>
            <div class="p-4 pt-8 flex-grow flex flex-col justify-between gap-3">
                <div>
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <h4 class="font-serif font-bold text-sm text-zinc-900">${t.name}</h4>
                        <span class="bg-indigo-100 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">${(t.badge || '').split(' ')[0]}</span>
                    </div>
                    <p class="text-[10px] text-zinc-400 mt-0.5">Pemilik: ${t.owner}</p>
                    <p class="text-xs text-zinc-600 mt-2 italic line-clamp-2">"${t.desc}"</p>
                </div>
                <div class="border-t border-zinc-100 pt-3 flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                    <span>⭐ ${t.rating}</span>
                    <span>👥 ${t.followers} Pengikut</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============================================
// 17. PRODUCT DETAIL FUNCTIONS
// ============================================

async function openProductDetail(productId) {
    const result = await getProducts();
    let product = null;
    
    if (result.success) {
        product = result.products.find(p => p.id === productId);
    }
    
    // Coba cari di dummy jika tidak ditemukan
    if (!product) {
        product = dummyProducts.find(p => p.id === productId);
    }
    
    if (!product) {
        showToast('Produk tidak ditemukan!', '#cc1a1a');
        return;
    }
    
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;
    
    document.getElementById('detailProductImg').src = product.photo || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300';
    document.getElementById('detailProductName').innerText = product.name || 'Produk';
    document.getElementById('detailProductPrice').innerText = formatRupiah(product.price);
    document.getElementById('detailProductDesc').innerText = product.desc || 'Produk orisinal premium dengan mutu pengerjaan terbaik.';
    
    const store = brandPool.find(b => b.id === product.brandId) || brandPool[0];
    const storeBtn = document.getElementById('detailProductStoreLink');
    if (storeBtn) {
        storeBtn.innerText = store.name;
        storeBtn.onclick = () => {
            closeProductDetailModal();
            openShopDetail(store.id);
        };
    }
    
    const badge = document.getElementById('detailProductStoreBadge');
    if (badge) badge.innerText = (store.badge || 'Official').split(' ')[0];
    
    const addCartBtn = document.getElementById('detailProductAddCart');
    if (addCartBtn) {
        addCartBtn.onclick = () => addToCartUI(product);
    }
    
    const buyBtn = document.getElementById('detailProductBuy');
    if (buyBtn) {
        buyBtn.onclick = async () => {
            await addToCartUI(product);
            closeProductDetailModal();
            toggleCartDrawer();
        };
    }
    
    const chatBtn = document.getElementById('detailProductChat');
    if (chatBtn) {
        chatBtn.onclick = () => {
            closeProductDetailModal();
            openDirectChat(product.brandId, product.name);
        };
    }
    
    modal.classList.remove('hidden');
}

function closeProductDetailModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) modal.classList.add('hidden');
}

// ============================================
// 18. SHOP DETAIL FUNCTIONS
// ============================================

function openShopDetail(shopId) {
    const homeView = document.getElementById('homeView');
    const searchResultsView = document.getElementById('searchResultsView');
    const shopDetailView = document.getElementById('shopDetailView');
    
    const brand = brandPool.find(b => b.id === shopId);
    if (!brand) return;
    
    if (homeView) homeView.style.display = 'none';
    if (searchResultsView) searchResultsView.style.display = 'none';
    if (shopDetailView) shopDetailView.style.display = 'block';
    
    const banner = document.getElementById('shopDetailBanner');
    const avatar = document.getElementById('shopDetailAvatar');
    const name = document.getElementById('shopDetailName');
    const owner = document.getElementById('shopDetailOwner');
    const desc = document.getElementById('shopDetailDesc');
    const badgeEl = document.getElementById('shopDetailBadge');
    const followers = document.getElementById('shopStatFollowers');
    const rating = document.getElementById('shopStatRating');
    const editBtn = document.getElementById('btnEditUserShop');
    const followBtn = document.getElementById('btnFollowShop');
    
    if (banner) banner.src = brand.banner;
    if (avatar) avatar.src = brand.avatar;
    if (name) name.innerText = brand.name;
    if (owner) owner.innerHTML = `Pemilik: <span class="font-semibold text-white">${brand.owner}</span>`;
    if (desc) desc.innerText = `"${brand.desc}"`;
    if (badgeEl) {
        badgeEl.innerText = brand.badge;
        badgeEl.className = `${brand.badgeColor} text-[9px] md:text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white`;
    }
    if (followers) followers.innerText = brand.followers;
    if (rating) rating.innerText = brand.rating;
    
    currentChatShopId = shopId;
    
    if (editBtn && followBtn) {
        if (shopId === 'user-shop') {
            editBtn.classList.remove('hidden');
            followBtn.classList.add('hidden');
        } else {
            editBtn.classList.add('hidden');
            followBtn.classList.remove('hidden');
            followBtn.innerText = 'Ikuti Toko';
            followBtn.className = 'px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm shadow hover:bg-zinc-100 transition';
        }
    }
    
    renderShopProducts(shopId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function renderShopProducts(shopId) {
    const grid = document.getElementById('shopProductsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    let products = [];
    
    if (shopId === 'user-shop' && currentUser) {
        const result = await getProducts(currentUser.id);
        if (result.success) {
            products = result.products || [];
        }
    } else {
        const allProducts = await getProducts();
        if (allProducts.success) {
            products = allProducts.products.filter(p => p.brandId === shopId);
        }
        // Tambahkan dummy products jika kosong
        if (products.length === 0) {
            products = dummyProducts.filter(p => p.brandId === shopId);
        }
    }
    
    const statProducts = document.getElementById('shopStatProducts');
    if (statProducts) statProducts.innerText = products.length;
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-zinc-500">
                <svg class="mx-auto w-12 h-12 text-zinc-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line>
                </svg>
                <p class="font-semibold text-base text-zinc-800">Katalog Produk Kosong</p>
                <p class="text-sm mt-1">Toko ini belum merilis produk di database.</p>
            </div>
        `;
        return;
    }
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetail(p.id);
        
        card.innerHTML = `
            <div class="product-card-img">
                <img src="${p.photo || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300'}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300'">
            </div>
            <div class="product-card-body">
                <h4 class="product-card-title text-zinc-900">${p.name || 'Produk'}</h4>
                <p class="product-card-desc">${p.desc || 'Belum ada deskripsi untuk produk premium ini.'}</p>
                <div class="product-card-price">${formatRupiah(p.price)}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleFollowStore() {
    const btn = document.getElementById('btnFollowShop');
    if (!btn) return;
    
    if (btn.innerText === 'Ikuti Toko') {
        btn.innerText = 'Mengikuti';
        btn.className = 'px-6 py-2.5 rounded-full bg-zinc-900 text-white font-semibold text-sm shadow hover:bg-black transition';
        showToast('Anda sekarang mengikuti toko ini!', '#10b981');
    } else {
        btn.innerText = 'Ikuti Toko';
        btn.className = 'px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm shadow hover:bg-zinc-100 transition';
        showToast('Batal mengikuti toko.', '#e11d48');
    }
}

function returnToHome() {
    const homeView = document.getElementById('homeView');
    const searchResultsView = document.getElementById('searchResultsView');
    const shopDetailView = document.getElementById('shopDetailView');
    
    if (homeView) homeView.style.display = 'block';
    if (searchResultsView) searchResultsView.style.display = 'none';
    if (shopDetailView) shopDetailView.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// 19. WHATSAPP CHAT FUNCTIONS
// ============================================

function openDirectChat(shopId, productName) {
    const sid = shopId || currentChatShopId || 'ebay-premium';
    const brand = brandPool.find(b => b.id === sid) || brandPool[0];
    
    let sellerPhone = '';
    
    if (sid === 'user-shop') {
        sellerPhone = profileData.phone || '082261068992';
    } else {
        const phoneRegistry = {
            'ebay-premium': '081234567890',
            'macys-fashion': '082211223344',
            'cyberbyte-pc': '085711223344',
            'woodcraft': '081987654321',
            'runfaster': '085123456789'
        };
        sellerPhone = phoneRegistry[sid] || '081234567890';
    }
    
    let sanitizedPhone = sellerPhone.replace(/[^0-9]/g, '');
    if (sanitizedPhone.startsWith('0')) {
        sanitizedPhone = '62' + sanitizedPhone.slice(1);
    } else if (!sanitizedPhone.startsWith('62') && sanitizedPhone.length > 0) {
        if (sanitizedPhone.startsWith('8')) {
            sanitizedPhone = '62' + sanitizedPhone;
        }
    }
    
    if (!sanitizedPhone) {
        sanitizedPhone = '6282261068992';
    }
    
    let messageText = `Halo ${brand.name}, saya ingin bertanya mengenai toko Anda.`;
    if (productName) {
        messageText = `Halo ${brand.name}, saya tertarik dengan produk Anda: *${productName}*. Apakah produk tersebut masih ready stock?`;
    }
    
    const finalWaUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(messageText)}`;
    
    showToast(`Mengalihkan ke WhatsApp ${brand.name}...`, '#10b981');
    setTimeout(() => {
        window.open(finalWaUrl, '_blank');
    }, 800);
}

// ============================================
// 20. HERO CAROUSEL FUNCTIONS
// ============================================

function goToSlide(index) {
    currentSlide = index;
    const slides = document.getElementById('heroSlides');
    if (slides) {
        slides.style.transform = `translateX(-${currentSlide * 20}%)`;
    }
    
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
    });
    resetAutoSlide();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
}

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// ============================================
// 21. TOAST NOTIFICATION
// ============================================

function showToast(message, colorHex) {
    const toast = document.getElementById('shopToast');
    const toastMsg = document.getElementById('toastMessage');
    if (toast && toastMsg) {
        toastMsg.innerText = message;
        toast.style.borderColor = colorHex || '#fff';
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// ============================================
// 22. BRAND DATABASE RENDER
// ============================================

function renderBrandDatabase() {
    const container = document.getElementById('brandsDatabaseGrid');
    if (!container) return;
    
    const userBrand = brandPool.find(b => b.id === 'user-shop');
    if (userBrand && profileData) {
        userBrand.name = profileData.name || userBrand.name;
        userBrand.owner = profileData.name || userBrand.owner;
        userBrand.avatar = profileData.avatar || userBrand.avatar;
    }
    
    container.innerHTML = '';
    brandPool.forEach(brand => {
        const card = document.createElement('div');
        card.className = 'relative overflow-hidden rounded-[24px] md:rounded-[30px] bg-zinc-900 shadow-xl border border-zinc-800 group cursor-pointer transition transform hover:-translate-y-2 hover:shadow-2xl duration-300';
        card.onclick = () => openShopDetail(brand.id);
        
        card.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10"></div>
            <img src="${brand.banner}" alt="${brand.name}" class="w-full h-[180px] md:h-[240px] object-cover transition-transform duration-700 group-hover:scale-105" onerror="this.src='https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600'">
            <div class="absolute inset-x-4 md:inset-x-6 bottom-4 md:bottom-6 z-20 flex flex-col gap-1 md:gap-2">
                <div>
                    <span class="${brand.badgeColor} text-[9px] md:text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full backdrop-blur-sm">
                        ${brand.badge}
                    </span>
                    <h3 class="font-serif text-lg md:text-2xl font-bold text-white mt-1.5 md:mt-2 group-hover:text-indigo-400 transition-colors">
                        ${brand.name}
                    </h3>
                    <p class="text-zinc-400 text-[10px] md:text-xs mt-0.5 md:mt-1 font-light">
                        Pemilik: <span class="text-white font-medium">${brand.owner}</span>
                    </p>
                    <p class="text-zinc-500 text-[10px] md:text-[11px] mt-1 italic line-clamp-1">
                        "${brand.desc}"
                    </p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================
// 23. COMMUNITY PRODUCTS RENDER
// ============================================

async function renderCommunityProducts() {
    const container = document.getElementById('communityProductsGrid');
    if (!container) return;
    container.innerHTML = '';
    
    // Ambil semua produk dari database
    const result = await getProducts();
    let allProducts = result.success ? result.products : [];
    
    // Ambil produk dari user
    let userProducts = [];
    if (currentUser) {
        const userResult = await getProducts(currentUser.id);
        if (userResult.success) {
            userProducts = userResult.products || [];
        }
    }
    
    // Gabungkan dan filter
    let communityProducts = [...userProducts];
    
    // Tambahkan dummy community products
    const mockCommunity = [
        { id: 101, name: "Kacamata Hitam Vintage Polaroid", price: 125000, desc: "Perlindungan maksimal dari radiasi UV matahari, desain retro elegan.", photo: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=300", brandId: "user-shop" },
        { id: 102, name: "Tas Ransel Kulit Sintetis Elegan", price: 340000, desc: "Slot laptop tebal 14 inch, tahan rintik air ringan, banyak kompartemen.", photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300", brandId: "user-shop" }
    ];
    
    // Tambahkan dummy jika tidak ada produk dari database
    if (communityProducts.length === 0) {
        communityProducts = [...mockCommunity];
    }
    
    // Ambil 6 produk terbaru atau random
    const displayProducts = communityProducts.slice(0, 6);
    
    displayProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetail(p.id);
        
        const formattedPrice = formatRupiah(p.price);
        const pPhoto = p.photo || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300';
        
        card.innerHTML = `
            <div class="product-card-img">
                <img src="${pPhoto}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=300'">
            </div>
            <div class="product-card-body">
                <span class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest font-mono">KOMUNITAS</span>
                <h4 class="product-card-title">${p.name || 'Produk'}</h4>
                <p class="product-card-desc">${p.desc || 'Belum ada deskripsi untuk produk berkualitas tinggi ini.'}</p>
                <div class="product-card-price">${formattedPrice}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================
// 24. INITIALIZATION & EVENT LISTENERS
// ============================================

async function initApp() {
    // 1. Cek session user
    const sessionResult = await getSession();
    if (sessionResult.success && sessionResult.session) {
        currentSession = sessionResult.session;
        currentUser = sessionResult.session.user;
    }
    
    // 2. Inisialisasi brand pool dengan user data
    if (currentUser) {
        const profileResult = await getProfile(currentUser.id);
        if (profileResult.success && profileResult.profile) {
            profileData = profileResult.profile;
            const userBrand = defaultBrandPool.find(b => b.id === 'user-shop');
            if (userBrand) {
                userBrand.name = profileData.name || userBrand.name;
                userBrand.owner = profileData.name || userBrand.owner;
                userBrand.avatar = profileData.avatar || userBrand.avatar;
            }
        }
        brandPool = [...defaultBrandPool];
        
        // Load cart
        await loadCart();
        await updateMyOrdersBadge();
    } else {
        brandPool = [...defaultBrandPool];
    }
    
    // 3. Render brand database
    renderBrandDatabase();
    
    // 4. Render community products
    await renderCommunityProducts();
    
    // 5. If on profile page, load profile and toko
    if (window.location.pathname.includes('profil.html')) {
        if (currentUser) {
            await loadProfile();
            await loadToko();
            await loadOrders();
            
            // Setup event listeners untuk profile page
            setupProfilePageListeners();
        }
    }
    
    // 6. Setup global event listeners
    setupGlobalListeners();
    
    // 7. Start carousel
    startAutoSlide();
    
    // 8. Handle auth page
    if (window.location.pathname.includes('auth.html')) {
        setupAuthPage();
    }
    
    // 9. Handle search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) searchBtn.addEventListener('click', triggerSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });
}

function setupGlobalListeners() {
    // Toggle cart drawer
    const cartToggleBtns = document.querySelectorAll('[onclick*="toggleCartDrawer"]');
    cartToggleBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            toggleCartDrawer();
        };
    });
    
    // Modal close on outside click
    const modals = document.querySelectorAll('.modal-overlay, .cs-overlay, .product-modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

function setupProfilePageListeners() {
    // Avatar upload
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // Brand upload
    const brandInput = document.getElementById('brandInput');
    if (brandInput) {
        brandInput.addEventListener('change', handleBrandUpload);
    }
    
    // Product photo preview
    const productPhotoInput = document.getElementById('productPhotoInput');
    if (productPhotoInput) {
        productPhotoInput.addEventListener('change', handleProductPhotoPreview);
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfileChanges);
    }
}

function setupAuthPage() {
    // Set mode default signin
    setMode('signin');
    
    // Start quote carousel
    startQuoteCarousel();
    
    // Setup form submit
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.onsubmit = handleSignIn;
    }
    
    // Google sign in
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.onclick = handleGoogleSignIn;
    }
    
    // CS Modal
    const csBtn = document.querySelector('.cs-btn');
    const csOverlay = document.getElementById('csOverlay');
    if (csBtn && csOverlay) {
        csBtn.onclick = () => {
            csOverlay.style.display = 'flex';
        };
        csOverlay.onclick = (e) => {
            if (e.target === csOverlay) {
                csOverlay.style.display = 'none';
            }
        };
    }
}

// ============================================
// 25. DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

// Export functions untuk inline onclick
window.goToSlide = goToSlide;
window.searchByTag = searchByTag;
window.triggerSearch = triggerSearch;
window.switchSearchMode = switchSearchMode;
window.openShopDetail = openShopDetail;
window.returnToHome = returnToHome;
window.toggleFollowStore = toggleFollowStore;
window.openProductDetail = openProductDetail;
window.closeProductDetailModal = closeProductDetailModal;
window.toggleCartDrawer = toggleCartDrawer;
window.addToCartUI = addToCartUI;
window.updateCartQty = updateCartQty;
window.removeFromCartDB = removeFromCartDB;
window.checkoutOrder = checkoutOrder;
window.closeOrderSuccessModal = closeOrderSuccessModal;
window.openDirectChat = openDirectChat;
window.showToast = showToast;

// Profile exports
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProfileChanges = saveProfileChanges;
window.handleAvatarUpload = handleAvatarUpload;
window.handleBrandUpload = handleBrandUpload;
window.handleProductPhotoPreview = handleProductPhotoPreview;
window.saveProduct = saveProduct;
window.deleteCurrentProduct = deleteCurrentProduct;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeProductModal = closeProductModal;
window.switchTokoTab = switchTokoTab;
window.confirmOrder = confirmOrder;
window.openMyOrdersModal = openMyOrdersModal;
window.closeMyOrdersModal = closeMyOrdersModal;

// Auth exports
window.setMode = setMode;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleLogout = handleLogout;
window.jumpToQuote = jumpToQuote;
window.toggleCSModal = function(show) {
    const overlay = document.getElementById('csOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
};