"use client";

import Image from 'next/image';

export const LandingContent = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-20 my-20">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-center text-4xl text-white font-extrabold mb-10">THE REVOLUTION IN MCAT PREP</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/2 text-white">
            <h3 className="text-2xl font-bold mb-4">Have a headache from trying to figure out how to study?</h3>
            <p className="mb-4">
              No need for a CAT scan! We got you. Our MCAT suite was designed by a 99th percentile
              scorer and has seen outstanding results in our alpha, with customers boasting an average
              MCAT of 511, and nearly 25% scoring 515 and above. While most test prep companies
              promise a high score, we actually deliver with an innovative approach that revolutionizes
              your learning!
            </p>
            <p className="font-semibold">Watch our video to find out more!</p>
          </div>
          <div className="w-full md:w-1/2 aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/njEqnfyzYjI?si=hShf98dN5kOMwAU2"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen>
            </iframe>
          </div>
        </div>
        <div className="mt-20 bg-navy-blue p-8 rounded-lg">
          <h2 className="text-center text-2xl text-yellow-300 font-bold mb-10">How MCAT Suite Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <Image
                src="/kalypsohi.gif"
                alt="Kalypso the cat"
                width={400}
                height={400}
                className="mb-4"
              />
            </div>
            <div className="w-full md:w-3/4 text-white">
              <h3 className="text-1xl font-bold mb-4">MEET KALYPSO</h3>
              <p className="mb-4">
                Kalypso is a friendly AI study buddy that keeps you accountable with
                weekly emails summarizing your progress. He provides suggestions
                based on your Suite analytics. You can even talk to him for emotional
                support! (unless he's napping)
              </p>
              <p className="mb-4">
                He's a part of the innovative system that ensures you will score...
              </p>
              <p className="text-1xl font-bold text-white-300">...MEOWSOME!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};