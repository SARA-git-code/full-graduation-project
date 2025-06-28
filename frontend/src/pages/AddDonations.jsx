import { useEffect } from "react";
import DonationForm from "../components/DonationForm";

const AddDonation = () => {
  useEffect(() => {
    // تأكد أن التمرير يحدث بعد تحميل الصفحة فعليًا
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100); // وقت بسيط للتأخير بعد التحميل

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="main-content">
      <DonationForm mode="add" />
    </div>
  );
};

export default AddDonation;
