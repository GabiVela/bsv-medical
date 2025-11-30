import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

export async function POST(req: Request) {
  const { text } = await req.json();
  const audio = await client.textToSpeech.convert({ text, voiceId: 'your_voice' });
  return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } });
}