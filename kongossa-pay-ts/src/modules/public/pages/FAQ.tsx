import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/layouts/PublicLayout";

interface FAQItem {
  question: string;
  answer: string;
  image?: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is a Tontine?",
    answer: "A Tontine is a financial arrangement where participants contribute to a pooled fund and receive payouts in turns.",
    image: "/banners/15.jpg"
  },
  {
    question: "How do I join a Tontine group?",
    answer: "You can join by signing up on the platform, selecting a Tontine group, and contributing the required amount.",
    image: "/banners/16.jpg"
  },
  {
    question: "Is my money safe?",
    answer: "Yes, our platform uses secure payment gateways and encryption to keep your funds protected.",
    image: "/banners/17.jpg"
  },
  {
    question: "Can I withdraw before my turn?",
    answer: "Some Tontines allow early withdrawal with a small penalty. Check the group rules before joining.",
    image: "/banners/18.jpg"
  },
  {
    question: "How are payouts calculated?",
    answer: "Payouts depend on the total fund and the number of participants. Each member gets their turn based on contributions.",
    image: "/banners/19.jpg"
  },
  {
    question: "Are there late fees?",
    answer: "Yes, late contributions may incur fees depending on the group’s rules.",
    image: "/banners/20.jpg"
  },
  {
    question: "How do I invite friends?",
    answer: "You can invite friends via a referral link shared in your dashboard.",
    image: "/banners/21.jpg"
  },
  {
    question: "Can I create my own Tontine?",
    answer: "Yes, you can create custom Tontines and set your own rules for contributions and payouts.",
    image: "/banners/22.jpg"
  },
  {
    question: "What currencies are supported?",
    answer: "We currently support USD, EUR, and local currencies depending on your region.",
    image: "/banners/23.jpg"
  },
  {
    question: "How do I contact support?",
    answer: "You can contact support via live chat or email. Response time is usually within 24 hours.",
    image: "/banners/24.jpg"
  },
];

const FAQ: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-black text-white dark:bg-gray-900 py-16 px-6 md:px-12">
      <motion.h1
        className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 mb-12 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Frequently Asked Questions
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {faqData.map((faq, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-purple-800 via-pink-700 to-yellow-600"
          >
            <Card className="bg-black/80 backdrop-blur-sm border border-white/10 ">
              {faq.image && (
                <img
                  src={faq.image}
                  alt={faq.question}
                  className="h-48 w-full object-cover"
                />
              )}
              <CardContent className="min-h-[150px]">
                <CardTitle className="text-lg font-bold mb-2 text-white">{faq.question}</CardTitle>
                <p className="text-gray-200">{faq.answer}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <Accordion type="single" collapsible>
          {faqData.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-white/10">
              <AccordionTrigger className="text-white font-semibold hover:text-yellow-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-200">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
    </PublicLayout>
  );
};

export default FAQ;
