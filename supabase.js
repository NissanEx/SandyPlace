// Hubungkan aplikasi ke Supabase DB
// Konfigurasi asli database Supabase Sandy Place milik Anda
const SUPABASE_URL = "https://aprnwmcliuubjosmtqis.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OX9pW9J_w-oC6QCZPqPYcg_a0TogFm3";

// Menggunakan window.supabase secara eksplisit untuk menghindari konflik referensi variabel lokal saat inisialisasi
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper utilitas global untuk mengambil sesi pengguna aktif saat ini
async function dapatkanUserAktif() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

// Format mata uang rupiah Indonesia secara konsisten
function formatRupiah(angka) {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}