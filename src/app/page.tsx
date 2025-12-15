"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Brain, Heart, Leaf, MessageCircle, Share2, Users, Target, CalendarCheck, Sparkles, Clock, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { MobileFrame } from "@/components/shared/MobileFrame";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [activeFeature, setActiveFeature] = useState("connect");

  // Optionally redirect authenticated users to home
  // Commented out to allow authenticated users to view landing page if they want
  // useEffect(() => {
  //   if (!loading && isAuthenticated) {
  //     router.push("/home");
  //   }
  // }, [isAuthenticated, loading, router]);

  const handleAuthClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) {
      e.preventDefault();
      router.push("/home");
    }
    // If not authenticated, let the link work normally (go to /auth)
  };
  const heroImage = PlaceHolderImages.find(img => img.id === 'landing-hero');
  const featureConnectImage = PlaceHolderImages.find(img => img.id === 'feature-connect');
  const featureConverseImage = PlaceHolderImages.find(img => img.id === 'feature-converse');
  const featureHabitsImage = PlaceHolderImages.find(img => img.id === 'feature-habits');
  const featureCheckinsImage = PlaceHolderImages.find(img => img.id === 'feature-checkins');
  const featureMeditationImage = PlaceHolderImages.find(img => img.id === 'feature-meditation');
  const teamMembers = [
    { name: 'Dr. Anya Sharma', title: 'Mindfulness Coach', imageId: 'team-member-1' },
    { name: 'Ben Carter', title: 'Community Guide', imageId: 'team-member-2' },
    { name: 'Chloe Davis', title: 'Content Curator', imageId: 'team-member-3' },
  ]
  const faqItems = [
    {
      question: "What is ZenZone?",
      answer: "ZenZone is your lifelong guide to better mental health. Through evidence-based meditation and mindfulness tools, sleep resources, mental health coaching, and more, ZenZone helps you create life-changing habits to support your mental health and find a healthier, happier you."
    },
    {
      question: "What is ZenZone's mission?",
      answer: "ZenZone was founded with the mission to revolutionize mental health for humanity and to guide you to more joy, less stress, and the best sleep of your life. A better day at work, home, and all the moments in between — ZenZone makes it easy for you to love your mind."
    },
    {
      question: "How do I download the ZenZone app?",
      answer: "The ZenZone app is currently available on Apple (iPhone, iPad, iPod Touch) and Android (smartphone and tablet) devices. Sign up for a ZenZone account, and then you'll be directed to download the app to get started."
    },
    {
      question: "What is included in a ZenZone app subscription?",
      answer: "Once you've subscribed, your subscription will include: 1,000+ expert-led exercises: Mood-boosting meditations and stress-relieving tools for all of life's moments. Find your best sleep: Rest easy with relaxing wind downs, soundscapes, and fan-favorite sleepcasts. Proven mental health resources: Reach your goals with tools backed by research and delivered by trained mindfulness experts. You can also add mental health coaching to your plan. If you need help choosing a plan or subscribing, please visit our FAQs."
    },
    {
      question: "How much does ZenZone cost?",
      answer: "You can check out all of our different subscription plans, which include our Annual and Monthly plans. We also have student and family plans, as well as a gift option."
    },
    {
      question: "Does my ZenZone subscription automatically renew?",
      answer: "Yes, your annual or monthly subscription will auto-renew. Unless canceled, monthly subscriptions automatically renew each month and annual subscriptions automatically renew each year on the day you subscribed. Your subscription can be canceled at any time."
    },
    {
      question: "How do I cancel my ZenZone subscription?",
      answer: "If you need help canceling your subscription, you can learn more in our help center."
    },
    {
      question: "How can I support my team's mental health at work?",
      answer: "Request a demo to learn more about how we help you support your team. ZenZone is here to provide mindfulness, coaching, EAP, therapy, psychiatry, and more to organizations worldwide."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            {loading ? (
              <>
                <Button variant="secondary" className="rounded-full" disabled>Sign In</Button>
                <Button className="rounded-full" disabled>Get Started</Button>
              </>
            ) : isAuthenticated ? (
              <>
                <Link href="/home">
                  <Button variant="secondary" className="rounded-full">Go to Home</Button>
                </Link>
                <Link href="/profile/me">
                  <Button className="rounded-full">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" onClick={handleAuthClick}>
                  <Button variant="secondary" className="rounded-full">Sign In</Button>
                </Link>
                <Link href="/auth" onClick={handleAuthClick}>
                  <Button className="rounded-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  A team that's here for you.
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                  ZenZone is more than just an app. We're a team of guides, coaches, and community leaders dedicated to helping you find your calm.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  {loading ? (
                    <Button size="lg" className="w-full rounded-full sm:w-auto" disabled>
                      Loading...
                    </Button>
                  ) : isAuthenticated ? (
                    <Link href="/home">
                      <Button size="lg" className="w-full rounded-full sm:w-auto">
                        Go to Home <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth" onClick={handleAuthClick}>
                      <Button size="lg" className="w-full rounded-full sm:w-auto">
                        Get Started for Free <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                {heroImage && (
                  <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      className="object-cover"
                      data-ai-hint={heroImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">BLOG</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Resources To Fuel Your Mindfulness Journey
                </h2>
              </div>
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">
                More Resources <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Blog Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Blog Card 1 */}
              <div className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">BLOG</span>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center">
                          <Brain className="w-12 h-12 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      Everything You Need To Know About Mindfulness Practice
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>3 Min Read</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Card 2 - Video */}
              <div className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">VIDEO</span>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Play className="w-8 h-8 text-primary fill-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      Guided Meditation Techniques - Build Your Daily Practice
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>3 Min Watch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Card 3 */}
              <div className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">BLOG</span>
                  </div>
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center">
                          <Heart className="w-12 h-12 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      The Role of Self-Care in Mental Health & Well-being
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>5 Min Read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Tabs */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Features</h2>
            </div>

            <Tabs value={activeFeature} onValueChange={setActiveFeature} className="w-full">
              <div className="flex justify-center mb-12">
                <TabsList className="inline-flex h-auto p-1 bg-secondary rounded-full gap-1">
                  <TabsTrigger 
                    value="connect" 
                    className="rounded-full px-4 py-2 text-sm font-medium bg-transparent text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all hover:text-foreground"
                  >
                    Connect & Share
                  </TabsTrigger>
                  <TabsTrigger 
                    value="converse" 
                    className="rounded-full px-4 py-2 text-sm font-medium bg-transparent text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all hover:text-foreground"
                  >
                    Conversations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="habits" 
                    className="rounded-full px-4 py-2 text-sm font-medium bg-transparent text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all hover:text-foreground"
                  >
                    Habits Tracker
                  </TabsTrigger>
                  <TabsTrigger 
                    value="checkins" 
                    className="rounded-full px-4 py-2 text-sm font-medium bg-transparent text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all hover:text-foreground"
                  >
                    Daily Check-ins
                  </TabsTrigger>
                  <TabsTrigger 
                    value="meditation" 
                    className="rounded-full px-4 py-2 text-sm font-medium bg-transparent text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all hover:text-foreground"
                  >
                    Guided Meditation
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* Connect & Share */}
              <TabsContent value="connect" className="mt-0">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center min-h-[600px]" style={{ backgroundColor: '#8B5CF6' }}>
                  <div className="flex justify-center lg:justify-start p-8 lg:p-12">
                    <MobileFrame className="w-full max-w-[280px]">
                      <div className="h-full bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                        {featureConnectImage && (
                          <div className="relative h-full w-full rounded-2xl overflow-hidden">
                            <Image
                              src={featureConnectImage.imageUrl}
                              alt={featureConnectImage.description}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              data-ai-hint={featureConnectImage.imageHint}
                            />
                          </div>
                        )}
                      </div>
                    </MobileFrame>
                  </div>
                  <div className="flex flex-col justify-center space-y-6 p-8 lg:p-12 text-white">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Connect & Share</h2>
                    <p className="max-w-xl text-lg md:text-xl opacity-90">
                      Share your moments and connect with a community that cares. Our feed is designed to be a calm space for you to express yourself and engage with content that matters.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Share2 className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>A beautiful, minimalist feed to share updates, photos, and ideas.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Build your circle by following people who inspire you.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Mindful Conversations */}
              <TabsContent value="converse" className="mt-0">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center min-h-[600px]" style={{ backgroundColor: '#10B981' }}>
                  <div className="flex justify-center lg:justify-start p-8 lg:p-12">
                    <div className="flex gap-4 w-full max-w-[600px]">
                      <MobileFrame className="w-full max-w-[280px]">
                        <div className="h-full bg-white p-4 flex flex-col">
                          {/* Messages Header */}
                          <div className="flex items-center gap-3 pb-3 border-b">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                            <div>
                              <div className="font-semibold text-sm">Sarah</div>
                              <div className="text-xs text-gray-500">Active now</div>
                            </div>
                          </div>
                          {/* Messages */}
                          <div className="flex-1 overflow-y-auto py-4 space-y-3">
                            <div className="flex justify-start">
                              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                                <p className="text-sm text-gray-800">Hey! How are you doing today?</p>
                                <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                                <p className="text-sm text-white">I'm doing great, thanks for asking! 😊</p>
                                <p className="text-xs text-blue-100 mt-1">10:32 AM</p>
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                                <p className="text-sm text-gray-800">That's wonderful to hear! Want to grab coffee this weekend?</p>
                                <p className="text-xs text-gray-500 mt-1">10:33 AM</p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                                <p className="text-sm text-white">Absolutely! Saturday works for me</p>
                                <p className="text-xs text-blue-100 mt-1">10:35 AM</p>
                              </div>
                            </div>
                          </div>
                          {/* Input */}
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <input 
                              type="text" 
                              placeholder="Type a message..." 
                              className="flex-1 text-sm px-4 py-2 bg-gray-100 rounded-full focus:outline-none"
                              readOnly
                            />
                          </div>
                        </div>
                      </MobileFrame>
                      <MobileFrame className="w-full max-w-[280px] hidden lg:block -mt-8">
                        <div className="h-full bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 flex flex-col">
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center">
                                <MessageCircle className="w-12 h-12 text-yellow-600" />
                              </div>
                              <p className="text-sm font-semibold text-yellow-900">LISTENS</p>
                              <p className="text-xs text-yellow-700 mt-1">State your needs</p>
                            </div>
                          </div>
                        </div>
                      </MobileFrame>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-6 p-8 lg:p-12 text-white">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Mindful Conversations</h2>
                    <p className="max-w-xl text-lg md:text-xl opacity-90">
                      Engage in private, one-on-one conversations. Our chat is a sanctuary for deeper connections, away from the noise of public feeds.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <MessageCircle className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Clean and intuitive interface for seamless messaging.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Focus on quality conversations with the people who matter to you.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Habits Tracker */}
              <TabsContent value="habits" className="mt-0">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center min-h-[600px]" style={{ backgroundColor: '#3B82F6' }}>
                  <div className="flex justify-center lg:justify-start p-8 lg:p-12">
                    <MobileFrame className="w-full max-w-[280px]">
                      <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                        {featureHabitsImage && (
                          <div className="relative h-full w-full rounded-2xl overflow-hidden">
                            <Image
                              src={featureHabitsImage.imageUrl}
                              alt={featureHabitsImage.description}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              data-ai-hint={featureHabitsImage.imageHint}
                            />
                          </div>
                        )}
                      </div>
                    </MobileFrame>
                  </div>
                  <div className="flex flex-col justify-center space-y-6 p-8 lg:p-12 text-white">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Habits Tracker</h2>
                    <p className="max-w-xl text-lg md:text-xl opacity-90">
                      Build positive routines and track your progress with our intuitive habits tracker. Create meaningful habits that support your well-being and watch your growth over time.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Target className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Set and track daily, weekly, or custom habit goals with ease.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Brain className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Visualize your progress with beautiful charts and streaks.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Daily Check-ins */}
              <TabsContent value="checkins" className="mt-0">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center min-h-[600px]" style={{ backgroundColor: '#F59E0B' }}>
                  <div className="flex justify-center lg:justify-start p-8 lg:p-12">
                    <MobileFrame className="w-full max-w-[280px]">
                      <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                        {featureCheckinsImage && (
                          <div className="relative h-full w-full rounded-2xl overflow-hidden">
                            <Image
                              src={featureCheckinsImage.imageUrl}
                              alt={featureCheckinsImage.description}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              data-ai-hint={featureCheckinsImage.imageHint}
                            />
                          </div>
                        )}
                      </div>
                    </MobileFrame>
                  </div>
                  <div className="flex flex-col justify-center space-y-6 p-8 lg:p-12 text-white">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Daily Check-ins</h2>
                    <p className="max-w-xl text-lg md:text-xl opacity-90">
                      Take a moment each day to reflect on how you're feeling. Our daily check-ins help you stay connected with yourself and build self-awareness.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CalendarCheck className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Quick and thoughtful prompts to guide your daily reflection.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Track your emotional well-being and patterns over time.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Guided Meditation */}
              <TabsContent value="meditation" className="mt-0">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center min-h-[600px]" style={{ backgroundColor: '#EC4899' }}>
                  <div className="flex justify-center lg:justify-start p-8 lg:p-12">
                    <MobileFrame className="w-full max-w-[280px]">
                      <div className="h-full bg-gradient-to-br from-pink-50 to-pink-100 p-4">
                        {featureMeditationImage && (
                          <div className="relative h-full w-full rounded-2xl overflow-hidden">
                            <Image
                              src={featureMeditationImage.imageUrl}
                              alt={featureMeditationImage.description}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                              data-ai-hint={featureMeditationImage.imageHint}
                            />
                          </div>
                        )}
                      </div>
                    </MobileFrame>
                  </div>
                  <div className="flex flex-col justify-center space-y-6 p-8 lg:p-12 text-white">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Guided Meditation</h2>
                    <p className="max-w-xl text-lg md:text-xl opacity-90">
                      Find peace and clarity with our library of guided meditations. Whether you're new to mindfulness or deepening your practice, we have sessions for every moment and mood.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Sparkles className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Explore hundreds of guided sessions for relaxation, focus, and sleep.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Heart className="mt-1 h-5 w-5 flex-shrink-0" />
                        <span>Personalized recommendations based on your needs and goals.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Path to Feeling Better Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">A path to feeling better</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                We've designed every feature to be intentional, promoting a healthier social experience across all aspects of your life.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary shadow-diffused">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Mind</h3>
                <p className="mt-2 text-muted-foreground">
                  Engage with content and conversations that are enriching and reduce mental clutter.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary shadow-diffused">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Life</h3>
                <p className="mt-2 text-muted-foreground">
                  Build genuine connections and find support for your daily life and interests.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary shadow-diffused">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Body</h3>
                <p className="mt-2 text-muted-foreground">
                  Find inspiration for a healthy lifestyle, from mindfulness practices to physical activities.
                </p>
              </div>
            </div>
          </div>
        </section>

         {/* Final CTA */}
         <section className="bg-primary/5 py-16 md:py-24 lg:py-32">
          <div className="container mx-auto text-center px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Ready to find your zone?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Create an account in minutes and start your journey towards a more mindful social life.
            </p>
            <div className="mt-8">
                {loading ? (
                  <Button size="lg" className="rounded-full" disabled>
                    Loading...
                  </Button>
                ) : isAuthenticated ? (
                  <Link href="/home">
                    <Button size="lg" className="rounded-full">
                      Go to Home
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth" onClick={handleAuthClick}>
                    <Button size="lg" className="rounded-full">
                      Join ZenZone Now
                    </Button>
                  </Link>
                )}
            </div>
          </div>
        </section>

        {/* Meet Your Care Team Section */}
        <section className="bg-secondary py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Meet your care team</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Our team is a group of passionate individuals committed to fostering a positive and mindful community.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
              {teamMembers.map((member) => {
                const memberImage = PlaceHolderImages.find(img => img.id === member.imageId);
                return (
                  <div key={member.name} className="flex flex-col items-center text-center">
                    {memberImage && (
                      <Avatar className="h-32 w-32 border-4 border-background">
                        <AvatarImage src={memberImage.imageUrl} alt={member.name} data-ai-hint={memberImage.imageHint} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <h3 className="mt-4 text-xl font-semibold">{member.name}</h3>
                    <p className="text-muted-foreground">{member.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* User Reviews Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            {/* Hero Headline with Face Elements */}
            <div className="relative mb-16 md:mb-20">
              <div className="max-w-4xl mx-auto text-center relative">
                {/* Decorative Star Elements */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 md:left-[45%] w-4 h-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yellow-400">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="absolute -top-6 right-1/2 translate-x-1/2 md:right-[35%] w-3 h-3">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-pink-400">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>

                {/* Face Elements */}
                {/* Top Left - Blue with Pink outline */}
                <div className="absolute -top-12 -left-8 md:-top-16 md:-left-16 w-20 h-20 md:w-24 md:h-24">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-blue-400"></div>
                    <div className="absolute -inset-2 rounded-full bg-pink-200/40 blur-md"></div>
                    {/* Closed Eyes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Top Right - Purple with Green outline */}
                <div className="absolute -top-12 -right-8 md:-top-16 md:-right-16 w-20 h-20 md:w-24 md:h-24">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-purple-400"></div>
                    <div className="absolute -inset-2 rounded-full bg-green-200/40 blur-md"></div>
                    {/* Closed Eyes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Left - Orange */}
                <div className="absolute -bottom-12 -left-8 md:-bottom-16 md:-left-16 w-20 h-20 md:w-24 md:h-24">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-orange-400"></div>
                    {/* Closed Eyes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Right - Pink with Green outline */}
                <div className="absolute -bottom-12 -right-8 md:-bottom-16 md:-right-16 w-20 h-20 md:w-24 md:h-24">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-pink-400"></div>
                    <div className="absolute -inset-2 rounded-full bg-green-200/40 blur-md"></div>
                    {/* Closed Eyes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                      <svg width="8" height="8" viewBox="0 0 8 8" className="text-gray-700">
                        <path d="M1 4 Q 2 3, 3 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Main Headline */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight relative z-10">
                  Members are enjoying happier and healthier lives
                </h2>
              </div>
            </div>

            {/* Review Cards */}
            <div className="grid gap-6 md:grid-cols-3 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {/* Review Card 1 */}
              <div className="bg-gray-100 rounded-2xl p-6 md:p-8">
                <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-6">
                  "I appreciate the consistent reminders to be kind and patient with myself as I learn and practice daily habits that are helping me find a calmer daily space."
                </p>
                <p className="text-sm text-gray-600">
                  Member on forming more helpful habits
                </p>
              </div>

              {/* Review Card 2 */}
              <div className="bg-gray-100 rounded-2xl p-6 md:p-8">
                <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-6">
                  "ZenZone helped me begin the process of stepping back from toxic thinking and being a part of something bigger than my own personal grievances."
                </p>
                <p className="text-sm text-gray-600">
                  Member on learning to think in more helpful ways
                </p>
              </div>

              {/* Review Card 3 */}
              <div className="bg-gray-100 rounded-2xl p-6 md:p-8">
                <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-6">
                  "The strategies in the courses allow me to work on a part of myself that I am struggling with. ZenZone changed the relationship I have with myself."
                </p>
                <p className="text-sm text-gray-600">
                  Member on working through their feelings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently asked questions Section */}
        <section className="bg-background py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="mx-auto mt-12 max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem value={`item-${i + 1}`} key={i}>
                    <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

       <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row px-4 md:px-6">
            <Logo />
            <p className="text-sm text-muted-foreground">© 2024 ZenZone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
