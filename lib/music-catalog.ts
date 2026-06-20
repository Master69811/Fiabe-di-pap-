import type { StoryCategory } from '@/types'

// Sottofondo musicale per categoria — tracce royalty-free / pubblico dominio
// Per sostituire: carica i tuoi MP3 su Supabase Storage e aggiorna gli URL qui
export const CATEGORY_MUSIC: Record<StoryCategory, string> = {
  // 🧚 Magia — arpeggi leggeri, atmosfera da libro illustrato
  magic:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',

  // 🌙 Buonanotte — calmo, ipnotico, per addormentarsi
  sleep:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',

  // 🐻 Animali — giocoso, curioso
  animals:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',

  // 🚀 Avventura — ritmico, dinamico
  adventure:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',

  // ❤️ Emozioni — morbido, coinvolgente
  emotions:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',

  // 🌱 Educativo — leggero, vivace
  educational:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',

  // 🦸 Eroi — epico ma delicato
  heroes:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',

  // 👨‍👩‍👧 Famiglia — caldo, avvolgente
  family:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
}
