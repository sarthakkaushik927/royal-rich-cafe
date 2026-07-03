import { useCallback } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionDivider } from "../common/SectionDivider";
import shrimpImg from "@/assets/shrimp.jpg";
import risottoImg from "@/assets/risotto.jpg";
import pastaImg from "@/assets/pasta.jpg";
import burgerImg from "@/assets/burger.jpg";
import bgImg from "@/assets/steak.jpg";

const items = [
  {
    id: 1,
    image: shrimpImg,
    alt: "Seafood shrimp dish",
    caption: "Discover Our Menu",
    cta: "View Menu",
  },
  {
    id: 2,
    image: risottoImg,
    alt: "Mushroom risotto",
    caption: "Chef's Specialties",
    cta: "Learn More",
  },
  {
    id: 3,
    image: pastaImg,
    alt: "Italian Pasta",
    caption: "Authentic Recipes",
    cta: "Taste Now",
  },
  {
    id: 4,
    image: burgerImg,
    alt: "Gourmet Burger",
    caption: "Premium Burgers",
    cta: "Order Now",
  },
];

export function ExquisiteCuisine() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 2000, stopOnInteraction: false })]
  );

  const prevSlide = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const nextSlide = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section 
      id="menu" 
      className="relative pt-8 md:pt-12 pb-24 md:pb-32 px-6 md:px-12 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#0D0B09]/70 via-[#0D0B09]/40 to-[#0D0B09]/70" />
      
      <SectionDivider className="mb-6 opacity-80" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-6xl mx-auto text-center mb-12"
      >
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#F7F3EC]">Exquisite Cuisine</h2>
        <p className="mt-4 md:mt-6 text-[#C7BFB2] tracking-[0.2em] md:tracking-[0.3em] uppercase text-sm md:text-lg">
          A Culinary Journey of Delight
        </p>
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-center">
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 md:-left-12 z-100 p-2 bg-black/40 hover:bg-[#D4A24C]/20 rounded-full text-[#D4A24C] hover:text-[#F7F3EC] transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft size={40} strokeWidth={1.5} />
        </button>

        <div className="w-full relative h-[460px] md:h-[660px] flex items-center justify-center overflow-hidden mt-8">
          <div className="overflow-hidden w-full h-full" ref={emblaRef}>
            <div className="flex h-full">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 px-4 flex flex-col items-center justify-center"
                >
                  <div className="p-2 border border-[#D4A24C]/40 rounded-sm bg-[#0D0B09]/60 backdrop-blur-sm shadow-2xl w-[90%] md:w-[90%] max-w-[400px] overflow-hidden group">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="w-full h-[320px] md:h-[500px] object-cover rounded-sm transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mt-6 md:mt-8 font-serif text-2xl md:text-3xl text-[#F7F3EC] tracking-wide text-center">
                    {item.caption}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={nextSlide}
          className="absolute right-2 md:-right-12 z-100 p-2 bg-black/40 hover:bg-[#D4A24C]/20 rounded-full text-[#D4A24C] hover:text-[#F7F3EC] transition-all cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight size={40} strokeWidth={1.5} />
        </button>
      </div>

      <SectionDivider className="mt-16 opacity-80" />
    </section>
  );
}
