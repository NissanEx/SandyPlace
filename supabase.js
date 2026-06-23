// ===== SUPABASE.JS =====
// Konfigurasi Supabase
const SUPABASE_URL = 'https://aprnwmcliuubjosmtqis.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OX9pW9J_w-oC6QCZPqPYcg_a0TogFm3';

// Inisialisasi client Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized:', supabase ? 'SUCCESS' : 'FAILED');

/**
 * Mendapatkan user yang sedang login
 * @returns {Promise<Object|null>} User object atau null jika tidak login
 */
async function dapatkanUserAktif() {
    try {
        // Cek session aktif
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return null;
        }
        
        if (!session || !session.user) {
            console.log('Tidak ada session aktif');
            return null;
        }
        
        console.log('User aktif ditemukan:', session.user.email);
        return session.user;
        
    } catch (error) {
        console.error('Error di dapatkanUserAktif:', error);
        return null;
    }
}

/**
 * Mendapatkan profil user berdasarkan ID
 * @param {string} userId - ID user
 * @returns {Promise<Object|null>} Profil user atau null
 */
async function getProfilUser(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Error getting profile:', error);
            return null;
        }
        
        return data;
        
    } catch (error) {
        console.error('Error di getProfilUser:', error);
        return null;
    }
}

/**
 * Logout user
 * @returns {Promise<boolean>} True jika berhasil
 */
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logout:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error di logoutUser:', error);
        return false;
    }
}

// Ekspor fungsi ke global scope
window.supabaseClient = supabase;
window.dapatkanUserAktif = dapatkanUserAktif;
window.getProfilUser = getProfilUser;
window.logoutUser = logoutUser;

console.log('Supabase.js loaded successfully!');