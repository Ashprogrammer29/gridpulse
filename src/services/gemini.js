import { GoogleGenAI } from '@google/genai';

/**
 * Helper to initialize the GoogleGenAI client with the user's local API key.
 */
const initClient = (apiKey) => {
  if (!apiKey) {
    throw new Error('Gemini API key is required. Please set it in the settings modal.');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Evaluates the simulated grid settings and returns an AI dispatch assessment.
 */
export async function generateSimulationReport(apiKey, metrics) {
  try {
    const ai = initClient(apiKey);
    const systemPrompt = `You are the core intelligence module of GridPulse, an advanced Smart Grid Decision Support System. 
Analyze the current telemetry metrics provided below and produce an expert operational report.
Your output must be formatted in clean Markdown with the following sections:
1. **Grid Safety Classification**: State the risk category (Optimal, Elevated, Critical) and brief summary.
2. **Current Vulnerabilities**: Note specific risks based on the numbers (e.g., line congestions, excessive peak demand, low battery reserve).
3. **Immediate Dispatch Actions**: Provide a numbered, step-by-step checklist of actions the grid operator must take (e.g., curtailment, battery discharge, rolling demand response).
4. **Energy Efficiency Policy Advice**: Suggest policies or residential incentive advice for these specific parameters.`;

    const userPrompt = `Telemetry parameters for assessment:
- Grid Capacity Limit: ${metrics.gridCapacity} MW
- Current Consumer Demand Load: ${metrics.consumerDemand} MW
- Solar Generation Availability: ${metrics.solarGen} MW
- Wind Generation Availability: ${metrics.windGen} MW
- Battery Storage State of Charge (SoC): ${metrics.batteryCharge}%
- Current Ambient Temperature: ${metrics.ambientTemp}°C
- Electric Vehicle (EV) Charging Demand multiplier: ${metrics.evLoad}x`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // stable and fast model
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // low temp for accurate advisory data
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Simulation API Error:', error);
    throw new Error(error.message || 'Failed to generate simulation assessment.');
  }
}

/**
 * Generates an operational mitigation checklist for an active alert.
 */
export async function generateMitigationSteps(apiKey, alert) {
  try {
    const ai = initClient(apiKey);
    const systemPrompt = `You are a Smart Grid Safety Advisor. Analyze the active alert report and write a clear, actionable Standard Operating Procedure (SOP) to mitigate the event safely. 
Your response should be in clean Markdown:
- **Safety Precaution Checklist** (with checkbox items e.g., - [ ] verify circuit separation)
- **Containment steps**
- **Load balancing & routing directives**
Keep it concise, clear, and highly practical for a control room engineer.`;

    const userPrompt = `Active Alert Detail:
- Source: ${alert.source}
- Type: ${alert.title}
- Severity: ${alert.severity}
- Trigger Value: ${alert.value}
- Duration active: ${alert.duration}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Alert API Error:', error);
    throw new Error(error.message || 'Failed to generate mitigation protocols.');
  }
}

/**
 * Single-turn chat helper to chat with the Grid Advisor.
 */
export async function sendChatMessage(apiKey, history, message) {
  try {
    const ai = initClient(apiKey);
    
    // Format history for GoogleGenAI SDK
    // SDK expects format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const contents = history.map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const systemInstruction = `You are the virtual chief grid operations engineer and energy policy advisor at GridPulse. 
You assist utility managers, city planners, and engineers with smart grid operation, energy efficiency initiatives, load forecasting, demand response planning, and grid stability.
Be precise, technically sound, and constructive. Use simple markdown (bold text, lists) in your responses.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Chat API Error:', error);
    throw new Error(error.message || 'Failed to send message to Grid Advisor.');
  }
}
