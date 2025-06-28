// src/context/UserContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// 🧠 إنشاء السياق
const UserContext = createContext();

// 🌍 مزوّد السياق الذي يغلف التطبيق
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 دالة لجلب بيانات المستخدم الحالي
  const fetchUser = async () => {
    try {
      console.log("🚀 fetchUser() started");

      const res = await axios.get("/users/profile", { withCredentials: true });
      console.log("✅ Response from /users/profile:", res.data);

      // 🛠️ تأكد من بناء رابط الصورة داخل النافبار هنا أيضًا
      const enriched = {
        ...res.data,
        profileImage: res.data.profileImage
          ? `http://localhost:5050/uploads/${res.data.profileImage}`
          : "/assets/user.png",
      };
      console.log("✅ Final enriched user:", enriched);
      setCurrentUser(enriched);
    } catch (err) {
      console.error("❌ Failed to fetch current user:", err.message);
      setCurrentUser(null);
    }finally {
    setLoading(false); // ✅ بعد كل شيء
  }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user: currentUser, setUser: setCurrentUser,loading, fetchUser }}
>
      {children}
    </UserContext.Provider>
  );
};


export const useUserContext = () => useContext(UserContext);

