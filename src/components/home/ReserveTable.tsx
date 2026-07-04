"use client";
import { useState, type SelectHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { BookOpen, Wine, Sparkles, ChevronDown } from "lucide-react";
import { GoldButton } from "../common/GoldButton";
import { ReservationModal } from "@/components/modals/ReservationModal";
import { toast } from "sonner";

function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full md:w-auto">
      <select
        {...props}
        className="appearance-none w-full md:w-52 bg-[#141110] text-[#F7F3EC] border border-[#D4A24C]/60 rounded-[4px] px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#D4A24C] cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#D4A24C]"
      />
    </div>
  );
}

const features = [
  { Icon: BookOpen, label: "Gourmet Cuisine" },
  { Icon: Wine, label: "Fine Wines & Cocktails" },
  { Icon: Sparkles, label: "Luxurious Ambiance" },
];

export function ReserveTable() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="reserve" className="relative py-24 md:py-32 px-6 md:px-12 flex flex-col justify-between min-h-[85vh]">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0D0B09]/80 to-[#0D0B09]" />
      
      <div className="relative z-10 max-w-5xl mx-auto text-center flex-1">
        <div className="flex items-center justify-center gap-6 mb-4">
          <span className="h-px w-16 md:w-24 bg-[#D4A24C]" />
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#F7F3EC]">
            Reserve Your Table
          </h2>
          <span className="h-px w-12 md:w-32 bg-[#D4A24C]" />
        </div>
        <p className="text-[#C7BFB2] text-lg md:text-2xl tracking-wide mb-12 md:mb-16">
          Experience an unforgettable evening with us.
        </p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            if (!date || !time || !guests) {
              toast.error("Please select a date, time, and guest count.");
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 w-full px-4 md:px-0"
        >
          <Select value={date} onChange={(e) => setDate(e.target.value)}>
            <option value="">Select Date</option>
            <option>Tonight</option>
            <option>Tomorrow</option>
            <option>This Weekend</option>
          </Select>
          <Select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Select Time</option>
            <option>6:00 PM</option>
            <option>7:30 PM</option>
            <option>9:00 PM</option>
          </Select>
          <Select value={guests} onChange={(e) => setGuests(e.target.value)}>
            <option value="">Guests</option>
            <option>2 Guests</option>
            <option>4 Guests</option>
            <option>6 Guests</option>
          </Select>
          <GoldButton type="submit">Reserve Now</GoldButton>
        </motion.form>

        <div className="mt-20 mb-20">
          <div className="h-px w-full bg-linear-to-r from-transparent via-[#D4A24C]/50 to-transparent mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {features.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 md:gap-4">
                <Icon size={48} strokeWidth={1} className="text-[#D4A24C] md:w-[56px] md:h-[56px]" />
                <p className="text-[#F7F3EC] tracking-widest text-sm md:text-base uppercase text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{ date, time, guests }}
      />
    </section>
  );
}
