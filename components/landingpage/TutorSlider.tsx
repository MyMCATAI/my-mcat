import React from 'react';
import Image from 'next/image';

const tutors = [
  {
    name: 'Chas',
    score: '526',
    institution: 'JHU Medicine',
    role: 'Tutor',
    image: '/tutors/ChasB.png'
  },
  {
    name: 'Kerol',
    score: '521',
    institution: 'JHU Medicine',
    role: 'Tutor',
    image: '/tutors/KerolF.png'
  },
  {
    name: 'Prynce',
    score: '523',
    institution: 'Rice',
    role: 'Instructor',
    image: '/tutors/PrynceK.png'
  },
  {
    name: 'Laura',
    score: '520',
    institution: 'UCLA',
    role: 'Tutor',
    image: '/tutors/LauraN.png'
  },
  {
    name: 'Ethan',
    score: '519',
    institution: 'Penn Medicine',
    role: 'Tutor',
    image: '/tutors/EthanK.png'
  },
  {
    name: 'Vivian',
    score: '512',
    institution: 'CNU SOM',
    role: 'Tutor',
    image: '/tutors/VivianZ.png'
  }
];

const TutorSlider = () => {
  return (
    <div className="mb-20">
      <h2 className="text-4xl font-bold text-white text-center mb-8 font-krungthep">
        Our Medical Students
      </h2>
      <div className="text-white/80 text-center text-lg mb-10 max-w-xl mx-auto">
       We have mentored hundreds and know this test inside and out.
      </div>
      
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 max-w-5xl">
          {tutors.map((tutor, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden 
                          border-2 border-green-500/30 transition-all duration-300 mb-3">
                <Image
                  src={tutor.image}
                  alt={tutor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white font-medium text-sm sm:text-base">{tutor.name}</span>
                  <span className="text-green-400 font-bold text-sm sm:text-base">{tutor.score}</span>
                </div>
                <span className="text-blue-400 text-xs sm:text-sm">{tutor.institution}</span>
                <div className="text-white/50 text-xs">{tutor.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorSlider; 