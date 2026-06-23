const SUPABASE_URL = 'https://aprnwmcliuubjosmtqis.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OX9pW9J_w-oC6QCZPqPYcg_a0TogFm3';

// Inisialisasi dan langsung override window.supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase; // ← kunci utama fix

console.log('Supabase client initialized:', supabase ? 'SUCCESS' : 'FAILED');

async function dapatkanUserAktif() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) return null;
        return session.user;
    } catch (e) {
        console.error('dapatkanUserAktif error:', e);
        return null;
    }
}

async function getProfilUser(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) return null;
        return data;
    } catch (e) {
        return null;
    }
}

async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        return !error;
    } catch (e) {
        return false;
    }
}

// Export ke global
window.dapatkanUserAktif = dapatkanUserAktif;
window.getProfilUser = getProfilUser;
window.logoutUser = logoutUser;

console.log('Supabase.js loaded successfully!');