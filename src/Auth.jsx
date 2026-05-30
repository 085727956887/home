import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      return alert('Silakan isi email dan password terlebih dahulu!')
    }

    try {
      setLoading(true)
      if (isRegister) {
        // Proses Pendaftaran Akun Baru
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Pendaftaran berhasil! Silakan klik tombol "Masuk" untuk langsung login menggunakan akun tersebut.')
        setIsRegister(false)
      } else {
        // Proses Masuk Aplikasi
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      alert(error.message || 'Terjadi kesalahan saat memproses data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="card-ide" style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isRegister ? 'Daftar Akun' : 'Masuk Aplikasi'}
        </h1>
        
        <form onSubmit={handleAuth}>
          {/* Email input memanfaatkan style textarea biar serasi */}
          <textarea
            rows={1}
            placeholder="Masukkan alamat email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ resize: 'none' }}
            disabled={loading}
          />
          
          {/* Password input diberi style khusus agar serasi dengan textarea */}
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#202024',
              color: '#e1e1e6',
              border: '1px solid #323238',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
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
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: '#00b37e', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isRegister ? 'Login di sini' : 'Daftar di sini'}
          </span>
        </p>
      </div>
    </div>
  )
}