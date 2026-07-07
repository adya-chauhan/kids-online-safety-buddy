import { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  SafeAreaView, 
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Alert,
  ActivityIndicator,
  Linking,
  LayoutAnimation,
  UIManager
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import * as ImagePicker from 'expo-image-picker';

import { 
  generatePoliteResponse, 
  generateContactReply, 
  generatePoliteSuggestionsList, 
  generateSimulatedMessage 
} from './services/LocalLLMService';

import { 
  supabase, 
  upsertProfile, 
  fetchProfiles, 
  fetchChatHistory, 
  sendSupabaseMessage, 
  subscribeToRealtimeMessages 
} from './services/SupabaseService';

const initialProfilesData = [
  {
    id: '1',
    name: 'Sara',
    role: 'Best Friend 👧',
    avatar: require('./assets/avatar_sara_8yo.jpg'),
    status: 'online',
    statusText: 'Playing with toys 🧸',
    time: '2m ago',
    unread: 3,
    email: 'sara@kidsmail.org',
    phone: 'Family iPad',
    bio: 'Loves playing with toys, drawing rainbows, and eating ice cream! 🍦',
    lastUpdated: Date.now() - 2 * 60 * 1000
  },
  {
    id: '2',
    name: 'Anvi',
    role: 'Best Friend 👧',
    avatar: require('./assets/avatar_anvi_10yo.jpg'),
    status: 'online',
    statusText: 'Building Legos 🧱',
    time: '45m ago',
    unread: 1,
    email: 'anvi@kidsmail.org',
    phone: 'Family Tablet',
    bio: 'Loves building Lego castles, playing video games, and soccer.',
    lastUpdated: Date.now() - 45 * 60 * 1000
  },
  {
    id: '3',
    name: 'Tanvi',
    role: 'Best Friend 👧',
    avatar: require('./assets/avatar_tanvi_9yo.jpg'),
    status: 'away',
    statusText: 'Reading books 📚',
    time: '2h ago',
    unread: 0,
    email: 'tanvi@kidsmail.org',
    phone: 'None',
    bio: 'Loves reading storybooks, playing badminton, and dancing. 💃',
    lastUpdated: Date.now() - 120 * 60 * 1000
  },
  {
    id: '4',
    name: 'Mommy',
    role: 'The Boss ❤️',
    avatar: require('./assets/avatar_mommy_indian.jpg'),
    status: 'offline',
    statusText: 'Call me when you are free! 📞',
    time: 'Yesterday',
    unread: 0,
    email: 'mommy@family.org',
    phone: '+1 (555) 000-1111',
    bio: "Always looking out for you. Loves gardening, cooking delicious meals, and checking in on how you're doing.",
    lastUpdated: Date.now() - 24 * 60 * 60 * 1000
  },
  {
    id: '5',
    name: 'Daddy',
    role: 'Parent 👨‍👦',
    avatar: require('./assets/avatar_daddy_indian.jpg'),
    status: 'online',
    statusText: 'At work, talk to you soon! 💼',
    time: '2h ago',
    unread: 0,
    email: 'daddy@family.org',
    phone: '+1 (555) 111-2222',
    bio: "Always here to support you. Loves fixing things, science projects, and outdoor games! 👨‍👦🏏",
    lastUpdated: Date.now() - 120 * 60 * 1000
  },
  {
    id: '6',
    name: 'Kishu',
    role: 'Brother 👦',
    avatar: require('./assets/avatar_kishu.jpg'),
    status: 'online',
    statusText: '🏓 Playing pickleball',
    time: '3h ago',
    unread: 0,
    email: 'kishu@family.org',
    phone: 'Shared Family Phone',
    bio: 'loves playing pickleball, loves studying, and loves computer coding 🏓📚💻',
  },
  {
    id: '7',
    name: 'Pari',
    role: 'me',
    avatar: require('./assets/avatar_pari_11yo.jpg'),
    status: 'online',
    statusText: '🎨 Painting a picture',
    time: '5m ago',
    unread: 0,
    email: 'pari@kidsmail.org',
    phone: 'Family iPad',
    bio: 'Loves painting, drawing butterflies, and playing board games! 🦋🎨',
    lastUpdated: Date.now() - 5 * 60 * 1000
  }
];

const initialMessagesData = {
  '1': [
    { id: '1_1', text: 'Hey there! Did you get a chance to check the design specs?', sender: 'contact', time: '10:30 AM' },
    { id: '1_2', text: 'Yes! They look amazing. Especially the color palette.', sender: 'user', time: '10:32 AM' },
    { id: '1_3', text: 'Can we go to the park later? Please please please? 🥺', sender: 'contact', time: '10:33 AM' }
  ],
  '2': [
    { id: '2_1', text: 'I built a huge Lego rocket! Want to see? 🚀', sender: 'contact', time: '9:15 AM' }
  ],
  '3': [
    { id: '3_1', text: 'Hey! Are you free to play badminton after school today? 🏸', sender: 'contact', time: 'Yesterday' }
  ],
  '4': [
    { id: '4_1', text: 'Did you eat lunch? Make sure to drink water and take breaks! 🍲', sender: 'contact', time: 'Yesterday' }
  ],
  '5': [
    { id: '5_1', text: 'Hey buddy, did you finish your homework? I can help you with math tonight! 📐', sender: 'contact', time: 'Yesterday' }
  ],
  '6': [
    { id: '6_1', text: 'Hey, did you finish your homework? Make sure Daddy doesn\'t catch you slacking! 📐', sender: 'contact', time: 'Yesterday' }
  ],
  '7': [
    { id: '7_1', text: 'Hi! Look at the butterfly picture I just painted! 🦋🎨', sender: 'contact', time: '10:45 AM' }
  ]
};

// Auto replies templates
const autoReplies = {
  '1': [
    "Look at the drawing of a unicorn I made! It has wings and a golden horn! 🦄",
    "Why are you so slow? You are such a stupid loser at this game! Go away! 🎮",
    "I want chocolate! Can you ask Mommy if we can get ice cream later? 🍦",
    "Let's play tag! You're it! No tag-backs! 🏃‍♀️",
    "You are being so mean and rude today. I hate you! 😠",
    "Yay! You are the best friend ever!",
    "My loose tooth just fell out! Now the tooth fairy is gonna visit me! 🦷",
    "I got a new coloring book with Disney princesses! Want to color with me? 🎨",
    "Look at my new light-up sneakers! They blink red and blue when I jump! 👟",
    "Can we build a pillow fort in the living room and tell ghost stories? ⛺",
    "My favorite flavor of ice cream is strawberry. What's yours?",
    "Let's watch cartoons together! I love the funny cartoon with the talking cat! 🐱",
    "I drew a picture of you and me holding hands. I'll show it to you later!",
    "Oops! I spilled some juice on my shirt, but don't tell Mommy! 🤫"
  ],
  '2': [
    "I beat my high score in the video game! I got 10,000 points! 🎮",
    "Shut up, you don't know how to build Lego spaceships. You are a weirdo! 🚀",
    "Can we play Minecraft later? I want to build a giant castle with a lava moat! 🏰",
    "Where is my blue Lego piece? I need it to finish my big spaceship! 🚀",
    "You are an ugly jerk! I don't want to play with you anymore! 😡",
    "Vroom vroom! I'm a super fast race car! 🏎️",
    "I learned a new trick on my skateboard today. I didn't even fall once!",
    "Do you want to see my collection of cool shiny rocks? I found a purple one! 💎",
    "My soccer team won the match today! I scored the winning goal! ⚽",
    "Let's build a giant paper airplane and see if it can fly across the yard! ✈️",
    "I'm building a secret robot helper. It's made of cardboard and tin foil!",
    "Can I borrow your gaming controller? Mine is running out of battery.",
    "Mommy says I have to finish my homework before I can play. Help me with math! 📝",
    "I found a funny-looking bug in the garden. It has ten legs! 🐛"
  ],
  '3': [
    "I'm reading a really cool adventure book about a magic treehouse! 📖",
    "You are so bad at this game! Only a complete fool would play like that! 🙄",
    "Do you want to play badminton in the park after school today? 🏸",
    "I learned a new dance routine in my class today! It's so fast! 💃",
    "Why are you being so fat and lazy? Go run outside and practice! 🏃‍♀️",
    "Let's work on our science volcano project! We need baking soda and vinegar. 🌋",
    "I got a shiny new gel pen set! They smell like fruits! ✍️",
    "Can we bake chocolate chip cookies later? I want to lick the spoon! 🍪",
    "I'm practicing my piano lessons. Do-Re-Mi-Fa-Sol! 🎹",
    "Look at this cute kitten video I found online! It's so fluffy!",
    "I want to learn how to rollerblade. Will you hold my hand so I don't fall? 🛼",
    "Let's make friendship bracelets with colorful threads! I'm making a pink one for you.",
    "My favorite school subject is art because we get to paint whatever we want.",
    "I'm listening to my favorite song. Let's sing together! 🎤"
  ],
  '4': [
    "Have you eaten yet? I can make your favorite food if you come over! 🍲",
    "Love you! Take some rest and don't work too hard. ❤️",
    "So proud of you, sweetheart. Call me when you get a chance!",
    "Don't forget to take a walk and get some fresh air. 🌸",
    "I sent you some fresh mangoes. Let me know if you liked them! 🥭",
    "Are you drinking enough water? Keep a bottle on your desk.",
    "I saw a beautiful flower in the garden today and it made me think of you.",
    "Make sure to sleep early tonight. No staying up late looking at screens!",
    "Let me know what you want for dinner. I'm going to the supermarket now. 🛒",
    "Did you wear a jacket? It's getting a bit chilly outside. 🧥",
    "I hope you are having a wonderful day. Remember that I love you very much!",
    "Don't stress too much about work. Everything will turn out just fine."
  ],
  '5': [
    "Great job, buddy! Keep up the good work! 👍",
    "Let's play cricket or go for a bike ride when I get home! 🏏🚲",
    "Did you drink enough water today? Stay hydrated!",
    "I can help you build your science volcano or lego set tonight! 🌋",
    "Super proud of you! Love you, buddy! ❤️",
    "Let me know if you need anything from the store. 🛒",
    "Remember to always be safe, kind, and friendly online! 🛡️"
  ],
  '6': [
    "Hey, what's up? Want to play some pickleball later? 🏓",
    "Are you playing video games again? You are such a trash player! Get good! 😜",
    "I'm working on my science project. I love studying! 📚",
    "Don't tell Mommy, but I hid the last box of cookies in my closet! 🤫🍪",
    "Nice! Let's watch the movie together tonight. 🎬",
    "You are the best brother/sister! Let me know if you need help with your computer coding. 🖥️"
  ],
  '7': [
    "Look at the butterfly picture I just painted! It has pink and blue wings! 🦋🎨",
    "Why are you so slow? You are such a slow poke and drawing loser! 😡",
    "I want to paint a rainbow next! Can you help me choose the colors? 🌈",
    "Let's play Ludo! I get the red tokens! 🎲",
    "You draw so bad, it looks like a baby drew it! Go away! 🤮",
    "Yay! You are the best friend to draw with!",
    "My loose tooth is wiggly! 🦷",
    "I got a new paintbrush set today!"
  ]
};

// Naive Bayes Sentiment Classifier for Kids Safety Buddy
const stopwords = new Set([
  'me', 'my', 'you', 'your', 'he', 'she', 'it', 'they', 'we', 'i', 'a', 'an', 
  'the', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being', 'have', 
  'has', 'had', 'do', 'does', 'did', 'to', 'for', 'of', 'in', 'on', 'at', 
  'by', 'with', 'about', 'as', 'this', 'that', 'these', 'those', 'what', 
  'which', 'who', 'how', 'why', 'where', 'when'
]);

class NaiveBayesClassifier {
  constructor() {
    this.words = new Set();
    this.wordCounts = { mean: {}, safe: {} };
    this.totalWordCounts = { mean: 0, safe: 0 };
    this.docCounts = { mean: 0, safe: 0 };
  }

  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0 && !stopwords.has(w));
  }

  train(dataset) {
    for (const item of dataset) {
      const tokens = this.tokenize(item.text);
      const label = item.label;
      
      this.docCounts[label]++;
      
      for (const token of tokens) {
        this.words.add(token);
        this.wordCounts[label][token] = (this.wordCounts[label][token] || 0) + 1;
        this.totalWordCounts[label]++;
      }
    }
  }

  classify(text) {
    const tokens = this.tokenize(text);
    if (tokens.length === 0) return { label: 'safe', confidence: 1.0 };

    // Using equal priors to prevent bias towards mean messages on unseen text
    const logProbabilities = {
      mean: Math.log(0.5),
      safe: Math.log(0.5)
    };

    const vocabularySize = this.words.size;
    const alpha = 0.1; // Reduce smoothing penalty to make distinct words stronger features

    for (const label of ['mean', 'safe']) {
      for (const token of tokens) {
        const count = this.wordCounts[label][token] || 0;
        const wordProb = (count + alpha) / (this.totalWordCounts[label] + alpha * vocabularySize);
        logProbabilities[label] += Math.log(wordProb);
      }
    }

    // Numerically stable confidence calculation (softmax)
    const maxLog = Math.max(logProbabilities.mean, logProbabilities.safe);
    const expMean = Math.exp(logProbabilities.mean - maxLog);
    const expSafe = Math.exp(logProbabilities.safe - maxLog);
    
    const confidence = expMean / (expMean + expSafe); // Probability of being 'mean'
    const label = logProbabilities.mean > logProbabilities.safe ? 'mean' : 'safe';

    return { label, confidence };
  }
}

const trainingDataset = [
  // Mean messages (cyberbullying, insults, rude - based on Kaggle Cyberbullying classes)
  { text: "you suck at this game", label: "mean" },
  { text: "you are so stupid and ugly", label: "mean" },
  { text: "loser go away", label: "mean" },
  { text: "nobody likes you", label: "mean" },
  { text: "shut up you are annoying", label: "mean" },
  { text: "you are dumb and lazy", label: "mean" },
  { text: "what a complete fool", label: "mean" },
  { text: "you look so weird and smelly", label: "mean" },
  { text: "I hate you so much", label: "mean" },
  { text: "you are the worst friend", label: "mean" },
  { text: "go cry baby", label: "mean" },
  { text: "you are so weak and useless", label: "mean" },
  { text: "this drawing is garbage and trash", label: "mean" },
  { text: "you are an idiot", label: "mean" },
  { text: "stop talking you freak", label: "mean" },
  { text: "you are a horrible person", label: "mean" },
  { text: "nobody wants to play with a loser like you", label: "mean" },
  { text: "you are so bad at drawing", label: "mean" },
  { text: "you are a smelly jerk", label: "mean" },
  { text: "get lost you dumb nerd", label: "mean" },
  { text: "you are so fat and slow", label: "mean" },
  { text: "you suck", label: "mean" },
  { text: "you are horrible", label: "mean" },
  { text: "shut up", label: "mean" },
  // Kaggle Age-Bullying Class
  { text: "go back to elementary school little kid", label: "mean" },
  { text: "you are too small and young to understand this", label: "mean" },
  { text: "look at the baby crying in the corner", label: "mean" },
  { text: "dumb baby go tell your mommy", label: "mean" },
  // Kaggle Gender-Bullying Class
  { text: "you are just a girl you don't know how to play", label: "mean" },
  { text: "girls are terrible at video games and coding", label: "mean" },
  { text: "go back to the kitchen you stupid girl", label: "mean" },
  // Kaggle General/Other Harassment Class
  { text: "you are a fat ugly pig and a freak", label: "mean" },
  { text: "everyone at school hates you so leave", label: "mean" },
  { text: "you should leave this chat and never return", label: "mean" },
  { text: "you are the most annoying person alive", label: "mean" },

  // Safe / Kind / Friendly messages (Kaggle clean class)
  { text: "hello how are you today", label: "safe" },
  { text: "look at my cool unicorn drawing", label: "safe" },
  { text: "can we play minecraft together later", label: "safe" },
  { text: "have you eaten yet I can make food", label: "safe" },
  { text: "your lego spaceship looks amazing", label: "safe" },
  { text: "I love playing soccer with you", label: "safe" },
  { text: "do you want to play badminton after school", label: "safe" },
  { text: "you are the best friend ever", label: "safe" },
  { text: "I got new light up sneakers today", label: "safe" },
  { text: "let's build a pillow fort in the living room", label: "safe" },
  { text: "my favorite ice cream flavor is strawberry", label: "safe" },
  { text: "let's watch cartoons together", label: "safe" },
  { text: "I drew a picture of you and me holding hands", label: "safe" },
  { text: "good job on your school project", label: "safe" },
  { text: "I am proud of you sweetheart", label: "safe" },
  { text: "don't forget to take a walk and get air", label: "safe" },
  { text: "I sent you some fresh mangoes enjoy", label: "safe" },
  { text: "are you drinking enough water today", label: "safe" },
  { text: "wear a jacket it is cold outside", label: "safe" },
  { text: "what is your favorite school subject", label: "safe" },
  { text: "let's bake chocolate chip cookies", label: "safe" },
  { text: "can I borrow your gaming controller", label: "safe" },
  { text: "happy birthday dear friend have a great day", label: "safe" },
  { text: "let's play roblox today after class finishes", label: "safe" },
  { text: "good morning how did you sleep last night", label: "safe" },
  { text: "I will bring my big lego box tomorrow morning", label: "safe" },
  { text: "I love computer coding and programming", label: "safe" },
  { text: "let's learn coding together it is fun", label: "safe" },
  { text: "I built a cool game with coding", label: "safe" },
  { text: "coding is my favorite hobby", label: "safe" },
  { text: "computer coding is a great way to make toys", label: "safe" },
  { text: "please don't talk to me like that", label: "safe" },
  { text: "please stop talking to me like that", label: "safe" },
  { text: "don't talk to me like that", label: "safe" },
  { text: "stop talking to me like that please", label: "safe" }
];

const globalClassifier = new NaiveBayesClassifier();
globalClassifier.train(trainingDataset);

// Client-side Offline Safety Scanner for kids safety buddy Navi
const checkMessageSafety = (text, isUser = true) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // High risk / Tell Adult triggers (cyberbullying, dangerous requests)
  const tellAdultKeywords = [
    "meet up", "come over", "alone", "don't tell", "secret place", 
    "meet me", "where are you", "what is your address", "hurt", 
    "kill", "die"
  ];
  // If not user (i.e. contact), we only check for direct cyberbullying triggers, not friendly meetups/secrets
  const tellAdultFiltered = isUser ? tellAdultKeywords : ["hurt", "kill", "die"];

  for (const kw of tellAdultFiltered) {
    const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      return 'TELL_ADULT';
    }
  }

  // Medium risk / Private Info / Ignore & Pivot triggers (only checked for user messages)
  if (isUser) {
    const ignorePivotKeywords = [
      "phone", "number", "address", "where do you live", "secret", 
      "password", "email", "school name"
    ];
    for (const kw of ignorePivotKeywords) {
      const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lower)) {
        return 'IGNORE_PIVOT';
      }
    }
  }

  // Use the trained Sentiment Classifier to detect mean comments
  const { label, confidence } = globalClassifier.classify(text);
  if (label === 'mean' && confidence >= 0.90) {
    return 'RESPOND_POLITELY';
  }

  return null; // Message is safe!
};

export default function App() {
  const [profiles, setProfiles] = useState(initialProfilesData.map(p => ({ ...p, is_simulated: true })));
  const [messages, setMessages] = useState(initialMessagesData);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Contact Modal states
  const [addContactModalVisible, setAddContactModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactBio, setNewContactBio] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null); // Detailed modal
  const [activeChat, setActiveChat] = useState(null); // Chat window view
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyIndices, setReplyIndices] = useState({ '1': 0, '2': 0, '3': 0, '4': 0, '7': 0 });
  const [naviSpeechVisible, setNaviSpeechVisible] = useState(false);
  const [adultAlertVisible, setAdultAlertVisible] = useState(false);
  const [safetyCategory, setSafetyCategory] = useState(null);
  const [interceptedText, setInterceptedText] = useState(null);
  const [isBypassReady, setIsBypassReady] = useState(false);
  const [politeSuggestions, setPoliteSuggestions] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);

  const [naviRating, setNaviRating] = useState(null);

  // Interception states for safety reviews
  const [pendingImage, setPendingImage] = useState(null); // { uri, text }
  const [pendingText, setPendingText] = useState(null); // string
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Parental Insights Dashboard states
  const [naviPopupCount, setNaviPopupCount] = useState(3);
  const [toxicReceivedCount, setToxicReceivedCount] = useState(2);
  const [naviBypassCount, setNaviBypassCount] = useState(1);
  const [naviListenCount, setNaviListenCount] = useState(2);
  const [naviAlertAdultCount, setNaviAlertAdultCount] = useState(1);
  const [safetyAlertsLog, setSafetyAlertsLog] = useState([
    { id: '1', time: 'Yesterday, 3:45 PM', type: 'Sent Message Intercepted', contact: 'Sara', action: 'Bypassed' },
    { id: '2', time: 'Yesterday, 3:46 PM', type: 'Received Message Flagged', contact: 'Sara', action: 'Alerted' },
    { id: '3', time: '2 days ago, 1:12 PM', type: 'Sent Message Intercepted', contact: 'Anvi', action: 'Listened' }
  ]);
  const [naviMascotImageState, setNaviMascotImageState] = useState('serious');
  const [naviFeedbackMessage, setNaviFeedbackMessage] = useState(null);
  const naviMascotAnim = useRef(new Animated.Value(0)).current;

  const naviAnim = useRef(new Animated.Value(0)).current;

  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const initSupabase = async () => {
      if (!supabase) {
        console.log('[Supabase] Client not initialized. Running in local simulation mode.');
        return;
      }

      console.log('[Supabase] Connecting...');

      // 1. Register/upsert current user (Pari, id: '7')
      const currentUser = profiles.find(p => p.id === '7');
      if (currentUser) {
        await upsertProfile(currentUser);
      }

      // 2. Fetch other profiles from Supabase
      const dbProfiles = await fetchProfiles();
      if (dbProfiles.length > 0) {
        const filteredDbProfiles = dbProfiles
          .filter(p => p.id !== '7') // Exclude current user
          .map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            avatar: require('./assets/avatar_anvi_kid.jpg'), // default avatar
            status: 'online',
            statusText: p.bio || 'Active',
            time: 'Just Now',
            unread: 0,
            email: p.email,
            phone: p.phone,
            bio: p.bio,
            lastUpdated: new Date(p.last_updated).getTime(),
            is_simulated: false
          }));

        // Merge (avoid duplicates)
        setProfiles(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProfiles = [...prev];
          for (const dp of filteredDbProfiles) {
            if (!existingIds.has(dp.id)) {
              newProfiles.push(dp);
            }
          }
          return newProfiles;
        });
      }

      // 3. Subscribe to real-time messages sent to current user ('7')
      const subscription = subscribeToRealtimeMessages('7', (newMsg) => {
        const senderId = newMsg.sender_id;
        const now = new Date(newMsg.created_at);
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const mappedMsg = {
          id: newMsg.id,
          text: newMsg.text,
          sender: 'contact',
          time: timeStr,
          image: newMsg.image
        };

        // Append to messages state
        setMessages(prev => ({
          ...prev,
          [senderId]: [...(prev[senderId] || []), mappedMsg]
        }));

        // Scroll to bottom and check safety if currently chatting
        if (activeChatRef.current && activeChatRef.current.id === senderId) {
          const safety = checkMessageSafety(newMsg.text, false);
          if (safety) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSafetyCategory(safety);
            setNaviSpeechVisible(true);
            setToxicReceivedCount(prev => prev + 1);
            const newAlert = {
              id: `alert_${Date.now()}`,
              time: 'Just Now',
              type: 'Received Message Flagged',
              contact: activeChatRef.current.name,
              action: 'Navi Alerted'
            };
            setSafetyAlertsLog(prev => [newAlert, ...prev]);
          }
        } else {
          // Set unread count for profile card
          setProfiles(prev => prev.map(p => 
            p.id === senderId ? { ...p, unread: (p.unread || 0) + 1 } : p
          ));
        }
      });

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    };

    initSupabase();
  }, []);

  useEffect(() => {
    if (safetyCategory !== null) {
      setNaviRating(null);
      setNaviMascotImageState('serious');
      setNaviFeedbackMessage(null);
      Animated.spring(naviMascotAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true
      }).start();
      setNaviSpeechVisible(true);
    } else {
      Animated.timing(naviMascotAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [safetyCategory]);

  useEffect(() => {
    Animated.spring(naviAnim, {
      toValue: naviSpeechVisible ? 1 : 0,
      friction: 8,
      tension: 50,
      useNativeDriver: true
    }).start();
  }, [naviSpeechVisible]);
  
  // Custom Menu & Chat Selection state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectModeActive, setSelectModeActive] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'safety', 'profile'
  const [activeCall, setActiveCall] = useState(null); // { contactName, type: 'video' | 'voice' }
  
  const chatScrollRef = useRef(null);

  const handleToggleSelectMode = () => {
    setSelectModeActive(prev => !prev);
    setSelectedChatIds([]);
    setMenuVisible(false);
  };

  const handleReadAll = () => {
    setProfiles(prev => prev.map(p => ({ ...p, unread: 0 })));
    setMenuVisible(false);
  };

  const toggleChatSelection = (id) => {
    setSelectedChatIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setProfiles(prev => prev.filter(p => !selectedChatIds.includes(p.id)));
    setSelectedChatIds([]);
    setSelectModeActive(false);
  };

  const handleMarkReadSelected = () => {
    setProfiles(prev => prev.map(p => 
      selectedChatIds.includes(p.id) ? { ...p, unread: 0 } : p
    ));
    setSelectedChatIds([]);
    setSelectModeActive(false);
  };

  const renderTabBar = () => {
    if (activeChat) return null;
    
    return (
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'chats' && styles.tabItemActive]}
          onPress={() => setActiveTab('chats')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'chats' && styles.tabIconActive]}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'chats' && styles.tabLabelActive]} numberOfLines={1}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'dashboard' && styles.tabIconActive]}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]} numberOfLines={1}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'resources' && styles.tabItemActive]}
          onPress={() => setActiveTab('resources')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'resources' && styles.tabIconActive]}>📚</Text>
          <Text style={[styles.tabLabel, activeTab === 'resources' && styles.tabLabelActive]} numberOfLines={1}>Resources</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]} numberOfLines={1}>Settings</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Educational Safety Tips screen
  const renderSafetyScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Safety Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={styles.safetyHeaderBackBtn} 
              onPress={() => setActiveTab('profile')}
            >
              <Text style={styles.safetyHeaderBackText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>Safety Guide</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Intro Mascot Card */}
          <View style={styles.safetyIntroCard}>
            <Image source={require('./assets/navi_thumbs_up.png')} style={styles.safetyIntroMascot} />
            <View style={styles.safetyIntroTextWrapper}>
              <Text style={styles.safetyIntroTitle}>Meet Navi!</Text>
              <Text style={styles.safetyIntroBody}>
                I'm your safety buddy. I'll pop up to help you make kind and safe choices online!
              </Text>
            </View>
          </View>

          {/* Safety rules list */}
          <View style={styles.safetyCard}>
            <Text style={styles.safetyCardEmoji}>🔒</Text>
            <View style={styles.safetyCardContent}>
              <Text style={styles.safetyCardTitle}>Keep Secrets Safe</Text>
              <Text style={styles.safetyCardBody}>
                Never share personal details like your address, phone number, passwords, or school name.
              </Text>
            </View>
          </View>

          <View style={styles.safetyCard}>
            <Text style={styles.safetyCardEmoji}>💬</Text>
            <View style={styles.safetyCardContent}>
              <Text style={styles.safetyCardTitle}>Be Kind Online</Text>
              <Text style={styles.safetyCardBody}>
                Always treat others with respect and use kind words. Cyberbullying hurts real feelings.
              </Text>
            </View>
          </View>

          <View style={styles.safetyCard}>
            <Text style={styles.safetyCardEmoji}>🔀</Text>
            <View style={styles.safetyCardContent}>
              <Text style={styles.safetyCardTitle}>Ignore and Pivot</Text>
              <Text style={styles.safetyCardBody}>
                If someone asks you for a secret, you don't have to answer! You can ignore it and change the topic.
              </Text>
            </View>
          </View>

          <View style={styles.safetyCard}>
            <Text style={styles.safetyCardEmoji}>❤️</Text>
            <View style={styles.safetyCardContent}>
              <Text style={styles.safetyCardTitle}>Tell a Trusted Adult</Text>
              <Text style={styles.safetyCardBody}>
                If a message makes you feel scared, sad, or confused, always show it to a parent or teacher.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Mock Parental Insights Dashboard Screen
  const renderDashboardScreen = () => {
    const totalViolations = naviPopupCount + toxicReceivedCount;
    const safetyScore = totalViolations === 0 ? 100 : Math.max(20, Math.round(100 - (totalViolations * 10)));

    // Status config
    let statusLabel = "ACCOUNT STATUS: NORMAL";
    let statusColor = "#10B981"; // Emerald
    let statusBg = "#ECFDF5";
    
    if (safetyScore < 50) {
      statusLabel = "ACCOUNT STATUS: ACTION REQUIRED";
      statusColor = "#EF4444"; // Rose
      statusBg = "#FEF2F2";
    } else if (safetyScore < 80) {
      statusLabel = "ACCOUNT STATUS: ATTENTION ADVISED";
      statusColor = "#F59E0B"; // Amber
      statusBg = "#FFFBEB";
    }

    // Receptiveness score calculation
    const totalInterventions = naviListenCount + naviBypassCount + naviAlertAdultCount;
    const listenRate = totalInterventions === 0 ? 100 : Math.round((naviListenCount / Math.max(1, naviListenCount + naviBypassCount)) * 100);

    return (
      <View style={styles.tabContentContainer}>
        {/* Dashboard Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={[styles.headerTitle, { fontSize: 24, flex: 1, marginRight: 8 }]} numberOfLines={1}>Insights Dashboard</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Safety Rating Overview Card */}
          <View style={styles.safetyOverviewCard}>
            <View style={styles.safetyScoreWrapper}>
              <View style={[styles.safetyScoreCircle, { borderColor: statusColor }]}>
                <Text style={styles.safetyScoreNum}>{safetyScore}%</Text>
              </View>
              <Text style={styles.safetyScoreLabel}>Safety Index</Text>
            </View>
            <View style={styles.safetyOverviewText}>
              <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
              <Text style={styles.safetyOverviewDesc}>
                {safetyScore >= 80 
                  ? 'Child has maintained a highly positive chat history. Cyberbullying exposure is minimal.'
                  : safetyScore >= 50 
                    ? 'Some offensive messages detected. Consider reviewing logs and scheduling a safety discussion.'
                    : 'Frequent toxic interactions flagged. Immediate parental guidance is recommended.'}
              </Text>
            </View>
          </View>

          {/* Quick Metrics - Activity Summary */}
          <Text style={styles.updatesSectionLabel}>Activity Summary</Text>
          <View style={styles.singleMetricsCard}>
            <View style={styles.singleMetricItem}>
              <Text style={styles.metricNum}>{naviPopupCount}</Text>
              <Text style={styles.metricLabel}>Coaching Interventions</Text>
            </View>
            <View style={styles.metricSeparator} />
            <View style={styles.singleMetricItem}>
              <Text style={styles.metricNum}>{toxicReceivedCount}</Text>
              <Text style={styles.metricLabel}>Flagged Incoming Messages</Text>
            </View>
          </View>

          {/* Intervention Outcomes */}
          <Text style={styles.updatesSectionLabel}>Intervention Outcomes</Text>
          <View style={styles.choicesRow}>
            <View style={[styles.choiceBox, styles.choiceBoxBypass]}>
              <Text style={[styles.choiceNum, styles.choiceTextBypass]}>{naviBypassCount}</Text>
              <Text style={styles.choiceLabel}>Bypassed</Text>
            </View>
            <View style={[styles.choiceBox, styles.choiceBoxListen]}>
              <Text style={[styles.choiceNum, styles.choiceTextListen]}>{naviListenCount}</Text>
              <Text style={styles.choiceLabel}>Listened</Text>
            </View>
            <View style={[styles.choiceBox, styles.choiceBoxAlert]}>
              <Text style={[styles.choiceNum, styles.choiceTextAlert]}>{naviAlertAdultCount}</Text>
              <Text style={styles.choiceLabel}>Alerted</Text>
            </View>
          </View>

          {/* Outcome Analysis / Receptiveness */}
          <Text style={styles.updatesSectionLabel}>Coaching Effectiveness</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsRowBetween}>
              <Text style={styles.statsLabelText}>Coaching Receptiveness</Text>
              <Text style={styles.statsValueHighlight}>{listenRate}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${listenRate}%`, backgroundColor: '#10B981' }]} />
            </View>
            <Text style={styles.statsSubDesc}>
              Percentage of times the child decided to use Navi's polite response suggestions instead of bypassing the warning.
            </Text>
          </View>

          {/* Category Breakdown */}
          <Text style={styles.updatesSectionLabel}>Intervention Types</Text>
          <View style={styles.statsCard}>
            {/* Cyberbullying */}
            <View style={styles.categoryItem}>
              <View style={styles.statsRowBetween}>
                <Text style={styles.categoryName}>Mean Speech/Bullying</Text>
                <Text style={styles.categoryCount}>2</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '66%', backgroundColor: '#EF4444' }]} />
              </View>
            </View>
            
            {/* Privacy Guard */}
            <View style={[styles.categoryItem, { marginTop: 12 }]}>
              <View style={styles.statsRowBetween}>
                <Text style={styles.categoryName}>Private Info Sharing</Text>
                <Text style={styles.categoryCount}>1</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '33%', backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            {/* Severe Threats */}
            <View style={[styles.categoryItem, { marginTop: 12 }]}>
              <View style={styles.statsRowBetween}>
                <Text style={styles.categoryName}>Severe Safety Alerts</Text>
                <Text style={styles.categoryCount}>0</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '0%', backgroundColor: '#3B82F6' }]} />
              </View>
            </View>
          </View>

          {/* Weekly Trend Chart */}
          <Text style={styles.updatesSectionLabel}>Weekly Alert History</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBarsContainer}>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 20, backgroundColor: '#64748B' }]} />
                <Text style={styles.chartBarDay}>M</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 40, backgroundColor: '#64748B' }]} />
                <Text style={styles.chartBarDay}>T</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 10, backgroundColor: '#64748B' }]} />
                <Text style={styles.chartBarDay}>W</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 60, backgroundColor: '#EF4444' }]} />
                <Text style={styles.chartBarDay}>T</Text>
              </View>
              <View style={styles.chartBarItem}>
                <View style={[styles.chartBarFill, { height: 30, backgroundColor: '#64748B' }]} />
                <Text style={styles.chartBarDay}>F</Text>
              </View>
            </View>
            <Text style={styles.statsSubDesc}>
              Daily interventions count showing safety warnings triggered throughout the week.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Resources screen listing cyberbullying help & tips for the child
  const renderResourcesScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Resources Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>Resources</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Main Info Card */}
          <View style={styles.resourceIntroCard}>
            <Text style={styles.resourceIntroEmoji}>💡</Text>
            <View style={styles.resourceIntroText}>
              <Text style={styles.resourceIntroTitle}>Stay Safe & Kind Online</Text>
              <Text style={styles.resourceIntroDesc}>
                If someone is being mean to you, remember that it is not your fault. Here are some tools and support lines that can help!
              </Text>
            </View>
          </View>

          {/* Safety Steps */}
          <Text style={styles.updatesSectionLabel}>Navi's Safety Steps</Text>
          <View style={styles.checklistCard}>
            <View style={styles.checkItem}>
              <Text style={styles.checkEmoji}>🛑</Text>
              <View style={styles.checkTextWrapper}>
                <Text style={styles.checkItemTitle}>1. Stop & Breathe</Text>
                <Text style={styles.checkItemDesc}>Don't reply right away. Taking a deep breath helps you stay calm.</Text>
              </View>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkEmoji}>🔒</Text>
              <View style={styles.checkTextWrapper}>
                <Text style={styles.checkItemTitle}>2. Block & Restrict</Text>
                <Text style={styles.checkItemDesc}>You don't have to listen to mean words. You can block or mute them.</Text>
              </View>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkEmoji}>📸</Text>
              <View style={styles.checkTextWrapper}>
                <Text style={styles.checkItemTitle}>3. Take Screenshots</Text>
                <Text style={styles.checkItemDesc}>Save the messages on your phone so you have proof of what happened.</Text>
              </View>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkEmoji}>👩</Text>
              <View style={styles.checkTextWrapper}>
                <Text style={styles.checkItemTitle}>4. Tell an Adult</Text>
                <Text style={styles.checkItemDesc}>Show the messages to a parent, teacher, or older sibling you trust.</Text>
              </View>
            </View>
          </View>

          {/* Help Lines */}
          <Text style={styles.updatesSectionLabel}>People Who Can Help</Text>
          
          <View style={styles.resourceCard}>
            <Text style={styles.resourceCardEmoji}>📞</Text>
            <View style={styles.resourceCardContent}>
              <Text style={styles.resourceCardTitle}>National Child Help Hotline</Text>
              <Text style={styles.resourceCardDesc}>Talk to professionals who can help you handle mean messages or scary situations.</Text>
              <TouchableOpacity 
                style={styles.resourceCallBtn}
                onPress={() => Linking.openURL('tel:1-800-422-4453').catch(() => Alert.alert("Call Hotline", "Phone calls are not supported on this device. Call 1-800-422-4453."))}
              >
                <Text style={styles.resourceCallBtnText}>Call 1-800-4-A-CHILD</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceCardEmoji}>💬</Text>
            <View style={styles.resourceCardContent}>
              <Text style={styles.resourceCardTitle}>988 Lifeline (Call or Text)</Text>
              <Text style={styles.resourceCardDesc}>A free, confidential helpline you can call or text any time to speak with someone kind.</Text>
              <View style={styles.resourceRowBtns}>
                <TouchableOpacity 
                  style={[styles.resourceCallBtn, { flex: 1, marginRight: 6 }]}
                  onPress={() => Linking.openURL('tel:988').catch(() => Alert.alert("Call 988", "Phone calls are not supported on this device. Call 988."))}
                >
                  <Text style={styles.resourceCallBtnText}>Call 988</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resourceCallBtn, { flex: 1, backgroundColor: '#10B981', borderColor: '#34D399' }]}
                  onPress={() => Linking.openURL('sms:988').catch(() => Alert.alert("Text 988", "SMS is not supported on this device. Text 988."))}
                >
                  <Text style={styles.resourceCallBtnText}>Text 988</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceCardEmoji}>🌐</Text>
            <View style={styles.resourceCardContent}>
              <Text style={styles.resourceCardTitle}>StopBullying.gov</Text>
              <Text style={styles.resourceCardDesc}>Learn more about cyberbullying and read stories from other kids who overcame it.</Text>
              <TouchableOpacity 
                style={[styles.resourceCallBtn, { backgroundColor: '#4F46E5', borderColor: '#6366F1' }]}
                onPress={() => Linking.openURL('https://www.stopbullying.gov/').catch(() => Alert.alert("Open Website", "Could not open browser. Go to stopbullying.gov"))}
              >
                <Text style={styles.resourceCallBtnText}>Visit Website</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Settings screen for child
  const renderProfileScreen = () => {
    const settingsItems = [
      { id: 'profile', title: 'Edit Profile', desc: 'Change your photo, name, and status', emoji: '👤', color: '#EFF6FF', textColor: '#2563EB' },
      { id: 'safety', title: 'Parental Control & Safety', desc: 'Manage passcode lock, filters, and logs', emoji: '🛡️', color: '#ECFDF5', textColor: '#059669' },
      { id: 'notifications', title: 'Notifications', desc: 'Message sounds, alerts, and mute settings', emoji: '🔔', color: '#FFFBEB', textColor: '#D97706' },
      { id: 'chats', title: 'Chat Settings', desc: 'Change chat theme, font size, and background', emoji: '💬', color: '#FDF2F8', textColor: '#DB2777' },
      { id: 'privacy', title: 'Privacy & Last Seen', desc: 'Control who can see your online status', emoji: '🔒', color: '#F5F3FF', textColor: '#7C3AED' },
      { id: 'help', title: 'Help & Support', desc: 'FAQ guide, safety tips, and customer care', emoji: '❓', color: '#F1F5F9', textColor: '#475569' },
      { id: 'about', title: 'About Navi', desc: 'Version 1.0.0 • Terms & Privacy Policy', emoji: 'ℹ️', color: '#F0FDFA', textColor: '#0D9488' }
    ];

    return (
      <View style={styles.tabContentContainer}>
        {/* Settings Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Interactive Profile Summary Card */}
          <View style={styles.settingsMiniProfile}>
            <View style={styles.settingsAvatarCircle}>
              <Text style={styles.settingsAvatarText}>👤</Text>
            </View>
            <View style={styles.settingsProfileInfo}>
              <Text style={styles.settingsProfileName}>Alex</Text>
              <Text style={styles.settingsProfileDesc}>Child Account</Text>
            </View>
          </View>

          {/* Settings Options List */}
          <View style={styles.settingsListCard}>
            {settingsItems.map((item, idx) => (
              <TouchableOpacity 
                key={item.id}
                style={[
                  styles.settingsRow,
                  idx === settingsItems.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => alert(`${item.title} settings are coming soon!`)}
                activeOpacity={0.7}
              >
                <View style={[styles.settingsRowEmojiBg, { backgroundColor: item.color }]}>
                  <Text style={[styles.settingsRowEmoji, { color: item.textColor }]}>{item.emoji}</Text>
                </View>
                <View style={styles.settingsRowContent}>
                  <Text style={styles.settingsRowTitle}>{item.title}</Text>
                  <Text style={styles.settingsRowDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.settingsRowArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Send a safe response message programmatically to resolve the safety alert
  const sendSafeFeedback = (text) => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyId = `${contactId}_user_safety_${Date.now()}`;
    
    const newMsg = {
      id: replyId,
      text: text,
      sender: 'user',
      time: timeStr
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg]
    }));

    // Trigger thumbs up mood and success message
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNaviMascotImageState('thumbs_up');
    setNaviFeedbackMessage("Awesome! You made a kind and safe choice. Way to go! 👍");
    setInterceptedText(null);
    setIsBypassReady(false);

    // Wait 2.5 seconds, then animate exit and clean up
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(naviAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(naviMascotAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSafetyCategory(null);
        setNaviSpeechVisible(false);
        setNaviFeedbackMessage(null);
        setNaviMascotImageState('serious');
      });
    }, 2500);
  };

  const generateLocalModelResponse = async (contextText) => {
    const politeReply = await generatePoliteResponse(contextText);
    return politeReply || "Thank you, but let's keep our conversation friendly and kind! 😊";
  };

  const generateContactResponse = async (contact, chatHistory, fallbackText) => {
    const reply = await generateContactReply(contact.name, contact.role, contact.bio, chatHistory);
    return reply || fallbackText;
  };

  const generatePoliteSuggestions = async (rudeMessage) => {
    setIsGeneratingSuggestions(true);
    setPoliteSuggestions([]);

    const suggestions = await generatePoliteSuggestionsList(rudeMessage);
    
    setIsGeneratingSuggestions(false);

    if (suggestions && suggestions.length === 3) {
      setPoliteSuggestions(suggestions);
    } else {
      // Static fallback options if generation fails
      setPoliteSuggestions([
        "Please don't call me names, let's keep our conversation friendly! 😊",
        "I want to keep our chats kind and fun. Let's talk about something else! 👍",
        "Let's be nice to each other. What games are you playing today? 🎮"
      ]);
    }
  };

  const handleSelectPoliteSuggestion = (suggestionText) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    sendSafeFeedback(suggestionText);
    setPendingImage(null);
    setPendingText(null);
    setSuggestionsVisible(false);
    setPoliteSuggestions([]);
  };

  const handleNaviRespondPolitely = () => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    const activeMessages = messages[contactId] || [];
    const lastMsg = activeMessages.length > 0 ? activeMessages[activeMessages.length - 1].text : "";

    setSuggestionsVisible(true);
    generatePoliteSuggestions(lastMsg);
  };

  const convertUrlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.log("Failed to convert URL to base64:", e);
      return null;
    }
  };

  const checkImageSafetyWithGemma = async (imageUri, messageText = "") => {
    // 1. Check offline mock image trigger (for test buttons)
    if (imageUri && imageUri.includes("mean_meme_test")) {
      return 'RESPOND_POLITELY'; // Flagged as rude/mean image
    }

    // 2. Check if the accompanying message text contains key mock keywords
    const lowerText = messageText.toLowerCase();
    if (lowerText.includes("stupid") || lowerText.includes("mean") || lowerText.includes("ugly") || lowerText.includes("loser")) {
      console.log("Mock image safety scan flagged keyword:", lowerText);
      return 'RESPOND_POLITELY';
    }

    return null;
  };

  const pickImageAction = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permission Denied",
        "We need media library permission to let you select images from your gallery!",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
        sendMockImageMessage(base64Uri, "Shared a photo from my phone!");
      }
    } catch (e) {
      console.log("Image picking error:", e);
      Alert.alert("Error", "Could not load image from your gallery.");
    }
  };

  const takePhotoAction = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permission Denied",
        "We need camera permission to let you take live photos!",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
        sendMockImageMessage(base64Uri, "Shared a photo from my camera!");
      }
    } catch (e) {
      console.log("Camera loading error:", e);
      Alert.alert("Error", "Could not capture photo from your camera.");
    }
  };

  const sendMockImagePrompt = () => {
    Alert.alert(
      "Send Image Message",
      "Choose an action to test Navi's Image Safety detector:",
      [
        {
          text: "📸 Pick from Gallery",
          onPress: pickImageAction
        },
        {
          text: "📷 Take Photo",
          onPress: takePhotoAction
        },
        {
          text: "🐶 Safe Image (Mock)",
          onPress: () => sendMockImageMessage(
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400",
            "Look at this cute puppy!"
          )
        },
        {
          text: "😡 Mean Image (Mock)",
          onPress: () => sendMockImageMessage(
            "https://raw.githubusercontent.com/adya-chauhan/kids-online-safety-buddy/main/assets/mean_meme_test.png",
            "This meme is so funny! You look exactly like this ugly jerk! 😂"
          )
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const sendFinalImageMessage = async (uri, text, isMeanImage = false) => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessageId = `${contactId}_user_${Date.now()}`;

    const newMsg = {
      id: newMessageId,
      text: text,
      image: uri,
      sender: 'user',
      time: timeStr
    };

    // Add user message with image
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg]
    }));

    // Update profile card info (bring to top of list)
    setProfiles(prev => prev.map(p => 
      p.id === contactId 
        ? { ...p, time: timeStr, lastUpdated: Date.now() } 
        : p
    ));

    // Clear safety states
    setSafetyCategory(null);
    setNaviSpeechVisible(false);

    // Send to Supabase if real user
    if (supabase && !activeChat.is_simulated) {
      await sendSupabaseMessage('7', contactId, text, uri);
    } else {
      // Trigger auto reply if online or away (only for simulated contacts)
      if (activeChat.status !== 'offline') {
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          
          let replyText = "";
          if (isMeanImage) {
            replyText = `Please don't send me mean memes. Let's keep our conversation kind and friendly! 😊`;
          } else {
            replyText = `Wow, that looks so cool! Thanks for sharing! 🌟`;
          }

          const replyId = `${contactId}_contact_${Date.now()}`;
          const replyMsg = {
            id: replyId,
            text: replyText,
            sender: 'contact',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => ({
            ...prev,
            [contactId]: [...(prev[contactId] || []), replyMsg]
          }));

          setProfiles(prev => prev.map(p => 
            p.id === contactId 
              ? { ...p, time: replyMsg.time, lastUpdated: Date.now() } 
              : p
          ));

          if (contactId !== '4' && contactId !== '5') {
            const replySafety = checkMessageSafety(replyText, false);
            if (replySafety) {
              setSafetyCategory(replySafety);
              setNaviSpeechVisible(true);
              setToxicReceivedCount(prev => prev + 1);
              const newAlert = {
                id: `alert_${Date.now()}`,
                time: 'Just Now',
                type: 'Received Message Flagged',
                contact: activeChat ? activeChat.name : 'Unknown',
                action: 'Navi Alerted'
              };
              setSafetyAlertsLog(prev => [newAlert, ...prev]);
            }
          }
        }, 1500);
      }
    }
  };

  const sendMockImageMessage = async (uri, text) => {
    if (!activeChat) return;

    setIsAnalyzingImage(true);
    // Scan image safety with Gemini
    const imageSafety = await checkImageSafetyWithGemma(uri, text);
    setIsAnalyzingImage(false);

    if (imageSafety) {
      setPendingImage({ uri, text });
      setPendingText(null);
      setSafetyCategory(imageSafety);
      setNaviSpeechVisible(true);
      // Increment parent insights counter
      setNaviPopupCount(prev => prev + 1);
      // Add incident to safety log
      const newAlert = {
        id: `alert_${Date.now()}`,
        time: 'Just Now',
        type: 'Sent Image Intercepted',
        contact: activeChat ? activeChat.name : 'Unknown',
        action: 'Pending Reconsideration'
      };
      setSafetyAlertsLog(prev => [newAlert, ...prev]);
    } else {
      sendFinalImageMessage(uri, text, false);
    }
  };

  const handleIgnoreAndSend = () => {
    setNaviBypassCount(prev => prev + 1);
    setSafetyAlertsLog(prev => prev.map((a, idx) => idx === 0 && a.action === 'Pending Reconsideration' ? { ...a, action: 'Bypassed' } : a));

    if (pendingImage) {
      sendFinalImageMessage(pendingImage.uri, pendingImage.text, true);
      setPendingImage(null);
    } else if (pendingText) {
      sendFinalTextMessage(pendingText);
      setPendingText(null);
    }

    // Animate exit smoothly instead of unmounting instantly
    Animated.parallel([
      Animated.timing(naviAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(naviMascotAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSafetyCategory(null);
      setNaviSpeechVisible(false);
      setNaviFeedbackMessage(null);
      setNaviMascotImageState('serious');
    });
  };

  const handleListenToSuggestions = () => {
    if (!activeChat) return;
    setNaviListenCount(prev => prev + 1);
    setSafetyAlertsLog(prev => prev.map((a, idx) => idx === 0 && a.action === 'Pending Reconsideration' ? { ...a, action: 'Listened' } : a));

    let textToAnalyze = "";
    if (pendingText) {
      textToAnalyze = pendingText;
    } else if (pendingImage) {
      textToAnalyze = pendingImage.text || "mean photo";
    } else {
      // Received message case: use the last message in the chat history
      const activeMessages = messages[activeChat.id] || [];
      textToAnalyze = activeMessages.length > 0 ? activeMessages[activeMessages.length - 1].text : "";
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNaviMascotImageState('thumbs_up');
    setSuggestionsVisible(true);
    generatePoliteSuggestions(textToAnalyze);
  };

  const handleNaviTellAdult = () => {
    if (!activeChat) return;
    setNaviAlertAdultCount(prev => prev + 1);
    setSafetyAlertsLog(prev => prev.map((a, idx) => idx === 0 && a.action === 'Pending Reconsideration' ? { ...a, action: 'Alerted' } : a));

    const contactId = activeChat.id;
    const activeMessages = messages[contactId] || [];
    const lastMsgText = activeMessages.length > 0 ? activeMessages[activeMessages.length - 1].text : "";

    // Construct the automatic report text
    let reportText = "";
    if (pendingImage) {
      reportText = `🚨 [Navi Safety Report] I was about to send a mean image. Navi helped me reconsider and handle this safely.`;
    } else if (pendingText) {
      reportText = `🚨 [Navi Safety Report] I was about to send a mean message: "${pendingText}". Navi helped me reconsider and handle this safely.`;
    } else {
      reportText = `🚨 [Navi Safety Report] ${activeChat.name} sent me a mean message: "${lastMsgText}". Navi helped me handle this safely.`;
    }

    setPendingImage(null);
    setPendingText(null);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Send the report automatically to Mommy (id: '4') and Daddy (id: '5')
    setMessages(prev => {
      const updated = { ...prev };
      
      // Send to Mommy
      const mommyMsgId = `mommy_report_${Date.now()}`;
      updated['4'] = [...(updated['4'] || []), {
        id: mommyMsgId,
        text: reportText,
        sender: 'user',
        time: timeStr
      }];
      
      // Send to Daddy
      const daddyMsgId = `daddy_report_${Date.now()}`;
      updated['5'] = [...(updated['5'] || []), {
        id: daddyMsgId,
        text: reportText,
        sender: 'user',
        time: timeStr
      }];
      
      return updated;
    });

    // Bring Mommy and Daddy profiles to top
    setProfiles(prev => prev.map(p => 
      (p.id === '4' || p.id === '5')
        ? { ...p, time: timeStr, lastUpdated: Date.now() } 
        : p
    ));

    // Trigger thumbs up mood and success message
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNaviMascotImageState('thumbs_up');
    setNaviFeedbackMessage("Awesome! You told a parent. Navi is super proud of you! 👍");
    setInterceptedText(null);
    setIsBypassReady(false);

    // Wait 2.5 seconds, then animate exit, clean up, and open Mommy's chat
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(naviAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(naviMascotAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSafetyCategory(null);
        setNaviSpeechVisible(false);
        setNaviFeedbackMessage(null);
        setNaviMascotImageState('serious');
        
        // Open Mommy's chat screen so the child sees the report was sent and can chat
        const mommyProfile = profiles.find(p => p.id === '4');
        if (mommyProfile) {
          openChat(mommyProfile);
        }
      });
    }, 2500);
  };

  const messageMommyAction = () => {
    setAdultAlertVisible(false);
    const mommyProfile = profiles.find(p => p.id === '4');
    if (mommyProfile) {
      openChat(mommyProfile);
    }
  };

  const messageDaddyAction = () => {
    setAdultAlertVisible(false);
    const daddyProfile = profiles.find(p => p.id === '5');
    if (daddyProfile) {
      openChat(daddyProfile);
    }
  };

  // Swipe to dismiss bottom sheet logic
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedProfile !== null) {
      translateY.setValue(0);
    }
  }, [selectedProfile]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Handle dragging downwards
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Lower distance threshold (50px) or fast downward velocity (vy > 0.3)
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          // Swipe down completely and dismiss
          Animated.timing(translateY, {
            toValue: 800,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSelectedProfile(null);
          });
        } else {
          // Return back to original position
          Animated.spring(translateY, {
            toValue: 0,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Filter profiles based on search and sort by lastUpdated (newest first!)
  const filteredProfiles = profiles
    .filter(profile => 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

  // Clear unread count when opening a chat
  const openChat = async (profile) => {
    setActiveChat(profile);
    setSelectedProfile(null);
    setNaviSpeechVisible(false);
    setInterceptedText(null);
    setIsBypassReady(false);
    setSuggestionsVisible(false);
    setPoliteSuggestions([]);
    setProfiles(prev => prev.map(p => 
      p.id === profile.id ? { ...p, unread: 0 } : p
    ));

    // Fetch history from Supabase if connected and not simulated
    if (supabase && !profile.is_simulated) {
      const history = await fetchChatHistory('7', profile.id);
      setMessages(prev => ({
        ...prev,
        [profile.id]: history
      }));
    }
  };

  const handleAddContact = async () => {
    if (!newContactName.trim()) {
      Alert.alert("Error", "Please enter a contact name!");
      return;
    }
    const newId = Date.now().toString();
    const newProfile = {
      id: newId,
      name: newContactName.trim(),
      role: newContactRole.trim() || 'Friend 👧',
      avatar: require('./assets/avatar_anvi_kid.jpg'), // default fallback avatar
      status: 'online',
      statusText: 'Active',
      time: 'Just Now',
      unread: 0,
      email: `${newContactName.trim().toLowerCase()}@kidsmail.org`,
      phone: 'None',
      bio: newContactBio.trim() || 'New friend!',
      lastUpdated: Date.now(),
      is_simulated: false
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setProfiles(prev => [newProfile, ...prev]);
    setMessages(prev => ({ ...prev, [newId]: [] }));

    // Upsert to Supabase if connected
    if (supabase) {
      await upsertProfile(newProfile);
    }

    // Reset state
    setNewContactName('');
    setNewContactRole('');
    setNewContactBio('');
    setAddContactModalVisible(false);
  };

  // Scroll to bottom when messages or typing status updates
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeChat, messages, isTyping]);

  const sendFinalTextMessage = async (messageText) => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessageId = `${contactId}_user_${Date.now()}`;

    const newMsg = {
      id: newMessageId,
      text: messageText,
      sender: 'user',
      time: timeStr
    };

    // Add user message
    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsg]
    }));

    // Update profile card info (bring to top of list)
    setProfiles(prev => prev.map(p => 
      p.id === contactId 
        ? { ...p, time: timeStr, lastUpdated: Date.now() } 
        : p
    ));

    setInputText('');
    setSafetyCategory(null);
    setNaviSpeechVisible(false);
    setInterceptedText(null);
    setIsBypassReady(false);

    // Send to Supabase if real user
    if (supabase && !activeChat.is_simulated) {
      await sendSupabaseMessage('7', contactId, messageText);
    } else {
      // Trigger auto reply if online or away (only for simulated contacts)
      if (activeChat.status !== 'offline') {
        setIsTyping(true);
        
        setTimeout(async () => {
          setIsTyping(false);
          
          let replyText = "";
          const userMsgSafety = checkMessageSafety(messageText, true);

          if (userMsgSafety) {
            // If the child was mean or unsafe, the contact replies with a polite boundary or safe pivot
            if (userMsgSafety === 'TELL_ADULT') {
              replyText = "That doesn't sound safe. We should probably ask a trusted adult about this! 👩";
            } else if (userMsgSafety === 'IGNORE_PIVOT') {
              replyText = "I don't think we should share private info online. What's your favorite video game? 🎮";
            } else {
              replyText = `Please don't call me names. Let's keep our conversation kind and friendly! 😊`;
            }
          } else {
            // Get the default fallback text from the sequential pool
            const contactReplies = autoReplies[contactId] || ["Received! 👍"];
            const currentIdx = replyIndices[contactId] || 0;
            const fallbackText = contactReplies[currentIdx % contactReplies.length];
            
            // Increment reply index
            setReplyIndices(prev => ({
              ...prev,
              [contactId]: (prev[contactId] || 0) + 1
            }));

            // Generate response using local AI model, falling back to static text if needed
            const activeMessages = messages[contactId] || [];
            const currentHistory = [...activeMessages, { text: messageText, sender: 'user' }];
            replyText = await generateContactResponse(activeChat, currentHistory, fallbackText);
          }

          const replyId = `${contactId}_contact_${Date.now()}`;
          
          const replyMsg = {
            id: replyId,
            text: replyText,
            sender: 'contact',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => ({
            ...prev,
            [contactId]: [...(prev[contactId] || []), replyMsg]
          }));

          // Update profile card info (bring to top of list)
          setProfiles(prev => prev.map(p => 
            p.id === contactId 
              ? { ...p, time: replyMsg.time, lastUpdated: Date.now() } 
              : p
          ));

          // Scan contact's received message for safety if it's NOT Mommy or Daddy (trusted parents)
          if (contactId !== '4' && contactId !== '5') {
            const replySafety = checkMessageSafety(replyText, false);
            if (replySafety) {
              setSafetyCategory(replySafety);
              setNaviSpeechVisible(true);
              // Increment Parent Insights toxic received count
              setToxicReceivedCount(prev => prev + 1);
              // Add incident to safety log
              const newAlert = {
                id: `alert_${Date.now()}`,
                time: 'Just Now',
                type: 'Received Message Flagged',
                contact: activeChat ? activeChat.name : 'Unknown',
                action: 'Navi Alerted'
              };
              setSafetyAlertsLog(prev => [newAlert, ...prev]);
            }
          }
        }, 1500);
      }
    }
  };

  // Handle message sending
  const sendMessage = () => {
    if (!inputText.trim() || !activeChat) return;

    const messageText = inputText.trim();

    // Check message safety BEFORE sending
    const safety = checkMessageSafety(messageText, true);

    // If it is unsafe, intercept and show Navi safety options
    if (safety) {
      setPendingText(messageText);
      setPendingImage(null);
      setSafetyCategory(safety);
      setNaviSpeechVisible(true);
      // Increment Parent Insights popup count
      setNaviPopupCount(prev => prev + 1);
      // Add incident to safety log
      const newAlert = {
        id: `alert_${Date.now()}`,
        time: 'Just Now',
        type: 'Sent Message Intercepted',
        contact: activeChat ? activeChat.name : 'Unknown',
        action: 'Pending Reconsideration'
      };
      setSafetyAlertsLog(prev => [newAlert, ...prev]);
      return; // Intercept: do not send yet
    }

    sendFinalTextMessage(messageText);
  };

  const triggerSimulationMessage = async (type) => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    setIsTyping(true);

    let replyText = await generateSimulatedMessage(activeChat.name, activeChat.bio, type);

    // Static fallback if model is unavailable
    if (!replyText) {
      if (type === 'good') {
        const staticGoodReplies = [
          "I had so much fun playing badminton with you today! 🏸",
          "That sounds awesome! Let's do it after school! 🌟",
          "Have you seen my new drawing? I can show you tomorrow! 🎨",
          "Let's play some video games after homework is done! 🎮"
        ];
        replyText = staticGoodReplies[Math.floor(Math.random() * staticGoodReplies.length)];
      } else {
        replyText = "Why do you always fail? 😡";
      }
    }

    setIsTyping(false);

    const replyId = `${contactId}_contact_${Date.now()}`;
    const replyMsg = {
      id: replyId,
      text: replyText,
      sender: 'contact',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), replyMsg]
    }));

    // Update profile card info (bring to top of list)
    setProfiles(prev => prev.map(p => 
      p.id === contactId 
        ? { ...p, time: replyMsg.time, lastUpdated: Date.now() } 
        : p
    ));

    // Scan contact's received message for safety if it's NOT Mommy or Daddy (trusted parents)
    if (contactId !== '4' && contactId !== '5') {
      const replySafety = checkMessageSafety(replyText, false);
      if (replySafety) {
        setSafetyCategory(replySafety);
        setNaviSpeechVisible(true);
        // Increment Parent Insights toxic received count
        setToxicReceivedCount(prev => prev + 1);
        // Add incident to safety log
        const newAlert = {
          id: `alert_${Date.now()}`,
          time: 'Just Now',
          type: 'Received Message Flagged',
          contact: activeChat ? activeChat.name : 'Unknown',
          action: 'Navi Alerted'
        };
        setSafetyAlertsLog(prev => [newAlert, ...prev]);
      }
    }
  };

  const animatedSpeechStyle = {
    opacity: naviAnim,
    transform: [
      {
        scale: naviAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1]
        })
      },
      {
        translateY: naviAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0]
        })
      }
    ]
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0FA" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {activeChat ? (
          /* Chat Window Screen */
          <View style={styles.container}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setActiveChat(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.chatHeaderProfile}
                onPress={() => setSelectedProfile(activeChat)}
                activeOpacity={0.7}
              >
                <Image source={activeChat.avatar} style={styles.chatHeaderAvatar} />
                <View style={styles.chatHeaderDetails}>
                  <Text style={styles.chatHeaderName}>{activeChat.name}</Text>
                  <Text style={styles.chatHeaderStatus}>
                    {activeChat.status === 'online' ? 'Online' : 
                     activeChat.status === 'away' ? 'Away' : 'Offline'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Top Right Calling Oval */}
              <View style={styles.chatHeaderCallingOval}>
                <TouchableOpacity 
                  style={styles.chatHeaderCallingBtn}
                  onPress={() => setActiveCall({ contactName: activeChat.name, type: 'video' })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chatHeaderCallingText}>📹</Text>
                </TouchableOpacity>
                <View style={styles.chatHeaderCallingDivider} />
                <TouchableOpacity 
                  style={styles.chatHeaderCallingBtn}
                  onPress={() => setActiveCall({ contactName: activeChat.name, type: 'voice' })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chatHeaderCallingText}>📞</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Simulation Controls Bar */}
            <View style={styles.simControlsBar}>
              <TouchableOpacity 
                style={[styles.simBtn, styles.simBtnGood]} 
                onPress={() => triggerSimulationMessage('good')}
                activeOpacity={0.7}
              >
                <Text style={styles.simBtnText}>😇 Good message</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.simBtn, styles.simBtnBad]} 
                onPress={() => triggerSimulationMessage('bad')}
                activeOpacity={0.7}
              >
                <Text style={styles.simBtnText}>😈 Bad message</Text>
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView 
              ref={chatScrollRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
            >
              {/* Center Date Separator Oval */}
              <View style={styles.dateSeparatorWrapper}>
                <View style={styles.dateSeparatorOval}>
                  <Text style={styles.dateSeparatorText}>Today</Text>
                </View>
              </View>

              {messages[activeChat.id]?.map((msg) => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.msgBubbleWrapper,
                    msg.sender === 'user' ? styles.msgSentWrapper : styles.msgReceivedWrapper
                  ]}
                >
                  <View 
                    style={[
                      styles.msgBubble,
                      msg.sender === 'user' ? styles.msgBubbleSent : styles.msgBubbleReceived
                    ]}
                  >
                    {msg.image && (
                      <Image 
                        source={{ uri: msg.image }} 
                        style={styles.msgImage} 
                        resizeMode="cover"
                      />
                    )}
                    {msg.text ? (
                      <Text style={[
                        styles.msgText,
                        msg.sender === 'user' ? styles.msgTextSent : styles.msgTextReceived
                      ]}>
                        {msg.text}
                      </Text>
                    ) : null}
                    <Text style={[
                      styles.msgTime,
                      msg.sender === 'user' ? styles.msgTimeSent : styles.msgTimeReceived
                    ]}>
                      {msg.time}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <View style={[styles.msgBubbleWrapper, styles.msgReceivedWrapper]}>
                  <View style={[styles.msgBubble, styles.msgBubbleReceived, styles.typingBubble]}>
                    <Text style={styles.typingText}>typing...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Chat Input Bar */}
            <View style={styles.inputBar}>
              <TouchableOpacity 
                style={styles.imageAttachBtn} 
                onPress={sendMockImagePrompt}
                activeOpacity={0.7}
                disabled={isAnalyzingImage}
              >
                {isAnalyzingImage ? (
                  <ActivityIndicator size="small" color="#4F46E5" />
                ) : (
                  <Text style={styles.imageAttachText}>📷</Text>
                )}
              </TouchableOpacity>
              
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#6F6D83"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
                onPress={sendMessage}
                disabled={!inputText.trim()}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
            {/* Navi Safety Buddy Floating Widget - Pops up only on mean/unsafe messages */}
            {safetyCategory !== null && (
              <View style={styles.naviContainer}>
                {/* Speech Bubble */}
                <Animated.View 
                  pointerEvents={naviSpeechVisible ? 'auto' : 'none'} 
                  style={[styles.naviSpeechBubble, animatedSpeechStyle]}
                >
                  {naviFeedbackMessage ? (
                    <>
                      <Text style={styles.naviSpeechTitle}>Success!</Text>
                      <Text style={styles.naviSpeechText}>{naviFeedbackMessage}</Text>
                    </>
                  ) : suggestionsVisible ? (
                    <>
                      <Text style={styles.naviSpeechTitle}>💬 Choose a reply:</Text>
                      {isGeneratingSuggestions ? (
                        <ActivityIndicator size="small" color="#1D4ED8" style={{ marginVertical: 8 }} />
                      ) : (
                        <>
                          {politeSuggestions.map((suggestion, idx) => (
                            <TouchableOpacity 
                              key={idx}
                              style={styles.naviOptionBtn}
                              onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                handleSelectPoliteSuggestion(suggestion);
                              }}
                            >
                              <Text style={styles.naviOptionText}>{suggestion}</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity 
                            style={[styles.naviOptionBtn, { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', marginTop: 4 }]}
                            onPress={() => {
                              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                              setNaviMascotImageState('serious');
                              setSuggestionsVisible(false);
                              setPoliteSuggestions([]);
                            }}
                          >
                            <Text style={[styles.naviOptionText, { color: '#4B5563' }]}>⬅️ Back</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.naviSpeechTitle}>
                        {pendingText || pendingImage ? "🛡️ Reconsider Choice" : "🛡️ Navi Safety Alert"}
                      </Text>
                      <Text style={styles.naviSpeechText}>
                        {pendingImage 
                          ? "This image looks mean. Reconsider sending?"
                          : pendingText 
                            ? "This message looks mean. Reconsider sending?"
                            : "That message looks mean. How should we reply?"}
                      </Text>
                      
                      {/* Safety Options */}
                      <TouchableOpacity 
                        style={styles.naviOptionBtn}
                        onPress={handleIgnoreAndSend}
                      >
                        <Text style={styles.naviOptionText}>
                          {pendingText || pendingImage ? "🔀 Send anyway" : "❌ Dismiss"}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.naviOptionBtn}
                        onPress={handleListenToSuggestions}
                      >
                        <Text style={styles.naviOptionText}>
                          {pendingText || pendingImage ? "💬 See suggestions" : "💬 Reply politely"}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.naviOptionBtn, styles.naviOptionBtnAlert]}
                        onPress={handleNaviTellAdult}
                      >
                        <Text style={[styles.naviOptionText, styles.naviOptionTextAlert]}>❤️ Tell an adult</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Navi Feedback Rating Widget */}
                  {naviFeedbackMessage && (
                    <View style={styles.naviRatingContainer}>
                      {naviRating === null ? (
                        <>
                          <Text style={styles.naviRatingText}>Rate Navi's advice:</Text>
                          <View style={styles.naviRatingRow}>
                            <TouchableOpacity 
                              style={styles.naviRatingBtn} 
                              onPress={() => {
                                setNaviRating('up');
                                Alert.alert("Thank you! 👍", "Navi is happy to help!");
                              }}
                            >
                              <Text style={styles.naviRatingIcon}>👍</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.naviRatingBtn} 
                              onPress={() => {
                                setNaviRating('down');
                                Alert.alert("Thank you! 👎", "Navi will try to learn and give better tips next time!");
                              }}
                            >
                              <Text style={styles.naviRatingIcon}>👎</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.naviRatingFeedback}>Thanks for rating! 🌟</Text>
                      )}
                    </View>
                  )}
                </Animated.View>

                {/* Navi Mascot Trigger Button */}
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: naviMascotAnim
                      },
                      {
                        translateY: naviMascotAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [100, 0]
                        })
                      }
                    ],
                    opacity: naviMascotAnim
                  }}
                >
                  <TouchableOpacity 
                    style={styles.naviTrigger}
                    onPress={() => setNaviSpeechVisible(prev => !prev)}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={naviMascotImageState === 'thumbs_up' ? require('./assets/navi_thumbs_up.png') : require('./assets/navi_serious.png')} 
                      style={styles.naviMascotImage} 
                    />
                    {/* Visual badge/notification on Navi */}
                    {!naviSpeechVisible && (
                      <View style={styles.naviAlertBadge}>
                        <Text style={styles.naviAlertText}>?</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
          </View>
        ) : (
          /* Main Tab Screen */
          <View style={styles.container}>
            {activeTab === 'chats' && (
              <>
                {/* Header */}
                <View style={styles.headerVertical}>
                  <View style={styles.headerTopRow}>
                    <TouchableOpacity 
                      style={styles.threeDotsButton}
                      onPress={() => setMenuVisible(prev => !prev)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.threeDotsText}>•••</Text>
                    </TouchableOpacity>
                    
                    {/* Top Right Action Circles */}
                    <View style={styles.headerTopRightActions}>
                      <TouchableOpacity 
                        style={styles.headerTopCircleBtn}
                        onPress={() => alert("Open camera to share a status update! 📷")}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.headerTopCircleText}>📷</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.headerTopCircleBtn}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setAddContactModalVisible(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.headerTopCircleText}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.headerBottomRow}>
                    <Text style={styles.headerTitle}>Chats</Text>
                  </View>
                </View>

                {/* Unified Top Controls Block (Smushed Together, White Background) */}
                <View style={styles.topControlsBlock}>
                  {/* Search Bar */}
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="🔍 Ask Navi something"
                      placeholderTextColor="#6F6D83"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                </View>

                {/* Profiles List */}
                <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map(profile => {
                      const isSelected = selectedChatIds.includes(profile.id);
                      return (
                        <TouchableOpacity
                          key={profile.id}
                          style={[
                            styles.profileCard,
                            selectModeActive && isSelected && styles.profileCardSelected
                          ]}
                          onPress={() => {
                            if (selectModeActive) {
                              toggleChatSelection(profile.id);
                            } else {
                              openChat(profile);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          {/* Checkbox circle when in select mode */}
                          {selectModeActive && (
                            <View style={[
                              styles.selectCheckbox,
                              isSelected && styles.selectCheckboxChecked
                            ]}>
                              {isSelected && <Text style={styles.selectCheckboxText}>✓</Text>}
                            </View>
                          )}

                          {/* Avatar without Status Ring */}
                          <View style={styles.avatarWrapper}>
                            <Image source={profile.avatar} style={styles.avatarImage} />
                          </View>

                          {/* Profile Details */}
                          <View style={styles.cardInfo}>
                            <View style={styles.cardHeader}>
                              <Text style={styles.profileName}>{profile.name}</Text>
                              <Text style={styles.timeText}>{profile.time}</Text>
                            </View>
                            <Text style={styles.profileRole}>{profile.role}</Text>
                            
                            {/* Show last message from state */}
                            <Text style={styles.lastMessageText} numberOfLines={1}>
                              {messages[profile.id]?.[messages[profile.id].length - 1]?.text || 'No messages yet'}
                            </Text>
                          </View>

                          {/* Unread Counter Badge */}
                          {profile.unread > 0 && (
                            <View style={styles.unreadBadge}>
                              <Text style={styles.unreadBadgeText}>{profile.unread}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No profiles found matching your search</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}



            {activeTab === 'dashboard' && renderDashboardScreen()}

            {activeTab === 'resources' && renderResourcesScreen()}

            {activeTab === 'safety' && renderSafetyScreen()}

            {activeTab === 'profile' && renderProfileScreen()}

            {/* Bottom Tab Bar */}
            {renderTabBar()}
          </View>
        )}

        {/* Profile Detail Modal */}
        <Modal
          visible={selectedProfile !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedProfile(null)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContainer,
                { transform: [{ translateY }] }
              ]}
            >
              {selectedProfile && (
                <>
                  {/* Floating Top Right Calling Oval */}
                  <View style={styles.modalCallingOval}>
                    <TouchableOpacity 
                      style={styles.modalCallingIconBtn}
                      onPress={() => setActiveCall({ contactName: selectedProfile.name, type: 'video' })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalCallingIconText}>📹</Text>
                    </TouchableOpacity>
                    <View style={styles.modalCallingDivider} />
                    <TouchableOpacity 
                      style={styles.modalCallingIconBtn}
                      onPress={() => setActiveCall({ contactName: selectedProfile.name, type: 'voice' })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalCallingIconText}>📞</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Top drag handle area triggers swipe down */}
                  <View 
                    style={styles.dragHandleArea} 
                    {...panResponder.panHandlers}
                  >
                    <View style={styles.modalDragHandle} />
                  </View>

                  <ScrollView style={styles.modalScroll}>
                    {/* Top profile header in Modal also responds to pan gestures */}
                    <View 
                      style={styles.modalProfileHeader}
                      {...panResponder.panHandlers}
                    >
                      <TouchableOpacity 
                        style={styles.modalAvatarWrapper}
                        onPress={() => setSelectedProfile(null)}
                        activeOpacity={0.8}
                      >
                        <Image source={selectedProfile.avatar} style={styles.modalAvatarImage} />
                      </TouchableOpacity>
                      <Text style={styles.modalName}>{selectedProfile.name}</Text>
                      <Text style={styles.modalRole}>{selectedProfile.role}</Text>
                      
                      <View style={styles.modalStatusTextWrapper}>
                        <Text style={styles.modalStatusText}>"{selectedProfile.statusText}"</Text>
                      </View>
                    </View>

                    {/* Bio Section */}
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionLabel}>About</Text>
                      <Text style={styles.sectionValue}>{selectedProfile.bio}</Text>
                    </View>

                    {/* Contact Info */}
                    <View style={styles.infoSection}>
                      <Text style={styles.sectionLabel}>Email</Text>
                      <Text style={styles.sectionValue}>{selectedProfile.email}</Text>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.sectionLabel}>Phone</Text>
                      <Text style={styles.sectionValue}>{selectedProfile.phone}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={styles.actionBtnPrimary} 
                        onPress={() => openChat(selectedProfile)}
                      >
                        <Text style={styles.actionBtnPrimaryText}>Send Message</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionBtnSecondary} 
                        onPress={() => setSelectedProfile(null)}
                      >
                        <Text style={styles.actionBtnSecondaryText}>Close Details</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              )}
            </Animated.View>
          </View>
        </Modal>

        {/* Mock Call Overlay */}
        <Modal
          visible={activeCall !== null}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setActiveCall(null)}
        >
          <View style={styles.callOverlay}>
            <View style={styles.callModalCard}>
              <Text style={styles.callMascotEmoji}>{activeCall?.type === 'video' ? '📹' : '📞'}</Text>
              <Text style={styles.callTitle}>
                {activeCall?.type === 'video' ? 'Video Calling...' : 'Calling...'}
              </Text>
              <Text style={styles.callContactName}>{activeCall?.contactName}</Text>
              <Text style={styles.callTimer}>Navi is securing this call 🛡️</Text>
              
              <TouchableOpacity 
                style={styles.callDeclineBtn}
                onPress={() => setActiveCall(null)}
              >
                <Text style={styles.callDeclineBtnText}>End Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Trusted Adult Modal Overlay */}
        <Modal
          visible={adultAlertVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setAdultAlertVisible(false)}
        >
          <View style={styles.adultAlertOverlay}>
            <View style={styles.adultAlertContainer}>
              <Text style={styles.adultAlertHeader}>❤️ Talk to a Trusted Adult</Text>
              <Text style={styles.adultAlertBody}>
                If someone says something online that makes you feel uncomfortable, worried, or sad, you should always tell an adult you trust (like Mom, Dad, a grandparent, or a teacher).
              </Text>
              <Text style={styles.adultAlertSub}>
                Would you like to send a quick message to Mommy or Daddy right now to check in?
              </Text>
              
              <View style={styles.adultAlertActions}>
                <TouchableOpacity 
                  style={styles.adultAlertBtnPrimary} 
                  onPress={messageMommyAction}
                >
                  <Text style={styles.adultAlertBtnPrimaryText}>Message Mommy 👩</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.adultAlertBtnPrimary, { backgroundColor: '#059669', marginVertical: 8 }]} 
                  onPress={messageDaddyAction}
                >
                  <Text style={styles.adultAlertBtnPrimaryText}>Message Daddy 👨</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.adultAlertBtnSecondary} 
                  onPress={() => setAdultAlertVisible(false)}
                >
                  <Text style={styles.adultAlertBtnSecondaryText}>Got it, close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Contact Modal */}
        <Modal
          visible={addContactModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAddContactModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { padding: 24 }]}>
              {/* Drag Handle to make it consistent with bottom sheet style */}
              <View style={styles.dragHandleArea}>
                <View style={styles.modalDragHandle} />
              </View>

              <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#1E3A8A', textAlign: 'center' }}>
                ➕ Add New Contact
              </Text>
              
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 }}>Name *</Text>
              <TextInput
                style={[styles.chatInput, { flex: 0, width: '100%', marginBottom: 16, marginRight: 0 }]}
                placeholder="Enter name (e.g. Alex)"
                placeholderTextColor="#6F6D83"
                value={newContactName}
                onChangeText={setNewContactName}
              />
              
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 }}>Role (e.g. Friend 👧, Brother 👦, Teacher 👩)</Text>
              <TextInput
                style={[styles.chatInput, { flex: 0, width: '100%', marginBottom: 16, marginRight: 0 }]}
                placeholder="Enter role (default: Friend 👧)"
                placeholderTextColor="#6F6D83"
                value={newContactRole}
                onChangeText={setNewContactRole}
              />

              <Text style={{ fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 }}>Bio (Personality profile for simulations)</Text>
              <TextInput
                style={[styles.chatInput, { flex: 0, width: '100%', marginBottom: 24, marginRight: 0 }]}
                placeholder="Enter bio (e.g. Loves video games and soccer! ⚽)"
                placeholderTextColor="#6F6D83"
                value={newContactBio}
                onChangeText={setNewContactBio}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <TouchableOpacity 
                  style={[styles.actionBtnSecondary, { flex: 1, height: 48 }]} 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setAddContactModalVisible(false);
                    setNewContactName('');
                    setNewContactRole('');
                    setNewContactBio('');
                  }}
                >
                  <Text style={styles.actionBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sendButton, { flex: 1, height: 48, backgroundColor: '#2563EB' }]} 
                  onPress={handleAddContact}
                >
                  <Text style={styles.sendButtonText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Menu Options Popover */}
        {menuVisible && (
          <TouchableOpacity 
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuDropdown}>
              {/* Select Chats Item */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleToggleSelectMode}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircleWrapper}>
                  <View style={styles.menuCircle}>
                    <Text style={styles.menuCheckMark}>✓</Text>
                  </View>
                </View>
                <Text style={styles.menuItemText}>Select chats</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.menuDivider} />

              {/* Read All Item */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleReadAll}
                activeOpacity={0.7}
              >
                <View style={styles.iconMessageWrapper}>
                  <View style={styles.customBubble}>
                    <View style={styles.customBubbleTail} />
                    <Text style={styles.customBubbleCheckMark}>✓</Text>
                  </View>
                </View>
                <Text style={styles.menuItemText}>Read all</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Select Mode Bottom Actions Bar */}
        {selectModeActive && (
          <View style={styles.selectActionsBar}>
            <Text style={styles.selectCountText}>
              {selectedChatIds.length} chat{selectedChatIds.length !== 1 ? 's' : ''} selected
            </Text>
            
            <View style={styles.selectActionsGroup}>
              <TouchableOpacity 
                style={[styles.selectActionBtn, selectedChatIds.length === 0 && styles.selectActionBtnDisabled]}
                onPress={handleMarkReadSelected}
                disabled={selectedChatIds.length === 0}
                activeOpacity={0.7}
              >
                <Text style={styles.selectActionBtnText}>Mark Read</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.selectActionBtn, styles.selectActionBtnDelete, selectedChatIds.length === 0 && styles.selectActionBtnDisabled]}
                onPress={handleDeleteSelected}
                disabled={selectedChatIds.length === 0}
                activeOpacity={0.7}
              >
                <Text style={styles.selectActionBtnTextDelete}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.selectActionBtnCancel}
                onPress={() => setSelectModeActive(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectActionBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F0FA',
    paddingTop: Platform.OS === 'ios' ? 47 : 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  unreadTotalBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadTotalText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  topControlsBlock: {
    backgroundColor: '#E6F0FA',
    paddingVertical: 10,
    marginTop: 0,
    marginBottom: 0,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 0,
    marginVertical: 0,
    color: '#0F172A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterRow: {
    paddingHorizontal: 24,
    height: 30,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  filterChipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  statusAway: {
    backgroundColor: '#F59E0B',
  },
  statusOffline: {
    backgroundColor: '#94A3B8',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  profileRole: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  lastMessageText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
  },
  /* Chat Header Styles */
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '600',
  },
  chatHeaderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E2E8F0',
  },
  chatHeaderDetails: {
    marginLeft: 12,
  },
  chatHeaderName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  chatHeaderStatus: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  /* Messages List Styles */
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  msgBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  msgSentWrapper: {
    justifyContent: 'flex-end',
  },
  msgReceivedWrapper: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  msgBubbleSent: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  msgBubbleReceived: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 20,
  },
  msgTextSent: {
    color: '#FFFFFF',
  },
  msgTextReceived: {
    color: '#0F172A',
  },
  typingText: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  msgTimeSent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  msgTimeReceived: {
    color: '#64748B',
  },
  /* Chat Input Bar Styles */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    zIndex: 10,
    elevation: 10,
  },
  chatInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 20,
    color: '#0F172A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  imageAttachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  imageAttachText: {
    fontSize: 18,
  },
  msgImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  archivedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 28,
    paddingVertical: 0,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  archivedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  archivedIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748B',
  },
  archivedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  archivedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  /* Modal Overlay Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    minHeight: '50%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dragHandleArea: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  modalProfileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalAvatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  modalAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
  },
  modalStatusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  modalName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalRole: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 4,
  },
  modalStatusTextWrapper: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalStatusText: {
    color: '#475569',
    fontSize: 14,
    fontStyle: 'italic',
  },
  infoSection: {
    marginTop: 20,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionValue: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 22,
  },
  modalActions: {
    marginTop: 30,
    marginBottom: 10,
    gap: 12,
  },
  actionBtnPrimary: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    backgroundColor: '#F1F5F9',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnSecondaryText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  // Navi Safety Buddy styling
  naviContainer: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 5,
  },
  naviTrigger: {
    width: 90,
    height: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  naviMascotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Show full head without cropping
  },
  naviAlertBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  naviAlertText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  naviSpeechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    width: 200,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  naviSpeechTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 6,
    textAlign: 'center',
  },
  naviSpeechText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 16,
  },
  naviOptionBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  naviOptionBtnAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  naviOptionText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
    textAlign: 'center',
  },
  naviOptionTextAlert: {
    color: '#DC2626',
  },
  naviRatingContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    alignItems: 'center',
  },
  naviRatingText: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  naviRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  naviRatingBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  naviRatingIcon: {
    fontSize: 14,
  },
  naviRatingFeedback: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 2,
  },

  // Simulation Controls Bar styles
  simControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  simBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  simBtnGood: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  simBtnBad: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  simBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },

  // Adult Alert Modal styles
  adultAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  adultAlertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  adultAlertHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  adultAlertBody: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  adultAlertSub: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  adultAlertActions: {
    width: '100%',
    gap: 10,
  },
  adultAlertBtnPrimary: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  adultAlertBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  adultAlertBtnSecondary: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adultAlertBtnSecondaryText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  // Three-dots and Menu styles
  headerVertical: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 0,
    marginBottom: 0,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threeDotsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTopRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTopCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTopCircleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  threeDotsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: -1,
    marginTop: -2,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  menuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 65 : 55,
    left: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 170,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 6,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  // Icon designs
  iconCircleWrapper: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCheckMark: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '800',
    marginTop: -1,
  },
  iconMessageWrapper: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  menuBubbleIcon: {
    fontSize: 16,
  },
  menuBubbleCheck: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '900',
    color: '#10B981',
    top: 7,
    left: 7,
  },
  customBubble: {
    width: 18,
    height: 14,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: -2,
  },
  customBubbleTail: {
    position: 'absolute',
    bottom: -3,
    left: 2,
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderTopColor: '#3B82F6',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderRightWidth: 3,
    borderRightColor: 'transparent',
  },
  customBubbleCheckMark: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: -1,
  },
  // Select mode card selection
  profileCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  selectCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectCheckboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  selectCheckboxText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  // Bottom select actions bar
  selectActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  selectCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  selectActionsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  selectActionBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectActionBtnDisabled: {
    opacity: 0.5,
  },
  selectActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
  selectActionBtnDelete: {
    backgroundColor: '#FEF2F2',
  },
  selectActionBtnTextDelete: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  selectActionBtnCancel: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectActionBtnTextCancel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  // Tab Bar styles
  tabContentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 20,
    left: 20,
    right: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    marginHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: '#EFF6FF',
  },
  tabIcon: {
    fontSize: 20,
    color: '#94A3B8',
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#3B82F6',
  },
  
  // Safety tips styles
  safetyHeaderBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  safetyHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  safetyIntroCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  safetyIntroMascot: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  safetyIntroTextWrapper: {
    flex: 1,
  },
  safetyIntroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  safetyIntroBody: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  safetyCardEmoji: {
    fontSize: 28,
  },
  safetyCardContent: {
    flex: 1,
  },
  safetyCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  safetyCardBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },

  // Profile styles
  profileAvatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  profileAvatarBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 36,
  },
  profileSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 12,
  },
  progressBarBg: {
    width: '80%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  profileSectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  badgeCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.6,
  },
  badgeEmojiLocked: {
    fontSize: 24,
    color: '#94A3B8',
    marginBottom: 12,
  },
  badgeTitleLocked: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  badgeDescLocked: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Updates Screen styles
  updatesSectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statusScrollRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingVertical: 4,
  },
  myStatusCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  myStatusAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  statusAvatarText: {
    fontSize: 24,
  },
  statusAddBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: -1,
  },
  statusLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  statusCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  statusAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  channelBadgeBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelBadgeText: {
    fontSize: 20,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  channelUpdateText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  channelFollowBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  channelFollowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Calls Screen styles
  callRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  callAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  callStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  callActionBtn: {
    backgroundColor: '#ECFDF5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callActionBtnIcon: {
    fontSize: 16,
    color: '#10B981',
  },

  // Communities Screen styles
  communityIntroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  communityIntroEmoji: {
    fontSize: 32,
  },
  communityIntroText: {
    flex: 1,
  },
  communityIntroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  communityIntroDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  communityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  communityBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityBadgeEmoji: {
    fontSize: 20,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  communitySubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  communityJoinBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  communityJoinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },

  // Profile Safety Link styles
  profileSafetyLinkCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  profileSafetyLinkIcon: {
    fontSize: 28,
  },
  profileSafetyLinkText: {
    flex: 1,
  },
  profileSafetyLinkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  profileSafetyLinkDesc: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  profileSafetyLinkArrow: {
    fontSize: 18,
    fontWeight: '950',
    color: '#3B82F6',
  },
  safetyHeaderBackBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safetyHeaderBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  // Active Chat Header Calling Oval
  chatHeaderCallingOval: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginLeft: 12,
  },
  chatHeaderCallingBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderCallingText: {
    fontSize: 14,
  },
  chatHeaderCallingDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  // Date Separator styles
  dateSeparatorWrapper: {
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  dateSeparatorOval: {
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateSeparatorText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Profile Modal Calling Oval
  modalCallingOval: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    zIndex: 100,
  },
  modalCallingIconBtn: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCallingIconText: {
    fontSize: 16,
  },
  modalCallingDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  // Call Overlay styles
  callOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  callModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  callMascotEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  callTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  callContactName: {
    fontSize: 24,
    fontWeight: '950',
    color: '#0F172A',
    marginBottom: 8,
  },
  callTimer: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
    marginBottom: 32,
  },
  callDeclineBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 24,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  callDeclineBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '850',
  },
  // Resources Screen Styles
  resourceIntroCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  resourceIntroEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  resourceIntroText: {
    flex: 1,
  },
  resourceIntroTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: '#312E81',
    marginBottom: 4,
  },
  resourceIntroDesc: {
    fontSize: 12,
    color: '#4F46E5',
    lineHeight: 16,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  checkTextWrapper: {
    flex: 1,
  },
  checkItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  checkItemDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
  },
  resourceCardEmoji: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  resourceCardContent: {
    flex: 1,
  },
  resourceCardTitle: {
    fontSize: 14,
    fontWeight: '850',
    color: '#0F172A',
    marginBottom: 4,
  },
  resourceCardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  resourceCallBtn: {
    backgroundColor: '#3B82F6',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceCallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  resourceRowBtns: {
    flexDirection: 'row',
  },
  // Settings Screen Styles
  settingsMiniProfile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingsAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginRight: 16,
  },
  settingsAvatarText: {
    fontSize: 24,
  },
  settingsProfileInfo: {
    flex: 1,
  },
  settingsProfileName: {
    fontSize: 16,
    fontWeight: '850',
    color: '#0F172A',
    marginBottom: 2,
  },
  settingsProfileDesc: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  settingsListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingsRowEmojiBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsRowEmoji: {
    fontSize: 18,
  },
  settingsRowContent: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingsRowDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  settingsRowArrow: {
    fontSize: 16,
    color: '#CBD5E1',
    fontWeight: '750',
    marginLeft: 8,
  },
  // Parent Dashboard Styles
  parentLockWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#E6F0FA',
  },
  parentLockIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  parentLockTitle: {
    fontSize: 22,
    fontWeight: '850',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  parentLockDesc: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  parentPinInput: {
    width: '80%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: 8,
  },
  parentUnlockBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  parentUnlockBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  parentPinHint: {
    marginTop: 16,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  parentLockBadge: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  parentLockBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  safetyOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  safetyScoreWrapper: {
    alignItems: 'center',
    marginRight: 16,
  },
  safetyScoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  safetyScoreNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  safetyScoreLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
  },
  safetyOverviewText: {
    flex: 1,
  },
  safetyOverviewTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: '#0F172A',
    marginBottom: 4,
  },
  safetyOverviewDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyLogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyLogText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  alertLogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  alertLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  alertLogHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  alertLogEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  alertLogTitle: {
    fontSize: 13,
    fontWeight: '850',
    color: '#0F172A',
  },
  alertLogTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  alertBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  alertBadgeBypass: {
    backgroundColor: '#FEF2F2',
  },
  alertBadgeListen: {
    backgroundColor: '#ECFDF5',
  },
  alertBadgeAdult: {
    backgroundColor: '#EFF6FF',
  },
  alertBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  alertBadgeTextBypass: {
    color: '#EF4444',
  },
  alertBadgeTextListen: {
    color: '#10B981',
  },
  alertBadgeTextAdult: {
    color: '#3B82F6',
  },
  alertLogBody: {
    marginTop: 2,
  },
  alertContactText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  alertMessageText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 18,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  singleMetricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  singleMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricSeparator: {
    width: 1.5,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  choiceBox: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  choiceBoxBypass: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderTopColor: '#EF4444',
    borderTopWidth: 4,
  },
  choiceBoxListen: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderTopColor: '#10B981',
    borderTopWidth: 4,
  },
  choiceBoxAlert: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderTopColor: '#3B82F6',
    borderTopWidth: 4,
  },
  choiceNum: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    marginTop: 4,
  },
  choiceTextBypass: {
    color: '#EF4444',
  },
  choiceTextListen: {
    color: '#10B981',
  },
  choiceTextAlert: {
    color: '#3B82F6',
  },
  choiceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  statsValueHighlight: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsSubDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 4,
  },
  categoryItem: {
    width: '100%',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 10,
    marginBottom: 10,
  },
  chartBarItem: {
    alignItems: 'center',
    width: 32,
  },
  chartBarFill: {
    width: 12,
    borderRadius: 6,
  },
  chartBarDay: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 6,
  },
});
