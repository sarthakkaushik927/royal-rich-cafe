"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Image, Volume2, VolumeX, Mic, MicOff, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
  isLoading?: boolean;
}

export function RoyalAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Greetings, noble guest. I am Royal AI, your personal culinary concierge. May I suggest an exquisite pairing, details of our menu, or assist with your reservation today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle native speech synthesis
  const speakText = (text: string) => {
    if (!isSpeechEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a premium-sounding voice if possible
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.95; // Slightly slower, more premium pace
    window.speechSynthesis.speak(utterance);
  };

  // Simulate streaming response
  const streamAIResponse = (responseText: string) => {
    setIsTyping(true);
    const aiMessageId = `ai-${Date.now()}`;
    
    // Add empty message to start streaming
    setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '', isLoading: true }]);

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += Math.min(3 + Math.floor(Math.random() * 4), responseText.length - currentLength);
      const partialText = responseText.slice(0, currentLength);
      
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: partialText, isLoading: false } : m));

      if (currentLength >= responseText.length) {
        clearInterval(interval);
        setIsTyping(false);
        speakText(responseText);
      }
    }, 40);
  };

  // Process standard text requests
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const query = textToSend.toLowerCase();
    let response = "";

    // Dynamic responses based on context menu data
    if (query.includes('wagyu') || query.includes('miyazaki')) {
      response = `Our A5 Miyazaki Wagyu is the crown jewel of our kitchen. Priced at $120, it is seared over 1000-degree binchotan charcoal. We highly recommend pairing it with our Chateau Margaux 2015 wine.`;
    } else if (query.includes('wine') || query.includes('pair')) {
      response = "For our signature A5 Miyazaki Wagyu, our Sommelier recommends the Grand Cru Chateau Margaux 2015 ($95/glass) which offers deep notes of lilac and plum. For seafood, like our saffron butter-poached lobster, we recommend a crisp Chardonnay.";
    } else if (query.includes('vegetarian') || query.includes('veg') || query.includes('gluten')) {
      response = `Of course! We care deeply about dietary preferences. Our exquisite vegetarian signatures include: Dal Makhani, Paneer Butter Masala, and Malai Soya Chaap. Let us know if you have specific allergies, and our Chef will customize your plating.`;
    } else if (query.includes('allergy') || query.includes('nuts') || query.includes('shellfish')) {
      response = "Our concierge and chef staff prioritize your safety. Standard allergens like nuts are present in our Valrhona Chocolate Dome and Baklava dessert. Please mention this during reservation or order customization so our kitchen can implement sterile preparation.";
    } else if (query.includes('budget') || query.includes('cheap') || query.includes('under 50')) {
      response = `We offer multiple fine options under $50, such as our Black Truffle Wild Mushroom Risotto and our premium Cafe items. Excellent value without compromising on royal taste!`;
    } else if (query.includes('book') || query.includes('reserve') || query.includes('table')) {
      response = "I can assist you! You can head over to our Reservations tab to visually choose a table (like our premium Window seat or Fireplace table). Alternatively, you can book now by telling me the date and time.";
    } else if (query.includes('hours') || query.includes('time') || query.includes('open')) {
      response = "Royal Rich is open from 12:00 PM to 11:00 PM on weekdays (Monday - Friday), and 1:00 PM to 12:00 AM on weekends (Saturday & Sunday). Afternoon Tea is served from 3:00 PM to 5:00 PM daily.";
    } else {
      response = "I have recorded your interest. As a Michelin-grade restaurant, Royal Rich aims to exceed expectations. Would you like me to recommend a Chef Specialty, search the menu, or assist in calling our concierge?";
    }

    setTimeout(() => {
      streamAIResponse(response);
    }, 600);
  };

  // Simulated image identification
  const handleUploadSimulatedImage = (dishName: string, imageUrl: string) => {
    setShowImagePicker(false);
    
    // Add image message
    const userMsg: Message = { 
      id: `u-${Date.now()}`, 
      sender: 'user', 
      text: `Uploaded photo: ${dishName}`,
      image: imageUrl 
    };
    setMessages(prev => [...prev, userMsg]);

    // AI analysis response
    let response = "";
    if (dishName.includes('Wagyu')) {
      response = "Scanning image... I detect an exquisite marbling. Yes! This is our signature A5 Miyazaki Wagyu Ribeye. It features authentic Japanese beef seared over charcoal, rated at 820 calories. Would you like to add it to your reservation or order it directly?";
    } else if (dishName.includes('Caviar') || dishName.includes('Oyster')) {
      response = "Scanning image... That is our Royal Beluga Caviar & Oysters. Beautiful plating with 24k gold leaf and organic champagne foam. Would you like me to explain the sourcing of our oysters?";
    } else {
      response = `Scanning image... I identify elements of our signature culinary styling. This is our ${dishName}. Excellent choice!`;
    }

    setTimeout(() => {
      streamAIResponse(response);
    }, 1000);
  };

  // Mock voice input
  const handleToggleVoiceListen = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate listening and typing
      setTimeout(() => {
        setIsListening(false);
        const speechPhrases = [
          "Suggest a signature dish",
          "What wine goes with Wagyu?",
          "Show me reservations availability",
          "Vegan options available today"
        ];
        const randomPhrase = speechPhrases[Math.floor(Math.random() * speechPhrases.length)];
        setInputText(randomPhrase);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-[60] sm:w-[400px] h-[500px] max-h-[calc(100dvh-8rem)] bg-luxury-dark border border-luxury-gold/25 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-black/60 p-4 border-b border-luxury-gold/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-luxury-gold/10 border border-luxury-gold flex items-center justify-center animate-pulse overflow-hidden p-0.5">
                <img src="/chef-avatar.png" alt="Chef AI" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-luxury-gold tracking-wide">Royal AI</h3>
                <span className="text-[10px] text-green-500 font-sans tracking-widest flex items-center">
                  ● ONLINE CONCIERGE
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Text to Speech Toggle */}
              <button 
                onClick={() => {
                  setIsSpeechEnabled(!isSpeechEnabled);
                  if (isSpeechEnabled) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-full hover:bg-white/5 transition ${isSpeechEnabled ? 'text-luxury-gold' : 'text-luxury-accent/40'}`}
                title={isSpeechEnabled ? "Mute Voice Response" : "Unmute Voice Response"}
              >
                {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-luxury-accent/60 hover:text-luxury-gold transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Queue */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-luxury-bg/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-luxury-gold text-luxury-bg font-medium rounded-tr-none'
                    : 'glass-card text-luxury-accent rounded-tl-none border-luxury-gold/10'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded dish" className="rounded-lg mb-2 max-w-full h-auto border border-luxury-gold/20" />
                  )}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass-card text-luxury-accent rounded-2xl rounded-tl-none border-luxury-gold/10 px-4 py-3 flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Simulated Image Recognition Picker */}
          {showImagePicker && (
            <div className="bg-black/80 border-t border-luxury-gold/10 p-3 grid grid-cols-2 gap-2 animate-fade-in text-xs">
              <button 
                onClick={() => handleUploadSimulatedImage('A5 Miyazaki Wagyu', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300')}
                className="p-2 border border-luxury-gold/25 rounded hover:bg-luxury-gold/15 text-left text-luxury-gold truncate"
              >
                Upload Wagyu Steak
              </button>
              <button 
                onClick={() => handleUploadSimulatedImage('Beluga Caviar Oysters', 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=300')}
                className="p-2 border border-luxury-gold/25 rounded hover:bg-luxury-gold/15 text-left text-luxury-gold truncate"
              >
                Upload Caviar Oysters
              </button>
            </div>
          )}

          {/* Chips */}
          <div className="px-4 py-2 bg-black/40 overflow-x-auto flex space-x-2 no-scrollbar border-t border-luxury-gold/5">
            <button 
              onClick={() => handleSendMessage("Recommend a signature dish")}
              className="text-[11px] bg-luxury-card hover:bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/15 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              Chef Signature
            </button>
            <button 
              onClick={() => handleSendMessage("What wine goes with Wagyu?")}
              className="text-[11px] bg-luxury-card hover:bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/15 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              Wine Pairing
            </button>
            <button 
              onClick={() => handleSendMessage("Do you have vegan options?")}
              className="text-[11px] bg-luxury-card hover:bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/15 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              Vegetarian
            </button>
          </div>

          {/* Inputs Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }} 
            className="p-4 bg-black border-t border-luxury-gold/10 flex items-center space-x-2"
          >
            {/* Image recognition button */}
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className={`p-2 rounded-full transition hover:bg-white/5 ${showImagePicker ? 'text-luxury-gold' : 'text-luxury-accent/60'}`}
              title="Upload Food Image for AI Recognition"
            >
              <Image size={18} />
            </button>

            {/* Voice Input button */}
            <button
              type="button"
              onClick={handleToggleVoiceListen}
              className={`p-2 rounded-full transition hover:bg-white/5 ${isListening ? 'text-red-500 animate-pulse' : 'text-luxury-accent/60'}`}
              title="Voice input simulation"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening, speak now..." : "Ask Royal AI..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isListening}
              className="flex-1 bg-luxury-card border border-luxury-gold/25 text-white placeholder-luxury-textGrey/50 px-4 py-2 rounded-full text-sm focus:outline-none focus:border-luxury-gold transition duration-300"
            />
            
            <button
              type="submit"
              className="p-2 bg-luxury-gold text-luxury-bg rounded-full hover:opacity-90 transition shadow-lg"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Icon */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full gold-bg-gradient gold-glow-button flex items-center justify-center shadow-2xl relative border border-luxury-accent/25 cursor-pointer"
          title="Open Royal AI Concierge"
        >
          {isOpen ? <X size={24} className="text-luxury-bg" /> : <img src="/chef-avatar.png" alt="Chef AI" className="w-full h-full rounded-full object-cover p-1" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-luxury-accent"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
}
