import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, HeartHandshake, Target } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100/50 -z-10" />
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(230,115,76,0.05),transparent_40%)] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
             <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-6 border border-accent/20">
              A Modern Approach to Giving Back
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-brand-950 tracking-tight leading-[1.1] mb-8">
              Swing for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#eb8f6e]">Cause.</span><br />
              Win the Jackpot.
            </h1>
            <p className="text-xl md:text-2xl text-brand-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Enter your recent scores, compete in monthly weighted draws, and automatically support the charities you care about.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-accent/20">
                Start Subscription <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-900 mb-4">How It Works</h2>
            <p className="text-brand-600 max-w-2xl mx-auto text-lg">A seamless blend of community, competition, and charity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: <Target className="w-8 h-8 text-accent" />,
                title: "Log Your Rounds",
                desc: "Keep track of your latest 5 rounds (scores 1-45). Your performance weights the monthly draw pool.",
                delay: 0.1
              },
              {
                icon: <Trophy className="w-8 h-8 text-accent" />,
                title: "Monthly Draws",
                desc: "Our engine picks 5 numbers. Match 3, 4, or hit the Jackpot with 5 matches to win from the prize pool.",
                delay: 0.2
              },
              {
                icon: <HeartHandshake className="w-8 h-8 text-accent" />,
                title: "Support Charity",
                desc: "A minimum of 10% of your subscription goes directly to your selected charity every month.",
                delay: 0.3
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                className="bg-brand-50/50 p-8 rounded-3xl border border-brand-100 hover:border-brand-200 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-brand-50 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-display text-brand-900 mb-3">{feature.title}</h3>
                <p className="text-brand-600 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
