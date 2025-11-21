import { GoogleGenAI, Type } from "@google/genai";
import { Agent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeneratedDialogueLine {
  speaker: string;
  text: string;
}

export interface DialogueResponse {
  dialogue: GeneratedDialogueLine[];
  transaction?: {
    success: boolean;
    amount: number;
    buyerId: string;
    sellerId: string;
    item: string;
  };
}

export const generateAgentConversation = async (
  agentA: Agent,
  agentB: Agent,
  locationContext: string,
  timeContext: string,
  historyContext: string
): Promise<DialogueResponse> => {
  try {
    const isBusinessInteraction = (agentA.type === 'BOSS' && agentB.type === 'CUSTOMER') || (agentA.type === 'CUSTOMER' && agentB.type === 'BOSS');
    
    let businessContext = "";
    let bossStr = "";
    
    if (isBusinessInteraction) {
      const boss = agentA.type === 'BOSS' ? agentA : agentB;
      const customer = agentA.type === 'BOSS' ? agentB : agentA;
      bossStr = boss.role;

      businessContext = `
        [BUSINESS NEGOTIATION MODE]
        Seller: ${boss.name} (${boss.role}). Goal: Sell high-margin products/services.
        Buyer: ${customer.name} (Money: ¥${customer.stats.money}). Goal: Be skeptical but open to value.
        
        SPECIFIC SALES TACTICS REQUIRED:
        - If IT Boss: Use buzzwords (AI, Blockchain, Cloud), create FOMO (Fear Of Missing Out), promise future returns.
        - If Chef: Describe taste vividly (smell, texture), appeal to hunger and comfort.
        - If Finance Boss: Use authority, talk about "market trends", "passive income", and "compounding".
        - If Designer: Appeal to vanity, "personal branding", and aesthetics.
        
        TRANSACTION LOGIC:
        - If the Customer is convinced and has enough money, set transaction.success = true.
        - Amount should be realistic: Meal (50-500), IT/Design (2000-20000), Finance (10000-100000).
      `;
    } else {
      businessContext = "Casual conversation. Discuss daily life, weather, or town gossip. No business transaction possible.";
    }

    const prompt = `
      You are the AI engine for a life simulation game. Generate a realistic dialogue in Simplified Chinese (中文).

      CONTEXT:
      - Time: ${timeContext}
      - Location: ${locationContext}
      - Previous Interaction History: ${historyContext ? historyContext : "None. This is their first meeting today."}

      CHARACTERS:
      1. ${agentA.name} (${agentA.role}) [${agentA.type}]
         Traits: ${agentA.personality}
         State: Mood ${agentA.stats.mood}/100.
      
      2. ${agentB.name} (${agentB.role}) [${agentB.type}]
         Traits: ${agentB.personality}
         State: Mood ${agentB.stats.mood}/100.

      SCENARIO:
      ${businessContext}

      REQUIREMENTS:
      1. **Realism**: Dialogue must feel natural, not robotic. Use sentence fragments, hesitations, or emotional outbursts where appropriate.
      2. **Memory**: Characters must explicitly acknowledge their history if it exists (e.g., "Did you think about the deal I mentioned earlier?").
      3. **Persuasion**: The Boss MUST try hard to sell. The Customer must push back with real concerns (price, quality, need) before agreeing or refusing.
      4. **Length**: Generate 3 to 6 turns total to allow for a proper back-and-forth negotiation.

      OUTPUT FORMAT (JSON):
      {
        "dialogue": [{ "speaker": "Name", "text": "Content" }, ...],
        "transaction": { "success": boolean, "amount": number, "buyerId": "id", "sellerId": "id", "item": "short item name" } (Optional, only if deal made)
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            transaction: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                success: { type: Type.BOOLEAN },
                amount: { type: Type.INTEGER },
                buyerId: { type: Type.STRING },
                sellerId: { type: Type.STRING },
                item: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");

    return JSON.parse(text) as DialogueResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      dialogue: [
        { speaker: agentA.name, text: "你好。" },
        { speaker: agentB.name, text: "你好，再见。" }
      ]
    };
  }
};