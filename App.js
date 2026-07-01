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
  PanResponder
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
    bio: 'Loves playing with toys, drawing rainbows, and eating ice cream! 🍦'
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
    bio: 'Loves building Lego castles, playing video games, and soccer.'
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
    bio: 'Loves reading storybooks, playing badminton, and dancing. 💃'
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
    bio: "Always looking out for you. Loves gardening, cooking delicious meals, and checking in on how you're doing."
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
  ]
};

// Auto replies templates
const autoReplies = {
  '1': [
    "Look at the drawing of a unicorn I made! It has wings and a golden horn! 🦄",
    "I want chocolate! Can you ask Mommy if we can get ice cream later? 🍦",
    "Let's play tag! You're it! No tag-backs! 🏃‍♀️",
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
    "Can we play Minecraft later? I want to build a giant castle with a lava moat! 🏰",
    "Where is my blue Lego piece? I need it to finish my big spaceship! 🚀",
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
    "Do you want to play badminton in the park after school today? 🏸",
    "I learned a new dance routine in my class today! It's so fast! 💃",
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
  ]
};

// Client-side Offline Safety Scanner for kids safety buddy Navi
const checkMessageSafety = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  
  // High risk / Tell Adult triggers (cyberbullying, dangerous requests)
  const tellAdultKeywords = [
    "meet up", "come over", "alone", "don't tell", "secret place", 
    "meet me", "where are you", "what is your address", "hurt", 
    "kill", "die", "stupid loser", "ugly jerk", "hate you"
  ];
  for (const kw of tellAdultKeywords) {
    if (lower.includes(kw)) {
      return 'TELL_ADULT';
    }
  }

  // Medium risk / Private Info / Ignore & Pivot triggers
  const ignorePivotKeywords = [
    "phone", "number", "address", "where do you live", "secret", 
    "password", "email", "school name"
  ];
  for (const kw of ignorePivotKeywords) {
    if (lower.includes(kw)) {
      return 'IGNORE_PIVOT';
    }
  }

  // General Mean / Rude words / Respond Politely triggers
  const respondPolitelyKeywords = [
    "hate", "stupid", "dumb", "ugly", "shut up", "loser", 
    "jerk", "weirdo", "smelly", "bad", "mean", "fool", "fat"
  ];
  for (const kw of respondPolitelyKeywords) {
    if (lower.includes(kw)) {
      return 'RESPOND_POLITELY';
    }
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
  
  // Custom Menu & Chat Selection state
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectModeActive, setSelectModeActive] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'safety', 'profile'
  
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

  // Bottom navigation tab bar component
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
          <Text style={[styles.tabLabel, activeTab === 'chats' && styles.tabLabelActive]}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'safety' && styles.tabItemActive]}
          onPress={() => setActiveTab('safety')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'safety' && styles.tabIconActive]}>🛡️</Text>
          <Text style={[styles.tabLabel, activeTab === 'safety' && styles.tabLabelActive]}>Safety Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>My Profile</Text>
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
            <View style={styles.safetyHeaderBadge}>
              <Text style={styles.safetyHeaderBadgeText}>🛡️ Safety Center</Text>
            </View>
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

  // Gamified Profile screen for child
  const renderProfileScreen = () => {
    return (
      <View style={styles.tabContentContainer}>
        {/* Profile Header */}
        <View style={styles.headerVertical}>
          <View style={styles.headerBottomRow}>
            <Text style={styles.headerTitle}>My Profile</Text>
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

    // Clear safety category and hide Navi speech bubble
    setSafetyCategory(null);
    setNaviSpeechVisible(false);
  };

  const handleNaviRespondPolitely = () => {
    sendSafeFeedback("Thank you, but let's keep our conversation friendly and kind! 😊");
  };

  const handleNaviIgnorePivot = () => {
    sendSafeFeedback("Hey, let's talk about something else! What's your favorite school subject? 📚");
  };

  const handleNaviTellAdult = () => {
    setNaviSpeechVisible(false);
    setAdultAlertVisible(true);
  };

  const messageMommyAction = () => {
    setAdultAlertVisible(false);
    const mommyProfile = profiles.find(p => p.id === '4');
    if (mommyProfile) {
      openChat(mommyProfile);
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

  // Filter profiles based on search
  const filteredProfiles = profiles.filter(profile => 
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Clear unread count when opening a chat
  const openChat = (profile) => {
    setActiveChat(profile);
    setSelectedProfile(null);
    setNaviSpeechVisible(false);
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

    setInputText('');

    // Scan user's sent message for mean/unsafe content AFTER it is sent
    const safety = checkMessageSafety(messageText);
    if (safety) {
      setSafetyCategory(safety);
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
        const userMsgSafety = checkMessageSafety(messageText);

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
          // If the child was kind, send a normal friendly reply from the sequential pool
          const contactReplies = autoReplies[contactId] || ["Received! 👍"];
          const currentIdx = replyIndices[contactId] || 0;
          replyText = contactReplies[currentIdx % contactReplies.length];
          
          // Increment reply index
          setReplyIndices(prev => ({
            ...prev,
            [contactId]: (prev[contactId] || 0) + 1
          }));
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

        // Scan contact's received message for safety (in case it contains an unsafe prompt trigger, 
        // though our boundary replies are pre-moderated and safe)
        const replySafety = checkMessageSafety(replyText);
        if (replySafety) {
          setSafetyCategory(replySafety);
          setNaviSpeechVisible(true);
        }
      }, 1500);
    }
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
            </View>

            {/* Chat Messages */}
            <ScrollView 
              ref={chatScrollRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
            >
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
                    <Text style={[
                      styles.msgText,
                      msg.sender === 'user' ? styles.msgTextSent : styles.msgTextReceived
                    ]}>
                      {msg.text}
                    </Text>
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
                {naviSpeechVisible && (
                  <View style={styles.naviSpeechBubble}>
                    <Text style={styles.naviSpeechTitle}>🛡️ Navi Safety Tip:</Text>
                    <Text style={styles.naviSpeechText}>
                      How would you like to handle this message to stay safe and kind?
                    </Text>
                    
                    {/* Safety Options */}
                    <TouchableOpacity 
                      style={styles.naviOptionBtn}
                      onPress={handleNaviRespondPolitely}
                    >
                      <Text style={styles.naviOptionText}>💬 Respond politely</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.naviOptionBtn}
                      onPress={handleNaviIgnorePivot}
                    >
                      <Text style={styles.naviOptionText}>🔀 Ignore & Pivot</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.naviOptionBtn, styles.naviOptionBtnAlert]}
                      onPress={handleNaviTellAdult}
                    >
                      <Text style={[styles.naviOptionText, styles.naviOptionTextAlert]}>❤️ Tell a trusted adult</Text>
                    </TouchableOpacity>
                  </View>
                )}

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
                  </View>
                  
                  <View style={styles.headerBottomRow}>
                    <Text style={styles.headerTitle}>Chats</Text>
                    <View style={styles.unreadTotalBadge}>
                      <Text style={styles.unreadTotalText}>
                        {profiles.reduce((acc, curr) => acc + curr.unread, 0)} New
                      </Text>
                    </View>
                  </View>
                </View>

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

                          {/* Avatar with Status Ring */}
                          <View style={styles.avatarWrapper}>
                            <Image source={profile.avatar} style={styles.avatarImage} />
                            <View style={[
                              styles.statusDot,
                              profile.status === 'online' ? styles.statusOnline :
                              profile.status === 'away' ? styles.statusAway : styles.statusOffline
                            ]} />
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
                        <View style={[
                          styles.modalStatusDot,
                          selectedProfile.status === 'online' ? styles.statusOnline :
                          selectedProfile.status === 'away' ? styles.statusAway : selectedProfile.statusOffline
                        ]} />
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
                Would you like to send a quick message to Mommy right now to check in?
              </Text>
              
              <View style={styles.adultAlertActions}>
                <TouchableOpacity 
                  style={styles.adultAlertBtnPrimary} 
                  onPress={messageMommyAction}
                >
                  <Text style={styles.adultAlertBtnPrimaryText}>Message Mommy 👩</Text>
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 18,
    color: '#0F172A',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 30,
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
    borderRadius: 20,
    padding: 16,
    width: 260,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  naviSpeechTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  naviSpeechText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  naviOptionBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  naviOptionBtnAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  naviOptionText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  naviOptionTextAlert: {
    color: '#DC2626',
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
    paddingBottom: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
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
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabItemActive: {
    backgroundColor: '#F8FAFC',
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
});
