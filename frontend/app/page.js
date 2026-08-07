"use client";

import useSiteEffects from "./useSiteEffects";

export default function HomePage() {
  useSiteEffects();

  return (
    <>
    <nav className="wago-navbar">
        <a href="#" className="nav-brand">
            <div className="logo-icon">和</div>
            <div className="logo-text">
                <span className="brand-name">WaGo</span>
                <span className="brand-sub">ENTERPRISE</span>
            </div>
            <span className="brand-parent">by NexZuku Japan</span>
        </a>

        <ul className="nav-links">
            <li><a href="#">Features</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Industries</a></li>
            <li><a href="#">Pricing</a></li>
        </ul>

        <div className="nav-actions">
            <a href="#" className="sign-in">Sign In</a>
            <a href="#" className="btn-get-started"><span className="btn-label">Get Started Free</span></a>
        </div>

        <button className="nav-hamburger" id="navHamburger" aria-label="Toggle menu">
            <span></span><span></span><span></span>
        </button>
    </nav>

    
    <section className="wago-hero">
        <div className="hero-decor" aria-hidden="true">
            <span className="decor-dot d1"></span>
            <span className="decor-dot d2"></span>
            <span className="decor-dot d3"></span>
            <span className="decor-dot d4"></span>
            <span className="decor-dot d5"></span>
            <span className="decor-dot d6"></span>

            <svg className="decor-cluster cluster-tl" viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
                <line x1="8" y1="70" x2="55" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <line x1="55" y1="25" x2="115" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <circle cx="8" cy="70" r="2.2" fill="rgba(255,255,255,0.55)"/>
                <circle cx="55" cy="25" r="2.2" fill="rgba(255,255,255,0.55)"/>
                <circle cx="115" cy="50" r="2.2" fill="rgba(255,255,255,0.55)"/>
            </svg>

            <svg className="decor-cluster cluster-br" viewBox="0 0 140 90" xmlns="http://www.w3.org/2000/svg">
                <line x1="15" y1="20" x2="70" y2="55" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <line x1="70" y1="55" x2="130" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <circle cx="15" cy="20" r="2.2" fill="rgba(255,255,255,0.55)"/>
                <circle cx="70" cy="55" r="2.2" fill="rgba(255,255,255,0.55)"/>
                <circle cx="130" cy="30" r="2.2" fill="rgba(255,255,255,0.55)"/>
            </svg>

            <svg className="decor-cluster cluster-bl" viewBox="0 0 110 70" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="15" x2="60" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <circle cx="10" cy="15" r="2" fill="rgba(255,255,255,0.5)"/>
                <circle cx="60" cy="50" r="2" fill="rgba(255,255,255,0.5)"/>
            </svg>
        </div>
        <div className="hero-content">
            
            <div className="hero-badge">
                <i className="fa-solid fa-brain" style={{marginRight: '8px'}}></i> Built for Corporate Japanese Training.
            </div>

            <h1 className="hero-title">
                Prepare your workforce<br/>
                <span className="hero-title-muted">for the</span><br/>
                <span className="hero-highlight">Japanese Market.</span>
            </h1>

            <p className="hero-subtitle">
                Equip international employees with business-ready Japanese skills through AI-powered voice cloning, specialized curriculum, and real-time feedback.
            </p>

            <div className="hero-actions">
                <a href="#" className="btn-primary-solid">
                    <span className="btn-label"><i className="fa-regular fa-calendar" style={{marginRight: '8px', color: '#00A3FF'}}></i> Start Your Free Trial</span>
                </a>
                <a href="#" className="btn-secondary-outline">
                    See How It Works <i className="fa-solid fa-arrow-right" style={{marginLeft: '8px'}}></i>
                </a>
            </div>

            <div className="hero-dashboard-wrap" id="demo-tilt">
                <div className="hero-dashboard-glow" aria-hidden="true"></div>
                <div className="hero-dashboard">

                    <div className="hero-dashboard-topbar">
                        <div className="hero-dashboard-dots">
                            <span className="dot-red"></span><span className="dot-yellow"></span><span className="dot-green"></span>
                        </div>
                        <div className="hero-dashboard-title">
                            <i className="fa-solid fa-brain"></i> WaGo AI Coach
                        </div>
                        <div className="hero-dashboard-live">
                            <span className="live-dot"></span> Live Session
                        </div>
                    </div>

                    <div className="hero-dashboard-body">

                        <div className="hero-dashboard-chat">
                            <div className="chat-msg chat-ai">
                                <div className="chat-avatar"><i className="fa-solid fa-robot"></i></div>
                                <div className="chat-bubble">こんにちは! Let&apos;s practice your client greeting.</div>
                            </div>
                            <div className="chat-msg chat-user">
                                <div className="chat-bubble">Hajimemashite, yoroshiku onegaishimasu.</div>
                                <div className="chat-avatar chat-avatar-user"><i className="fa-solid fa-user"></i></div>
                            </div>
                            <div className="chat-msg chat-ai chat-typing">
                                <div className="chat-avatar"><i className="fa-solid fa-robot"></i></div>
                                <div className="chat-bubble chat-bubble-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>

                            <div className="chat-mic-row">
                                <div className="chat-mic-btn" aria-hidden="true">
                                    <i className="fa-solid fa-microphone"></i>
                                    <span className="mic-pulse-ring"></span>
                                    <span className="mic-pulse-ring mic-pulse-ring-delay"></span>
                                </div>
                                <div className="ai-waveform chat-mic-wave" aria-hidden="true">
                                    <span></span><span></span><span></span><span></span>
                                    <span></span><span></span><span></span><span></span>
                                </div>
                                <span className="chat-mic-label">Listening for your response&hellip;</span>
                            </div>
                        </div>

                        <div className="hero-dashboard-side">
                            <div className="dash-widget dash-widget-score">
                                <p className="dash-widget-label">Pronunciation</p>
                                <div className="dash-mini-ring-wrap">
                                    <svg className="dash-mini-ring" viewBox="0 0 100 100">
                                        <circle className="dash-mini-ring-track" cx="50" cy="50" r="40"/>
                                        <circle className="dash-mini-ring-fill" cx="50" cy="50" r="40"/>
                                    </svg>
                                    <div className="dash-mini-ring-center"><span data-count-to="92" data-suffix="%">0%</span></div>
                                </div>
                            </div>

                            <div className="dash-widget dash-widget-chart">
                                <p className="dash-widget-label">Weekly Progress</p>
                                <svg className="dash-mini-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
                                    <polyline className="dash-mini-chart-line" points="0,34 16,28 32,30 48,18 64,20 80,8 100,4"/>
                                </svg>
                            </div>

                            <div className="dash-widget dash-widget-progress">
                                <p className="dash-widget-label">Module 7 of 12</p>
                                <div className="dash-progress-track">
                                    <div className="dash-progress-fill"></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="hero-dashboard-doc">
                        <div className="dash-doc-file">
                            <div className="dash-doc-icon"><i className="fa-solid fa-file-lines"></i></div>
                            <div className="dash-doc-info">
                                <p className="dash-doc-name">Company_Safety_Manual.pdf</p>
                                <p className="dash-doc-meta">48 pages &middot; vocabulary &amp; safety terms extracted</p>
                            </div>
                            <div className="dash-doc-status"><i className="fa-solid fa-circle-check"></i> Indexed</div>
                        </div>
                        <div className="dash-doc-tags">
                            <span className="dash-tag">避難経路 Evacuation Route</span>
                            <span className="dash-tag">保護具 PPE</span>
                            <span className="dash-tag">機密保持 Confidentiality</span>
                            <span className="dash-tag dash-tag-more">+32 more terms</span>
                        </div>
                        <p className="dash-doc-hint"><i className="fa-solid fa-comment-dots"></i> Ask WaGo AI anything about this manual &mdash; in Japanese or English.</p>
                    </div>
                </div>
            </div>

            </div>
    </section>

    
    <div className="nexzuku-trust-strip">
        <div className="trust-strip-inner">
            <div className="trust-item">
                <i className="fa-solid fa-shield"></i> 500+ Enterprise Clients
            </div>
            <div className="trust-item">
                <i className="fa-solid fa-location-dot"></i> Global HQ: Tokyo, Japan
            </div>
            <div className="trust-item">
                <i className="fa-solid fa-certificate"></i> SOC-2 Type II Certified
            </div>
            <div className="trust-item">
                <i className="fa-solid fa-globe"></i> Bilingual EN/JP Support
            </div>
        </div>
    </div>

    
    <section className="capabilities-section">
        <div className="capabilities-inner">
            <h2 className="capabilities-title">Enterprise-grade <span className="title-accent">language training</span></h2>
            <p className="capabilities-subtitle">A comprehensive suite of tools built to deploy organization-wide Japanese curriculum at scale.</p>

            <div className="capabilities-grid">

                <div className="capability-card">
                    <div className="capability-visual visual-voice">
                        <svg className="visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                            <path d="M19 11a7 7 0 0 1-14 0"/>
                            <line x1="12" y1="18" x2="12" y2="22"/>
                        </svg>
                        <div className="icon-wave">
                            <span></span><span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                    <h3>AI Voice Cloning</h3>
                    <p>Train with cloned native voices that match your company culture for immersive, realistic practice sessions.</p>
                </div>

                <div className="capability-card">
                    <div className="capability-visual visual-brain">
                        <svg className="visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 3.2c-1.5 0-2.7 1-3.1 2.4-1.5.2-2.7 1.5-2.7 3.1 0 .6.15 1.2.45 1.65C3.4 10.9 3 11.75 3 12.7c0 1.7 1.35 3.1 3.05 3.15.15 1.5 1.4 2.65 2.95 2.65.5 0 .95-.12 1.35-.33"/>
                            <path d="M14.5 3.2c1.5 0 2.7 1 3.1 2.4 1.5.2 2.7 1.5 2.7 3.1 0 .6-.15 1.2-.45 1.65.65.55 1.05 1.4 1.05 2.35 0 1.7-1.35 3.1-3.05 3.15-.15 1.5-1.4 2.65-2.95 2.65-.5 0-.95-.12-1.35-.33"/>
                            <path d="M9.5 3.2c1.6 0 2.9 1.3 2.9 2.9v11.8c0 1-.8 1.8-1.8 1.8"/>
                            <path d="M14.5 3.2c-1.6 0-2.9 1.3-2.9 2.9"/>
                            <path d="M6.6 8.4c.9.4 1.9.6 2.9.6"/>
                            <path d="M17.4 8.4c-.9.4-1.9.6-2.9.6"/>
                            <path d="M6 12.3c.9.3 1.85.45 2.8.45"/>
                            <path d="M18 12.3c-.9.3-1.85.45-2.8.45"/>
                        </svg>
                        <svg className="decor-neural" viewBox="0 0 300 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="#c084fc" strokeWidth="1" fill="none" opacity="0.35">
                                <line x1="10" y1="36" x2="60" y2="14"/>
                                <line x1="10" y1="36" x2="60" y2="36"/>
                                <line x1="10" y1="36" x2="60" y2="58"/>
                                <line x1="60" y1="14" x2="120" y2="10"/>
                                <line x1="60" y1="14" x2="120" y2="36"/>
                                <line x1="60" y1="36" x2="120" y2="10"/>
                                <line x1="60" y1="36" x2="120" y2="36"/>
                                <line x1="60" y1="36" x2="120" y2="62"/>
                                <line x1="60" y1="58" x2="120" y2="36"/>
                                <line x1="60" y1="58" x2="120" y2="62"/>
                                <line x1="120" y1="10" x2="180" y2="30"/>
                                <line x1="120" y1="36" x2="180" y2="30"/>
                                <line x1="120" y1="36" x2="180" y2="55"/>
                                <line x1="120" y1="62" x2="180" y2="55"/>
                                <line x1="180" y1="30" x2="240" y2="18"/>
                                <line x1="180" y1="30" x2="240" y2="45"/>
                                <line x1="180" y1="55" x2="240" y2="45"/>
                                <line x1="240" y1="18" x2="290" y2="34"/>
                                <line x1="240" y1="45" x2="290" y2="34"/>
                            </g>
                            <g stroke="#e9d5ff" strokeWidth="1.3" fill="none">
                                <line className="signal-line" x1="10" y1="36" x2="60" y2="14" style={{animationDelay: '0s'}}/>
                                <line className="signal-line" x1="60" y1="14" x2="120" y2="10" style={{animationDelay: '0.3s'}}/>
                                <line className="signal-line" x1="120" y1="10" x2="180" y2="30" style={{animationDelay: '0.6s'}}/>
                                <line className="signal-line" x1="180" y1="30" x2="240" y2="18" style={{animationDelay: '0.9s'}}/>
                                <line className="signal-line" x1="240" y1="18" x2="290" y2="34" style={{animationDelay: '1.2s'}}/>
                                <line className="signal-line" x1="10" y1="36" x2="60" y2="58" style={{animationDelay: '1.8s'}}/>
                                <line className="signal-line" x1="60" y1="58" x2="120" y2="62" style={{animationDelay: '2.1s'}}/>
                                <line className="signal-line" x1="120" y1="62" x2="180" y2="55" style={{animationDelay: '2.4s'}}/>
                                <line className="signal-line" x1="180" y1="55" x2="240" y2="45" style={{animationDelay: '2.7s'}}/>
                                <line className="signal-line" x1="240" y1="45" x2="290" y2="34" style={{animationDelay: '3s'}}/>
                            </g>
                            <g fill="#c084fc">
                                <circle className="neural-node" cx="10" cy="36" r="3" style={{animationDelay: '0s'}}/>
                                <circle className="neural-node" cx="60" cy="14" r="2.6" style={{animationDelay: '0.15s'}}/>
                                <circle className="neural-node" cx="60" cy="36" r="2.6" style={{animationDelay: '0.15s'}}/>
                                <circle className="neural-node" cx="60" cy="58" r="2.6" style={{animationDelay: '0.15s'}}/>
                                <circle className="neural-node" cx="120" cy="10" r="2.6" style={{animationDelay: '0.35s'}}/>
                                <circle className="neural-node" cx="120" cy="36" r="2.6" style={{animationDelay: '0.35s'}}/>
                                <circle className="neural-node" cx="120" cy="62" r="2.6" style={{animationDelay: '0.35s'}}/>
                                <circle className="neural-node" cx="180" cy="30" r="2.6" style={{animationDelay: '0.55s'}}/>
                                <circle className="neural-node" cx="180" cy="55" r="2.6" style={{animationDelay: '0.55s'}}/>
                                <circle className="neural-node" cx="240" cy="18" r="2.6" style={{animationDelay: '0.75s'}}/>
                                <circle className="neural-node" cx="240" cy="45" r="2.6" style={{animationDelay: '0.75s'}}/>
                                <circle className="neural-node" cx="290" cy="34" r="3" style={{animationDelay: '0.95s'}}/>
                            </g>
                        </svg>
                    </div>
                    <h3>Adaptive Learning</h3>
                    <p>AI algorithms personalize each lesson based on proficiency, pace, and industry context in real time.</p>
                </div>

                <div className="capability-card">
                    <div className="capability-visual visual-books">
                        <svg className="visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2.5" y="5.5" width="4.4" height="14" rx="0.5"/>
                            <line x1="4.7" y1="8" x2="4.7" y2="9.4"/>
                            <rect x="7.6" y="4" width="4.4" height="15.5" rx="0.5"/>
                            <line x1="9.8" y1="7" x2="9.8" y2="8.6"/>
                            <g transform="rotate(9 15 12)">
                                <rect x="12.7" y="4.8" width="4.4" height="14.4" rx="0.5"/>
                                <line x1="14.9" y1="7.6" x2="14.9" y2="9.2"/>
                            </g>
                            <line x1="2" y1="19.7" x2="21" y2="19.7"/>
                        </svg>
                        <div className="decor-vocab">
                            <span className="vocab-chip" style={{animationDelay: '0s'}}>COMPLIANCE</span>
                            <span className="vocab-chip" style={{animationDelay: '1.4s'}}>INVOICE</span>
                            <span className="vocab-chip" style={{animationDelay: '2.8s'}}>PROTOCOL</span>
                            <span className="vocab-chip" style={{animationDelay: '4.2s'}}>NEGOTIATION</span>
                            <span className="vocab-chip" style={{animationDelay: '5.6s'}}>AUDIT</span>
                        </div>
                    </div>
                    <h3>Industry Vocabulary</h3>
                    <p>Pre-built modules for Finance, Tech, Manufacturing, and Healthcare with sector-specific terminology.</p>
                </div>

                <div className="capability-card">
                    <div className="capability-visual visual-analytics">
                        <svg className="visual-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="13" rx="1.6"/>
                            <path d="M6.5 14l3-3.2 2.3 2.2L16.5 8.5"/>
                            <circle cx="16.5" cy="8.5" r="0.9" fill="currentColor" stroke="none"/>
                            <line x1="8" y1="20" x2="16" y2="20"/>
                            <line x1="12" y1="17" x2="12" y2="20"/>
                        </svg>
                        <div className="decor-grid">
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                        </div>
                    </div>
                    <h3>Analytics &amp; ROI</h3>
                    <p>Enterprise dashboards track team progress, engagement metrics, and measurable business outcomes.</p>
                </div>

            </div>
        </div>
    </section>

    
    <section className="results-section">
        <div className="results-inner">

            <div className="results-left">
                <span className="results-badge">Proven Results</span>
                <h2 className="results-title">Accelerate proficiency <span className="title-accent">with AI precision.</span></h2>
                <p className="results-subtitle">Traditional methods take years. WaGo delivers business-ready fluency in months through hyper-personalized learning paths.</p>

                <div className="results-stats-grid">
                    <div className="result-stat-card accent-orange">
                        <span className="rsc-index">01</span>
                        <div className="result-stat-icon"><i className="fa-solid fa-gauge-high"></i></div>
                        <p className="rsc-title">40% Faster Fluency</p>
                        <div className="rsc-desc">AI-driven personalization accelerates learning compared to traditional classroom methods.</div>
                    </div>
                    <div className="result-stat-card accent-blue">
                        <span className="rsc-index">02</span>
                        <div className="result-stat-icon"><i className="fa-solid fa-briefcase"></i></div>
                        <p className="rsc-title">Business-Ready Output</p>
                        <div className="rsc-desc">Employees practice real scenarios — meetings, emails, negotiations — not textbook dialogues.</div>
                    </div>
                    <div className="result-stat-card accent-green">
                        <span className="rsc-index">03</span>
                        <div className="result-stat-icon"><i className="fa-solid fa-shield-halved"></i></div>
                        <p className="rsc-title">Enterprise-Grade Security</p>
                        <div className="rsc-desc">SOC 2 compliant infrastructure with SSO, SAML, and regional data residency options.</div>
                    </div>
                    <div className="result-stat-card accent-purple">
                        <span className="rsc-index">04</span>
                        <div className="result-stat-icon"><i className="fa-solid fa-diagram-project"></i></div>
                        <p className="rsc-title">Team-Wide Deployment</p>
                        <div className="rsc-desc">Roll out to 10 or 10,000 employees with centralized admin controls and reporting.</div>
                    </div>
                </div>

                <div className="results-visual-strip">

                    <div className="insight-card insight-progress">
                        <div className="insight-card-head">
                            <span className="insight-icon"><i className="fa-solid fa-gauge-high"></i></span>
                            <span className="insight-label">Learning Progress</span>
                        </div>
                        <div className="progress-ring-wrap">
                            <svg className="progress-ring" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="insightProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#4fd1c5"/>
                                        <stop offset="100%" stopColor="#0ea5e9"/>
                                    </linearGradient>
                                </defs>
                                <circle className="progress-ring-track" cx="50" cy="50" r="40"/>
                                <circle className="progress-ring-fill" cx="50" cy="50" r="40"/>
                            </svg>
                            <div className="progress-ring-center">
                                <span data-count-to="87" data-suffix="%">0%</span>
                            </div>
                        </div>
                        <p className="insight-caption">Avg. proficiency gain per quarter</p>
                    </div>

                    <div className="insight-card insight-waveform">
                        <div className="insight-card-head">
                            <span className="insight-icon"><i className="fa-solid fa-waveform-lines"></i></span>
                            <span className="insight-label">AI Voice Engine</span>
                        </div>
                        <div className="ai-waveform" aria-hidden="true">
                            <span></span><span></span><span></span><span></span><span></span><span></span>
                            <span></span><span></span><span></span><span></span><span></span><span></span>
                        </div>
                        <p className="insight-caption">Real-time native speech synthesis</p>
                    </div>

                    <div className="insight-card insight-graph">
                        <div className="insight-card-head">
                            <span className="insight-icon"><i className="fa-solid fa-arrow-trend-up"></i></span>
                            <span className="insight-label">Fluency Trendline</span>
                        </div>
                        <svg className="learning-graph" viewBox="0 0 160 70" preserveAspectRatio="none">
                            <line className="learning-graph-grid" x1="0" y1="60" x2="160" y2="60"/>
                            <polygon className="learning-graph-area" points="0,60 0,55 24,48 48,50 72,34 96,30 120,16 144,10 160,4 160,60"/>
                            <polyline className="learning-graph-line" points="0,55 24,48 48,50 72,34 96,30 120,16 144,10 160,4"/>
                            <circle className="learning-graph-dot" cx="160" cy="4" r="3.5"/>
                        </svg>
                        <p className="insight-caption">Consistent month-over-month gains</p>
                    </div>

                    <div className="insight-card insight-score">
                        <div className="insight-card-head">
                            <span className="insight-icon"><i className="fa-solid fa-microphone-lines"></i></span>
                            <span className="insight-label">Pronunciation Score</span>
                        </div>
                        <div className="score-meter-list">
                            <div className="score-meter-row">
                                <span className="score-meter-name">Accuracy</span>
                                <div className="score-meter-track"><div className="score-meter-fill" style={{'--fill': '94%'}}></div></div>
                                <span className="score-meter-val">94</span>
                            </div>
                            <div className="score-meter-row">
                                <span className="score-meter-name">Fluency</span>
                                <div className="score-meter-track"><div className="score-meter-fill" style={{'--fill': '88%'}}></div></div>
                                <span className="score-meter-val">88</span>
                            </div>
                            <div className="score-meter-row">
                                <span className="score-meter-name">Intonation</span>
                                <div className="score-meter-track"><div className="score-meter-fill" style={{'--fill': '91%'}}></div></div>
                                <span className="score-meter-val">91</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="results-detail-list">
                    <div className="detail-item accent-orange">
                        <h4>40% Faster Fluency</h4>
                        <p>AI-driven personalization accelerates learning compared to traditional classroom methods.</p>
                    </div>
                    <div className="detail-item accent-blue">
                        <h4>Business-Ready Output</h4>
                        <p>Employees practice real scenarios — meetings, emails, negotiations — not textbook dialogues.</p>
                    </div>
                    <div className="detail-item accent-green">
                        <h4>Enterprise-Grade Security</h4>
                        <p>SOC 2 compliant infrastructure with SSO, SAML, and regional data residency options.</p>
                    </div>
                    <div className="detail-item accent-purple">
                        <h4>Team-Wide Deployment</h4>
                        <p>Roll out to 10 or 10,000 employees with centralized admin controls and reporting.</p>
                    </div>
                </div>
            </div>
            
            <div className="mobile-results-slider" style={{display: 'none'}}>
                <div className="mobile-results-track" id="mobileResultsTrack">
                    <div className="mobile-slide accent-orange">
                        <div className="result-stat-icon"><i className="fa-solid fa-gauge-high"></i></div>
                        <h4>40% Faster Fluency</h4>
                        <p>AI-driven personalization accelerates learning compared to traditional classroom methods.</p>
                    </div>
                    <div className="mobile-slide accent-blue">
                        <div className="result-stat-icon"><i className="fa-solid fa-briefcase"></i></div>
                        <h4>Business-Ready Output</h4>
                        <p>Employees practice real scenarios — meetings, emails, negotiations — not textbook dialogues.</p>
                    </div>
                    <div className="mobile-slide accent-green">
                        <div className="result-stat-icon"><i className="fa-solid fa-shield-halved"></i></div>
                        <h4>Enterprise-Grade Security</h4>
                        <p>SOC 2 compliant infrastructure with SSO, SAML, and regional data residency options.</p>
                    </div>
                    <div className="mobile-slide accent-purple">
                        <div className="result-stat-icon"><i className="fa-solid fa-diagram-project"></i></div>
                        <h4>Team-Wide Deployment</h4>
                        <p>Roll out to 10 or 10,000 employees with centralized admin controls and reporting.</p>
                    </div>
                </div>
            </div>

            <div className="results-right">
                <div className="advantage-panel">
                    <div className="advantage-screen">
                        <div className="advantage-header">
                            <span className="advantage-badge-icon"><i className="fa-solid fa-bolt"></i></span>
                            <h3>The WaGo Advantage</h3>
                        </div>

                        <ul className="advantage-list">
                            <li className="accent-teal"><span className="advantage-item-icon"><i className="fa-solid fa-headset"></i></span>AI-cloned native speaker voices</li>
                            <li className="accent-blue"><span className="advantage-item-icon"><i className="fa-solid fa-book-open"></i></span>Industry-specific specialized vocab</li>
                            <li className="accent-purple"><span className="advantage-item-icon"><i className="fa-regular fa-clock"></i></span>10-minute daily micro-sessions</li>
                            <li className="accent-orange"><span className="advantage-item-icon"><i className="fa-solid fa-chart-line"></i></span>Executive-level progress analytics</li>
                            <li className="accent-green"><span className="advantage-item-icon"><i className="fa-solid fa-microphone-lines"></i></span>Real-time pronunciation scoring</li>
                        </ul>

                        <button className="advantage-cta"><span className="btn-label">Compare Plans &amp; Pricing</span></button>
                    </div>
                </div>

                <div className="compliance-strip">
                    <p className="compliance-strip-label">Certified &amp; compliant</p>
                    <div className="compliance-badges">
                        <div className="compliance-badge">
                            <i className="fa-solid fa-shield-halved"></i>
                            <span>SOC 2<br/>Type II</span>
                        </div>
                        <div className="compliance-badge">
                            <i className="fa-solid fa-lock"></i>
                            <span>GDPR<br/>Compliant</span>
                        </div>
                        <div className="compliance-badge">
                            <i className="fa-solid fa-certificate"></i>
                            <span>ISO<br/>27001</span>
                        </div>
                        <div className="compliance-badge">
                            <i className="fa-solid fa-key"></i>
                            <span>SSO /<br/>SAML</span>
                        </div>
                        </div>

                    <div className="live-status-panel">
                        <div className="live-status-header">
                            <span className="live-dot"></span> Live system status
                        </div>
                        <div className="live-status-feed" id="live-status-feed">
                            <div className="live-status-item active">
                                <i className="fa-solid fa-lock"></i>
                                <span>All data encrypted end-to-end</span>
                            </div>
                            <div className="live-status-item">
                                <i className="fa-solid fa-language"></i>
                                <span>Curriculum built for non-native Japanese speakers</span>
                            </div>
                            <div className="live-status-item">
                                <i className="fa-solid fa-chart-line"></i>
                                <span>Track fluency progress across your whole team</span>
                            </div>
                            <div className="live-status-item">
                                <i className="fa-solid fa-user-shield"></i>
                                <span>Enterprise-grade access controls</span>
                            </div>
                            <div className="live-status-item">
                                <i className="fa-solid fa-headset"></i>
                                <span>Dedicated onboarding support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

    
    <section className="verticals-section">
        <div className="verticals-constellation"></div>
        <div className="verticals-inner">
            <h2 className="verticals-title">Curated for <span className="title-accent">your sector.</span></h2>
            <p className="verticals-subtitle">Industry-specific scenarios and technical terminology designed for global teams.</p>

            <div className="verticals-grid">

                
                <div className="vertical-card accent-tech">
                    <div className="vertical-icon-scene scene-tech">
                        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
                                <line x1="30" y1="30" x2="12" y2="14"/>
                                <line x1="30" y1="30" x2="48" y2="14"/>
                                <line x1="30" y1="30" x2="10" y2="42"/>
                                <line x1="30" y1="30" x2="50" y2="44"/>
                            </g>
                            <circle className="net-node" cx="30" cy="30" r="4" style={{animationDelay: '0s'}}/>
                            <circle className="net-node" cx="12" cy="14" r="2.6" style={{animationDelay: '0.2s'}}/>
                            <circle className="net-node" cx="48" cy="14" r="2.6" style={{animationDelay: '0.4s'}}/>
                            <circle className="net-node" cx="10" cy="42" r="2.6" style={{animationDelay: '0.6s'}}/>
                            <circle className="net-node" cx="50" cy="44" r="2.6" style={{animationDelay: '0.8s'}}/>
                        </svg>
                    </div>
                    <h3 className="vertical-stat" data-count-to="85" data-suffix="%">0%</h3>
                    <p className="vertical-label">Improved Collaboration</p>
                    <div className="vertical-divider"></div>
                    <p className="vertical-industry">Technology</p>
                    <div className="vertical-hover-note">Real-time cross-team standups, sprint planning &amp; code-review vocabulary.</div>
                </div>

                
                <div className="vertical-card accent-manufacturing">
                    <div className="vertical-icon-scene scene-manufacturing">
                        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                            <g className="gear-big" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="24" cy="26" r="9"/>
                                <line x1="24" y1="13" x2="24" y2="17"/>
                                <line x1="24" y1="35" x2="24" y2="39"/>
                                <line x1="11" y1="26" x2="15" y2="26"/>
                                <line x1="33" y1="26" x2="37" y2="26"/>
                                <line x1="15.7" y1="17.7" x2="18.5" y2="20.5"/>
                                <line x1="29.5" y1="31.5" x2="32.3" y2="34.3"/>
                                <line x1="32.3" y1="17.7" x2="29.5" y2="20.5"/>
                                <line x1="18.5" y1="31.5" x2="15.7" y2="34.3"/>
                            </g>
                            <g className="gear-small" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="41" cy="40" r="6.5"/>
                                <line x1="41" y1="30.5" x2="41" y2="33.5"/>
                                <line x1="41" y1="46.5" x2="41" y2="49.5"/>
                                <line x1="31.5" y1="40" x2="34.5" y2="40"/>
                                <line x1="47.5" y1="40" x2="50.5" y2="40"/>
                            </g>
                        </svg>
                    </div>
                    <h3 className="vertical-stat" data-count-to="60" data-suffix="%">0%</h3>
                    <p className="vertical-label">Fewer Miscommunications</p>
                    <div className="vertical-divider"></div>
                    <p className="vertical-industry">Manufacturing</p>
                    <div className="vertical-hover-note">Safety protocols, shop-floor instructions &amp; quality-control terminology.</div>
                </div>

                
                <div className="vertical-card accent-finance">
                    <div className="vertical-icon-scene scene-finance">
                        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                            <path className="finance-arrow" d="M6 44 L20 30 L28 37 L46 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M38 16 L46 16 L46 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="finance-bars">
                            <span style={{'--h': '35%', animationDelay: '0s'}}></span>
                            <span style={{'--h': '55%', animationDelay: '0.15s'}}></span>
                            <span style={{'--h': '40%', animationDelay: '0.3s'}}></span>
                            <span style={{'--h': '75%', animationDelay: '0.45s'}}></span>
                            <span style={{'--h': '95%', animationDelay: '0.6s'}}></span>
                        </div>
                    </div>
                    <h3 className="vertical-stat" data-count-to="3" data-suffix="x">0x</h3>
                    <p className="vertical-label">Faster Onboarding</p>
                    <div className="vertical-divider"></div>
                    <p className="vertical-industry">Finance</p>
                    <div className="vertical-hover-note">Client negotiations, compliance briefings &amp; investment terminology.</div>
                </div>

                
                <div className="vertical-card accent-healthcare">
                    <div className="vertical-icon-scene scene-healthcare">
                        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                                <path d="M20 4 C20 16, 40 16, 40 28 C40 40, 20 40, 20 52"/>
                                <path d="M40 4 C40 16, 20 16, 20 28 C20 40, 40 40, 40 52"/>
                                <line x1="21" y1="8" x2="39" y2="8"/>
                                <line x1="24" y1="16" x2="36" y2="16"/>
                                <line x1="21" y1="24" x2="39" y2="24"/>
                                <line x1="21" y1="32" x2="39" y2="32"/>
                                <line x1="24" y1="40" x2="36" y2="40"/>
                                <line x1="21" y1="48" x2="39" y2="48"/>
                            </g>
                        </svg>
                    </div>
                    
                    <h3 className="vertical-stat" data-count-to="90" data-suffix="%">0%</h3>
                    <p className="vertical-label">Compliance Rate</p>
                    <div className="vertical-divider"></div>
                    <p className="vertical-industry">Healthcare</p>
                    <div className="vertical-hover-note">Patient interactions, clinical documentation &amp; regulatory terminology.</div>
                </div>

            </div>
        </div>
    </section>
    
    <section className="testimonials-section">
        <div className="testimonials-inner">
            <span className="testimonials-badge">Loved by teams worldwide</span>
            <h2 className="testimonials-title">What our <span className="title-accent">customers say</span></h2>

            <div className="testimonials-viewport">
                <div className="testimonials-track" id="testimonials-track">

                    <div className="testimonial-card featured">
                        <div className="testimonial-stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p className="testimonial-quote">"WaGo transformed how our international team communicates with our Tokyo headquarters. The voice cloning feature makes practice feel incredibly natural — our employees actually <strong>look forward</strong> to their daily sessions."</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar">SC</div>
                            <div>
                                <p className="author-name">Sarah Chen</p>
                                <p className="author-role">VP of Global Operations, TechCorp International</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p className="testimonial-quote">"Rolling out to 8,000 employees across 12 countries would've taken years with a traditional vendor. WaGo had us live in six weeks."</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar avatar-2">MT</div>
                            <div>
                                <p className="author-name">Marcus Tanaka</p>
                                <p className="author-role">Head of L&amp;D, Meridian Manufacturing</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p className="testimonial-quote">"The compliance-specific vocabulary module alone paid for the platform. Our audit prep time dropped by half."</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar avatar-3">RP</div>
                            <div>
                                <p className="author-name">Riko Patel</p>
                                <p className="author-role">Director of Compliance, Sakura Health Group</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p className="testimonial-quote">"Our engineering and design teams finally speak the same shorthand in meetings with our Osaka office. No more lost-in-translation delays."</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar avatar-4">JL</div>
                            <div>
                                <p className="author-name">Jenna Lee</p>
                                <p className="author-role">COO, Northwind Logistics</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p className="testimonial-quote">"Executive dashboards actually get used now. Leadership can see fluency progress by region without asking L&amp;D for a report."</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar avatar-5">DK</div>
                            <div>
                                <p className="author-name">David Kim</p>
                                <p className="author-role">CHRO, Vertex Financial Group</p>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p className="testimonial-quote">"Onboarding new hires used to take a full quarter before they were client-ready in Japanese. Now it's under a month."</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar avatar-6">AM</div>
                            <div>
                                <p className="author-name">Aiko Morrison</p>
                                <p className="author-role">Director of Talent, Kaizen Group</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="testimonials-dots" id="testimonials-dots"></div>
        </div>
    </section>
    
    <section className="cta-section">
        <div className="cta-inner">
            <h2 className="cta-title">Ready to transform your <span className="title-accent">global communication?</span></h2>
            <p className="cta-subtitle">Join 500+ global enterprises already accelerating their Japanese language goals with WaGo.</p>

            <div className="cta-actions">
                <a href="#" className="cta-btn-primary"><span className="btn-label">Start 14-Day Free Trial <i className="fa-solid fa-arrow-right"></i></span></a>
                <a href="#" className="cta-btn-secondary"><span className="btn-label"><i className="fa-regular fa-calendar"></i> Schedule Demo</span></a>
            </div>

            <div className="cta-checklist">
                <span><i className="fa-solid fa-circle-check"></i> 14-day free trial</span>
                <span><i className="fa-solid fa-circle-check"></i> No credit card required</span>
                <span><i className="fa-solid fa-circle-check"></i> Cancel anytime</span>
            </div>
        </div>
    </section>

    
    <footer className="site-footer">
        <div className="footer-inner">

            <div className="footer-brand-col">
                <div className="footer-brand">
                    <div className="footer-logo-icon">和</div>
                    <span className="footer-brand-name">WaGo</span>
                </div>
                <p className="footer-tagline">Enterprise-grade Japanese language training powered by advanced AI voice technology.</p>
                <span className="footer-parent-tag">A product of NexZuku Japan</span>
                <div className="footer-social">
                    <a href="#" className="footer-social-link">Twitter</a>
                    <a href="#" className="footer-social-link">LinkedIn</a>
                    <a href="#" className="footer-social-link">GitHub</a>
                </div>
            </div>

            <div className="footer-links-col">
                <p className="footer-col-heading">Product</p>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Enterprise</a>
                <a href="#">Integrations</a>
            </div>

            <div className="footer-links-col">
                <p className="footer-col-heading">Company</p>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
            </div>

            <div className="footer-links-col">
                <p className="footer-col-heading">Legal</p>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Security</a>
                <a href="#">GDPR</a>
            </div>

        </div>

        <div className="footer-bottom">
            <p>&copy; 2026 NexZuku Japan. All rights reserved.</p>
            <p className="footer-location">Global HQ: Tokyo, Japan</p>
        </div>
    </footer>

    </>
  );
}
