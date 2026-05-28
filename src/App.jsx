import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { jelaskanIdeAI } from './ai'; 
import './style.css';

export default function App() {
  const [ide, setIde] = useState('');
  const [listIde, setListIde] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ambil riwayat ide yang sudah pernah dijelaskan dari Supabase saat web pertama dibuka
  useEffect(() => {
    ambilRiwayatIde();
  }, []);

  async function ambilRiwayatIde() {
    // Membaca data dari tabel 'notes' di Supabase
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('id', { ascending: false });
      
    if (!error) {
      setListIde(data);
    } else {
      console.error("Gagal mengambil data dari Supabase:", error);
    }
  }

  async function handleAutomate(e) {
    e.preventDefault();
    if (!ide.trim()) return;

    setLoading(true);

    // 1. AI (Groq) bekerja otomatis menjelaskan ide secara detail
    const penjelasanDetail = await jelaskanIdeAI(ide);
    
    // 2. Format teks gabungan antara Ide asli dan Penjelasan Detail dari AI
    const dataLengkap = `💡 IDE: ${ide} \n\n🤖 PENJELASAN AI: \n${penjelasanDetail}`;

    // 3. Simpan hasilnya ke kolom 'content' di tabel 'notes' Supabase
    const { error } = await supabase.from('notes').insert([{ content: dataLengkap }]);

    if (!error) {
      setIde(''); // Kosongkan kolom input setelah sukses
      ambilRiwayatIde(); // Refresh atau perbarui list di layar
    } else {
      alert("Gagal menyimpan ke database Supabase. Pastikan tabel 'notes' dengan kolom 'content' sudah dibuat.");
    }
    setLoading(false);
  }

  return (
    <div className="container">
      <h1>💡 AI Idea Automation Explainer</h1>
      <p>Ketik ide kasarmu, dan biarkan AI menjelaskannya secara detail dan terstruktur.</p>
      
      <form onSubmit={handleAutomate}>
        <textarea 
          placeholder="Contoh: Aplikasi ojek online khusus untuk mengantar makanan kucing..." 
          value={ide}
          onChange={(e) => setIde(e.target.value)}
          rows={4}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'AI Sedang Merumuskan Ide Detail...' : 'Automate & Jelaskan Ide!'}
        </button>
      </form>

      <h2>📋 Riwayat Eksplorasi Ide:</h2>
      <div className="list-ide">
        {listIde.length === 0 ? <p>Belum ada ide yang dieksplorasi.</p> : null}
        {listIde.map((item) => (
          <div key={item.id} className="card-ide">
            {/* Trik CSS 'whiteSpace' agar baris baru (\n) dari AI bisa rapi di layar */}
            <p style={{ whiteSpace: 'pre-line' }}>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}