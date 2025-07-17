import { config } from 'dotenv';
config();

// Note: This flow is now initialized within the flow definition itself
// to accommodate dynamic API keys. This import remains for Genkit's dev
// UI to discover the flow.
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/calculate-formula-flow.ts';
