/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "poppins-black": ["Poppins-Black"],
        "poppins-extrabold": ["Poppins-ExtraBold"],
        "poppins-bold": ["Poppins-Bold"],
        "poppins-semibold": ["Poppins-SemiBold"],
        "poppins-regular": ["Poppins-Regular"],
        "poppins-light": ["Poppins-Light"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-thin": ["Poppins-Thin"],
      },
    },
  },
  plugins: [],
};
