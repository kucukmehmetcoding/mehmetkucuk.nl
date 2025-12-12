/**
 * AI Services - Multi-Provider System
 * 
 * This file re-exports from the multi-provider AI system
 * and keeps image generation functionality
 */

// Re-export AI text functions from multi-provider system
export { 
  callFalRewrite, 
  callFalTranslate,
  type FalRewritePayload,
  type RewriteOutput,
  type TranslateOutput,
} from './ai-providers';

// Keep Fal.ai for image generation only
import {fal} from '@fal-ai/client';

const falApiKey = process.env.FAL_API_KEY;

if (!falApiKey) {
  console.warn('FAL_API_KEY missing. Image generation will fail until configured.');
}

fal.config({
  credentials: falApiKey ?? ''
});

export interface ImageGenerationInput {
  title: string;
  category: string;
  tags?: string[];
}

export async function callFalImage(input: ImageGenerationInput): Promise<string | null> {
  try {
    // Category-based style mapping for relevant visuals
    const categoryStyles: Record<string, string> = {
      technology: 'futuristic technology, modern digital aesthetic, clean lines, blue and silver tones, professional',
      science: 'scientific research, laboratory environment, discovery, clean and clinical, professional',
      programming: 'software development, code visualization, abstract digital patterns, modern tech workspace',
      gaming: 'gaming culture, vibrant neon colors, dynamic composition, entertainment technology',
      crypto: 'blockchain visualization, digital currency, futuristic finance, abstract geometric patterns',
      ai: 'artificial intelligence, neural network visualization, futuristic technology, data streams',
      security: 'cybersecurity, digital protection, shield iconography, dark tech aesthetic with blue accents',
      space: 'space exploration, cosmos, astronomy, stars and galaxies, awe-inspiring',
      mobile: 'smartphones, mobile technology, sleek modern devices, minimalist design',
      business: 'corporate technology, professional business environment, modern office',
      health: 'medical technology, healthcare innovation, clean clinical aesthetic',
      entertainment: 'digital entertainment, streaming, modern media consumption',
    };

    // Get style based on category, default to technology
    const normalizedCategory = input.category.toLowerCase().replace(/[^a-z]/g, '');
    const style = categoryStyles[normalizedCategory] || categoryStyles['technology'];
    
    // Create a detailed, specific prompt
    const prompt = `Professional news article header image. 
Topic: "${input.title}". 
Visual style: ${style}. 
Technical requirements: High quality photorealistic or premium 3D render, 16:9 landscape aspect ratio, professional composition suitable for major news publication, visually striking but journalistically appropriate, absolutely no text or watermarks, no logos, clean and uncluttered composition with clear focal point.`;

    console.log(`[FalImage] Generating image for: "${input.title.substring(0, 50)}..."`);

    const response = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt,
        image_size: 'landscape_16_9',
        num_images: 1,
        enable_safety_checker: true,
      }
    });
    
    // Extract image URL from response
    const data = response.data as { images?: Array<{ url: string }> };
    if (data?.images && data.images.length > 0 && data.images[0].url) {
      console.log(`[FalImage] ✓ Image generated successfully`);
      return data.images[0].url;
    }
    
    console.warn(`[FalImage] ⚠ No image URL in response`);
    return null;
  } catch (error) {
    console.error(`[FalImage] ✗ Error generating image:`, error);
    return null;
  }
}
