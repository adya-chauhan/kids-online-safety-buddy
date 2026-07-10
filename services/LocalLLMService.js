// LocalLLMService.js
// Centralizes all local model inference calls.
// During development (__DEV__), calls host Ollama endpoints over network.
// For production, connects to local native device engines.

const PRIMARY_IP = '192.168.0.158';
const OLLAMA_PORT = '11434';

// Helper to make fetch requests to Ollama
const callOllama = async (model, prompt, options = {}, timeout = 25000) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options
    })
  };

  // Try Primary IP first
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`http://${PRIMARY_IP}:${OLLAMA_PORT}/api/generate`, {
      ...requestOptions,
      signal: controller.signal
    });
    clearTimeout(id);
    if (response.ok) {
      const json = await response.json();
      return json.response;
    }
  } catch (e) {
    console.log(`[LLM] Primary IP connection failed: ${e.message}`);
  }

  // Fallback to localhost (for simulator)
  const controllerLocal = new AbortController();
  const idLocal = setTimeout(() => controllerLocal.abort(), timeout - 2000);
  try {
    const response = await fetch(`http://localhost:${OLLAMA_PORT}/api/generate`, {
      ...requestOptions,
      signal: controllerLocal.signal
    });
    clearTimeout(idLocal);
    if (response.ok) {
      const json = await response.json();
      return json.response;
    }
  } catch (e) {
    console.log(`[LLM] Localhost connection failed: ${e.message}`);
  }

  return null;
};

// 1. Generate single polite response text
export const generatePoliteResponse = async (rudeText) => {
  const prompt = `You are a child safety assistant named Navi. The child received this rude message: "${rudeText}". The child wants to respond politely to keep the conversation kind. Write a very short, polite, child-friendly response (1 sentence, max 15 words) that sets a kind boundary. Do not repeat the rude message. Output ONLY the response text itself, no explanations, no quotes.`;
  
  const result = await callOllama('gemma:2b', prompt);
  return result ? result.trim().replace(/^["']|["']$/g, '') : null;
};

// 2. Generate conversational reply from contacts
export const generateContactReply = async (contactName, contactRole, contactBio, chatHistory) => {
  // Get last 6 messages for context
  const contextMsgs = chatHistory.slice(-6).map(m => {
    const senderName = m.sender === 'user' ? 'Me' : contactName;
    return `${senderName}: ${m.text}`;
  }).join('\n');

  const roleClean = contactRole.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();

  const prompt = `You are ${contactName}, a child's ${roleClean}. Your personality/bio: "${contactBio}".
Respond to your friend's chat in a very natural, friendly, kid-friendly chat style. Stay on the topic they are talking about (e.g. pickleball, Lego, drawings, school).
Keep your response short (1 to 2 sentences, maximum 25 words). Do not prefix with your name. Respond directly.

Conversation history:
${contextMsgs}

Response from ${contactName}:`;

  const result = await callOllama('gemma:2b', prompt);
  return result ? result.trim().replace(/^["']|["']$/g, '') : null;
};

// 3. Generate three polite suggestions
export const generatePoliteSuggestionsList = async (rudeText) => {
  const prompt = `You are a child safety assistant named Navi. The child received this rude message: "${rudeText}".
Generate exactly 3 short, distinct, polite, child-friendly reply options (max 15 words each) that set a kind boundary and keep the conversation friendly.
Do not write explanations, quotes, or markdown. Output them as a numbered list:
1. [First reply option]
2. [Second reply option]
3. [Third reply option]`;

  const result = await callOllama('gemma:2b', prompt + `\nEnsure variety. Seed: ${Math.random()}`, {
    temperature: 0.9,
    top_p: 0.9
  });

  if (result) {
    const lines = result.split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(line => line.length > 0 && !line.startsWith('Here are') && !line.includes('reply option'));
    
    if (lines.length === 3) {
      return lines;
    }
  }

  return null;
};

// 4. Generate simulated chat message (Good or Bad)
export const generateSimulatedMessage = async (contactName, contactBio, type) => {
  let prompt = "";
  if (type === 'good') {
    prompt = `You are roleplaying as ${contactName}, a child's friend. Personality: "${contactBio}".
Write a friendly, normal, kind chat message (1 sentence, max 15 words) about typical school, games, toys, or hobbies (e.g. "I love playing basketball" or "Let's work on our homework together!").
Do not repeat or make it mean. Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
  } else if (type === 'info') {
    prompt = `You are roleplaying as ${contactName}, a child's friend.
Write a chat message (1 sentence, max 15 words) asking the child for their private/personal information (e.g., "where do you live?", "what's your phone number?", "what school do you go to?", or "are your parents home?").
Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
  } else {
    prompt = `You are roleplaying as ${contactName}, a child's friend.
Write a mean, rude, or insulting chat message (1 sentence, max 15 words) that makes fun of someone, calls them a loser/ugly/stupid, or tells them to go away.
Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
  }

  const result = await callOllama('gemma:2b', prompt + `\nEnsure this response is completely unique, creative, and different from typical responses. Random seed: ${Math.random()}`, {
    temperature: 0.95,
    top_p: 0.9,
    top_k: 40
  });

  return result ? result.trim().replace(/^["']|["']$/g, '') : null;
};

// 5. Generate safety advice/coaching tips for support workers
export const generateSupportAdvice = async (situation, textingType) => {
  const prompt = `You are a child safety and mental health coach helper. A child submitted a support request because they encountered an issue online/texting.
Child's situation: "${situation}"
Context/Type: "${textingType}"
Provide 1 to 2 sentences of professional, actionable advice for a support worker/counselor on how to best respond to and help this child. Do not address the child directly. Address the support worker. Keep it under 40 words.`;

  const result = await callOllama('gemma:2b', prompt);
  return result ? result.trim().replace(/^["']|["']$/g, '') : "Listen actively, validate their feelings, and help them set a kind but firm boundary.";
};

