import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Users, 
  Globe, 
  Award,
  Shield,
  TrendingUp
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
            🚀 About KongossaPay
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Democratizing Financial Services
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}for Everyone
            </span>
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            We're on a mission to make financial services accessible, affordable, and secure 
            for individuals and businesses around the world.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="p-8 bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  To empower individuals and businesses with simple, secure, and affordable financial 
                  tools that enable them to send money, make payments, save together, and build wealth. 
                  We believe everyone deserves access to modern financial services, regardless of their 
                  location or economic status.
                </p>
              </CardContent>
            </Card>
            <Card className="p-8 bg-white border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  To become the world's most trusted financial platform, connecting communities 
                  globally through innovative digital solutions. We envision a future where 
                  financial inclusion is universal, and every person has the tools they need to 
                  achieve their financial goals and improve their quality of life.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: "Security First",
                description: "We prioritize the security and privacy of our users' data and funds with enterprise-grade protection."
              },
              {
                icon: <Users className="w-8 h-8 text-green-600" />,
                title: "Community Focused",
                description: "We build products that strengthen communities and enable people to support each other financially."
              },
              {
                icon: <Target className="w-8 h-8 text-purple-600" />,
                title: "Innovation",
                description: "We continuously innovate to provide cutting-edge solutions that meet evolving customer needs."
              },
              {
                icon: <Globe className="w-8 h-8 text-amber-600" />,
                title: "Accessibility",
                description: "We make financial services accessible to everyone, regardless of their background or location."
              },
              {
                icon: <Award className="w-8 h-8 text-red-600" />,
                title: "Excellence",
                description: "We strive for excellence in everything we do, from product development to customer service."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
                title: "Empowerment",
                description: "We empower our users with tools and knowledge to make informed financial decisions."
              }
            ].map((value, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-slate-50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-slate-600">
              From startup to global platform
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                year: "2020",
                title: "KongossaPay Founded",
                description: "Started with a vision to make financial services accessible to everyone, beginning with basic money transfer features."
              },
              {
                year: "2021",
                title: "First Million Users",
                description: "Reached our first million users milestone and launched business payment solutions for merchants."
              },
              {
                year: "2022",
                title: "Digital Tontine Launch",
                description: "Introduced our innovative digital tontine system, revolutionizing how communities save together."
              },
              {
                year: "2023",
                title: "Global Expansion",
                description: "Expanded to 150+ countries and launched our comprehensive API platform for developers."
              },
              {
                year: "2024",
                title: "Agent Network",
                description: "Built the largest financial agent network, providing services to underserved communities worldwide."
              }
            ].map((milestone, index) => (
              <div key={index} className="flex gap-8">
                <div className="w-20 flex-shrink-0 text-right">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{milestone.year}</span>
                  </div>
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                  <p className="text-slate-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-slate-600">
              Meet the people behind KongossaPay
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "David Okafor",
                role: "CEO & Founder", 
                bio: "Former fintech executive with 15+ years experience building payment platforms across Africa.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              },
              {
                name: "Sarah Johnson",
                role: "CTO",
                bio: "Tech leader and former Google engineer, specializing in secure payment systems and blockchain.",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              },
              {
                name: "Michael Chen",
                role: "Head of Product",
                bio: "Product strategist with extensive experience in mobile-first financial products and user experience.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              }
            ].map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-slate-50">
                <CardContent className="p-0">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}