
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  MessageCircle, 
  Mail, 
  Phone,
  Clock,
  CheckCircle,
  HelpCircle,
  Send,
  LifeBuoy, // Added
  BookOpen, // Added
  ShieldCheck // Added
} from "lucide-react";
import { Link } from "react-router-dom"; // Added
import { createPageUrl } from "@/utils"; // Added

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Support form submitted:', formData);
    alert('Thank you! We\'ll get back to you within 24 hours.');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
            🎧 Customer Support
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            We're Here to
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Help You
            </span>
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Get the support you need, when you need it. Our dedicated team is available 
            24/7 to assist with any questions or concerns.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Multiple ways to reach us
            </h2>
            <p className="text-xl text-slate-600">
              Choose the method that works best for you
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
                title: "Live Chat",
                description: "Chat with our support team instantly",
                availability: "24/7 Available",
                action: "Start Chat"
              },
              {
                icon: <Mail className="w-8 h-8 text-green-600" />,
                title: "Email Support",
                description: "Get detailed help via email",
                availability: "Response in 2-4 hours",
                action: "Send Email"
              },
              {
                icon: <Phone className="w-8 h-8 text-purple-600" />,
                title: "Phone Support",
                description: "Speak directly with our team",
                availability: "Mon-Fri 8AM-8PM",
                action: "Call Now"
              },
              {
                icon: <HelpCircle className="w-8 h-8 text-amber-600" />,
                title: "Help Center",
                description: "Find answers in our knowledge base",
                availability: "Self-service 24/7",
                action: "Browse FAQs"
              }
            ].map((option, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {option.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{option.title}</h3>
                  <p className="text-slate-600 mb-3">{option.description}</p>
                  <Badge variant="outline" className="mb-4">
                    <Clock className="w-3 h-3 mr-1" />
                    {option.availability}
                  </Badge>
                  <Button className="w-full bg-slate-900 text-white">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Send us a message
            </h2>
            <p className="text-xl text-slate-600">
              Fill out the form below and we'll get back to you as soon as possible
            </p>
          </div>
          <Card className="p-8 shadow-lg border-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="business">Business Inquiry</SelectItem>
                      <SelectItem value="agent">Agent Application</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Send className="mr-2 w-5 h-5" />
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Quick answers to common questions
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "How do I create a KongossaPay account?",
                answer: "Creating an account is simple! Download our mobile app or visit our website, click 'Sign Up', and follow the prompts to verify your phone number and complete the setup process."
              },
              {
                question: "What are the fees for sending money?",
                answer: "Our fees are transparent and competitive. Domestic transfers start at $0.99, while international transfers vary by destination. Business accounts have different pricing structures."
              },
              {
                question: "How secure is KongossaPay?",
                answer: "We use bank-grade security including 256-bit encryption, multi-factor authentication, and fraud monitoring. Your funds and personal information are fully protected."
              },
              {
                question: "Can I use KongossaPay for my business?",
                answer: "Yes! We offer comprehensive business solutions including payment processing, invoicing, analytics, and API integration. Contact our sales team to learn more."
              },
              {
                question: "How do I become a KongossaPay agent?",
                answer: "Visit our Agent page to learn about requirements and apply online. We provide training and support to help you succeed as an agent in your community."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6 bg-white border-0">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 pl-8">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Security Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Our Commitment to Security
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            Your trust is our top priority. We employ bank-level security measures to protect your data and funds. Our platform is designed with security at its core, and while full PCI DSS certification is a comprehensive process involving our payment partners and infrastructure, we adhere to its strict principles in all our operations.
          </p>
          <Link to={createPageUrl("Privacy")}>
            <Button variant="link">Learn more about our security practices</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
