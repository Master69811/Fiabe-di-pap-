import OpenAI from 'openai'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

interface GenerateStoryParams {
  childName: string
  age: number
  theme: string
  duration: 5 | 10 | 15
  moral?: string
  favoriteCharacter?: string
}

export async function generateCustomStory(params: GenerateStoryParams): Promise<{
  title: string
  content: string
  moral: string
  coverEmoji: string
  description: string
}> {
  const wordCount = params.duration * 120

  const prompt = `Sei un narratore esperto di fiabe italiane per bambini. Crea una fiaba originale con queste caratteristiche:

- Nome del protagonista: ${params.childName}
- Età del bambino: ${params.age} anni
- Tema: ${params.theme}
- Lunghezza: circa ${wordCount} parole
- Personaggio speciale da includere: ${params.favoriteCharacter || 'scegli tu qualcosa di magico e adatto'}
- Morale: ${params.moral || 'scegli una morale positiva adatta all\'età'}

Regole obbligatorie:
1. Usa "${params.childName}" come protagonista principale della storia
2. Linguaggio semplice, adatto a ${params.age} anni – frasi brevi e chiare
3. Conclusione sempre positiva, rassicurante, felice
4. Scrivi per la narrazione ad alta voce: ritmo lento, pause naturali, descrizioni vivide
5. Includi dettagli sensoriali (colori, suoni, profumi) per stimolare l'immaginazione
6. Nessun contenuto spaventoso, violento o perturbante
7. La storia deve trasmettere calore, sicurezza e meraviglia

Rispondi ESCLUSIVAMENTE con JSON valido in questo formato:
{
  "title": "titolo breve e poetico",
  "description": "descrizione di 2-3 frasi della storia",
  "content": "testo completo della storia",
  "moral": "la morale in una frase breve",
  "coverEmoji": "un singolo emoji che rappresenta la storia"
}`

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.85,
    max_tokens: 3000,
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  return result
}
