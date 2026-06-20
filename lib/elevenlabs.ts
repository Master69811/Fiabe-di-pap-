const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export async function generateAudio(
  text: string,
  voiceId: string,
  childName?: string
): Promise<Buffer> {
  const processedText = childName
    ? text.replace(/\{\{nome_bambino\}\}/g, childName)
    : text

  const intro = childName
    ? `Buonanotte ${childName}... Siediti comodo, chiudi gli occhi, e lascia che ti racconti una storia speciale. `
    : `Buonanotte piccolo mio... Siediti comodo e lascia che ti racconti una storia speciale. `

  const outro = childName
    ? ` E così la storia finì... felice. Sogni d'oro ${childName}, ti voglio tanto bene.`
    : ` E così la storia finì... felice. Sogni d'oro, piccolo mio.`

  const fullText = intro + processedText + outro

  const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text: fullText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} – ${errorText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function getVoices(): Promise<Array<{ voice_id: string; name: string }>> {
  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
  })

  if (!response.ok) throw new Error('Failed to fetch ElevenLabs voices')

  const data = await response.json()
  return data.voices
}

export async function validateVoiceId(voiceId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    })
    return response.ok
  } catch {
    return false
  }
}
