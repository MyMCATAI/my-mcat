import React from "react";
import logo from "../../public/StudySmartLogo.png";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const Footer = () => {
  // const { isSignedIn } = useAuth();
  
  const linkSections = [
    {
      title: "Pages",
      links: [{ href: "#", text: "Home" }],
    },
    {
      title: "Join Now",
      links: [
        { href:  "/dashboard", text: "Portal" }
      ],
    },
    {
      title: "Terms & Policy",
      links: [
        { href: "/privacypolicy", text: "Privacy Policy" },
        { href: "/termsandconditions", text: "Terms & Conditions" },
      ],
    },
  ];

  const socialMediaLinks = [
    {
      href: "#",
      name: "Facebook page",
      svg: (
        <svg
          className="w-4 h-4 mr-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 8 19"
        >
          <path
            fillRule="evenodd"
            d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      href: "#",
      name: "Twitter page",
      svg: (
        <svg
          className="w-4 h-4 mr-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 17"
        >
          <path
            fillRule="evenodd"
            d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      href: "#",
      name: "GitHub account",
      svg: (
        <svg
          className="w-4 h-4 mr-2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-black ">
      <div className="mx-auto max-w-screen-xl py-6 ">
        <div
          className="block lg:flex justify-between"
          style={{ padding: "16px 0" }}
        >
          <div className="mb-6 md:mb-0">
            <a href="#" className="flex items-center">
              <div className="flex items-center">
                <div className="h-32 w-32">
                  <Image src={logo} alt="Logo" className="w-full mr-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-2xl font">MyMCAT.ai</span>
                </div>
              </div>
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3 px-3">
            {linkSections.map((section, index) => (
              <div key={index} className="text-left md:text-left">
                <h2 className="mb-3 text-lg font-semibold text-white uppercase">
                  {section.title}
                </h2>
                <ul className="text-gray-500 font-medium">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex} className="mb-4">
                      <Link href={link.href} className=" text-gray-400 ">
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <hr className="my-6 border-gray-500 sm:mx-auto lg:my-8" />
        <div className="block lg:flex text-center lg:text-left items-center justify-between">
          <span className="text-md text-gray-400 sm:text-center">
            © 2024{" "}
            <a href="#" className="hover:underline ">
              MyStudy
            </a>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 justify-center lg:justify-end sm:mt-0">
            {socialMediaLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`text-gray-500 hover:text-gray-900 ${
                  index > 0 ? "ms-5" : ""
                }`}
              >
                {link.svg}
                <span className="sr-only">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;