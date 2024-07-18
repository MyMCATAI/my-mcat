import React from 'react'

const Youtube = () => {
    return (
        <>
            <div className="bg-[#0E2247]">


                <div className="container mx-auto py-16">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-[44px] font-bold text-white mb-2">
                            Our mission
                        </h1>
                        <p className="text-2xl text-white mb-6">
                            Kalypso is a friendly cat that believes everyone deserves a fair shot.
                        </p>
                    </div>



                    <div className="w-full aspect-video">
                        <iframe
                            className="w-full h-full rounded-[20px]"
                            src="https://www.youtube.com/embed/njEqnfyzYjI?si=hShf98dN5kOMwAU2"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            </div>
            <div className="bg-[#2D4778]">
                <div className="container mx-auto py-16">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-[44px] font-bold text-white mb-2">
                            Our product
                        </h1>
                        <p className="text-2xl text-white mb-6">
                            Designed by an AI Engineer and a 99% Scorer.
                        </p>
                    </div>
                    <div className="w-full aspect-video">
                        <iframe
                            className="w-full h-full rounded-[20px]"
                            src="https://www.youtube.com/embed/njEqnfyzYjI?si=hShf98dN5kOMwAU2"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Youtube