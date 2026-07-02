import steak from "@/assets/steak.jpg";
import pasta from "@/assets/pasta.jpg";
import burger from "@/assets/burger.jpg";
import emma from "@/assets/emma.jpg";
import james from "@/assets/james.jpg";
import sarah from "@/assets/sarah.jpg";

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About Us", href: "#about" },
  { label: "Offers", href: "#offers" },
  { label: "Contact", href: "#contact" },
];

export const dishes = [
  { id: 1, name: "Grilled Steak", desc: "With Garlic & Herbs", price: 28, img: steak },
  { id: 2, name: "Seafood Pasta", desc: "In Spicy Tomato Sauce", price: 24, img: pasta },
  { id: 3, name: "Gourmet Burger", desc: "With Crispy Fries", price: 18, img: burger },
];

export const reviews = [
  {
    id: 1,
    name: "Emma R.",
    avatar: emma,
    rating: 5,
    text: "Absolutely fantastic! The food was delicious and the atmosphere was perfect. Highly recommend!",
  },
  {
    id: 2,
    name: "James P.",
    avatar: james,
    rating: 5,
    text: "The steak was cooked to perfection and the wine pairing was exceptional. A truly memorable evening.",
  },
  {
    id: 3,
    name: "Sarah L.",
    avatar: sarah,
    rating: 5,
    text: "From the ambience to the service, every detail was flawless. Golden Spice sets the bar for fine dining.",
  },
];
