import { useEffect, useState } from "react";
import "../index.css"; 

const messages = [
  "🌍 تبرعك ليس مجرد عطاء، بل هو تحوّل في معادلة الحياة لشخص محتاج.",
  "🔬 كما تغير الجزيئات الصغيرة كيمياء المادة، تغير مبادرتك الصغيرة مصيرًا كبيرًا.",
  "🧠 الكرم سلوك عصبي فطري، لكنه يصبح حضاريًا حين يتم بوعي ونيّة.",
  "📚 شكراً لك، فقد كتبت اليوم سطرًا جديدًا في كتاب الإنسانية.",
  "⚖️ في ميزان الأخلاق، ما تقدمه قد يُحدث توازنًا في حياة غيرك.",
  "💡 تبرعك يشبه شرارة علمية تُطلق سلسلة من التفاعلات الإيجابية في المجتمع.",
  "🧬 كما أن كل خلية لها دور، فإن عطاؤك هو خلية فاعلة في جسد هذا العالم.",
  "🪐 في عالم يتغير بسرعة الضوء، يبقى العطاء هو الثابت الأجمل.",
];

const ThankYouModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMessage(messages[randomIndex]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="thankyou-overlay">
      <div className="thankyou-box">
        <h2>Thank You!</h2>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ThankYouModal;
