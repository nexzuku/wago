import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Mic2, 
  Globe2, 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  Shield,
  Zap,
  Clock,
  Target,
  Headphones,
  BookOpen,
  Play,
  ChevronDown,
  Star,
  Users,
  Sparkles,
  GraduationCap,
  BrainCircuit,
  LineChart,
  Menu,
  X
} from 'lucide-react';

/* ─── Data ─── */
const features = [
  {
    icon: Mic2,
    title: 'AI Voice Cloning',
    description: 'Train with cloned native voices that match your company culture for immersive, realistic practice sessions.',
    color: 'from-blue-500/10 to-indigo-500/10',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: BrainCircuit,
    title: 'Adaptive Learning',
    description: 'AI algorithms personalize each lesson based on proficiency, pace, and industry context in real time.',
    color: 'from-violet-500/10 to-purple-500/10',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
  {
    icon: Building2,
    title: 'Industry Vocabulary',
    description: 'Pre-built modules for Finance, Tech, Manufacturing, and Healthcare with sector-specific terminology.',
    color: 'from-amber-500/10 to-orange-500/10',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    icon: LineChart,
    title: 'Analytics & ROI',
    description: 'Enterprise dashboards track team progress, engagement metrics, and measurable business outcomes.',
    color: 'from-emerald-500/10 to-teal-500/10',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
];

const advantages = [
  { icon: Headphones, text: 'AI-cloned native speaker voices' },
  { icon: BookOpen, text: 'Industry-specific specialized vocab' },
  { icon: Clock, text: '10-minute daily micro-sessions' },
  { icon: BarChart3, text: 'Executive-level progress analytics' },
  { icon: Target, text: 'Real-time pronunciation scoring' },
];

const benefits = [
  {
    icon: Zap,
    title: '40% Faster Fluency',
    description: 'AI-driven personalization accelerates learning compared to traditional classroom methods.',
    accent: 'bg-amber-500',
  },
  {
    icon: GraduationCap,
    title: 'Business-Ready Output',
    description: 'Employees practice real scenarios — meetings, emails, negotiations — not textbook dialogues.',
    accent: 'bg-blue-500',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'SOC 2 compliant infrastructure with SSO, SAML, and regional data residency options.',
    accent: 'bg-emerald-500',
  },
  {
    icon: Users,
    title: 'Team-Wide Deployment',
    description: 'Roll out to 10 or 10,000 employees with centralized admin controls and reporting.',
    accent: 'bg-violet-500',
  },
];

const industries = [
  { name: 'Technology', stat: '85%', label: 'Improved Collaboration', color: 'from-blue-600 to-blue-700' },
  { name: 'Manufacturing', stat: '60%', label: 'Fewer Miscommunications', color: 'from-slate-700 to-slate-800' },
  { name: 'Finance', stat: '3x', label: 'Faster Onboarding', color: 'from-emerald-600 to-emerald-700' },
  { name: 'Healthcare', stat: '90%', label: 'Compliance Rate', color: 'from-violet-600 to-violet-700' },
];

const stats = [
  { value: '500+', label: 'Enterprise Clients' },
  { value: '50k+', label: 'Employees Trained' },
  { value: '95%', label: 'Satisfaction Rate' },
];

const trustedBy = ['TOYOTA', 'SONY', 'MITSUBISHI', 'RAKUTEN', 'SOFTBANK'];

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#benefits' },
  { label: 'Industries', href: '#industries' },
  { label: 'Pricing', href: '#pricing' },
];

/* ─── Animated Counter ─── */
const Counter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numericValue));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Component ─── */
const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ background: 'white' }}>
      {/* ─── Navigation ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-slate-100' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            <Link to="/" className="flex items-center gap-2.5 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-japanese font-bold text-white text-base shadow-lg shadow-slate-900/20">
                和
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[19px] text-slate-900 leading-tight tracking-tight">WaGo</span>
                <span className="text-[9px] font-bold text-primary-600 tracking-[0.15em] uppercase leading-none">Enterprise</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link to="/onboarding" className="hidden sm:inline-flex">
                <button className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5">
                  Get Started Free
                </button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 shadow-xl"
            >
              <div className="px-4 py-6 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[15px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Link to="/login" className="block px-4 py-3 text-[15px] font-semibold text-slate-600 text-center">
                    Sign In
                  </Link>
                  <Link to="/onboarding" className="block">
                    <button className="w-full px-5 py-3 bg-slate-900 text-white text-[15px] font-semibold rounded-xl">
                      Get Started Free
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-radial from-primary-100/40 via-blue-50/20 to-transparent" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary-50/50 blur-[100px]" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] rounded-full bg-blue-50/60 blur-[80px]" />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-[12px] font-semibold text-slate-600">
                  AI-Powered Corporate Japanese Training
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] font-bold text-slate-900 mb-6 leading-[1.08] tracking-[-0.02em]"
            >
              Prepare your workforce for{' '}
              <br className="hidden sm:block" />
              the <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Japanese Market</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-primary-100/60 -z-0 rounded-sm" />
              </span>.
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Equip international employees with business-ready Japanese skills through AI&#8209;powered voice cloning, specialized curriculum, and real&#8209;time feedback.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
            >
              <Link to="/onboarding">
                <button className="group flex items-center gap-2.5 px-7 py-3.5 bg-primary-600 text-white text-[15px] font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5">
                  Start 14-Day Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <button className="flex items-center gap-2.5 px-7 py-3.5 bg-white text-slate-700 text-[15px] font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-slate-600 ml-0.5" />
                </div>
                Watch Demo
              </button>
            </motion.div>

            {/* Micro-proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[13px] text-slate-400 mb-14"
            >
              No credit card required &middot; Setup in 5 minutes
            </motion.p>

            {/* Trust Logos */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-10 border-t border-slate-200/60"
            >
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-7">Trusted by forward-thinking enterprises</p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
                {trustedBy.map((company, i) => (
                  <span key={i} className="text-slate-300 font-display font-bold text-[17px] tracking-tight select-none hover:text-slate-400 transition-colors duration-300">
                    {company}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <ChevronDown className="w-4 h-4 text-slate-300 animate-bounce" />
        </motion.div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="relative py-16 lg:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 lg:gap-16">
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div className="text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-slate-900 tracking-tight mb-1.5">
                  <Counter 
                    value={stat.value} 
                    suffix={stat.value.includes('+') ? '+' : stat.value.includes('%') ? '%' : ''} 
                  />
                </div>
                <div className="text-[12px] sm:text-[13px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 lg:py-32 bg-slate-50/70 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-[12px] font-semibold mb-5">
              Platform Capabilities
            </span>
            <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-slate-900 mb-5 tracking-tight">
              Enterprise-grade language training
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              A comprehensive suite of tools built to deploy organization-wide Japanese curriculum at scale.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative bg-white rounded-2xl border border-slate-200/60 p-7 hover:border-slate-300/80 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-[14px] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits / How It Works ─── */}
      <section id="benefits" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Copy + Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-semibold mb-5">
                Proven Results
              </span>
              <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                Accelerate proficiency with AI precision.
              </h2>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                Traditional methods take years. WaGo delivers business-ready fluency in months through hyper-personalized learning paths.
              </p>

              <div className="space-y-5">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className={`w-1 h-10 rounded-full ${benefit.accent} flex-shrink-0 mt-0.5 group-hover:h-12 transition-all duration-300`} />
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-500 text-[14px] leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Dark Advantage Card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative bg-slate-900 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl shadow-slate-900/30 overflow-hidden">
                {/* Subtle glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] -ml-16 -mb-16" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-400" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                      The WaGo Advantage
                    </h3>
                  </div>

                  <div className="space-y-4 mb-10">
                    {advantages.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.12] transition-colors">
                          <item.icon className="w-4.5 h-4.5 text-primary-400" />
                        </div>
                        <span className="text-slate-300 text-[14px] font-medium group-hover:text-white transition-colors">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/onboarding" className="block">
                    <button className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white text-[15px] font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30">
                      Compare Plans & Pricing
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Industries ─── */}
      <section id="industries" className="py-24 lg:py-32 bg-slate-50/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-[12px] font-semibold mb-5">
              Vertical Solutions
            </span>
            <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-slate-900 mb-5 tracking-tight">
              Curated for your sector.
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Industry-specific scenarios and technical terminology designed for global teams.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {industries.map((industry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative rounded-2xl bg-gradient-to-br ${industry.color} p-7 text-white overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500" />
                <div className="relative z-10">
                  <div className="text-[2.5rem] font-bold tracking-tight mb-1 leading-none">
                    {industry.stat}
                  </div>
                  <div className="text-[12px] font-medium text-white/70 uppercase tracking-wider mb-5">{industry.label}</div>
                  <div className="text-[14px] font-semibold text-white/90 pt-4 border-t border-white/15">{industry.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof / Testimonial ─── */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-xl lg:text-2xl font-medium text-slate-700 leading-relaxed mb-8 max-w-3xl mx-auto">
              "WaGo transformed how our international team communicates with our Tokyo headquarters. The voice cloning feature makes practice feel incredibly natural — our employees actually <em className="text-slate-900 not-italic font-semibold">look forward</em> to their daily sessions."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                SC
              </div>
              <div className="text-left">
                <div className="text-[15px] font-bold text-slate-900">Sarah Chen</div>
                <div className="text-[13px] text-slate-500">VP of Global Operations, TechCorp International</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-white mb-6 tracking-tight leading-tight">
              Ready to transform your global communication?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 500+ global enterprises already accelerating their Japanese language goals with WaGo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link to="/onboarding">
                <button className="group flex items-center gap-2.5 px-8 py-4 bg-primary-500 text-white text-[15px] font-semibold rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5">
                  Start 14-Day Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <button className="px-8 py-4 text-white text-[15px] font-semibold rounded-xl border border-white/15 hover:bg-white/5 transition-all duration-200">
                Schedule Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((text, i) => (
                <span key={i} className="flex items-center gap-2 text-[13px] text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 border-t border-white/5 pt-16 lg:pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 lg:gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-japanese font-bold text-slate-900 text-sm">
                  和
                </div>
                <span className="font-display font-bold text-xl text-white tracking-tight">WaGo</span>
              </Link>
              <p className="text-slate-400 text-[14px] leading-relaxed max-w-xs mb-6">
                Enterprise-grade Japanese language training powered by advanced AI voice technology.
              </p>
              <div className="flex items-center gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <a key={social} href="#" className="px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all">
                    {social}
                  </a>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Enterprise', 'Integrations'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-[14px] text-slate-400 hover:text-white transition-colors duration-200">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-slate-500">
              &copy; {new Date().getFullYear()} WaGo. All rights reserved.
            </p>
            <p className="text-[13px] text-slate-600">
              Global HQ: Tokyo, Japan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
