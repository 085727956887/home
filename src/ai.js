import Groq from 'groq-sdk'

const apiKey = import.meta.env.VITE_AI_API_KEY
const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })

export const generateExplanation = async (idea) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Jelaskan secara detail dan otomatisasikan ide bisnis/aplikasi berikut ini: "${idea}". Berikan langkah-langkah konkret, struktur folder jika ada, dan gunakan format Markdown lengkap (gunakan ## untuk judul, ** untuk tebal, - untuk list, dan \`\`\` untuk blok kode) agar mudah dibaca.`,
        },
      ],
      model: 'llama-3.1-8b-instant', 
    })

    return response.choices[0]?.message?.content || 'Tidak ada respon dari AI.'
  } catch (error) {
    console.error(error)
    throw error
  }
}