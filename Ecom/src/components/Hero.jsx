import { useState, useEffect } from "react";

const Hero = () => {
  const images = [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507764923504-cd90bf7da772?q=80&w=1200&auto=format&fit=crop",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Transitions every 4 seconds
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary-900 via-indigo-900 to-primary-800 text-white py-24 sm:py-32">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-[800px] h-[600px] bg-primary-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center relative z-10 gap-12">
        
        <div className="md:w-1/2">
           <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-200 text-sm font-semibold tracking-wider mb-6 border border-primary-400/20 transition-all">
             NEW COLLECTION
           </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
            Elevate Your <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-200 to-indigo-200">Lifestyle</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-lg leading-relaxed">
            Discover premium curated products built for the modern individual. Quality you can feel, design you will love.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Fixed button text visibility bug (changed from text-primary-900 to text-indigo-900) */}
            <button className="bg-white text-indigo-900 px-8 py-3.5 rounded-xl font-extrabold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
              Shop Now
            </button>
            <button className="bg-primary-800/50 backdrop-blur-sm border border-primary-500/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700/50 transition-all duration-300">
              Explore Categories
            </button>
          </div>
        </div>

        <div className="md:w-1/2 w-full mt-10 md:mt-0 relative group">
          <div className="absolute inset-0 bg-linear-to-r from-primary-400 to-indigo-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          
          {/* Glassmorphic Container */}
          <div className="relative aspect-4/3 rounded-3xl shadow-2xl border border-white/10 bg-primary-800/20 backdrop-blur-sm p-2 overflow-hidden flex items-center justify-center">
             
             {/* Slider Wrapper */}
             <div className="relative w-full h-full rounded-2xl overflow-hidden">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Dynamic Hero Showcase ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover shadow-inner transition-opacity duration-1000 ease-in-out ${
                      index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  />
                ))}
             </div>
             
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
