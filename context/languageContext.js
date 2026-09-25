"use client"; // Needed for App Router

import { createContext, useContext, useState, useEffect } from "react";
import { postApi } from "services/api";
import { config } from "services/config";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState({});
  const [shopCategory, setShopCategory] = useState(''); // example global state

  const toggleShopCategory = (value) => {
    console.log(value, "change context");
    setShopCategory(value);
  };

  useEffect(() => {
    // const storedLoginState = localStorage.getItem('loggedIn');
    // console.log(storedLoginState,"storedLoginState")
    // if (storedLoginState == 'true') {
    //   setIsLoggedIn(true);
    //   findCartCount(true)
    // }
  }, []);
  const login = (userdata) => {
    setIsLoggedIn(true);
    console.log(userdata)
    setUser(userdata)
    localStorage.setItem('isLoggedIn', 'true'); // Store login state in localStorage or other persistent storage
  };

  // Function to log out
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.clear()
  };

  const fetchTranslations = async (selectedLang) => {


    try {
      const endpoint = config.translations;
      const data = { code: selectedLang };
      const response = await postApi(endpoint, data);

      setTranslations(response.trans)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const findCartCount = async (login) => {
    try {
      let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}))
      const endpoint = config.findCartCount;
      const data = { user: user?._id };
      // const response = await postApi(endpoint, data);
      const response = await postApi(endpoint, data);
      const cartLength = JSON.parse(localStorage.getItem("cartItems") || JSON.stringify({})).length || 0;
      (!login) ? setCartCount(cartLength || 0) : setCartCount(response?.count);
     
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchTranslations(lang);
     const storedLoginState = localStorage.getItem('loggedIn');
    console.log(storedLoginState,"storedLoginState")
    if (storedLoginState == 'true') {
      setIsLoggedIn(true);
      findCartCount(true)
    }else{
    findCartCount()}
  }, [lang, cartCount]);

const getFileType = (url) => {
  const extension = url.split('.').pop().toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return 'image';
  }

  if (['mp4', 'mov', 'avi'].includes(extension)) {
    return 'video';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (['doc', 'docx'].includes(extension)) {
    return 'word';
  }

  if (['xls', 'xlsx'].includes(extension)) {
    return 'excel';
  }

  if (['ppt', 'pptx'].includes(extension)) {
    return 'ppt';
  }

  if (extension === 'txt') {
    return 'text';
  }

  return 'other';
};

  return (
    <LanguageContext.Provider value={{ lang, setLang, translations, user, setUser, isLoggedIn, login, logout, cartCount, setCartCount, shopCategory, toggleShopCategory,getFileType }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
