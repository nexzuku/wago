import mongoose from 'mongoose';
import config from '../config/env.js';
import { Topic, Phrase, Company, User, TrainingSession, Content, AuditLog, VoiceSample, CultureContent, LearningPath, Scenario } from '../models/index.js';

const seedData = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Create global topics
    const topicsData = [
      {
        name: 'Business Greetings',
        slug: 'business-greetings',
        description: 'Essential greetings for professional settings',
        icon: '👋',
        color: '#3B82F6',
        difficulty: 'beginner',
        category: 'greetings'
      },
      {
        name: 'Meeting Phrases',
        slug: 'meeting-phrases',
        description: 'Common phrases used in business meetings',
        icon: '🤝',
        color: '#10B981',
        difficulty: 'intermediate',
        category: 'business'
      },
      {
        name: 'Safety & Emergency',
        slug: 'safety-emergency',
        description: 'Critical safety and emergency phrases',
        icon: '🚨',
        color: '#EF4444',
        difficulty: 'beginner',
        category: 'emergency'
      },
      {
        name: 'Daily Workplace',
        slug: 'daily-workplace',
        description: 'Everyday phrases for the workplace',
        icon: '🏢',
        color: '#8B5CF6',
        difficulty: 'beginner',
        category: 'daily'
      },
      {
        name: 'Technical Terms',
        slug: 'technical-terms',
        description: 'Industry-specific technical vocabulary',
        icon: '⚙️',
        color: '#F59E0B',
        difficulty: 'advanced',
        category: 'technical'
      }
    ];

    const createdTopics = [];

    for (const topicData of topicsData) {
      let topic = await Topic.findOne({ slug: topicData.slug, companyId: null });
      if (!topic) {
        topic = await Topic.create({ ...topicData, companyId: null });
        console.log(`Created topic: ${topic.name}`);

        // Add sample phrases for each topic
        const phrases = getSamplePhrases(topicData.slug);
        for (const phraseData of phrases) {
          await Phrase.create({
            ...phraseData,
            topicId: topic._id,
            companyId: null,
            difficulty: topicData.difficulty
          });
        }
        console.log(`Added ${phrases.length} phrases to ${topic.name}`);
      }
      createdTopics.push(topic);
    }

    // Seed Demo Data (Company, User, Activity, Content, Logs, Voice)
    await seedDemoData(createdTopics);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

const seedDemoData = async (globalTopics) => {
  console.log('Seeding demo data...');

  // 1. Create Demo Company
  let company = await Company.findOne({ slug: 'demo-corp' });
  if (!company) {
    company = await Company.create({
      name: 'Demo Corp',
      slug: 'demo-corp',
      contactEmail: 'admin@demo.com',
      industry: 'Technology',
      address: '123 Tech Valley, Tokyo',
      introduction: 'Leading innovation in AI technology.',
      subscription: {
        plan: 'enterprise',
        employeeLimit: 100,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      voiceProfile: {
        fishAudioVoiceId: 'sample_voice_id_123',
        accent: 'tokyo',
        status: 'ready',
        uploadedAt: new Date(),
        qualityScore: 95
      }
    });
    console.log('Created Demo Company: Demo Corp');
  }

  // 2. Create Demo User (Manager)
  const demoEmail = 'demo@example.com';
  let user = await User.findOne({ email: demoEmail, companyId: company._id });

  if (!user) {
    user = new User({
      companyId: company._id,
      email: demoEmail,
      role: 'manager',
      profile: {
        firstName: 'Demo',
        lastName: 'Manager',
        department: 'Sales',
        position: 'Team Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      },
      status: 'active',
      assignedTopics: globalTopics.map(t => t._id),
      stars: 350,
      badges: ['first_steps', 'week_streak', 'quick_learner', 'early_bird'],
      progress: {
        totalPhrasesPracticed: 245,
        totalTimeMinutes: 450,
        currentStreak: 5,
        longestStreak: 12,
        lastActiveAt: new Date(),
        skills: {
          fluency: 78,
          pronunciation: 82,
          grammar: 75,
          pitch: 70
        }
      }
    });
    await user.setPassword('password123');
    await user.save();
    console.log('Created Demo User: demo@example.com / password123');
  }

  // 3. Create Additional Employees (Team Members)
  const employees = [
    { email: 'sarah@example.com', name: 'Sarah Jones', role: 'employee' },
    { email: 'mike@example.com', name: 'Mike Smith', role: 'employee' },
    { email: 'kenji@example.com', name: 'Kenji Sato', role: 'employee' }
  ];

  for (const emp of employees) {
    let empUser = await User.findOne({ email: emp.email, companyId: company._id });
    if (!empUser) {
      empUser = new User({
        companyId: company._id,
        email: emp.email,
        role: emp.role,
        profile: {
          firstName: emp.name.split(' ')[0],
          lastName: emp.name.split(' ')[1],
          department: 'Sales',
          position: 'Sales Associate',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`
        },
        status: 'active',
        assignedTopics: globalTopics.slice(0, 3).map(t => t._id),
        progress: {
          totalPhrasesPracticed: Math.floor(Math.random() * 100),
          totalTimeMinutes: Math.floor(Math.random() * 200),
          currentStreak: Math.floor(Math.random() * 3),
          lastActiveAt: new Date()
        }
      });
      await empUser.setPassword('password123');
      await empUser.save();
      console.log(`Created Employee: ${emp.email}`);
    }
  }

  // 4. Create Training Sessions (Activity History for Demo User)
  const existingSessions = await TrainingSession.countDocuments({ userId: user._id });

  if (existingSessions === 0) {
    const sessions = [];
    const now = new Date();

    // Generate 10 random sessions over the last 14 days
    for (let i = 0; i < 10; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() - daysAgo);

      const randomTopic = globalTopics[Math.floor(Math.random() * globalTopics.length)];
      const modes = ['listen_repeat', 'test', 'free_talk'];
      const mode = modes[Math.floor(Math.random() * modes.length)];

      const duration = 5 + Math.floor(Math.random() * 20); // 5-25 minutes
      const score = 60 + Math.floor(Math.random() * 40); // 60-100 score

      sessions.push({
        userId: user._id,
        companyId: company._id,
        topicId: randomTopic._id,
        mode: mode,
        startedAt: sessionDate,
        endedAt: new Date(sessionDate.getTime() + duration * 60000),
        durationMinutes: duration,
        phrasesAttempted: 5 + Math.floor(Math.random() * 10),
        phrasesCorrect: 3 + Math.floor(Math.random() * 5),
        averageScore: score,
        isCompleted: true,
        attempts: []
      });
    }

    sessions.sort((a, b) => a.startedAt - b.startedAt);
    await TrainingSession.insertMany(sessions);
    console.log(`Created ${sessions.length} training sessions for demo user`);
  }

  // 5. Create Sample Content
  const existingContent = await Content.countDocuments({ companyId: company._id });
  if (existingContent === 0) {
    await Content.create([
      {
        companyId: company._id,
        title: 'Q1 Sales Strategy',
        description: 'Overview of our sales approach for the Japanese market.',
        type: 'pdf',
        fileUrl: 'https://example.com/q1-strategy.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024 * 2, // 2MB
        topicIds: [globalTopics[0]._id],
        uploadedBy: user._id,
        views: 12,
        completions: 5
      },
      {
        companyId: company._id,
        title: 'Greeting Etiquette Video',
        description: 'Proper bowing angles and greeting sequences.',
        type: 'video',
        fileUrl: 'https://example.com/greetings.mp4',
        thumbnailUrl: 'https://example.com/greetings-thumb.jpg',
        mimeType: 'video/mp4',
        size: 1024 * 1024 * 50, // 50MB
        topicIds: [globalTopics[0]._id],
        uploadedBy: user._id,
        views: 45,
        completions: 32,
        avgTimeSpent: 180
      }
    ]);
    console.log('Created sample content items');
  }

  // 6. Create Recent Audit Logs
  const existingLogs = await AuditLog.countDocuments({ companyId: company._id });
  if (existingLogs === 0) {
    await AuditLog.create([
      {
        companyId: company._id,
        userId: user._id,
        action: 'login',
        resource: 'user',
        resourceId: user._id,
        details: { method: 'password' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        companyId: company._id,
        userId: user._id,
        action: 'create',
        resource: 'content',
        details: { title: 'Q1 Sales Strategy' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        companyId: company._id,
        userId: user._id,
        action: 'update',
        resource: 'settings',
        details: { theme: 'dark' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...'
      }
    ]);
    console.log('Created sample audit logs');
  }

  // 7. Create Sample Voice Uploads
  const existingVoices = await VoiceSample.countDocuments({ companyId: company._id });
  if (existingVoices === 0) {
    await VoiceSample.create({
      companyId: company._id,
      filename: 'ceo-voice-sample.wav',
      originalName: 'CEO_Greeting.wav',
      mimeType: 'audio/wav',
      size: 1024 * 500, // 500KB
      url: 'https://example.com/voice-samples/ceo.wav',
      duration: 45,
      status: 'analyzed',
      qualityScore: 92,
      uploadedBy: user._id,
      analysisResult: {
        clarity: 95,
        noise: 5,
        volume: 88
      }
    });
    console.log('Created sample voice upload');
  }

  // 8. Create Culture Content
  const existingCulture = await CultureContent.countDocuments();
  if (existingCulture === 0) {
    await CultureContent.create([
      {
        companyId: null,
        title: 'Bowing (お辞儀 - Ojigi)',
        subtitle: 'Essential Japanese greeting',
        icon: '🙇',
        contentType: 'types',
        types: [
          { label: '15° - Casual', description: 'Eshaku (会釈) - Greeting coworkers' },
          { label: '30° - Respect', description: 'Keirei (敬礼) - Meeting clients or your boss' },
          { label: '45° - Deep', description: 'Saikeirei (最敬礼) - Apologies or deep gratitude' }
        ],
        sortOrder: 1,
        isActive: true
      },
      {
        companyId: null,
        title: 'Business Cards (名刺 - Meishi)',
        subtitle: 'Proper exchange etiquette',
        icon: '💳',
        contentType: 'rules',
        rules: [
          { text: 'Present with both hands', isPositive: true },
          { text: 'Text facing recipient', isPositive: true },
          { text: 'Receive with both hands', isPositive: true },
          { text: 'Study the card before putting away', isPositive: true },
          { text: "Never write on someone's card", isPositive: false }
        ],
        sortOrder: 2,
        isActive: true
      },
      {
        companyId: null,
        title: 'Meeting Etiquette (会議マナー)',
        subtitle: 'Professional behavior in meetings',
        icon: '🤝',
        contentType: 'rules',
        rules: [
          { text: 'Arrive 5 minutes early', isPositive: true },
          { text: 'Let seniors speak first', isPositive: true },
          { text: 'Take notes during meeting', isPositive: true },
          { text: 'Say "失礼します" when entering/leaving', isPositive: true },
          { text: "Don't interrupt or argue directly", isPositive: false }
        ],
        sortOrder: 3,
        isActive: true
      },
      {
        companyId: null,
        title: 'Communication Style (コミュニケーション)',
        subtitle: 'Indirect & respectful communication',
        icon: '💬',
        contentType: 'tips',
        tips: [
          { bad: '"No" directly', good: '"ちょっと難しいですね" (It\'s a bit difficult)' },
          { bad: '"I disagree"', good: '"別の考え方もあります" (There\'s another way to think about it)' },
          { bad: '"You are wrong"', good: '"少し違うかもしれません" (It might be a little different)' }
        ],
        sortOrder: 4,
        isActive: true
      },
      {
        companyId: null,
        title: 'Punctuality (時間厳守)',
        subtitle: 'Time is sacred in Japan',
        icon: '⏰',
        contentType: 'rules',
        rules: [
          { text: 'Being late is very disrespectful', isPositive: false },
          { text: 'Arrive 5-10 minutes early always', isPositive: true },
          { text: 'Notify immediately if delayed', isPositive: true },
          { text: 'Apologize profusely if late', isPositive: true }
        ],
        sortOrder: 5,
        isActive: true
      },
      {
        companyId: null,
        title: 'Dining Etiquette (食事マナー)',
        subtitle: 'Workplace meals & nomikai',
        icon: '🍜',
        contentType: 'rules',
        rules: [
          { text: 'Say "いただきます" before eating', isPositive: true },
          { text: 'Say "ごちそうさまでした" after eating', isPositive: true },
          { text: 'Wait for the senior person to start', isPositive: true },
          { text: 'Pour drinks for others, not yourself', isPositive: true },
          { text: 'Never stick chopsticks upright in rice', isPositive: false }
        ],
        sortOrder: 6,
        isActive: true
      }
    ]);
    console.log('Created 6 culture content items');
  }

  // 9. Create Learning Paths
  const existingPaths = await LearningPath.countDocuments();
  if (existingPaths === 0) {
    const beginnerTopics = globalTopics.filter(t => t.difficulty === 'beginner').map(t => t._id);
    const intermediateTopics = globalTopics.filter(t => t.difficulty === 'intermediate').map(t => t._id);
    const advancedTopics = globalTopics.filter(t => t.difficulty === 'advanced').map(t => t._id);

    const beginnerPath = await LearningPath.create({
      companyId: null,
      level: 'beginner',
      levelLabel: '初級 Beginner',
      title: 'Foundation Path',
      description: 'Build your Japanese foundation with essential greetings, daily phrases, and safety vocabulary.',
      duration: '4 weeks • 40 phrases • 10 cultural lessons',
      modules: [
        { name: 'Module 1: Greetings & Self-Introduction', topicIds: beginnerTopics.slice(0, 1), sortOrder: 1 },
        { name: 'Module 2: Basic Workplace Phrases', topicIds: beginnerTopics.slice(1, 2), sortOrder: 2 },
        { name: 'Module 3: Safety & Emergency', topicIds: beginnerTopics.slice(2, 3), sortOrder: 3 },
        { name: 'Module 4: Daily Operations', topicIds: beginnerTopics.length > 3 ? beginnerTopics.slice(3, 4) : beginnerTopics.slice(0, 1), sortOrder: 4 }
      ],
      sortOrder: 1,
      isActive: true
    });

    const intermediatePath = await LearningPath.create({
      companyId: null,
      level: 'intermediate',
      levelLabel: '中級 Intermediate',
      title: 'Workplace Integration',
      description: 'Advance your skills with business communication, meeting phrases, and customer interaction.',
      duration: '6 weeks • 60 phrases • 15 cultural lessons',
      modules: [
        { name: 'Module 1: Business Communication', topicIds: intermediateTopics.slice(0, 1), sortOrder: 1 },
        { name: 'Module 2: Meeting & Reporting', topicIds: intermediateTopics.slice(1, 2) || intermediateTopics.slice(0, 1), sortOrder: 2 },
        { name: 'Module 3: Customer Interaction', topicIds: intermediateTopics.length > 0 ? intermediateTopics.slice(0, 1) : beginnerTopics.slice(0, 1), sortOrder: 3 }
      ],
      prerequisitePathId: beginnerPath._id,
      sortOrder: 2,
      isActive: true
    });

    await LearningPath.create({
      companyId: null,
      level: 'advanced',
      levelLabel: '上級 Advanced',
      title: 'Professional Mastery',
      description: 'Master professional Japanese with leadership communication, negotiation, and team management.',
      duration: '8 weeks • 80 phrases • 20 cultural lessons',
      modules: [
        { name: 'Module 1: Leadership Communication', topicIds: advancedTopics.slice(0, 1), sortOrder: 1 },
        { name: 'Module 2: Negotiation & Problem Solving', topicIds: advancedTopics.length > 1 ? advancedTopics.slice(1, 2) : advancedTopics.slice(0, 1), sortOrder: 2 },
        { name: 'Module 3: Team Management', topicIds: advancedTopics.length > 0 ? advancedTopics.slice(0, 1) : intermediateTopics.slice(0, 1), sortOrder: 3 }
      ],
      prerequisitePathId: intermediatePath._id,
      sortOrder: 3,
      isActive: true
    });

    console.log('Created 3 learning paths (beginner → intermediate → advanced)');
  }

  // 10. Create Scenarios
  const existingScenarios = await Scenario.countDocuments();
  if (existingScenarios === 0) {
    const topicMap = {};
    for (const t of globalTopics) {
      topicMap[t.slug || t.category] = t._id;
    }

    const dailyTopicIds = globalTopics.filter(t => ['daily', 'greetings'].includes(t.category)).map(t => t._id);
    const safetyTopicIds = globalTopics.filter(t => ['safety', 'emergency'].includes(t.category)).map(t => t._id);
    const businessTopicIds = globalTopics.filter(t => ['business'].includes(t.category)).map(t => t._id);
    const technicalTopicIds = globalTopics.filter(t => ['technical'].includes(t.category)).map(t => t._id);

    const s1 = await Scenario.create({
      companyId: null,
      title: 'Morning Meeting',
      description: 'Practice greetings and daily report phrases used in morning meetings.',
      icon: '🏢',
      category: 'daily',
      categoryLabel: 'Daily Operations',
      difficulty: 'beginner',
      duration: '10 min',
      topicIds: dailyTopicIds.length > 0 ? dailyTopicIds : [globalTopics[0]._id],
      sortOrder: 1,
      isActive: true
    });

    const s2 = await Scenario.create({
      companyId: null,
      title: 'Lunch Break Conversation',
      description: 'Casual talk with coworkers during break time.',
      icon: '🏢',
      category: 'daily',
      categoryLabel: 'Daily Operations',
      difficulty: 'beginner',
      duration: '8 min',
      topicIds: dailyTopicIds.length > 0 ? dailyTopicIds : [globalTopics[0]._id],
      sortOrder: 2,
      isActive: true
    });

    await Scenario.create({
      companyId: null,
      title: 'End of Day Report',
      description: 'Reporting progress and saying goodbye to colleagues.',
      icon: '🏢',
      category: 'daily',
      categoryLabel: 'Daily Operations',
      difficulty: 'intermediate',
      duration: '12 min',
      topicIds: dailyTopicIds.length > 0 ? dailyTopicIds : [globalTopics[0]._id],
      prerequisiteScenarioId: s2._id,
      sortOrder: 3,
      isActive: true
    });

    const s4 = await Scenario.create({
      companyId: null,
      title: 'Safety Briefing',
      description: 'Understanding safety instructions in Japanese.',
      icon: '⚠️',
      category: 'safety',
      categoryLabel: 'Safety & Emergency',
      difficulty: 'intermediate',
      duration: '15 min',
      topicIds: safetyTopicIds.length > 0 ? safetyTopicIds : [globalTopics[0]._id],
      sortOrder: 1,
      isActive: true
    });

    await Scenario.create({
      companyId: null,
      title: 'Reporting an Incident',
      description: 'How to report workplace incidents in Japanese.',
      icon: '⚠️',
      category: 'safety',
      categoryLabel: 'Safety & Emergency',
      difficulty: 'intermediate',
      duration: '12 min',
      topicIds: safetyTopicIds.length > 0 ? safetyTopicIds : [globalTopics[0]._id],
      prerequisiteScenarioId: s4._id,
      sortOrder: 2,
      isActive: true
    });

    await Scenario.create({
      companyId: null,
      title: 'First Aid Communication',
      description: 'Emergency medical phrases for workplace first aid.',
      icon: '⚠️',
      category: 'safety',
      categoryLabel: 'Safety & Emergency',
      difficulty: 'beginner',
      duration: '10 min',
      topicIds: safetyTopicIds.length > 0 ? safetyTopicIds : [globalTopics[0]._id],
      sortOrder: 3,
      isActive: true
    });

    const s7 = await Scenario.create({
      companyId: null,
      title: 'Welcoming Visitors',
      description: 'Greeting and guiding clients at the office.',
      icon: '🤝',
      category: 'client',
      categoryLabel: 'Client Interaction',
      difficulty: 'intermediate',
      duration: '12 min',
      topicIds: businessTopicIds.length > 0 ? businessTopicIds : [globalTopics[0]._id],
      prerequisiteScenarioId: s1._id,
      sortOrder: 1,
      isActive: true
    });

    await Scenario.create({
      companyId: null,
      title: 'Phone Etiquette',
      description: 'Answering and making business calls in Japanese.',
      icon: '🤝',
      category: 'client',
      categoryLabel: 'Client Interaction',
      difficulty: 'advanced',
      duration: '15 min',
      topicIds: businessTopicIds.length > 0 ? businessTopicIds : [globalTopics[0]._id],
      prerequisiteScenarioId: s7._id,
      sortOrder: 2,
      isActive: true
    });

    const s9 = await Scenario.create({
      companyId: null,
      title: 'Tool & Equipment Names',
      description: 'Learn names of common workplace tools in Japanese.',
      icon: '🔧',
      category: 'technical',
      categoryLabel: 'Technical Communication',
      difficulty: 'beginner',
      duration: '10 min',
      topicIds: technicalTopicIds.length > 0 ? technicalTopicIds : [globalTopics[0]._id],
      sortOrder: 1,
      isActive: true
    });

    await Scenario.create({
      companyId: null,
      title: 'Giving Instructions',
      description: 'How to give and receive work instructions in Japanese.',
      icon: '🔧',
      category: 'technical',
      categoryLabel: 'Technical Communication',
      difficulty: 'advanced',
      duration: '18 min',
      topicIds: technicalTopicIds.length > 0 ? technicalTopicIds : [globalTopics[0]._id],
      prerequisiteScenarioId: s9._id,
      sortOrder: 2,
      isActive: true
    });

    console.log('Created 10 scenarios across 4 categories');
  }
};

function getSamplePhrases(topicSlug) {
  const phrases = {
    'business-greetings': [
      { japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', english: 'Good morning (formal)', usageContext: 'Use before 10 AM with colleagues and superiors' },
      { japanese: 'こんにちは', romaji: 'Konnichiwa', english: 'Good afternoon / Hello', usageContext: 'Use during daytime hours' },
      { japanese: 'お疲れ様です', romaji: 'Otsukaresama desu', english: 'Thank you for your hard work', usageContext: 'Common greeting between colleagues, especially at end of day' },
      { japanese: 'よろしくお願いします', romaji: 'Yoroshiku onegaishimasu', english: 'Please take care of this / Nice to meet you', usageContext: 'Use when meeting someone or asking for help' },
      { japanese: '失礼します', romaji: 'Shitsurei shimasu', english: 'Excuse me (formal)', usageContext: 'Use when entering/leaving a room or before doing something' },
      { japanese: 'お世話になっております', romaji: 'Osewa ni natte orimasu', english: 'Thank you for your continued support', usageContext: 'Standard business greeting in emails and calls' },
      { japanese: 'はじめまして', romaji: 'Hajimemashite', english: 'Nice to meet you (first time)', usageContext: 'Use when meeting someone for the first time' },
      { japanese: 'お元気ですか', romaji: 'Ogenki desu ka', english: 'How are you?', usageContext: 'Asking about someone\'s well-being' },
      { japanese: 'いらっしゃいませ', romaji: 'Irasshaimase', english: 'Welcome (to our establishment)', usageContext: 'Greeting customers or visitors' }
    ],
    'meeting-phrases': [
      { japanese: '会議を始めましょう', romaji: 'Kaigi wo hajimemashou', english: "Let's begin the meeting", usageContext: 'Opening phrase for meetings' },
      { japanese: 'ご質問はありますか', romaji: 'Go-shitsumon wa arimasu ka', english: 'Do you have any questions?', usageContext: 'Use to invite questions' },
      { japanese: '確認させてください', romaji: 'Kakunin sasete kudasai', english: 'Let me confirm', usageContext: 'Use when verifying information' },
      { japanese: 'それについて説明します', romaji: 'Sore ni tsuite setsumei shimasu', english: 'I will explain about that', usageContext: 'Use when providing explanations' },
      { japanese: '次の議題に移りましょう', romaji: 'Tsugi no gidai ni utsurimashou', english: "Let's move to the next topic", usageContext: 'Use to transition in meetings' }
    ],
    'safety-emergency': [
      { japanese: '助けてください', romaji: 'Tasukete kudasai', english: 'Please help me', usageContext: 'Emergency call for help', isEmergency: true, emergencyCategory: 'help' },
      { japanese: '危険です', romaji: 'Kiken desu', english: "It's dangerous", usageContext: 'Warning about danger', isEmergency: true, emergencyCategory: 'safety' },
      { japanese: '救急車を呼んでください', romaji: 'Kyuukyuusha wo yonde kudasai', english: 'Please call an ambulance', usageContext: 'Medical emergency', isEmergency: true, emergencyCategory: 'medical' },
      { japanese: '火事です', romaji: 'Kaji desu', english: "There's a fire", usageContext: 'Fire emergency', isEmergency: true, emergencyCategory: 'safety' },
      { japanese: '大丈夫ですか', romaji: 'Daijoubu desu ka', english: 'Are you okay?', usageContext: 'Checking on someone', isEmergency: true, emergencyCategory: 'help' }
    ],
    'daily-workplace': [
      { japanese: 'お先に失礼します', romaji: 'Osaki ni shitsurei shimasu', english: 'Excuse me for leaving before you', usageContext: 'Say when leaving work before others' },
      { japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu', english: 'Thank you (formal)', usageContext: 'General expression of gratitude' },
      { japanese: 'すみません', romaji: 'Sumimasen', english: 'Excuse me / Sorry', usageContext: 'Getting attention or apologizing' },
      { japanese: '分かりました', romaji: 'Wakarimashita', english: 'I understand', usageContext: 'Confirming understanding' },
      { japanese: '少々お待ちください', romaji: 'Shoushou omachi kudasai', english: 'Please wait a moment', usageContext: 'Asking someone to wait' }
    ],
    'technical-terms': [
      { japanese: '品質管理', romaji: 'Hinshitsu kanri', english: 'Quality control', usageContext: 'Manufacturing and QA contexts' },
      { japanese: '納期', romaji: 'Nouki', english: 'Delivery date / Deadline', usageContext: 'Project and logistics discussions' },
      { japanese: '仕様書', romaji: 'Shiyousho', english: 'Specifications document', usageContext: 'Technical documentation' },
      { japanese: '在庫', romaji: 'Zaiko', english: 'Inventory / Stock', usageContext: 'Warehouse and supply chain' },
      { japanese: '見積もり', romaji: 'Mitsumori', english: 'Estimate / Quote', usageContext: 'Business proposals and pricing' }
    ]
  };

  return phrases[topicSlug] || [];
}

seedData();
