const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

export async function jelaskanIdeAI(ideUser) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Kita pakai model llama-3.3-70b-versatile yang sangat pintar dan cepat di Groq
        model: "llama-3.3-70b-versatile", 
        messages: [
          {
            role: "user",
            content: `Kamu adalah seorang ahli strategi bisnis dan teknologi. User memiliki ide: "${ideUser}". 
            Tolong jelaskan ide ini secara detail, otomatis, dan terstruktur dengan Bahasa Indonesia yang baik. 
            Berikan: 
            1. Penjelasan konsep dasar, 
            2. Potensi cara mewujudkannya, 
            3. Tantangan yang mungkin dihadapi.`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    // Mengambil teks jawaban dari format respon Groq/OpenAI
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Error:", error);
    return "Gagal mengotomatisasi penjelasan ide karena masalah koneksi ke Groq.";
  }
}