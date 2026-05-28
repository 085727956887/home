import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { generateExplanation } from './ai'
import Markdown from 'react-markdown' // 🚀 Library ajaib kita

function App() {
  const [idea, setIdea] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotes = async () => {
    const { data } = await supabase.from('notes').select('*').order('id', { ascending: false })
    if (data) setHistory(data)
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleAutomate = async () => {
    if (!idea.trim()) return
    try {
      setLoading(true)
      const aiResponse = await generateExplanation(idea)

      // ✨ Simpan teks asli (dengan markdown-nya) ke database, jangan dipotong!
      await supabase.from('notes').insert([{ content: aiResponse }])

      setIdea('')
      fetchNotes()
    } catch (err) {
      alert("Gagal memproses.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 🚀 Menyuntikkan Google Fonts (Plus Jakarta Sans & Fira Code) secara instan */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; margin: 0; }
        
        /* Styling khusus untuk isi teks Markdown AI */
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { color: #f8fafc; margin-top: 24px; margin-bottom: 12px; font-weight: 700; }
        .markdown-content h2 { border-bottom: 1px solid #334155; padding-bottom: 8px; font-size: 1.4rem; }
        .markdown-content p { color: #cbd5e1; line-height: 1.8; font-size: 15px; margin-bottom: 16px; }
        .markdown-content ul, .markdown-content ol { color: #cbd5e1; padding-left: 20px; line-height: 1.8; }
        .markdown-content li { margin-bottom: 6px; }
        .markdown-content strong { color: #38bdf8; font-weight: 600; } /* Highlight teks tebal dengan warna biru langit */
        
        /* 💻 Styling Font Khusus untuk Blok Kode (seperti di Flutter) */
        .markdown-content pre { background-color: #1e293b; padding: 16px; borderRadius: 8px; border: 1px solid #334155; overflow-x: auto; margin: 20px 0; }
        .markdown-content code { font-family: 'Fira Code', monospace; color: #f1f5f9; font-size: 14px; }
      `}</style>

      <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <h1 style={{ color: '#ffffff', textAlign: 'center', fontSize: '2.2rem', fontWeight: 700 }}>AI Idea Automation</h1>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px' }}>Ubah ide kasarmu menjadi rencana matang dengan visual premium</p>
          
          <textarea 
            value={idea} 
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ketik ide kasarmu di sini..."
            rows={3}
            style={{ 
              width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #334155', 
              backgroundColor: '#1e293b', color: '#ffffff', fontSize: '16px', boxSizing: 'border-box', marginBottom: '15px'
            }}
          />
          
          <button 
            onClick={handleAutomate} 
            disabled={loading} 
            style={{ 
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              backgroundColor: loading ? '#475569' : '#3b82f6', color: '#ffffff', 
              fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sedang Memproses Ide...' : 'Automate & Jelaskan Ide!'}
          </button>

          <hr style={{ border: '0', borderTop: '1px solid #1e293b', margin: '40px 0' }} />

          <h2 style={{ color: '#ffffff', marginBottom: '20px', fontWeight: 600 }}>Riwayat Eksplorasi</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {history.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>Belum ada ide yang dieksplorasi.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '25px', borderRadius: '16px', border: '1px solid #334155' }}>
                  
                  {/* 🧙‍♂️ SIHIR UTAMA: Mengubah teks biasa menjadi komponen UI mewah lewat Markdown */}
                  <div className="markdown-content">
                    <Markdown>{item.content}</Markdown>
                  </div>

                  <small style={{ color: '#475569', display: 'block', textAlign: 'right', marginTop: '20px' }}>
                    {new Date(item.created_at).toLocaleString('id-ID')}
                  </small>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default App