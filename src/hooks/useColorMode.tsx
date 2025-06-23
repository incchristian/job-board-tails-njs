import { useEffect, useState } from "react";

const useColorMode = () => {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const className = window.document.body.className;
      const savedMode = localStorage.getItem("color-theme");

      if (savedMode) {
        setColorMode(savedMode as "light" | "dark");
      } else if (className.includes("dark")) {
        setColorMode("dark");
      } else {
        setColorMode("light");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const className = "dark";
      const bodyClass = window.document.body.classList;

      if (colorMode === "dark") {
        bodyClass.add(className);
      } else {
        bodyClass.remove(className);
      }

      // Save to localStorage
      localStorage.setItem("color-theme", colorMode);
    }
  }, [colorMode]);

  return [colorMode, setColorMode] as const;
};

export default useColorMode;
