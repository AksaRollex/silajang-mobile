/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'poppins-black' : ['Poppins-Black'],
        'poppins-extrabold': ['Poppins-ExtraBold'],
        'poppins-bold': ['Poppins-Bold'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-regular': ['Poppins-Regular'],
        'poppins-light': ['Poppins-Light'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-thin' : ['Poppins-Thin'],
      },
      fontSize: {
        'title-xxl': ['44px', '55px'],
        'title-xxl2': ['42px', '58px'],
        'title-xl': ['36px', '45px'],
        'title-xl2': ['33px', '45px'],
        'title-lg': ['28px', '35px'],
        'title-md': ['24px', '30px'],
        'title-md2': ['26px', '30px'],
        'title-sm': ['20px', '26px'],
        'title-sm2': ['22px', '28px'],
        'title-xsm': ['18px', '24px']
    },
      // animation: {
      //   'animate-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
      // },
      // keyframes:{
      //   pulse: {
      //     '0%, 100%': { opacity: '1' },
      //     '50%': { opacity: '.5' },
      //   },
      // }
    },
  },
  plugins: [],
}

