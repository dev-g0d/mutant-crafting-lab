import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { CraftingResult, ExperimentType, Gender } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const craftNewMutant = async (elementNames: string[], experimentType: ExperimentType, gender: Gender, lang: 'en' | 'th'): Promise<CraftingResult> => {
  try {
    const languageInstruction = `The 'name', 'description', 'abilities', 'weaknesses', 'habitat', 'attackPattern' and 'onHitEffect' fields in the JSON output MUST be in ${lang === 'th' ? 'Thai' : 'English'}. The 'imagePrompt' must always be in English. Numeric fields like 'dangerLevel' and 'simulatedHP' should be integers.`;
    const prompt = `Based on the combination of the following elements: [${elementNames.join(', ')}], generate a new '${gender}' creature of type '${experimentType}'. ${languageInstruction} Your response MUST be a valid JSON object that strictly adheres to the provided schema. Do not include any text or formatting outside of the JSON object itself.`;
    
    const nameDescription = lang === 'th' 
        ? "ชื่อที่สร้างสรรค์สำหรับสิ่งมีชีวิตใหม่นี้ (สูงสุด 2-3 คำ)"
        : "A creative name for this new being (2-3 words max).";

    const descriptionDescription = lang === 'th'
        ? "คำอธิบายที่ละเอียดและน่าดึงดูดเกี่ยวกับตำนาน ที่มา และจุดประสงค์ทั่วไปของสิ่งมีชีวิต (3-4 ประโยค)"
        : "A detailed and evocative summary of the creature's lore, origin, and general purpose. (3-4 sentences).";
    
    const abilitiesDescription = lang === 'th' ? "รายการความสามารถ, พลัง, หรือทักษะเด่นๆ 2-4 อย่าง" : "A list of 2-4 key abilities, powers, or notable skills.";
    const weaknessesDescription = lang === 'th' ? "รายการจุดอ่อนหรือช่องโหว่ที่สำคัญ 1-3 อย่าง" : "A list of 1-3 critical weaknesses or vulnerabilities.";
    const habitatDescription = lang === 'th' ? "คำอธิบายสั้นๆ เกี่ยวกับสภาพแวดล้อมตามธรรมชาติหรือที่สิ่งมีชีวิตนี้ชอบ" : "A brief description of the creature's natural or preferred environment.";
    
    const dangerLevelDescription = lang === 'th' ? "ระดับความอันตรายของสิ่งมีชีวิตนี้ เป็นตัวเลขจำนวนเต็ม 0-100" : "The danger level of this creature, as an integer from 0-100.";
    const attackPatternDescription = lang === 'th' ? "คำอธิบายสั้นๆ เกี่ยวกับวิธีการโจมตีของสิ่งมีชีวิตนี้" : "A brief description of how this creature typically attacks.";
    const onHitEffectDescription = lang === 'th' ? "จะเกิดอะไรขึ้นกับเป้าหมาย (เช่น ผู้เล่น) เมื่อถูกสิ่งมีชีวิตนี้โจมตี (เช่น ติดอัมพาต, ถูกกัดกร่อน, สูญเสียพลังชีวิต)" : "What happens to the target (e.g., the player) when hit by this creature's attack (e.g., paralysis, corrosion, life drain).";
    const simulatedHPDescription = lang === 'th' ? "ค่าพลังชีวิต (HP) จำลองสำหรับสิ่งมีชีวิตนี้ เป็นตัวเลขจำนวนเต็ม" : "A simulated Health Points (HP) value for this creature, as an integer.";


    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: nameDescription
        },
        description: {
          type: Type.STRING,
          description: descriptionDescription
        },
        abilities: {
            type: Type.ARRAY,
            description: abilitiesDescription,
            items: { type: Type.STRING }
        },
        weaknesses: {
            type: Type.ARRAY,
            description: weaknessesDescription,
            items: { type: Type.STRING }
        },
        habitat: {
            type: Type.STRING,
            description: habitatDescription
        },
        dangerLevel: {
            type: Type.INTEGER,
            description: dangerLevelDescription
        },
        simulatedHP: {
            type: Type.INTEGER,
            description: simulatedHPDescription
        },
        attackPattern: {
            type: Type.STRING,
            description: attackPatternDescription
        },
        onHitEffect: {
            type: Type.STRING,
            description: onHitEffectDescription
        },
        imagePrompt: {
          type: Type.STRING,
          description: `A highly detailed, vivid, and photorealistic image prompt for an AI image generator. The prompt should describe the ${gender} creature in a sterile, dimly-lit laboratory containment cell, or a habitat fitting its nature. Focus on texture, lighting, anatomy, and dynamic posture. Use dramatic and slightly horrific language. Example: 'Photorealistic, high-detail image of a ${gender} humanoid mutant. Its skin is a translucent, shimmering membrane revealing pulsating bioluminescent organs. Multiple insectoid limbs, sharp and chitinous, sprout from its spine. It stands in a sterile, concrete containment chamber, lit by a single, harsh overhead spotlight, casting long, eerie shadows. The air is misty. Cinematic, horror aesthetic.'`
        }
      },
      required: ["name", "description", "abilities", "weaknesses", "habitat", "dangerLevel", "simulatedHP", "attackPattern", "onHitEffect", "imagePrompt"]
    };


    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1.0,
      }
    });

    const jsonText = response.text;
    const parsed = JSON.parse(jsonText);
    
    // Basic validation
    if (typeof parsed.name !== 'string' || typeof parsed.description !== 'string' || !Array.isArray(parsed.abilities) || typeof parsed.imagePrompt !== 'string' || typeof parsed.dangerLevel !== 'number') {
        throw new Error("Invalid JSON structure from Gemini.");
    }

    // The craftNewMutant now returns an object that matches the CraftingResult, but without the image
    const { imagePrompt, ...details } = parsed;
    const image = await generateMutantImage(imagePrompt);

    return { ...details, image };

  } catch (error) {
    console.error("Error crafting new mutant:", error);
    throw new Error("Failed to generate mutant details from Gemini.");
  }
};

export const generateMutantImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("Imagen API did not return any images.");
    }
  } catch (error) {
    console.error("Error generating mutant image:", error);
    throw new Error("Failed to generate mutant image from Imagen.");
  }
};