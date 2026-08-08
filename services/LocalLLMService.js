import { NativeModules, Platform } from 'react-native';

const PRIMARY_LAN_IPS = ['192.168.0.151', '192.168.0.158'];
const OLLAMA_PORT = '11434';

// Helper to determine all candidate host addresses for web, mobile (Expo Go), and emulators
const getHostCandidates = () => {
  const hosts = [];

  // 1. Browser hostname (if running in web)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const h = window.location.hostname;
    if (h && h !== 'localhost' && h !== '127.0.0.1') {
      hosts.push(h);
    }
  }

  // 2. React Native bundle host (Expo Go / Metro bundler host IP on phone)
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/:\/\/([^:\/]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        hosts.push(match[1]);
      }
    }
  } catch (e) {}

  // 3. Known Mac LAN IPs
  hosts.push(...PRIMARY_LAN_IPS);

  // 4. Android emulator host alias
  try {
    if (Platform && Platform.OS === 'android') {
      hosts.push('10.0.2.2');
    }
  } catch (e) {}

  // 5. Localhost / Loopback
  hosts.push('localhost', '127.0.0.1');

  return Array.from(new Set(hosts.filter(Boolean)));
};

// Helper to make fetch requests to Ollama
const callOllama = async (model, prompt, options = {}, timeout = 8000) => {
  const requestOptions = {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options
    })
  };

  const hosts = getHostCandidates();

  for (const host of hosts) {
    const endpoint = `http://${host}:${OLLAMA_PORT}/api/generate`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(endpoint, {
        ...requestOptions,
        signal: controller.signal
      });
      clearTimeout(id);
      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          return json.response;
        }
      }
    } catch (e) {
      clearTimeout(id);
    }
  }

  // If primary model failed, fallback to qwen2.5:1.5b if available
  if (model !== 'qwen2.5:1.5b') {
    return callOllama('qwen2.5:1.5b', prompt, options, timeout);
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
    
    if (lines.length > 0) {
      return lines.slice(0, 3);
    }
  }

  return null;
};

// 4. Generate simulated response for mock contacts
export const generateSimulatedMessage = async (contactName, contactBio, mood) => {
  let promptInstruction = "";
  if (mood === 'good') {
    promptInstruction = `You are roleplaying as ${contactName}, a child's friend. Personality: "${contactBio}".
Write a friendly, normal, kind chat message (1 sentence, max 15 words) about typical school, games, toys, or hobbies (e.g. "I love playing basketball" or "Let's work on our homework together!").
Do not repeat or make it mean. Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
  } else if (mood === 'info') {
    promptInstruction = `You are roleplaying as ${contactName}, a child's friend.
Write a chat message (1 sentence, max 15 words) asking the child for their private/personal information (e.g., "where do you live?", "what's your phone number?", "what school do you go to?", or "are your parents home?").
Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
  } else {
    promptInstruction = `You are roleplaying as ${contactName}, a child's friend.
Write a mean, rude, or insulting chat message (1 sentence, max 15 words) that makes fun of someone, calls them a loser/ugly/stupid, or tells them to go away.
Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
  }

  const result = await callOllama('gemma:2b', promptInstruction + `\nEnsure this response is completely unique, creative, and different from typical responses. Random seed: ${Math.random()}`, {
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
  return result ? result.trim().replace(/^["|']|["|']$/g, '') : "Listen actively, validate their feelings, and help them set a kind but firm boundary.";
};

// 6. Generate Navi's friendly advice / chat response spoken directly to the child
export const generateNaviChildAdvice = async (situation, textingType) => {
  const cleanInput = (situation || '').trim();

  const prompt = `You are Navi, a friendly, warm, caring AI safety buddy for kids. You live right inside this safety app on the child's device.
The child sent you this message: "${cleanInput}" (Category: ${textingType}).

Reply directly to the child in 1 to 2 warm, natural, friendly sentences:
- If the child asks a question about you (e.g. "Where are you?", "Who are you?", "How many people have you talked to?"), answer cheerfully as Navi! (You live in their app as their safety buddy!).
- If the child shares a problem or mean situation, give 2 supportive sentences helping them feel safe.
- If the child says hi or makes small talk, give a happy greeting.

Keep your response under 35 words, friendly, kind, and positive.`;

  const result = await callOllama('gemma:2b', prompt, { temperature: 0.8 }, 15000);
  if (result && result.trim()) {
    return result.trim().replace(/^["|']|["|']$/g, '');
  }

  // Dynamic non-static contextual response if LLM is busy
  const lower = cleanInput.toLowerCase();
  if (lower.includes('where')) {
    return `I'm right here inside your app on your device! I'm always with you to keep your chats safe and fun. 💙`;
  }
  if (lower.includes('who') || lower.includes('what are you')) {
    return `I'm Navi! Your friendly AI safety buddy. I'm here to help you navigate chats and keep things positive. 🌟`;
  }
  if (lower.includes('how many') || lower.includes('people')) {
    return `I talk with awesome kids like you every day to help everyone stay safe and happy online! 😊`;
  }
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return `Hi there! I'm Navi! I'm so happy to chat with you today! 💙`;
  }

  return `I hear you about "${cleanInput}". I'm always right here in your app to help you navigate any chat! 💙`;
};
