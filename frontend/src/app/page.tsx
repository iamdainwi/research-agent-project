import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Database,
  Globe,
  Layers,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
            <span className="font-inter text-lg tracking-tight">ResearchAgent</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/iamdanwi/research-agent-project"
              target="_blank"
              className="text-sm text-zinc-400 hover:text-white transition-colors font-inter hidden sm:block"
            >
              GitHub
            </Link>
            <Link href="/chat">
              <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors font-inter">
                Try Demo
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 text-center mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-medium text-blue-400 font-inter">
              v1.0 Public Beta
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-8 font-inter max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
            Research at the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600">
              speed of thought
            </span>
            .
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-instrument leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200">
            Transform complex questions into comprehensive, citation-backed
            research reports. Powered by autonomous AI agents that read, rank,
            and synthesize the web for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-300">
            <Link href="/chat" className="w-full sm:w-auto">
              <button className="group w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-medium text-base hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 font-inter shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                Start Researching
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-[#1a1a1c] border border-white/5 text-white rounded-full font-medium text-base hover:bg-[#202022] hover:border-white/10 transition-all font-inter">
              View Documentation
            </button>
          </div>

          {/* Visual Hint */}
           <div className="mt-20 relative max-w-5xl mx-auto rounded-xl border border-white/10 bg-[#121214] shadow-2xl shadow-blue-900/10 overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both delay-500 p-2">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-transparent pointer-events-none" />
             <div className="rounded-lg overflow-hidden bg-[#0d0d0f] relative min-h-[400px] flex flex-col">
                {/* Visual Mockup Content */}
                <div className="border-b border-white/5 p-4 flex items-center gap-4">
                   <div className="flex gap-1.5">
                     <div className="w-3 h-3 rounded-full bg-zinc-700/50" />
                     <div className="w-3 h-3 rounded-full bg-zinc-700/50" />
                     <div className="w-3 h-3 rounded-full bg-zinc-700/50" />
                   </div>
                   <div className="h-6 w-96 rounded-full bg-zinc-800/50 text-[10px] flex items-center px-3 text-zinc-500 font-mono">
                      research-agent/query: "future of solid state batteries"
                   </div>
                </div>
                
                <div className="p-8 md:p-12 flex-1 flex flex-col justify-center items-center gap-8">
                   <div className="flex items-center gap-4 opacity-50">
                      <div className="h-px w-20 bg-gradient-to-r from-transparent to-blue-500/50" />
                      <span className="text-xs uppercase tracking-widest text-blue-400 font-medium">Processing Pipeline</span>
                      <div className="h-px w-20 bg-gradient-to-l from-transparent to-blue-500/50" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                      {[
                        { icon: Search, label: "Deep Search", desc: "Aggregating 20+ sources" },
                        { icon: Brain, label: "Analysis", desc: "Synthesizing key insights" },
                        { icon: Layers, label: "Report", desc: "Generating citations" },
                      ].map((s, i) => (
                        <div key={i} className="bg-[#18181b] border border-white/5 rounded-lg p-6 flex flex-col items-center text-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                             <s.icon className="w-5 h-5" />
                           </div>
                           <div>
                             <div className="text-sm font-medium text-zinc-200">{s.label}</div>
                             <div className="text-xs text-zinc-500">{s.desc}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 md:px-6 mb-32">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-4 font-inter">Built for depth</h2>
              <p className="text-zinc-400 max-w-xl mx-auto font-instrument">
                Go beyond surface-level results. Our agentic pipeline ensures comprehensive coverage.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Globe,
                  title: "Multi-Source Aggregation",
                  desc: "Queries multiple search engines and scrapes dozens of pages to gather a wide range of perspectives."
                },
                {
                  icon: Database,
                  title: "Smart Deduplication",
                  desc: "Intelligent content fingerprinting removes redundant information, saving you reading time."
                },
                {
                  icon: Zap,
                  title: "Real-time Streaming",
                  desc: "Watch the research process unfold live with our low-latency Server-Sent Events architecture."
                },
                {
                  icon: Brain,
                  title: "LLM Reranking",
                  desc: "Articles are analyzed and scored by AI to ensure only the most relevant content is used."
                },
                {
                  icon: Layers,
                  title: "Fact-Based Citations",
                  desc: "Every claim in the generated summary is linked directly to its source for easy verification."
                },
                {
                  icon: Sparkles,
                  title: "Zero Hallucinations",
                  desc: "Strict adherence to source material minimizes AI creativity in favor of factual accuracy."
                }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#121214] border border-white/5 hover:border-white/10 transition-colors group">
                   <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                   </div>
                   <h3 className="text-lg font-medium text-white mb-2 font-inter">{feature.title}</h3>
                   <p className="text-sm text-zinc-400 leading-relaxed font-instrument">
                      {feature.desc}
                   </p>
                </div>
              ))}
           </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 md:px-6 mb-32 border-y border-white/5 py-24 bg-[#0d0d0f]/50">
           <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium text-white mb-16 font-inter text-center">How it works</h2>
              
              <div className="space-y-12">
                 {[
                   {
                     step: "01",
                     title: "Query Expansion and Understanding",
                     desc: "The agent analyzes your prompt and generates multiple semantic variations to cast a wide net across the web."
                   },
                   {
                     step: "02",
                     title: "Deep Web Crawl and Extraction",
                     desc: "We fetch dozens of pages concurrently, strip the clutter, and extract the core content using advanced parsing algorithms."
                   },
                   {
                     step: "03",
                     title: "Note-Taking and Synthesis",
                     desc: "The Analyst Agent reads the ranked content, identifies key facts, and writes a cohesive report with citations."
                   }
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start opacity-80 hover:opacity-100 transition-opacity">
                      <div className="text-4xl font-normal text-zinc-800 font-mono shrink-0 select-none">
                        {item.step}
                      </div>
                      <div className="pt-2">
                         <h3 className="text-xl font-medium text-white mb-2 font-inter">{item.title}</h3>
                         <p className="text-zinc-400 font-instrument leading-relaxed max-w-xl">
                            {item.desc}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-6 text-center">
           <div className="p-12 md:p-24 rounded-3xl bg-linear-to-b from-[#18181b] to-[#0a0a0b] border border-white/5 relative overflow-hidden group">
              
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-700" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 font-inter tracking-tight">
                  Ready to dive deep?
                </h2>
                <p className="text-lg text-zinc-400 mb-8 max-w-lg mx-auto font-instrument">
                  Stop scrolling through endless search results. Get the answers you need in seconds.
                </p>
                <Link href="/chat">
                  <button className="px-8 py-4 bg-white text-black rounded-full font-medium text-base hover:bg-zinc-200 transition-colors font-inter shadow-lg shadow-white/5">
                    Start Researching Now
                  </button>
                </Link>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#050506]">
         <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
               <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-bold">R</span>
               <span className="font-instrument">© 2026 Research Agent. Open Source.</span>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500 font-instrument">
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
               <a href="#" className="hover:text-white transition-colors">GitHub</a>
               <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
