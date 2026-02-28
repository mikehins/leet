<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TextToSpeechService
{
    private const DEFAULT_VOICE = 'XrExE9yKIg1WjnnlVkGX'; // default-female (Rachel)

    private const DEFAULT_MODEL = 'eleven_multilingual_v2';

    /**
     * Map app locale to ElevenLabs language_code (ISO 639-1).
     */
    private const LOCALE_MAP = [
        'en' => 'en',
        'fr' => 'fr',
    ];

    /**
     * Generate speech from text using ElevenLabs with locale support.
     *
     * @return array{audio: string, mime_type: string} Base64 audio and MIME type
     */
    public function speak(string $text, string $locale = 'en'): array
    {
        $languageCode = self::LOCALE_MAP[$locale] ?? 'en';
        $apiKey = config('ai.providers.eleven.key');

        if (! $apiKey) {
            throw new \RuntimeException('ELEVENLABS_API_KEY is not configured.');
        }

        $response = Http::withHeaders([
            'xi-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.elevenlabs.io/v1/text-to-speech/'.self::DEFAULT_VOICE, [
            'model_id' => self::DEFAULT_MODEL,
            'text' => $text,
            'language_code' => $languageCode,
        ])->throw();

        return [
            'audio' => base64_encode((string) $response),
            'mime_type' => 'audio/mpeg',
        ];
    }
}
