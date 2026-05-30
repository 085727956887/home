import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  
  // State Input Form
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    
    const cleanUsername = username.trim().toLowerCase()
    if (!cleanUsername || !password.trim()) {
      return alert('Username dan password wajib diisi!')
    }

    try {
      setLoading(true)

      if (isRegister) {
        // =================================================================
        // ALUR DAFTAR AKUN (Minta Username, Email, & Password)
        // =================================================================
        if (!email.trim()) return alert('Email wajib diisi saat mendaftar!')

        // 1. Cek dulu apakah username sudah dipakai orang lain di database
        const { data: existingUser } = await supabase
          .from('notes') // Kita pinjam pengecekan lewat metadata via RPC atau trik query profile
          // Untuk amannya, Supabase menyimpan metadata di auth.users. 
          // Kita bisa langsung tembak pendaftaran, jika username duplikat kita handle secara logika atau lewat profile.
          
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            // 💾 Menyimpan username ke dalam data metadata user
            data: { display_username: cleanUsername }
          }
        })
        
        if (error) throw error
        
        alert(`Akun @${cleanUsername} berhasil terdaftar! Silakan langsung klik Masuk Aplikasi.`)
        setIsRegister(false)
        setEmail('')

      } else {
        // =================================================================
        // ALUR LOGIN (Hanya Butuh Username & Password)
        // =================================================================
        
        // 🕵️‍♂️ Cari email asli berdasarkan username yang diketik di metadata auth
        // Karena kita tidak bisa query auth.users langsung dari frontend demi keamanan, 
        // Supabase menyediakan trik mendeteksi user lewat tabel buatan atau trik reset.
        // Cara paling standar & aman tanpa bikin tabel baru: Ambil lewat fungsi pembantu bawaan.
        
        // Solusi termudah & anti-gagal: Kita cari emailnya lewat trik pencarian user metadata
        // Namun karena auth.users diproteksi, mari kita buat trik bypass otomatis:
        // Kita berasumsi username yang unik disimpan. 
        // Agar sistem pencarian username ke email berjalan mulus dari client-side, 
        // Supabase menyarankan menggunakan format identitas tersembunyi seperti ini:
        
        const loginEmail = `${cleanUsername}@user.idea` 
        // Tapi karena kamu ingin EMAIL ASLI saat daftar, mari gunakan trik database:
        // Jika tidak ingin ribet bikin tabel 'profiles', kita bisa pakai trik fake-email berbasis username saat login
        // Agar sinkron, saat DAFTAR, mari kita daftarkan emailnya sebagai `username@app.com` saja, tapi email aslinya disimpan di metadata!
        
        // Jika kamu ingin email aslinya benar-benar email valid untuk notifikasi, kita harus menembak fungsi RPC.
        // Tapi kalau tujuannya "Email diisi saat daftar cuma buat formalitas syarat data", kita pakai trik super simpel ini:
        
        const { error } = await supabase.auth.signInWithPassword({
          email: `${cleanUsername}@aplikasi.com`, // Latar belakang otomatis membaca format ini
          password: password
        })

        if (error) throw error
      }
    } catch (error) {
      let msg = error.message
      if (msg.includes('Invalid login credentials')) {
        msg = 'Username atau password yang kamu masukkan salah!'
      }
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  // Modifikasi fungsi daftar khusus agar selaras dengan trik username-login
  const handleRegisterReal = async (e) => {
    e.preventDefault()
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '')
    if (!cleanUsername || !email.trim() || !password.trim()) {
      return alert('Semua kolom wajib diisi!')
    }

    try {
      setLoading(true)
      // Kita daftarkan auth utama dengan username@aplikasi.com agar saat login tinggal ketik username
      // Email asli kiriman user kita simpan aman di dalam metadata (user_metadata)
      const { error } = await supabase.auth.signUp({
        email: `${cleanUsername}@aplikasi.com`,
        password: password,
        options: {
          data: { 
            real_email: email.trim(),
            username: cleanUsername
          }
        }
      })
      if (error) throw error
      alert(`Registrasi sukses! Akun @${cleanUsername} siap digunakan. Silakan login.`);
      setIsRegister(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="card-ide" style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isRegister ? 'Daftar Akun Baru' : 'Masuk Aplikasi'}
        </h1>
        
        <form onSubmit={isRegister ? handleRegisterReal : handleAuth}>
          {/* 👤 KOLOM USERNAME (Muncul di Daftar & Login) */}
          <textarea
            rows={1}
            placeholder="Ketik username (contoh: budi123)"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
            style={{ resize: 'none' }}
            disabled={loading}
          />

          {/* 📧 KOLOM EMAIL (Hanya muncul saat klik DAFTAR) */}
          {isRegister && (
            <textarea
              rows={1}
              placeholder="Masukkan alamat email asli kamu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ resize: 'none' }}
              disabled={loading}
            />
          )}
          
          {/* 🔒 KOLOM PASSWORD (Muncul di Daftar & Login) */}
          <input
            type="password"
            placeholder="Ketik password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '1rem', backgroundColor: '#202024',
              color: '#e1e1e6', border: '1px solid #323238', borderRadius: '8px',
              fontSize: '1rem', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.2s', marginBottom: '0.5rem'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00b37e'}
            onBlur={(e) => e.target.style.borderColor = '#323238'}
            disabled={loading}
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Aplikasi'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, fontSize: '0.9rem' }}>
          {isRegister ? 'Sudah punya akun?' : 'Belum memiliki akun?'}{' '}
          <span
            onClick={() => {
              setIsRegister(!isRegister)
              // Reset input form kalau pindah tab biar bersih
              setUsername('')
              setEmail('')
              setPassword('')
            }}
            style={{ color: '#00b37e', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isRegister ? 'Login di sini' : 'Daftar di sini'}
          </span>
        </p>
      </div>
    </div>
  )
}