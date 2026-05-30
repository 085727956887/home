import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { generateExplanation } from './ai'
import Markdown from 'react-markdown'
import Auth from './Auth' // 🚀 Menyambungkan dengan file Auth baru

function App() {
  const [session, setSession] = useState(null)
  const [idea, setIdea] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. Cek status session user di awal aplikasi dimuat
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Ambil riwayat khusus milik pengguna yang sedang login
  const fetchNotes = async () => {
    if (!session?.user?.id) return
    try {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id) // 🔒 Mengunci data agar privat per-user
        .order('id', { ascending: false })
      if (data) setHistory(data)
    } catch (err) {
      console.error('Gagal mengambil data:', err)
    }
  }

  useEffect(() => {
    if (session) fetchNotes()
  }, [session])

  // 3. Simpan ide baru yang terikat dengan user_id pengguna
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!idea.trim() || loading || !session?.user?.id) return

    try {
      setLoading(true)
      const aiResponse = await generateExplanation(idea)

      // 🔒 Memasukkan data lengkap dengan user_id auth
      await supabase.from('notes').insert([
        { 
          content: aiResponse,
          user_id: session.user.id 
        }
      ])

      setIdea('')
      fetchNotes()
    } catch (err) {
      alert("Gagal memproses ide. Silakan coba kembali.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🚪 Fungsi Keluar Aplikasi
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setHistory([]) // Bersihkan state riwayat demi keamanan data privat
  }

  // 🛑 PROTEKSI: Jika pengguna belum login, paksa masuk ke halaman Auth
  if (!session) {
    return <Auth />
  }

  // ✅ Jika sudah login, berikan akses penuh ke aplikasi utama
  return (
    <div className="container">
      {/* Tombol Logout Minimalis di Pojok Kanan Atas */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button 
          onClick={handleLogout} 
          style={{ 
            width: 'auto', 
            padding: '0.5rem 1.2rem', 
            backgroundColor: '#29292e', 
            color: '#a7a7a7',
            fontSize: '0.85rem',
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#3e3e42'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#29292e'}
        >
          Keluar (Logout)
        </button>
      </div>

      <h1>AI Idea Automation</h1>
      <p>Ubah ide kasarmu menjadi rencana matang langsung dari HP dengan visual premium.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Ketik ide kasarmu di sini... (Contoh: Aplikasi jasa jemput sampah daur ulang perumahan)"
          rows={4}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !idea.trim()}>
          {loading ? 'Sedang Memproses Ide...' : 'Automate Ide!'}
        </button>
      </form>

      <h2>Riwayat Eksplorasi Kamu</h2>

      <div className="list-ide">
        {history.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#7c7c8a' }}>
            Belum ada ide yang disimpan oleh akun ini.
          </p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="card-ide">
              <div className="markdown-content">
                <Markdown>{item.content}</Markdown>
              </div>
              <small style={{ display: 'block', textAlign: 'right', marginTop: '1rem', color: '#7c7c8a', fontSize: '0.75rem' }}>
                {new Date(item.created_at).toLocaleString('id-ID')}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App