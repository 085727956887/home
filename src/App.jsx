import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { generateExplanation } from './ai'
import Markdown from 'react-markdown'

function App() {
  const [idea, setIdea] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. Fungsi mengambil data riwayat dari database Supabase
  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .order('id', { ascending: false })
      if (data) setHistory(data)
    } catch (err) {
      console.error('Gagal mengambil data:', err)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  // 2. Fungsi ketika form disubmit (tombol ditekan)
  const handleSubmit = async (e) => {
    e.preventDefault() // Mencegah page refresh bawaan form HTML
    if (!idea.trim() || loading) return

    try {
      setLoading(true)
      const aiResponse = await generateExplanation(idea)

      // Simpan respons asli berbentuk markdown ke Supabase
      await supabase.from('notes').insert([{ content: aiResponse }])

      setIdea('')
      fetchNotes() // Refresh daftar riwayat otomatis setelah data masuk
    } catch (err) {
      alert("Gagal memproses ide. Silakan coba lagi.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      {/* Bagian Atas / Header */}
      <h1>AI Idea Automation</h1>
      <p>Ubah ide kasarmu menjadi rencana matang langsung dari HP dengan visual premium.</p>

      {/* Bagian Input Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Ketik ide kasarmu di sini... (Contoh: Aplikasi rental laptop khusus mahasiswa)"
          rows={4}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !idea.trim()}>
          {loading ? 'Sedang Memproses Ide...' : 'Automate Ide!'}
        </button>
      </form>

      {/* Garis Pembatas Sekaligus Penanda Riwayat */}
      <h2>Riwayat Eksplorasi</h2>

      {/* Bagian List Riwayat dari Supabase */}
      <div className="list-ide">
        {history.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#7c7c8a' }}>
            Belum ada ide yang dieksplorasi.
          </p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="card-ide">
              
              {/* ✨ KUNCI UTAMA: Merender format teks tebal, judul, list, & kode AI ke HTML */}
              <div className="markdown-content">
                <Markdown>{item.content}</Markdown>
              </div>

              {/* Menampilkan waktu pembuatan catatan di pojok kanan bawah kartu */}
              <small style={{ 
                display: 'block', 
                textAlign: 'right', 
                marginTop: '1rem', 
                color: '#7c7c8a',
                fontSize: '0.75rem'
              }}>
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