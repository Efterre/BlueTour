import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";

// Kullanıcı kaydı ve e-posta doğrulama
export const registerUserWithEmailVerification = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // E-posta doğrulama bağlantısı gönder
    await sendEmailVerification(user);
    
    return userCredential;
  } catch (error) {
    console.error("Kayıt hatası maildoğrulama  :", error.message);  // Hata mesajını logla
    throw new Error(error.message);  // Hata mesajını atarak iletin
  }
};

// Kullanıcı girişi
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Giriş hatası:", error.message);
    throw error;
  }
};

// Çıkış yap
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Çıkış hatası:", error.message);
    throw error;
  }
};
