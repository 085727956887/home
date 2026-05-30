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
    
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '')
    if (!cleanUsername || !password.trim()) {
      return alert('Username dan password wajib diisi!')
    }

    // 🕵️‍♂️ TRIK GAIB: Mengubah username jadi format email internal khusus aplikasi kamu
    // Supabase Auth akan membaca ini sebagai email unik kamu
    const internalEmail = `${cleanUsername}@ia-automation.com`

    try {
      setLoading(true)

      if (isRegister) {
        // =================================================================
        // 1. ALUR DAFTAR (Username + Email Asli + Password)
        // =================================================================
        if (!email.trim()) return alert('Email asli wajib diisi saat mendaftar!')

        const { error } = await supabase.auth.signUp({
          email: internalEmail, // Didaftarkan pakai format id internal biar bisa login pakai username
          password: password,
          options: {
            data: { 
              real_email: email.trim(), // Email aslimu tetap disimpan aman di sini
              username: cleanUsername
            }
          }
        })
        
        if (error) throw error
        
        alert(`Akun @${cleanUsername} berhasil dibuat! Silakan tunggu sampai rate limit email terbuka untuk mencoba login pertama kali.`)
        setIsRegister(false)
        setEmail('')

      } else {
        // =================================================================
        // 2. ALUR LOGIN (Cukup Username + Password)
        // =================================================================
        const { error } = await supabase.auth.signInWithPassword({
          email: internalEmail, // Otomatis masuk lewat format id internal tadi
          password: password
        })

        if (error) throw error
      }
    } catch (error) {
      let msg = error.message
      if (msg.includes('Invalid login credentials')) {
        msg = 'Username atau password salah!'
      } else if (msg.includes('already registered')) {
        msg = 'Username ini sudah terdaftar, silakan pakai username lain.'
      }
      alert(msg)
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
        
        <form onSubmit={handleAuth}>
          {/* USERNAME */}
          <textarea
            rows={1}
            placeholder="Ketik username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
            style={{ resize: 'none' }}
            disabled={loading}
          />

          {/* EMAIL ASLI (Hanya Muncul Saat Klik Daftar) */}
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
          
          {/* PASSWORD */}
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