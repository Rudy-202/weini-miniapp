/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 添加饭圈风格的粉色系颜色
        'fan-pink': {
          100: '#fff5f7',
          200: '#fed7e2',
          300: '#fbb6ce',
          400: '#f687b3',
          500: '#ed64a6',
          600: '#d53f8c',
          700: '#b83280',
          800: '#97266d',
          900: '#702459',
        },
      },
      backgroundImage: {
        'gradient-fan': 'linear-gradient(135deg, #FFCDD2 0%, #F8BBD0 50%, #E1BEE7 100%)',
        'gradient-fan-hover': 'linear-gradient(135deg, #F8BBD0 0%, #E1BEE7 50%, #D1C4E9 100%)',
      },
      boxShadow: {
        'fan': '0 4px 14px 0 rgba(237, 100, 166, 0.39)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
  // 与Ant Design兼容
  corePlugins: {
    preflight: false,
  },
}
