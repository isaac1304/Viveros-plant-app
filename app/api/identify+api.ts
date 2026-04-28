import Anthropic from '@anthropic-ai/sdk';
import { plants } from '@/data/plants';

const KNOWN_PLANT_IDS = plants.map((p) => ({
  id: p.id,
  commonName: p.commonName,
  scientificName: p.scientificName,
}));

const SYSTEM_PROMPT = `Eres un botánico experto especializado en plantas que se cultivan en Costa Rica. Te van a enviar una foto de una planta. Devuelve SIEMPRE un JSON válido con esta forma exacta, sin texto adicional ni markdown:

{
  "matchedKnownId": string | null,
  "commonName": string,
  "scientificName": string,
  "confidence": number,
  "alternatives": [{ "commonName": string, "scientificName": string }],
  "details": {
    "description": string,
    "origin": string,
    "light": string,
    "water": string,
    "temp": string,
    "toxic": boolean,
    "tips": [string, string, string],
    "pests": [{ "name": string, "symptoms": string, "treatment": string, "severity": "info" | "warning" | "danger" }],
    "diseases": [{ "name": string, "symptoms": string, "treatment": string, "severity": "info" | "warning" | "danger" }]
  }
}

Reglas:
- "commonName" en español, primera letra mayúscula. Usa el nombre como se conoce en Costa Rica si aplica.
- "scientificName" en latín, formato género especie.
- "confidence": 0-100, basado en qué tan claro está el match.
- "matchedKnownId": si la planta detectada coincide con alguno de los IDs conocidos, devolver ese ID. Si no, null.
- "alternatives": 2-3 plantas similares que podría ser. Vacío si la confianza es alta (>90).
- "details.description": 1-2 frases sobre la planta (qué es, por qué es popular).
- "details.origin": región de origen, breve (ej: "México y Centroamérica").
- "details.light": frase corta (ej: "Media indirecta", "Sol directo 6h").
- "details.water": frase corta (ej: "2x semana", "Cuando el sustrato esté seco").
- "details.temp": rango (ej: "18-27°C").
- "details.toxic": true si es tóxica para mascotas (perros/gatos), false si no.
- "details.tips": exactamente 3 tips prácticos y específicos. Si aplica, menciona el clima/altitud de Costa Rica (Cartago fresco, San José templado, Guanacaste seco, etc).
- "details.pests": 2-3 plagas comunes que afectan esta planta. "treatment" debe ser accionable (qué hacer, con qué producto, cada cuánto).
- "details.diseases": 1-2 enfermedades o problemas comunes (incluye problemas no patogénicos como pudrición de raíz por exceso de riego). "treatment" accionable.
- "severity": "danger" para problemas que pueden matar la planta rápido, "warning" para los que se controlan con tratamiento, "info" para problemas estéticos o leves.

IDs conocidos (para matchedKnownId): ${KNOWN_PLANT_IDS.map((p) => `${p.id} (${p.commonName} / ${p.scientificName})`).join(', ')}.`;

type Severity = 'info' | 'warning' | 'danger';
type Issue = { name: string; symptoms: string; treatment: string; severity: Severity };
type Details = {
  description: string;
  origin: string;
  light: string;
  water: string;
  temp: string;
  toxic: boolean;
  tips: string[];
  pests: Issue[];
  diseases: Issue[];
};

export async function POST(request: Request): Promise<Response> {
  let body: { image?: string };
  try {
    body = (await request.json()) as { image?: string };
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.image) {
    return Response.json({ error: 'Missing image' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Server not configured: ANTHROPIC_API_KEY missing' },
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: body.image },
            },
            {
              type: 'text',
              text: 'Identificá esta planta y devolvé toda la ficha en JSON. SOLO el JSON, sin texto antes ni después.',
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((c) => c.type === 'text');
    const rawText = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: 'Model returned no JSON', raw: rawText.slice(0, 500) },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      matchedKnownId: string | null;
      commonName: string;
      scientificName: string;
      confidence: number;
      alternatives: { commonName: string; scientificName: string }[];
      details: Details;
    };

    return Response.json({
      matchedPlantId: parsed.matchedKnownId,
      commonName: parsed.commonName,
      scientificName: parsed.scientificName,
      confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence))),
      alternatives: parsed.alternatives ?? [],
      details: parsed.details,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
