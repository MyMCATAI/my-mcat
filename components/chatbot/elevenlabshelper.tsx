import { ElevenLabsClient, play } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
});

export const useElevenLabs = () => {
  const generateAndPlayAudio = async (text: string) => {
    try {
      const audioStream = await elevenlabs.generate({
        stream: true,
        voice: "Kalypso", // You can change this to any voice you prefer
        text: text,
        model_id: "eleven_multilingual_v2"
      });

      await play(audioStream);
    } catch (error) {
      console.error("Error generating or playing audio:", error);
    }
  };

  return { generateAndPlayAudio };
};
