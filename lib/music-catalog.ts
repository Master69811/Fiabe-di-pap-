import type { StoryCategory } from '@/types'

// Musica di sottofondo per categoria — Kevin MacLeod (incompetech.com) — CC BY 4.0
// Attribution: Music by Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0
// Per sostituire: carica i tuoi MP3 su Supabase Storage e aggiorna gli URL qui
export const CATEGORY_MUSIC: Record<StoryCategory, string> = {
  // 🧚 Magia — arpeggi incantati e scintillanti
  magic:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Pixie%20Dust.mp3',

  // 🌙 Buonanotte — atmosfera soffice e onirica
  sleep:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Peaceful%20Desolation.mp3',

  // 🐻 Animali — melodia giocosa e buffa
  animals:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Monkeys%20Spinning%20Monkeys.mp3',

  // 🚀 Avventura — tema epico e ritmico
  adventure:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hall%20of%20the%20Mountain%20King.mp3',

  // ❤️ Emozioni — melodia morbida e toccante
  emotions:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Touching%20Moment.mp3',

  // 🌱 Educativo — tema curioso e leggero
  educational:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Quirky%20Dog.mp3',

  // 🦸 Piccoli eroi — tema eroico e coraggioso
  heroes:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Rynos%20Theme.mp3',

  // 👨‍👩‍👧 Famiglia — melodia calda e avvolgente
  family:
    'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wholesome.mp3',
}
