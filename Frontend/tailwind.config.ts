import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      // Since you are building a Ticket App, you might want 
      // to add custom brand colors here later:
      // colors: {
      //   ticketPrimary: '#1e40af', 
      // }
    },
  },
  plugins: [],
};

export default config;