// Updated AboutUs.jsx with true 3D Auto Slider using GSAP and pause on hover
import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import "../styles/about.css";

const sectionsContent = [
  {
    title: "About Us | من نحن",
    paragraphs: [
      "We are a group of computer science students with a purpose.",
      "نحن مجموعة من طلاب علم الحاسوب، اجتمعنا لهدف سامٍ",
      "A platform born from empathy and responsibility.",
      "منصة وُلدت من رحم المسؤولية والرحمة.",
      "We designed this site to reduce waste and redirect good to those in need.",
      "صممنا هذا الموقع لنقلل الهدر، ونعيد توجيه الخير لمن هم في أمسّ الحاجة.",
      "Not because we were told to — but because we believe in something bigger.",
      "ليس لأن أحدًا طلب منا، بل لأننا نؤمن بأن هناك معنى أعمق."
    ]
  },
  {
    title: "Every leftover item is a chance.",
    paragraphs: [
      "A second chance for food, clothes, books — and most importantly, for people.",
      "كل غرض زائد هو فرصة.",
      "فرصة ثانية للطعام، للملابس، للكتب... وللناس قبل كل شيء.",
      "We’re not just connecting donors and recipients. We’re connecting hearts.",
      "نحن لا نربط بين متبرع ومحتاج فحسب، بل نربط بين القلوب."
    ]
  },
  {
    title: "In Islam, helping others is not optional — it’s a duty.",
    paragraphs: [
      "\"And whoever saves one life, it is as if he had saved all mankind.\" (Qur’an 5:32)",
      "في الإسلام، مساعدة الآخرين ليست خيارًا... بل واجب.",
      "\"ومن أحياها فكأنما أحيا الناس جميعًا.\" (المائدة ٣٢)"
    ]
  },
  {
    title: "This is our mission:",
    paragraphs: [
      "To protect blessings from being lost, and to make giving as easy as breathing.",
      "هذه رسالتنا:",
      "أن نحفظ النعم من الضياع، وأن نجعل العطاء سهلًا كالتنفس."
    ]
  }
];

const AboutUs = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  const startAutoSlide = () => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % sectionsContent.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const handleMouseEnter = () => clearTimeout(timeoutRef.current);
  const handleMouseLeave = () => startAutoSlide();

  return (
    <div className="main-content">
    <div
      className="about-slider-fade"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {sectionsContent.map((section, index) => (
        <div
          key={index}
          className="slider-section-fade"
          style={{
            opacity: index === current ? 1 : 0,
            pointerEvents: index === current ? "auto" : "none",
            transform: index === current
              ? "scale(1) rotateY(0deg) rotateX(0deg)"
              : "scale(0.8) rotateY(-45deg) rotateX(10deg)",
            zIndex: index === current ? 2 : 1,
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          <div className="fade-in-block">
            <h2 className="highlight">{section.title}</h2>
            {section.paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
    </div>
  );
};

export default AboutUs;
