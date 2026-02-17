import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PublicLayout from "@/layouts/PublicLayout";

interface ContactInfo {
  title: string;
  email?: string;
  phone?: string;
  liveChat?: string;
  imgSrc?: string;
  gradient?: string;
}

const contacts: ContactInfo[] = [
  {
    title: "General Inquiries",
    email: "info@kongossapay.com",
    phone: "[Main Number]",
    imgSrc: "banners/7.jpg",
    gradient: "bg-gradient-to-r from-white/80 via-white/70 to-white/60",
  },
  {
    title: "Privacy Matters",
    email: "privacy@kongossapay.com",
    imgSrc: "banners/8.jpg",
    gradient: "bg-gradient-to-r from-white/80 via-white/75 to-white/65",
  },
  {
    title: "Data Protection Officer",
    email: "dpo@kongossapay.com",
    imgSrc: "banners/9.jpg",
    gradient: "bg-gradient-to-r from-white/85 via-white/75 to-white/70",
  },
  {
    title: "Security Issues",
    email: "security@kongossapay.com",
    phone: "[24/7 Hotline]",
    imgSrc: "banners/10.jpg",
    gradient: "bg-gradient-to-r from-white/80 via-white/70 to-white/60",
  },
  {
    title: "Customer Support",
    email: "support@kongossapay.com",
    phone: "[Support Number]",
    liveChat: "Available 24/7",
    imgSrc: "banners/11.jpg",
    gradient: "bg-gradient-to-r from-white/85 via-white/75 to-white/65",
  },
  {
    title: "Legal Department",
    email: "legal@kongossapay.com",
    imgSrc: "banners/12.jpg",
    gradient: "bg-gradient-to-r from-white/80 via-white/70 to-white/60",
  },
  {
    title: "Compliance Department",
    email: "compliance@kongossapay.com",
    imgSrc: "banners/13.jpg",
    gradient: "bg-gradient-to-r from-white/85 via-white/75 to-white/65",
  },
  {
    title: "Marketing Opt-Out",
    email: "unsubscribe@kongossapay.com",
    imgSrc: "banners/14.jpg",
    gradient: "bg-gradient-to-r from-white/80 via-white/70 to-white/60",
  },
];


interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  { question: "How do I contact customer support?", answer: "Email support@kongossapay.com or call the support number. Live chat is available 24/7." },
  { question: "Where can I send privacy concerns?", answer: "Email privacy@kongossapay.com or contact dpo@kongossapay.com for data protection matters." },
  { question: "How do I report a security issue?", answer: "Email security@kongossapay.com or call our 24/7 hotline for emergencies." },
  { question: "Can I unsubscribe from marketing emails?", answer: "Yes, email unsubscribe@kongossapay.com to opt out of marketing communications." },
  { question: "Who do I contact for legal inquiries?", answer: "Email legal@kongossapay.com for any legal questions." },
  { question: "How is my data protected?", answer: "We comply with global data protection regulations. Contact our DPO for more details." },
  { question: "What is the typical response time?", answer: "Live chat responses are instant. Emails are usually answered within 24 hours." },
  { question: "Do you support business accounts?", answer: "Yes, our support team handles both business and individual inquiries." },
  { question: "Can I schedule a call?", answer: "Yes, request a call via support email or live chat." },
  { question: "Are support emails monitored 24/7?", answer: "Yes, all support emails are monitored around the clock." },
];

const ContactCard: React.FC<ContactInfo> = ({ title, email, phone, liveChat, imgSrc, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={`relative rounded-xl shadow-xl overflow-hidden ${gradient} text-white group`}
  >
    {/* Image with overlay */}
    {imgSrc && (
      <div className="relative w-full h-40 md:h-56 lg:h-64">
        <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700" />
      </div>
    )}

    {/* Content */}
    <Card className="bg-transparent shadow-none min-h-[10px]">
      <CardContent className="relative p-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex flex-col gap-1 mt-2 text-sm">
          {email && <span>Email: <a href={`mailto:${email}`} className="underline">{email}</a></span>}
          {phone && <span>Phone: {phone}</span>}
          {liveChat && <span>Live Chat: {liveChat}</span>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Contact: React.FC = () => {
  return (
    <PublicLayout>
    <div className="container mx-auto px-4 py-12 dark:text-white dark:bg-black">
      <h1 className="text-4xl font-extrabold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-500 to-yellow-400">
        Contact Directory & FAQs
      </h1>

      {/* Contact Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {contacts.map((contact, idx) => (
          <ContactCard key={idx} {...contact} />
        ))}
      </div>

      {/* FAQ Section */}
      <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400">
        Frequently Asked Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, index) => (
          <Accordion key={index} type="single" collapsible>
            <AccordionItem value={`faq-${index}`} className="bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg p-3">
              <AccordionTrigger className="text-white font-semibold cursor-pointer">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-300">{faq.answer}</AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
    </PublicLayout>
  );
};

export default Contact;
