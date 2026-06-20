import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAudio } from '@/lib/elevenlabs'
import { getStoryById } from '@/lib/stories-catalog'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  let body: { storyId: string; childName?: string; voiceId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo della richiesta non valido' }, { status: 400 })
  }

  const { storyId, childName, voiceId } = body

  if (!storyId || !voiceId) {
    return NextResponse.json(
      { error: 'storyId e voiceId sono obbligatori' },
      { status: 400 }
    )
  }

  const story = getStoryById(storyId)
  if (!story) {
    return NextResponse.json({ error: 'Storia non trovata' }, { status: 404 })
  }

  // Check cache
  const cacheKey = childName || '__no_name__'
  const { data: cached } = await supabase
    .from('audio_cache')
    .select('audio_url')
    .eq('story_id', storyId)
    .eq('voice_id', voiceId)
    .eq('child_name', cacheKey)
    .single()

  if (cached?.audio_url) {
    return NextResponse.json({ audioUrl: cached.audio_url, cached: true })
  }

  // Generate audio via ElevenLabs
  let audioBuffer: Buffer
  try {
    audioBuffer = await generateAudio(story.content, voiceId, childName)
  } catch (err) {
    console.error('ElevenLabs error:', err)
    return NextResponse.json(
      { error: 'Errore nella generazione audio. Controlla la tua API key di ElevenLabs.' },
      { status: 502 }
    )
  }

  // Upload to Supabase Storage
  const fileName = `${storyId}__${voiceId}__${cacheKey}.mp3`
  const { error: uploadError } = await supabase.storage
    .from('audio-stories')
    .upload(fileName, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return NextResponse.json({ error: 'Errore nel salvataggio audio' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('audio-stories').getPublicUrl(fileName)
  const audioUrl = urlData.publicUrl

  // Save to cache table
  await supabase.from('audio_cache').insert({
    story_id: storyId,
    voice_id: voiceId,
    child_name: cacheKey,
    audio_url: audioUrl,
  })

  // Log session
  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (family) {
    await supabase.from('story_sessions').insert({
      family_id: family.id,
      story_id: storyId,
      completed: false,
    })
  }

  return NextResponse.json({ audioUrl, cached: false })
}
