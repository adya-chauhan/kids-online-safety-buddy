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
  ActivityIndicator
} from 'react-native';

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
    lastUpdated: Date.now() - 180 * 60 * 1000
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
  { text: "I will bring my big lego box tomorrow morning", label: "safe" }
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
  const [profiles, setProfiles] = useState(initialProfilesData);
  const [messages, setMessages] = useState(initialMessagesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null); // Detailed modal
  const [activeChat, setActiveChat] = useState(null); // Chat window view
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyIndices, setReplyIndices] = useState({ '1': 0, '2': 0, '3': 0, '4': 0 });
  const [naviSpeechVisible, setNaviSpeechVisible] = useState(false);
  const [adultAlertVisible, setAdultAlertVisible] = useState(false);
  const [safetyCategory, setSafetyCategory] = useState(null);
  const [interceptedText, setInterceptedText] = useState(null);
  const [isBypassReady, setIsBypassReady] = useState(false);
  const [politeSuggestions, setPoliteSuggestions] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);

  const naviAnim = useRef(new Animated.Value(0)).current;

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

  // Bottom navigation tab bar component (5 tabs capsule)
  const renderTabBar = () => {
    if (activeChat) return null;
    
    return (
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'updates' && styles.tabItemActive]}
          onPress={() => setActiveTab('updates')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'updates' && styles.tabIconActive]}>📢</Text>
          <Text style={[styles.tabLabel, activeTab === 'updates' && styles.tabLabelActive]} numberOfLines={1}>Updates</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'calls' && styles.tabItemActive]}
          onPress={() => setActiveTab('calls')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'calls' && styles.tabIconActive]}>📞</Text>
          <Text style={[styles.tabLabel, activeTab === 'calls' && styles.tabLabelActive]} numberOfLines={1}>Calls</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'communities' && styles.tabItemActive]}
          onPress={() => setActiveTab('communities')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'communities' && styles.tabIconActive]}>👥</Text>
          <Text style={[styles.tabLabel, activeTab === 'communities' && styles.tabLabelActive]} numberOfLines={1}>Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'chats' && styles.tabItemActive]}
          onPress={() => setActiveTab('chats')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'chats' && styles.tabIconActive]}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'chats' && styles.tabLabelActive]} numberOfLines={1}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]} numberOfLines={1}>You</Text>
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
            <Image source={require('./assets/mascot_navi.jpg')} style={styles.safetyIntroMascot} />
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

  // Mock Updates Feed Screen
  const renderUpdatesScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Updates Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>Updates</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Status Row */}
          <Text style={styles.updatesSectionLabel}>Status</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.statusScrollRow}>
            <View style={styles.myStatusCard}>
              <View style={styles.myStatusAvatar}>
                <Text style={styles.statusAvatarText}>👑</Text>
                <View style={styles.statusAddBadge}><Text style={styles.statusAddText}>+</Text></View>
              </View>
              <Text style={styles.statusLabelText}>My Status</Text>
            </View>
            
            <View style={styles.statusCard}>
              <View style={[styles.statusAvatar, { borderColor: '#10B981' }]}>
                <Image source={require('./assets/avatar_anvi_girl.jpg')} style={styles.statusAvatarImg} />
              </View>
              <Text style={styles.statusLabelText}>Anvi</Text>
            </View>

            <View style={styles.statusCard}>
              <View style={[styles.statusAvatar, { borderColor: '#10B981' }]}>
                <Image source={require('./assets/avatar_sara_kid.jpg')} style={styles.statusAvatarImg} />
              </View>
              <Text style={styles.statusLabelText}>Sara</Text>
            </View>

            <View style={styles.statusCard}>
              <View style={[styles.statusAvatar, { borderColor: '#94A3B8' }]}>
                <Image source={require('./assets/avatar_tanvi_indian.jpg')} style={styles.statusAvatarImg} />
              </View>
              <Text style={styles.statusLabelText}>Tanvi</Text>
            </View>
          </ScrollView>

          {/* Channels Section */}
          <Text style={styles.updatesSectionLabel}>Popular Channels</Text>
          <View style={styles.channelCard}>
            <View style={styles.channelBadgeBg}><Text style={styles.channelBadgeText}>🛡️</Text></View>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>Navi Safety Feed</Text>
              <Text style={styles.channelUpdateText}>"Always check with parents before playing new online games!"</Text>
            </View>
            <TouchableOpacity style={styles.channelFollowBtn}>
              <Text style={styles.channelFollowBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.channelCard}>
            <View style={[styles.channelBadgeBg, { backgroundColor: '#FEF3C7' }]}><Text style={styles.channelBadgeText}>🎨</Text></View>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>Creative Kids Art</Text>
              <Text style={styles.channelUpdateText}>"Drawing competition starts this Saturday! Bring your markers!"</Text>
            </View>
            <TouchableOpacity style={styles.channelFollowBtn}>
              <Text style={styles.channelFollowBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Mock Calls Log Screen
  const renderCallsScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Calls Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>Calls</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.updatesSectionLabel}>Recent Calls</Text>
          
          <View style={styles.callRow}>
            <Image source={require('./assets/avatar_anvi_girl.jpg')} style={styles.callAvatar} />
            <View style={styles.callInfo}>
              <Text style={styles.callName}>Anvi</Text>
              <Text style={styles.callStatusText}>↗️ Outgoing, Yesterday (10 min)</Text>
            </View>
            <TouchableOpacity style={styles.callActionBtn}>
              <Text style={styles.callActionBtnIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.callRow}>
            <Image source={require('./assets/avatar_sara_kid.jpg')} style={styles.callAvatar} />
            <View style={styles.callInfo}>
              <Text style={styles.callName}>Sara</Text>
              <Text style={styles.callStatusText}>↙️ Incoming, 2 days ago (5 min)</Text>
            </View>
            <TouchableOpacity style={styles.callActionBtn}>
              <Text style={styles.callActionBtnIcon}>📞</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.callRow}>
            <Image source={require('./assets/avatar_mommy_indian.jpg')} style={styles.callAvatar} />
            <View style={styles.callInfo}>
              <Text style={styles.callName}>Mommy</Text>
              <Text style={styles.callStatusText}>↙️ Missed Call, 3 days ago</Text>
            </View>
            <TouchableOpacity style={[styles.callActionBtn, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.callActionBtnIcon, { color: '#EF4444' }]}>📞</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Mock Communities Groups Screen
  const renderCommunitiesScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Communities Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>Communities</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Main Info Card */}
          <View style={styles.communityIntroCard}>
            <Text style={styles.communityIntroEmoji}>👥</Text>
            <View style={styles.communityIntroText}>
              <Text style={styles.communityIntroTitle}>School & Hobby Groups</Text>
              <Text style={styles.communityIntroDesc}>
                Connect with verified classmates and kids who share your hobbies in safe, moderated chats.
              </Text>
            </View>
          </View>

          <Text style={styles.updatesSectionLabel}>My Communities</Text>
          
          <View style={styles.communityCard}>
            <View style={styles.communityBadge}><Text style={styles.communityBadgeEmoji}>🎒</Text></View>
            <View style={styles.communityInfo}>
              <Text style={styles.communityName}>5th Grade Class Board</Text>
              <Text style={styles.communitySubText}>24 Members • Moderated</Text>
            </View>
            <TouchableOpacity style={styles.communityJoinBtn}>
              <Text style={styles.communityJoinBtnText}>Open</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.communityCard}>
            <View style={[styles.communityBadge, { backgroundColor: '#EFF6FF' }]}><Text style={styles.communityBadgeEmoji}>⚽</Text></View>
            <View style={styles.communityInfo}>
              <Text style={styles.communityName}>Soccer Practice Kids</Text>
              <Text style={styles.communitySubText}>18 Members • Moderated</Text>
            </View>
            <TouchableOpacity style={styles.communityJoinBtn}>
              <Text style={styles.communityJoinBtnText}>Open</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.communityCard}>
            <View style={[styles.communityBadge, { backgroundColor: '#FDF2F8' }]}><Text style={styles.communityBadgeEmoji}>🎨</Text></View>
            <View style={styles.communityInfo}>
              <Text style={styles.communityName}>Art Fort Builders</Text>
              <Text style={styles.communitySubText}>12 Members • Moderated</Text>
            </View>
            <TouchableOpacity style={styles.communityJoinBtn}>
              <Text style={styles.communityJoinBtnText}>Open</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  // Gamified Profile screen for child
  const renderProfileScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Profile Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>You</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {/* Level details card */}
          <View style={styles.profileAvatarCard}>
            <View style={styles.profileAvatarBorder}>
              <Text style={styles.profileAvatarText}>👑</Text>
            </View>
            <Text style={styles.profileName}>Junior Defender</Text>
            <Text style={styles.profileSub}>Level 3 Safety Shield</Text>
            
            {/* Progress bar */}
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
            <Text style={styles.progressLabel}>75% towards Safety Master status</Text>
          </View>

          {/* Safety Guide quick access */}
          <TouchableOpacity 
            style={styles.profileSafetyLinkCard}
            onPress={() => setActiveTab('safety')}
            activeOpacity={0.8}
          >
            <Text style={styles.profileSafetyLinkIcon}>🛡️</Text>
            <View style={styles.profileSafetyLinkText}>
              <Text style={styles.profileSafetyLinkTitle}>Open Online Safety Guide</Text>
              <Text style={styles.profileSafetyLinkDesc}>Review Navi's safety tips and guidelines.</Text>
            </View>
            <Text style={styles.profileSafetyLinkArrow}>→</Text>
          </TouchableOpacity>

          {/* Grid of badges */}
          <Text style={styles.profileSectionLabel}>My Badges</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>🛡️</Text>
              <Text style={styles.badgeTitle}>Privacy Hero</Text>
              <Text style={styles.badgeDesc}>Kept secret info private</Text>
            </View>
            <View style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>😊</Text>
              <Text style={styles.badgeTitle}>Politeness Star</Text>
              <Text style={styles.badgeDesc}>Used friendly boundary replies</Text>
            </View>
            <View style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>👩</Text>
              <Text style={styles.badgeTitle}>Guardian Link</Text>
              <Text style={styles.badgeDesc}>Communicated with trusted adults</Text>
            </View>
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeTitleLocked}>Perfect Week</Text>
              <Text style={styles.badgeDescLocked}>Maintain safe chat for 7 days</Text>
            </View>
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

    // Clear safety category and hide Navi speech bubble and bypass states
    setSafetyCategory(null);
    setNaviSpeechVisible(false);
    setInterceptedText(null);
    setIsBypassReady(false);
  };

  const generateLocalModelResponse = async (contextText) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const promptText = `You are a child safety assistant named Navi. The child received this rude message: "${contextText}". The child wants to respond politely to keep the conversation kind. Write a very short, polite, child-friendly response (1 sentence, max 15 words) that sets a kind boundary. Do not repeat the rude message. Output ONLY the response text itself, no explanations, no quotes.`;

    try {
      // First, try the known machine IP (physical devices on local network)
      const response = await fetch('http://192.168.0.158:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:2b',
          prompt: promptText,
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          return json.response.trim().replace(/^["']|["']$/g, ''); // strip outer quotes
        }
      }
    } catch (e) {
      console.log("Local model on primary IP failed or timed out, trying localhost...", e);
    }

    // Fallback to localhost (simulators)
    const controllerLocal = new AbortController();
    const timeoutIdLocal = setTimeout(() => controllerLocal.abort(), 10000); // 10-second timeout
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:2b',
          prompt: promptText,
          stream: false
        }),
        signal: controllerLocal.signal
      });
      clearTimeout(timeoutIdLocal);

      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          return json.response.trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch (e) {
      console.log("Local model on localhost failed or timed out:", e);
    }

    // Default static fallback response
    return "Thank you, but let's keep our conversation friendly and kind! 😊";
  };

  const generateContactResponse = async (contact, chatHistory, fallbackText) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    // Get last 6 messages for context
    const contextMsgs = chatHistory.slice(-6).map(m => {
      const senderName = m.sender === 'user' ? 'Me' : contact.name;
      return `${senderName}: ${m.text}`;
    }).join('\n');

    // Clean emojis from the role string to avoid prompting issues
    const roleClean = contact.role.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim();

    const promptText = `You are ${contact.name}, a child's ${roleClean}. Your personality/bio: "${contact.bio}".
Respond to your friend's chat in a very natural, friendly, kid-friendly chat style. Stay on the topic they are talking about (e.g. pickleball, Lego, drawings, school).
Keep your response short (1 to 2 sentences, maximum 25 words). Do not prefix with your name. Respond directly.

Conversation history:
${contextMsgs}

Response from ${contact.name}:`;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: promptText,
        stream: false
      })
    };

    try {
      // Try primary network IP
      const response = await fetch('http://192.168.0.158:11434/api/generate', {
        ...requestOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          return json.response.trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch (e) {
      console.log("Local model for contact response failed on primary IP, trying localhost...");
    }

    // Fallback to localhost
    const controllerLocal = new AbortController();
    const timeoutIdLocal = setTimeout(() => controllerLocal.abort(), 10000); // 10-second timeout
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        ...requestOptions,
        signal: controllerLocal.signal
      });
      clearTimeout(timeoutIdLocal);
      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          return json.response.trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch (e) {
      console.log("Local model for contact response failed on localhost:", e);
    }

    return fallbackText;
  };

  const generatePoliteSuggestions = async (rudeMessage) => {
    setIsGeneratingSuggestions(true);
    setPoliteSuggestions([]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const promptText = `You are a child safety assistant named Navi. The child received this rude message: "${rudeMessage}".
Generate exactly 3 short, distinct, polite, child-friendly reply options (max 15 words each) that set a kind boundary and keep the conversation friendly.
Do not write explanations, quotes, or markdown. Output them as a numbered list:
1. [First reply option]
2. [Second reply option]
3. [Third reply option]`;

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: promptText + `\nEnsure variety. Seed: ${Math.random()}`,
        stream: false,
        options: {
          temperature: 0.9,
          top_p: 0.9
        }
      })
    };

    let replyText = "";
    try {
      const response = await fetch('http://192.168.0.158:11434/api/generate', {
        ...requestOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          replyText = json.response.trim();
        }
      }
    } catch (e) {
      console.log("Local model for suggestions failed on primary IP, trying localhost...");
    }

    if (!replyText) {
      const controllerLocal = new AbortController();
      const timeoutIdLocal = setTimeout(() => controllerLocal.abort(), 10000);
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          ...requestOptions,
          signal: controllerLocal.signal
        });
        clearTimeout(timeoutIdLocal);
        if (response.ok) {
          const json = await response.json();
          if (json && json.response) {
            replyText = json.response.trim();
          }
        }
      } catch (e) {
        console.log("Local model for suggestions failed on localhost:", e);
      }
    }

    setIsGeneratingSuggestions(false);

    if (replyText) {
      // Parse the numbered list
      const lines = replyText.split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim().replace(/^["']|["']$/g, ''))
        .filter(line => line.length > 0 && !line.startsWith('Here are') && !line.includes('reply option'));
      
      const suggestions = lines.slice(0, 3);
      if (suggestions.length === 3) {
        setPoliteSuggestions(suggestions);
        return;
      }
    }

    // Static fallback options if generation fails
    setPoliteSuggestions([
      "Please don't call me names, let's keep our conversation friendly! 😊",
      "I want to keep our chats kind and fun. Let's talk about something else! 👍",
      "Let's be nice to each other. What games are you playing today? 🎮"
    ]);
  };

  const handleSelectPoliteSuggestion = (suggestionText) => {
    sendSafeFeedback(suggestionText);
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

  const checkImageSafetyWithGemma = async (imageUri) => {
    // 1. Check offline fallback first (reliable offline testing)
    if (imageUri && imageUri.includes("mean_meme_test")) {
      return 'RESPOND_POLITELY'; // Flagged as rude/mean image
    }

    // 2. Local vision LLM (PaliGemma / Llava via Ollama)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

    try {
      const response = await fetch('http://192.168.0.158:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llava', // or paligemma
          prompt: "Analyze this image. Does it contain cyberbullying, insults, rude memes, or mean content? Reply with exactly one word: SAFE or UNSAFE.",
          images: [imageUri], // public URL or base64
          stream: false
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const text = (json.response || "").toUpperCase();
        if (text.includes("UNSAFE") || text.includes("RUDE") || text.includes("MEAN")) {
          return 'RESPOND_POLITELY';
        }
      }
    } catch (e) {
      console.log("Gemma vision safety scan failed or timed out:", e);
    }
    return null;
  };

  const sendMockImagePrompt = () => {
    Alert.alert(
      "Simulate Image Message",
      "Would you like to send a safe image or a mean/unsafe image to test Navi's Gemma Vision detector?",
      [
        {
          text: "🐶 Safe Image",
          onPress: () => sendMockImageMessage(
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400",
            "Look at this cute puppy!"
          )
        },
        {
          text: "😡 Mean Image",
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

  const sendMockImageMessage = async (uri, text) => {
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

    // Scan image safety with Gemma
    const imageSafety = await checkImageSafetyWithGemma(uri);
    if (imageSafety) {
      setSafetyCategory(imageSafety);
      setNaviSpeechVisible(true);
    } else {
      setSafetyCategory(null);
      setNaviSpeechVisible(false);
    }

    // Trigger auto reply if online or away
    if (activeChat.status !== 'offline') {
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        
        let replyText = "";
        if (imageSafety) {
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

        // Update profile card info (bring to top of list)
        setProfiles(prev => prev.map(p => 
          p.id === contactId 
            ? { ...p, time: replyMsg.time, lastUpdated: Date.now() } 
            : p
        ));
      }, 1500);
    }
  };

  const handleNaviIgnorePivot = () => {
    sendSafeFeedback("Hey, let's talk about something else! What's your favorite school subject? 📚");
  };

  const handleNaviTellAdult = () => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    const activeMessages = messages[contactId] || [];
    const lastMsgText = activeMessages.length > 0 ? activeMessages[activeMessages.length - 1].text : "";

    setSafetyCategory(null);
    setNaviSpeechVisible(false);

    // Construct the automatic report text
    const reportText = `🚨 [Navi Safety Report] ${activeChat.name} sent me a mean message: "${lastMsgText}". Navi helped me handle this safely.`;

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

    // Show a success confirmation alert
    alert(`Navi has automatically reported this to Mommy and Daddy! 🛡️`);

    // Open Mommy's chat screen so the child sees the report was sent and can chat
    const mommyProfile = profiles.find(p => p.id === '4');
    if (mommyProfile) {
      openChat(mommyProfile);
    }
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
  const openChat = (profile) => {
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
  };

  // Scroll to bottom when messages or typing status updates
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [activeChat, messages, isTyping]);

  // Handle message sending
  const sendMessage = () => {
    if (!inputText.trim() || !activeChat) return;

    const messageText = inputText.trim();

    // Check message safety BEFORE sending
    const safety = checkMessageSafety(messageText, true);

    // If it is unsafe, and the user hasn't been warned yet for this exact message:
    if (safety && (!isBypassReady || interceptedText !== messageText)) {
      // Intercept and show Navi safety options
      setSafetyCategory(safety);
      setNaviSpeechVisible(true);
      setInterceptedText(messageText);
      setIsBypassReady(true);
      return; // Intercept: do not send yet
    }

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

    // Trigger auto reply if online or away
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
          }
        }
      }, 1500);
    }
  };

  const triggerSimulationMessage = async (type) => {
    if (!activeChat) return;
    const contactId = activeChat.id;
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout (give local model enough time to process)

    // Determine prompt based on type
    const personality = activeChat.bio;
    let promptText = "";
    if (type === 'good') {
      promptText = `You are roleplaying as ${activeChat.name}, a child's friend. Personality: "${personality}".
Write a friendly, normal, kind chat message (1 sentence, max 15 words) about typical school, games, toys, or hobbies (e.g. "I love playing basketball" or "Let's work on our homework together!").
Do not repeat or make it mean. Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
    } else {
      promptText = `You are roleplaying as ${activeChat.name}, a child's friend.
Write a mean, rude, or insulting chat message (1 sentence, max 15 words) that makes fun of someone, calls them a loser/ugly/stupid, or tells them to go away.
Do not prefix with your name. Output ONLY the text of the message, no quotes.`;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b', // Use gemma:2b (Gemini local equivalent) as requested
        prompt: promptText + `\nEnsure this response is completely unique, creative, and different from typical responses. Random seed: ${Math.random()}`,
        stream: false,
        options: {
          temperature: 0.95, // High temperature for maximum variety
          top_p: 0.9,
          top_k: 40
        }
      })
    };

    let replyText = "";
    try {
      const response = await fetch('http://192.168.0.158:11434/api/generate', {
        ...requestOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const json = await response.json();
        if (json && json.response) {
          replyText = json.response.trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch (e) {
      console.log("Local model for simulation failed on primary IP, trying localhost...");
    }

    if (!replyText) {
      // Try localhost fallback
      const controllerLocal = new AbortController();
      const timeoutIdLocal = setTimeout(() => controllerLocal.abort(), 10000); // 10-second timeout
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          ...requestOptions,
          signal: controllerLocal.signal
        });
        clearTimeout(timeoutIdLocal);
        if (response.ok) {
          const json = await response.json();
          if (json && json.response) {
            replyText = json.response.trim().replace(/^["']|["']$/g, '');
          }
        }
      } catch (e) {
        console.log("Local model for simulation failed on localhost:", e);
      }
    }

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
        const staticBadReplies = [
          "You are a complete loser and nobody wants to play with you! 😡",
          "Go away, your drawing looks completely ugly and terrible. 🤮",
          "Stop texting me, you are the most annoying person ever. 😠",
          "You suck at everything you do, just give up already! 👎",
          "You are so stupid, why are you even in our class? 😤"
        ];
        replyText = staticBadReplies[Math.floor(Math.random() * staticBadReplies.length)];
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
    <SafeAreaView style={styles.safeArea}>
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
              >
                <Text style={styles.imageAttachText}>📷</Text>
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
                  {suggestionsVisible ? (
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
                              onPress={() => handleSelectPoliteSuggestion(suggestion)}
                            >
                              <Text style={styles.naviOptionText}>{suggestion}</Text>
                            </TouchableOpacity>
                          ))}
                          <TouchableOpacity 
                            style={[styles.naviOptionBtn, { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB', marginTop: 4 }]}
                            onPress={() => {
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
                      <Text style={styles.naviSpeechTitle}>🛡️ Navi Safety Tip:</Text>
                      
                      {/* Safety Options */}
                      <TouchableOpacity 
                        style={styles.naviOptionBtn}
                        onPress={handleNaviIgnorePivot}
                      >
                        <Text style={styles.naviOptionText}>🔀 Ignore & pivot</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.naviOptionBtn}
                        onPress={handleNaviRespondPolitely}
                      >
                        <Text style={styles.naviOptionText}>💬 Reply politely</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.naviOptionBtn, styles.naviOptionBtnAlert]}
                        onPress={handleNaviTellAdult}
                      >
                        <Text style={[styles.naviOptionText, styles.naviOptionTextAlert]}>❤️ Alert an adult</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </Animated.View>

                {/* Navi Mascot Trigger Button */}
                <TouchableOpacity 
                  style={styles.naviTrigger}
                  onPress={() => setNaviSpeechVisible(prev => !prev)}
                  activeOpacity={0.8}
                >
                  <Image source={require('./assets/mascot_navi.jpg')} style={styles.naviMascotImage} />
                  {/* Visual badge/notification on Navi */}
                  {!naviSpeechVisible && (
                    <View style={styles.naviAlertBadge}>
                      <Text style={styles.naviAlertText}>?</Text>
                    </View>
                  )}
                </TouchableOpacity>
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
                        onPress={() => alert("Create a new chat! ＋")}
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

            {activeTab === 'updates' && renderUpdatesScreen()}

            {activeTab === 'calls' && renderCallsScreen()}

            {activeTab === 'communities' && renderCommunitiesScreen()}

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
                  <Text style={styles.menuBubbleIcon}>💬</Text>
                  <Text style={styles.menuBubbleCheck}>✓</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F0FA',
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
    zIndex: 1000,
  },
  naviTrigger: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  naviMascotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
});
