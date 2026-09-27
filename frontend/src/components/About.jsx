import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, Award, Brain, Key } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Header */}
        <motion.header 
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold text-yellow-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mt-6">
            About EventX
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transforming Event Management with AI, Blockchain & Web3 Integration
          </p>
        </motion.header>

        {/* Our Mission */}
        <motion.section 
          className="bg-white p-8 rounded-2xl  hover:shadow-2xl transition-shadow duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                At EventX, we believe that hackathons and event hosting should be as innovative as the ideas they inspire. We are on a quest to revolutionize event management by eliminating traditional inefficiencies and introducing automation, transparency, and fairness through cutting-edge technology.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our platform harnesses the power of AI for smart team formation and unbiased resume screening, while blockchain-driven smart contracts ensure seamless and trustless prize distribution. Every participant's achievement is immortalized through NFT-based certificates, creating a verifiable record of success.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Our Story */}
        <motion.section 
          className="bg-white p-8 rounded-2xl  hover:shadow-2xl transition-shadow duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Born from the frustration of managing disjointed, outdated event systems, EventX emerged as a bold solution to transform the hackathon experience. Our founders, passionate about technology and innovation, envisioned a unified platform where organizers could effortlessly set up events and participants could engage in a dynamic, interactive environment.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Today, EventX stands at the forefront of event hosting, offering a streamlined experience that combines AI-driven insights with the security and transparency of blockchain technology. We are not just organizing events—we're building a community where creativity thrives and every achievement is celebrated.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Key Features & Technology */}
        <motion.section 
          className="bg-white p-8 rounded-2xl  hover:shadow-2xl transition-shadow duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-lg">
                <Key className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Key Features & Technology</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Smart Team Formation",
                    description: "AI-powered recommendations pair participants based on skills and interests for a winning team dynamic.",
                    icon: <Users className="w-6 h-6 text-blue-500" />
                  },
                  {
                    title: "Automated Prize Distribution",
                    description: "Blockchain smart contracts handle rewards transparently and automatically.",
                    icon: <Award className="w-6 h-6 text-purple-500" />
                  },
                  {
                    title: "NFT-Based Certificates",
                    description: "Immutable, on-chain credentials that verify every participant's achievements.",
                    icon: <Award className="w-6 h-6 text-green-500" />
                  },
                  {
                    title: "AI-Powered Resume Screening",
                    description: "Advanced NLP and ML algorithms ensure unbiased and efficient candidate ranking.",
                    icon: <Brain className="w-6 h-6 text-red-500" />
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {feature.icon}
                      <h3 className="font-semibold text-lg text-gray-800">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Impact & Benefits */}
        <motion.section 
          className="bg-white p-8 rounded-2xl  hover:shadow-2xl transition-shadow duration-300"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="p-3 bg-red-100 rounded-lg">
                <Brain className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Impact & Benefits</h2>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  EventX is more than a platform—it's a catalyst for change in the world of hackathons and event management. By automating cumbersome processes and introducing verifiable technology, we empower organizers to host seamless events, enable participants to focus on innovation, and help businesses discover top talent effortlessly.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Streamlined event operations that save time and resources",
                    "Fair, transparent, and trustless prize distribution",
                    "Enhanced networking and team-building through smart technology",
                    "Verifiable credentials that build trust with recruiters and partners"
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-gray-700">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-700 mt-6 leading-relaxed">
                  Join us on our journey to redefine event hosting, where every challenge is met with innovation and every success is etched on the blockchain.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;