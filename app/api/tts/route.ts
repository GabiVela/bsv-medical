import { ElevenLabsClient } from 'elevenlabs';
import { NextRequest, NextResponse } from 'next/server';

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();
        const audio = await client.textToSpeech.convert({
        text: text.slice(0, 5000),
        voiceId: '21m00Tcm4TlvDq8ikWAM',
        modelId: 'eleven_monolingual_v1'
        });
        return new NextResponse(audio, { headers: { 'Content-Type': 'audio/mpeg' } });
    } catch (error) {
        return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }
}