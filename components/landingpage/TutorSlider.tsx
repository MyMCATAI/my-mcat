import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const tutors = [
  {
    name: 'Chas',
    score: '526',
    institution: 'JHU Medicine',
    role: 'Lead Tutor',
    image: '/tutors/ChasB.png',
    hoursHelped: '500+',
    specialty: 'CARS & B/B'
  },
  {
    name: 'Kerol',
    score: '521',
    institution: 'JHU Medicine',
    role: 'Senior Tutor',
    image: '/tutors/KerolF.png',
    hoursHelped: '400+',
    specialty: 'P/S & C/P'
  },
  {
    name: 'Prynce',
    score: '523',
    institution: 'Rice',
    role: 'Lead Instructor',
    image: '/tutors/PrynceK.png',
    hoursHelped: '600+',
    specialty: 'All Sections'
  },
  {
    name: 'Laura',
    score: '520',
    institution: 'UCLA',
    role: 'Senior Tutor',
    image: '/tutors/LauraN.png',
    hoursHelped: '300+',
    specialty: 'CARS & P/S'
  },
  {
    name: 'Ethan',
    score: '519',
    institution: 'Penn Medicine',
    role: 'Senior Tutor',
    image: '/tutors/EthanK.png',
    hoursHelped: '450+',
    specialty: 'B/B & C/P'
  },
  {
    name: 'Vivian',
    score: '512',
    institution: 'CNU SOM',
    role: 'Tutor',
    image: '/tutors/VivianZ.png',
    hoursHelped: '200+',
    specialty: 'P/S & CARS'
  }
];

const TutorSlider = () => {
  return (
    <div id="tutors" className="py-20 px-4 bg-gradient-to-b from-[#12233c] to-[#1a2f4d]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-krungthep">
            {"Elite Tutors + Smart Software"}
          </h2>
          <div className="space-y-4 text-white/80 md:text-xl mb-8 max-w-3xl mx-auto">
            <p className="leading-relaxed">
              {"Get started with our AI-powered study platform - free. Then supercharge your prep with a 520+ tutor who sees exactly where you need help."}
            </p>
            <p className="text-green-400 font-medium">
              {"Complete prep system: Practice questions • Study plans • Analytics • Expert tutoring"}
            </p>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {[
              { 
                label: 'Tutor Scores', 
                value: '520+',
                subtext: '98th percentile'
              },
              { 
                label: 'Score Increase', 
                value: '12+',
                subtext: 'Points avg.'
              },
              { 
                label: 'Study Resources', 
                value: '100%',
                subtext: 'Free to start'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-white/5 backdrop-blur-sm"
              >
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">{stat.value}</div>
                <div className="text-white/90 text-sm md:text-base mb-1">{stat.label}</div>
                <div className="text-white/60 text-xs">{stat.subtext}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tutor Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tutors.map((tutor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden 
                          border-2 border-green-500/30 transition-all duration-300 mb-4 hover:border-green-500/60">
                <Image
                  src={tutor.image}
                  alt={tutor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-white font-medium text-lg">{tutor.name}</span>
                  <span className="text-green-400 font-bold text-lg">{tutor.score}</span>
                </div>
                <span className="text-blue-400 text-sm block mb-1">{tutor.institution}</span>
                <div className="text-white/50 text-sm mb-3">{tutor.role}</div>
                <div className="text-white/70 text-xs">
                  <div className="font-medium text-green-400">{tutor.hoursHelped}</div>
                  <div>Hours Tutored</div>
                </div>
                <div className="mt-3 text-xs text-white/50">
                  <span className="font-medium">Specialty:</span> {tutor.specialty}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-600 transition-colors duration-300"
              >
                Start Free
              </motion.button>
            </Link>
            <Link href="/sign-up?plan=tutor">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors duration-300"
              >
                Get a Tutor
              </motion.button>
            </Link>
          </div>
          <p className="text-white/60 text-sm">
            Join 500+ students improving their score. Limited tutor spots available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorSlider; 