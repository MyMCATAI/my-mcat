return (
  <>
    <section className="bg-white py-24 md:py-32" id='methodology' ref={sectionRef}>
      <div className="container-fluid max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div className="mt-6 md:mt-0">
            <div className="polygon" ref={polygonRef}>
              {/* <p className='text-white' style={{ padding: "100px 30px" }}>Rest easy with us.</p> */}
            </div>
            <div className='mt-2 flex justify-center items-center' style={{ width: "80%" }}>
              <Image src={catoncouch} alt={"Image"} style={{ width: "80%", marginTop: "-160px", zIndex: "1" }} ref={catRef} />
            </div>
          </div>
          <div className="text-center mx-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#007AFF] mb-12" ref={titleRef}>
              Our methodology
            </h1>
            <ul className="grid grid-cols-1 gap-8 mb-16">
              {items.map((item, index) => (
                <li key={index} className='flex' ref={el => itemRefs.current[index] = el}>
                  <div style={{ minWidth: '100px', minHeight: '100px' }}>
                    <Image src={item.icon} alt={item.text} width={100} height={100} />
                  </div>
                  <div className='text-left pt-2 ps-5'>
                    <div>
                      <h3 className='text-2xl mb-2' style={{ color: "#0E2247", fontWeight: 600 }}>{item.heading}</h3>
                    </div>
                    <div className='text-lg'>
                      {item.text}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className='text-left doublediv mt-12 bg-[#0E2247] mx-3 rounded-lg shadow-lg' ref={restEasyRef}>
              <p className='p-6 text-white text-xl font-semibold'>
                Rest easy. You're with the best.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

export default Methodology;