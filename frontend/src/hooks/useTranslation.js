import { useState, useCallback, createContext, useContext } from 'react';

const translations = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      close: 'Close',
      viewAll: 'View all',
      learnMore: 'Learn more',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      overview: "Here's your training overview",
      totalEmployees: 'Total Employees',
      activeToday: 'Active Today',
      avgProgress: 'Avg. Progress',
      trainingHours: 'Training Hours',
      topPerformers: 'Top Performers',
      quickActions: 'Quick Actions',
      addEmployees: 'Add Employees',
      uploadContent: 'Upload Content',
      voiceSetup: 'Voice Setup',
    },
    employees: {
      title: 'Employees',
      subtitle: 'Manage your team members and their training',
      addEmployee: 'Add Employee',
      bulkImport: 'Bulk Import',
      inviteEmployee: 'Invite Employee',
      sendInvite: 'Send Invite',
      firstName: 'First Name',
      lastName: 'Last Name',
      department: 'Department',
      role: 'Role',
      status: 'Status',
      progress: 'Progress',
      active: 'Active',
      inactive: 'Inactive',
      invited: 'Invited',
    },
    content: {
      title: 'Content Management',
      subtitle: 'Manage training materials and resources',
      upload: 'Upload Content',
      totalMaterials: 'Total Materials',
      totalViews: 'Total Views',
      completions: 'Completions',
      noContent: 'No content yet',
      uploadFirst: 'Upload training materials to get started',
    },
    landing: {
      heroTitle: 'Enterprise Japanese',
      heroTitleHighlight: 'Training Reimagined',
      heroSubtitle: 'Empower your international workforce with AI-powered Japanese language training. Voice cloning, personalized curriculum, and real-time pronunciation feedback.',
      startTrial: 'Start Free Trial',
      watchDemo: 'Watch Demo',
      companies: 'Companies',
      employeesTrained: 'Employees Trained',
      satisfactionRate: 'Satisfaction Rate',
      fasterLearning: 'Faster Learning',
      features: 'Everything You Need',
      featuresSubtitle: 'A complete platform for enterprise Japanese language training',
      cta: 'Ready to Transform Your Training?',
      ctaSubtitle: 'Join hundreds of companies already using WaGo to train their international workforce.',
      freeTrial: '14-day free trial',
      noCard: 'No credit card required',
      cancelAnytime: 'Cancel anytime',
    },
    training: {
      title: 'Training',
      startSession: 'Start Session',
      continueTraining: 'Continue Training',
      phrases: 'phrases',
      minutes: 'minutes',
      pronunciation: 'Pronunciation',
      listening: 'Listening',
      vocabulary: 'Vocabulary',
    },
  },
  ja: {
    common: {
      loading: '読み込み中...',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      filter: 'フィルター',
      all: 'すべて',
      none: 'なし',
      yes: 'はい',
      no: 'いいえ',
      confirm: '確認',
      back: '戻る',
      next: '次へ',
      previous: '前へ',
      submit: '送信',
      reset: 'リセット',
      close: '閉じる',
      viewAll: 'すべて見る',
      learnMore: '詳しく見る',
    },
    auth: {
      login: 'ログイン',
      logout: 'ログアウト',
      register: '登録',
      forgotPassword: 'パスワードを忘れた',
      resetPassword: 'パスワードをリセット',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワードを確認',
    },
    dashboard: {
      title: 'ダッシュボード',
      welcome: 'おかえりなさい',
      overview: 'トレーニングの概要',
      totalEmployees: '総従業員数',
      activeToday: '今日アクティブ',
      avgProgress: '平均進捗',
      trainingHours: 'トレーニング時間',
      topPerformers: 'トップパフォーマー',
      quickActions: 'クイックアクション',
      addEmployees: '従業員を追加',
      uploadContent: 'コンテンツをアップロード',
      voiceSetup: '音声設定',
    },
    employees: {
      title: '従業員',
      subtitle: 'チームメンバーとトレーニングを管理',
      addEmployee: '従業員を追加',
      bulkImport: '一括インポート',
      inviteEmployee: '従業員を招待',
      sendInvite: '招待を送信',
      firstName: '名',
      lastName: '姓',
      department: '部署',
      role: '役職',
      status: 'ステータス',
      progress: '進捗',
      active: 'アクティブ',
      inactive: '非アクティブ',
      invited: '招待済み',
    },
    content: {
      title: 'コンテンツ管理',
      subtitle: 'トレーニング資料とリソースを管理',
      upload: 'コンテンツをアップロード',
      totalMaterials: '総資料数',
      totalViews: '総閲覧数',
      completions: '完了数',
      noContent: 'コンテンツがありません',
      uploadFirst: 'トレーニング資料をアップロードして始めましょう',
    },
    landing: {
      heroTitle: 'エンタープライズ日本語',
      heroTitleHighlight: 'トレーニング革新',
      heroSubtitle: 'AI搭載の日本語教育で国際的な従業員を強化。音声クローン、パーソナライズされたカリキュラム、リアルタイムの発音フィードバック。',
      startTrial: '無料トライアルを開始',
      watchDemo: 'デモを見る',
      companies: '企業',
      employeesTrained: 'トレーニング済み従業員',
      satisfactionRate: '満足度',
      fasterLearning: '学習速度向上',
      features: '必要な機能がすべて揃っています',
      featuresSubtitle: '企業向け日本語トレーニングの完全なプラットフォーム',
      cta: 'トレーニングを変革する準備はできていますか？',
      ctaSubtitle: 'WaGoを使用して国際的な従業員をトレーニングしている何百もの企業に参加しましょう。',
      freeTrial: '14日間無料トライアル',
      noCard: 'クレジットカード不要',
      cancelAnytime: 'いつでもキャンセル可能',
    },
    training: {
      title: 'トレーニング',
      startSession: 'セッションを開始',
      continueTraining: 'トレーニングを続ける',
      phrases: 'フレーズ',
      minutes: '分',
      pronunciation: '発音',
      listening: 'リスニング',
      vocabulary: '語彙',
    },
  },
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children, defaultLocale = 'en' }) => {
  const [locale, setLocale] = useState(defaultLocale);

  const t = useCallback((key, params = {}) => {
    const keys = key.split('.');
    let value = translations[locale];

    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    if (!value) {
      console.warn(`Translation missing: ${key}`);
      return key;
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => params[paramKey] || '');
    }

    return value;
  }, [locale]);

  const changeLocale = useCallback((newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('wago-locale', newLocale);
    }
  }, []);

  return (
    <TranslationContext.Provider value={{ t, locale, changeLocale, locales: Object.keys(translations) }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default useTranslation;
