import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import '../styles/CoverflowSlider.css';

const sectionsContent = [
  {
    title: "About Us | من نحن",
         
    paragraphs: [
         "نحن مجموعة من طلاب علم الحاسوب، اجتمعنا لهدف سامٍ",

      "منصة وُلدت من رحم المسؤولية والرحمة.",
     
      "صممنا هذا الموقع لنقلل الهدر، ونعيد توجيه الخير لمن هم في أمسّ الحاجة.",
    
     "ليس لأن أحدًا طلب منا، بل لأننا نؤمن بأن هناك معنى أعمق.",
     
      "We are a group of computer science students with a purpose.",
            "A platform born from empathy and responsibility.",
             "We designed this site to reduce waste and redirect good to those in need.",
               "Not because we were told to — but because we believe in something bigger.",


    ]
  },
  {
    title: "كل غرض زائد هو فرصة." ,
    paragraphs: [

        
      "فرصة ثانية للطعام، للملابس، للكتب... وللناس قبل كل شيء.",
        "نحن لا نربط بين متبرع ومحتاج فحسب، بل نربط بين القلوب.",
"Every leftover item is a chance.",
      "A second chance for food, clothes, books — and most importantly, for people.",
     
      "We’re not just connecting donors and recipients. We’re connecting hearts.",
    

    ]
  },
  {
    title: "في الإسلام، مساعدة الآخرين ليست خيارًا... بل واجب.",
    paragraphs: [
             
      "\"ومن أحياها فكأنما أحيا الناس جميعًا.\" (المائدة ٣٢)",
       "In Islam, helping others is not optional — it’s a duty.",

      "\"And whoever saves one life, it is as if he had saved all mankind.\" (Qur’an 5:32)",

    ]
  },
  {
    title:     "هذه رسالتنا:", 
    paragraphs: [
            "أن نحفظ النعم من الضياع، وأن نجعل العطاء سهلًا كالتنفس.",
        "This is our mission:",
      "To protect blessings from being lost, and to make giving as easy as breathing.",
 
  
    ]
  }
];

const CoverflowSlider = () => {
  const swiperRef = useRef(null);

  const handleMouseEnter = () => {
    swiperRef.current?.swiper?.autoplay?.stop();
  };

  const handleMouseLeave = () => {
    swiperRef.current?.swiper?.autoplay?.start();
  };

  return (
    <div className="coverflow-wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Swiper
        ref={swiperRef}
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        loop={true}
          speed={600} 
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 200,
          modifier: 1.5,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
     autoplay={{
  delay: 2500, // سرعة التبديل بين الشرائح
  disableOnInteraction: false,
}}

        modules={[EffectCoverflow, Pagination, Autoplay]}
        className="swiper-container"
      >
        {sectionsContent.map((section, index) => (
          <SwiperSlide key={index}>
            <div className="text-slide">
              <h3>{section.title}</h3>
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CoverflowSlider;
