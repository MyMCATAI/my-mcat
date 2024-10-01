"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Mission", href: "#mission" },
    { name: "Pricing", href: "#pricing" },
    { name: "Keypoints", href: "#keypoints" },
  ];

  // Handle scroll with IntersectionObserver
  // working but about does not work and url also
  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const sectionName = entry.target.getAttribute("id");
  //           if (sectionName) {
  //             setActiveSection(
  //               sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
  //             );
  //           }
  //         }
  //       });
  //     },
  //     {
  //       root: null, // Use the viewport as the root
  //       threshold: [0.3, 0.6], // Trigger when 30%-60% of the section is in view
  //     }
  //   );

  //   navLinks.forEach((link) => {
  //     const element = document.querySelector(link.href) as HTMLElement;
  //     if (element) {
  //       sectionRefs.current[link.name] = element;
  //       observer.observe(element);
  //     }
  //   });

  //   return () => {
  //     navLinks.forEach((link) => {
  //       const element = sectionRefs.current[link.name];
  //       if (element) {
  //         observer.unobserve(element);
  //       }
  //     });
  //   };
  // }, []);

  // const scrollToSection = (sectionName: string) => {
  //   const section = sectionRefs.current[sectionName];
  //   if (section) {
  //     const yOffset = -60; // Adjust this value based on your navbar height
  //     const y =
  //       section.getBoundingClientRect().top + window.pageYOffset + yOffset;
  //     window.scrollTo({ top: y, behavior: "smooth" });
  //     setActiveSection(sectionName); // Set active section on click
  //   }
  //   if (isOpen) {
  //     setIsOpen(false);
  //   }
  // };
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sectionElements = navLinks.map((link) =>
      document.querySelector(link.href)
    );

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const sectionName = navLinks.find(
              (link) => link.href === `#${sectionId}`
            )?.name;
            if (sectionName) {
              setActiveSection(sectionName);
              console.log(`Active section changed to: ${sectionName}`);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-50% 0px -50% 0px", // Consider a section active when it's in the middle 50% of the viewport
        threshold: 0,
      }
    );
    sectionElements.forEach((element) => {
      if (element) {
        observerRef.current?.observe(element);
        console.log(`Observing section: ${element.id}`);
      } else {
        console.log(`Section not found:`);
      }
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (sectionName: string) => {
    const sectionId = navLinks
      .find((link) => link.name === sectionName)
      ?.href.slice(1);
    const section = document.getElementById(sectionId || "");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionName);
      console.log(`Scrolling to section: ${sectionName}`);
    } else {
      console.log(`Section not found for scrolling: ${sectionName}`);
    }
    if (isOpen) {
      setIsOpen(false);
    }
  };

  // const handleScroll = () => {
  //   const scrollPosition = window.scrollY + window.innerHeight;
  // };
  // let currentSection = "";

  //   for (const link of navLinks) {
  //     const section = sectionRefs.current[link.name];
  //     if (section) {
  //       const { offsetTop, offsetHeight } = section;
  //       // if (
  //       //   scrollPosition >= offsetTop &&
  //       //   scrollPosition < offsetTop + offsetHeight
  //       // ) {
  //       //   currentSection = link.name;
  //       //   break;
  //       // }
  //       console.log(
  //         `${link.name} - Top: ${offsetTop}, Bottom: ${
  //           offsetTop + offsetHeight
  //         }`
  //       );
  //       if (
  //         scrollPosition >= offsetTop &&
  //         scrollPosition < offsetTop + offsetHeight
  //       ) {
  //         currentSection = link.name;
  //         break;
  //       }
  //     }
  //   }

  //   if (currentSection !== activeSection) {
  //     setActiveSection(currentSection);
  //     console.log(`Active section changed to: ${currentSection}`);
  //   }
  // };
  //   navLinks.forEach((link) => {
  //     const element = document.querySelector(link.href) as HTMLElement;
  //     if (element) {
  //       sectionRefs.current[link.name] = element;
  //       console.log(`Section found: ${link.name}`);
  //     } else {
  //       console.log(`Section not found: ${link.name}`);
  //     }
  //   });

  //   window.addEventListener("scroll", handleScroll);
  //   handleScroll(); // Check initial active section

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  // navLinks.forEach((link) => {
  //   const element = document.getElementById(link.href.slice(1));
  //   if (element) {
  //     sectionRefs.current[link.name] = element;
  //     console.log(
  //       `Section found: ${link.name}, Top: ${element.offsetTop}, Height: ${element.offsetHeight}`
  //     );
  //   } else {
  //     console.log(`Section not found: ${link.name}`);
  //   }
  // });

  //   window.addEventListener("scroll", handleScroll);
  //   handleScroll(); // Check initial active section

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [activeSection, navLinks]);

  // const scrollToSection = (sectionName: string) => {
  //   const section = sectionRefs.current[sectionName];
  //   if (section) {
  //     const yOffset = -60; // Adjust this value based on your navbar height
  //     const y =
  //       section.getBoundingClientRect().top + window.pageYOffset + yOffset;
  //     window.scrollTo({ top: y, behavior: "smooth" });
  //     setActiveSection(sectionName);
  //     console.log(`Scrolling to section: ${sectionName}`);
  //   } else {
  //     console.log(`Section not found for scrolling: ${sectionName}`);
  //   }
  //   if (isOpen) {
  //     setIsOpen(false);
  //   }
  // };

  // const scrollToSection = (sectionName: string) => {
  //   const section = sectionRefs.current[sectionName];
  //   if (section) {
  //     const yOffset = -60; // Adjust this value based on your navbar height
  //     const y =
  //       section.getBoundingClientRect().top + window.pageYOffset + yOffset;
  //     window.scrollTo({ top: y, behavior: "smooth" });
  //     setActiveSection(sectionName);
  //     console.log(`Scrolling to section: ${sectionName}`);
  //   } else {
  //     console.log(`Section not found for scrolling: ${sectionName}`);
  //   }
  //   if (isOpen) {
  //     setIsOpen(false);
  //   }
  // };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={"/"}>
          <div className="flex items-center">
            <div className="relative">
              {/* <Image src={logo} alt="Logo" width={48} height={48} /> */}
            </div>
            <div className="flex flex-col">
              <span className="text-white text-2xl">MyMCAT.ai</span>
            </div>
          </div>
        </Link>

        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-black focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={!isOpen ? "block" : "hidden"}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 5h20v2H2V5zm0 6h20v2H2v-2zm0 6h20v2H2v-2z"
              />
              <path
                className={isOpen ? "block" : "hidden"}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
              />
            </svg>
          </button>
        </div>

        {/* <div
          className={`lg:flex ${
            isOpen ? "hidden" : "hidden"
          } lg:block justify-center lg:justify-center py-2 px-5 rounded-[60px]`}
          style={{ backgroundColor: "#000000" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.name);
              }}
              className={`px-4 py-1 ${
                activeSection === link.name
                  ? "text-black bg-white lg:rounded-[60px]"
                  : "text-white"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div> */}
        <div
          className={`lg:flex ${
            isOpen ? "hidden" : "hidden"
          } lg:block justify-center lg:justify-center py-2 px-5 rounded-[60px]`}
          style={{ backgroundColor: "#000000" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.name);
              }}
              className={`px-4 py-1 ${
                activeSection === link.name
                  ? "text-black bg-white lg:rounded-[60px]"
                  : "text-white"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
        <div className="flex items-center hidden lg:block">
          <Link href={"/sign-in"}>
            <button className="bg-white text-black py-2 text-lg md:text-[16px] px-4 rounded-[8px]">
              Login
            </button>
          </Link>
        </div>
      </div>

      <div
        className={`fixed top-0  left-0 h-full w-64 bg-[#0E2247] shadow-lg z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
        style={{ borderRight: "1px solid #2D4778" }}
      >
        <svg
          onClick={toggleMenu}
          className="ml-auto mr-4 mt-4 mb-4"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="2"
            y1="2"
            x2="18"
            y2="18"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <line
            x1="18"
            y1="2"
            x2="2"
            y2="18"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>

        {/* <div>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => {
                scrollToSection(link.name);
                toggleMenu();
              }}
              className={`block px-4 py-4 border-b p-2  ${
                activeSection === link.name
                  ? "bg-[#ffffff] text-[#0E2247]"
                  : "text-[#ffffff]"
              }`}
              style={{ borderBottom: "2px solid #ffffff" }}
            >
              {link.name}
            </a>
          ))}
        </div> */}
      </div>
    </nav>
  );
};
