import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CardNav from '../components/CardNav';
import Aurora from '../components/Aurora';

const LandingPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };
  
  const navItems = [
    {
      label: 'Features',
      bgColor: 'rgba(15, 31, 24, 0.8)',
      textColor: '#e4ff00',
      links: [
        { label: 'Disease Detection', href: '#features', ariaLabel: 'AI Crop Disease Detection' },
        { label: 'Farm Insights', href: '#features', ariaLabel: 'AI Farm Insights' },
        { label: 'Treatments', href: '#features', ariaLabel: 'Treatment & Prevention' }
      ]
    },
    {
      label: 'Learn',
      bgColor: 'rgba(15, 31, 24, 0.8)',
      textColor: '#e4ff00',
      links: [
        { label: 'How It Works', href: '#how-it-works', ariaLabel: 'How It Works section' },
        { label: 'Documentation', href: '#docs', ariaLabel: 'Documentation' },
        { label: 'Blog', href: '#blog', ariaLabel: 'Blog' }
      ]
    },
    {
      label: 'Account',
      bgColor: 'rgba(15, 31, 24, 0.8)',
      textColor: '#e4ff00',
      links: [
        { label: token ? 'Dashboard' : 'Sign In', href: token ? '/dashboard' : '/login', ariaLabel: token ? 'Go to Dashboard' : 'Sign In' },
        { label: !token ? 'Sign Up' : 'Profile', href: !token ? '/register' : '/profile', ariaLabel: !token ? 'Create Account' : 'Profile' },
        { label: 'Support', href: '#support', ariaLabel: 'Support' }
      ]
    }
  ];

  return (
    <div className="bg-[#0f1f18] text-white">
      <CardNav 
        logo="/assets/greencore-logo-full.png"
        logoAlt="GreenCore"
        items={navItems}
        centerLinks={[
          { label: 'Home', href: '#home' },
          { label: 'Features', href: '#features' },
          { label: 'How it works', href: '#how-it-works' }
        ]}
        rightLinks={
          token 
            ? [
                { label: 'Profile', href: '/profile' },
                { label: 'Logout', onClick: handleLogout, isAction: true }
              ]
            : [
                { label: 'Log In', href: '/login' },
                { label: 'Sign Up', href: '/register' }
              ]
        }
        baseColor="rgba(26, 58, 42, 0.7)"
        menuColor="rgb(255, 255, 251)"
        linkColor="#fafaf7"
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-sm">
          <div className="bg-[#1a3a2a] border border-[#e4ff00]/30 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-[#1a3a2a]">
          {/* Aurora Background */}
          <Aurora 
            colorStops={['#1a3a2a', '#e4ff00', '#1a3a2a']}
            amplitude={1.2}
            blend={0.6}
            speed={0.8}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Hero Text */}
              <div className="flex flex-col gap-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e4ff00]/20 text-[#e4ff00] text-xs font-bold uppercase tracking-widest w-fit">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI-Powered Diagnostics
                </div>
                
                <h1 className="text-5xl md:text-[4rem] font-black leading-[1.1] tracking-tight text-white">
                  Detect Crop<br/>
                  Diseases <span className="text-[#e4ff00]">Instantly</span><br/>
                  with AI
                </h1>
                
                <p className="text-lg text-gray-300 max-w-lg leading-relaxed mt-2">
                  Take a picture of your crop leaf and get instant diagnosis and treatment recommendations. Empower your farm with the future of agriculture technology.
                </p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <Link 
                    to={token ? "/scan" : "/register"} 
                    className="flex items-center gap-2 bg-[#e4ff00] text-[#1a3a2a] px-8 py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-[#e4ff00]/30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Scan Crop
                  </Link>
                  {!token && (
                    <Link 
                      to="/register" 
                      className="flex items-center gap-2 bg-transparent border-2 border-[#e4ff00] text-[#e4ff00] px-8 py-4 rounded-xl font-bold hover:bg-[#e4ff00]/10 transition-colors"
                    >
                      Create Account
                    </Link>
                  )}
                </div>
              </div>

              {/* Hero Image / Illustration Mockup */}
              <div className="relative lg:ml-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e4ff00]/20 to-transparent rounded-full blur-3xl opacity-50 transform -translate-x-10"></div>
                
                {/* Tilted Image Container */}
                <div className="relative bg-[#1a3a2a] border border-[#e4ff00]/30 p-3 rounded-[2rem] shadow-2xl transform rotate-3 transition-transform hover:rotate-0 duration-500">
                  <img 
                    alt="Farmer scanning crop" 
                    className="rounded-[1.5rem] w-full h-[450px] object-cover"
                    src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800"
                  />
                  
                  {/* Floating Diagnosis Badge */}
                  <div className="absolute -bottom-6 -left-8 bg-[#1a3a2a] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 transform -rotate-3 border border-[#e4ff00]/30">
                    <div className="bg-[#e4ff00]/20 p-2 rounded-full flex-shrink-0">
                      <svg className="w-5 h-5 text-[#e4ff00]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Diagnosis</p>
                      <p className="font-bold text-white text-sm">Healthy Maize Leaf</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[#0f1f18]" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-[#e4ff00] font-bold tracking-widest uppercase text-xs mb-4">Features</h2>
              <h3 className="text-3xl md:text-[2.5rem] font-bold text-white">Advanced AI for Modern Farming</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="p-10 rounded-3xl bg-[#1a3a2a]/50 border border-[#e4ff00]/20 hover:shadow-lg hover:border-[#e4ff00]/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#e4ff00]/20 flex items-center justify-center mb-8">
                  <svg className="w-6 h-6 text-[#e4ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4 text-white">AI Crop Disease Detection</h4>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Upload photos of leaves to identify pests and diseases in seconds with over 98% accuracy.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="p-10 rounded-3xl bg-[#1a3a2a]/50 border border-[#e4ff00]/20 hover:shadow-lg hover:border-[#e4ff00]/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#e4ff00]/20 flex items-center justify-center mb-8">
                  <svg className="w-6 h-6 text-[#e4ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4 text-white">AI Farm Insights</h4>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Get data-driven insights to optimize your crop yield, water usage, and soil health monitoring.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="p-10 rounded-3xl bg-[#1a3a2a]/50 border border-[#e4ff00]/20 hover:shadow-lg hover:border-[#e4ff00]/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#e4ff00]/20 flex items-center justify-center mb-8">
                  <svg className="w-6 h-6 text-[#e4ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-4 text-white">Treatment & Prevention</h4>
                <p className="text-gray-300 leading-relaxed text-sm">
                  Receive specific, actionable advice to cure infections and prevent future outbreaks effectively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 bg-[#1a3a2a]" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              {/* Text / Steps */}
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-[2.5rem] font-bold mb-14 text-white">How It Works</h2>
                <div className="space-y-12">
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-[#e4ff00] text-[#1a3a2a] flex items-center justify-center font-bold text-sm shadow-md">1</div>
                    <div>
                      <h5 className="text-lg font-bold mb-2 text-white">Capture a Photo</h5>
                      <p className="text-sm text-gray-300 leading-relaxed">Use your smartphone to take a clear photo of the affected plant leaf in natural lighting.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-[#e4ff00] text-[#1a3a2a] flex items-center justify-center font-bold text-sm shadow-md">2</div>
                    <div>
                      <h5 className="text-lg font-bold mb-2 text-white">AI Analysis</h5>
                      <p className="text-sm text-gray-300 leading-relaxed">Our neural networks analyze the image patterns against thousands of known disease markers.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-none w-10 h-10 rounded-full bg-[#e4ff00] text-[#1a3a2a] flex items-center justify-center font-bold text-sm shadow-md">3</div>
                    <div>
                      <h5 className="text-lg font-bold mb-2 text-white">Get Results</h5>
                      <p className="text-sm text-gray-300 leading-relaxed">Receive a detailed report including the disease name, severity level, and treatment plan.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staggered Images Gallery */}
              <div className="lg:w-1/2 w-full grid grid-cols-2 gap-6">
                <div className="pt-20">
                  <img 
                    alt="Close up of a green leaf" 
                    className="rounded-3xl shadow-xl w-full h-[280px] object-cover"
                    src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600"
                  />
                </div>
                <div>
                  <img 
                    alt="Smart farming technology" 
                    className="rounded-3xl shadow-xl w-full h-[280px] object-cover"
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-24 pt-10 bg-[#fafcfa] dark:bg-[#122017]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1bc559] rounded-[3rem] px-8 py-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
              
              <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10 tracking-tight">Ready to boost your harvest?</h2>
              <p className="text-base md:text-lg text-white/90 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
                Join thousands of modern farmers who trust GreenCore for their daily crop monitoring and health management.
              </p>
              
              {!token && (
                <Link 
                  to="/register" 
                  className="bg-white text-[#1bc559] px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all relative z-10 inline-block"
                >
                  Get Started for Free
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 pr-8">
              <div className="flex items-center gap-2 mb-6">
                <img src="/assets/greencore-logo-full.png" alt="GreenCore" className="h-20 w-auto" />
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Empowering the global agriculture community with accessible, AI-driven plant pathology solutions.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-[#1bc559]/10 hover:text-[#1bc559] text-slate-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-[#1bc559]/10 hover:text-[#1bc559] text-slate-500 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h6 className="font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">About</h6>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-500 hover:text-[#1bc559] transition-colors">Our Mission</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-[#1bc559] transition-colors">Team</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-[#1bc559] transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Documentation</h6>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-500 hover:text-[#1bc559] transition-colors">API Guide</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-[#1bc559] transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-[#1bc559] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h6 className="font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Contact</h6>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  support@greencore.ai
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Agriculture Valley, Tech City
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-medium">© 2026 GreenCore AI. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-xs font-medium text-slate-400 hover:text-[#1bc559] transition-colors">Terms</a>
              <a href="#" className="text-xs font-medium text-slate-400 hover:text-[#1bc559] transition-colors">Privacy</a>
              <a href="#" className="text-xs font-medium text-slate-400 hover:text-[#1bc559] transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;