import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Brain, Heart, Leaf, MessageCircle, Share2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'landing-hero');
  const featureConnectImage = PlaceHolderImages.find(img => img.id === 'feature-connect');
  const featureConverseImage = PlaceHolderImages.find(img => img.id === 'feature-converse');
  const teamMembers = [
    { name: 'Dr. Anya Sharma', title: 'Mindfulness Coach', imageId: 'team-member-1' },
    { name: 'Ben Carter', title: 'Community Guide', imageId: 'team-member-2' },
    { name: 'Chloe Davis', title: 'Content Curator', imageId: 'team-member-3' },
  ]
  const faqItems = [
    {
      question: "What is ZenZone?",
      answer: "ZenZone is a minimalist social media platform focused on mindful connection and positive interactions. We provide a calm, ad-free space for you to connect with what matters most."
    },
    {
      question: "Who is the ZenZone team?",
      answer: "Our team consists of mindfulness coaches, community guides, and content curators dedicated to creating a supportive and uplifting online environment. We're here to help you on your journey to a healthier digital life."
    },
    {
      question: "How is this different from other social media?",
      answer: "We prioritize your well-being. Our features are designed to reduce noise, encourage meaningful conversations, and foster a sense of community. There are no ads, no distracting algorithms, just authentic connection."
    },
    {
      question: "Is my data private?",
      answer: "Yes, we take your privacy very seriously. We do not sell your data to third parties. You have full control over your profile's privacy settings and who can see your content."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="secondary" className="rounded-full">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button className="rounded-full">Get Started</Button>
            </Link>
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
                  <Link href="/auth">
                    <Button size="lg" className="w-full rounded-full sm:w-auto">
                      Get Started for Free <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                {heroImage && (
                  <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      fill
                      className="object-cover"
                      data-ai-hint={heroImage.imageHint}
                  />
                )}
              </div>
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

        {/* How It Works Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Getting started with ZenZone is simple. Here’s how you can begin your journey towards a more mindful social experience in just a few steps.
              </p>
            </div>
            <div className="mt-12 grid gap-12 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Create Your Account</h3>
                <p className="mt-2 text-muted-foreground">
                  Sign up in minutes with just your email. Complete your profile to connect with others.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Find Your People</h3>
                <p className="mt-2 text-muted-foreground">
                  Discover and connect with friends, family, and new acquaintances who share your interests.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Share Your Journey</h3>
                <p className="mt-2 text-muted-foreground">
                  Post updates, photos, and thoughts in a space that encourages positivity and support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features: Connect Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Features</div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Connect & Share</h2>
                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                  Share your moments and connect with a community that cares. Our feed is designed to be a calm space for you to express yourself and engage with content that matters.
                </p>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Share2 className="mt-1 h-5 w-5 text-primary" />
                    <span>A beautiful, minimalist feed to share updates, photos, and ideas.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="mt-1 h-5 w-5 text-primary" />
                    <span>Build your circle by following people who inspire you.</span>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                {featureConnectImage && (
                  <Image
                    src={featureConnectImage.imageUrl}
                    alt={featureConnectImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={featureConnectImage.imageHint}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features: Converse Section */}
        <section className="bg-secondary py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl lg:order-last">
                {featureConverseImage && (
                  <Image
                    src={featureConverseImage.imageUrl}
                    alt={featureConverseImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={featureConverseImage.imageHint}
                  />
                )}
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Features</div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Mindful Conversations</h2>
                <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
                  Engage in private, one-on-one conversations. Our chat is a sanctuary for deeper connections, away from the noise of public feeds.
                </p>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <MessageCircle className="mt-1 h-5 w-5 text-primary" />
                    <span>Clean and intuitive interface for seamless messaging.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="mt-1 h-5 w-5 text-primary" />
                    <span>Focus on quality conversations with the people who matter to you.</span>
                  </li>
                </ul>
              </div>
            </div>
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

        {/* What you can expect (FAQ) Section */}
        <section className="bg-secondary py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">What you can expect</h2>
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
                <Link href="/auth">
                    <Button size="lg" className="rounded-full">
                    Join ZenZone Now
                    </Button>
                </Link>
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
