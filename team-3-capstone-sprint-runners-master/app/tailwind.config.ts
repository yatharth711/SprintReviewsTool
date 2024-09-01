import type { Config } from "tailwindcss";

import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {       
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      layout: {
        disabledOpacity: "0.3", // opacity-[0.3]
        radius: {
          small: "2px", // rounded-small
          medium: "4px", // rounded-medium
          large: "6px", // rounded-large
        },
        borderWidth: {
          small: "1px", // border-small
          medium: "1px", // border-medium
          large: "2px", // border-large
        },
      },
      themes: {
        light: {
          layout : {},
          colors : {}
        },
        dark: {},
        instructor:{
          extend: "light",
          colors: {
            background: "#eceeff",
            foreground: "#1a1b60",
            primary: {
              DEFAULT: "#282a90",
              50: "#bfc0ed",
              100: "#7f80dc",
              200: "#3f41ca",
              300: "#3537c0",
              400: "#3032b0",
              500: "#2c2ea0",
              600: "#282a90",
              700: "#232580",
              800: "#1f2070",
              900: "#1a1b60"
            },
            secondary:{
              DEFAULT: "#468c98",
              50: "#8fc3cc",
              100: "#81bbc5",
              200: "#73b3bf",
              300: "#65acb8",
              400: "#57a4b2",
              500: "#468c98",
              600: "#40808c",
              700: "#3a747e",
              800: "#336770",
              900: "#2d5a62"
            },
            success: {
              DEFAULT: "#56b361",
              50: "#80c688",
              100: "#72c07b",
              200: "#64b96e",
              300: "#56b361",
              400: "#4ca957",
              500: "#469b50",
              600: "#3f8d48",
              700: "#397f41",
              800: "#33713a",
              900: "#2c6333"
            },
            warning: {
              DEFAULT: "#ff8552",
              50: "#ffa985",
              100: "#ff9b70",
              200: "#ff8552",
              300: "#ff7e47",
              400: "#ff7033",
              500: "#ff621f",
              600: "#ff540a",
              700: "#f54900",
              800: "#e04300",
              900: "#cc3d00"
            },
            danger: {
              DEFAULT: "#92140c",
              50: "#f16055",
              100: "#f04e42",
              200: "#ee3c2f",
              300: "#ed2a1d",
              400: "#e22012",
              500: "#d01e11",
              600: "#bd1b0f",
              700: "#aa180e",
              800: "#92140c",
              900: "#84130b"
            },
            focus: "#F182F6",
          },
        },
        student:{
          extend: "light",
          colors: {
            background: "#0D001A",
            foreground: "#193936",
            primary: {
              DEFAULT: "#265652", //dark green
              50: "#63bbb3",
              100: "#55b4ac",
              200: "#4baaa2",
              300: "#449c95",
              400: "#3e8e87",
              500: "#38807a",
              600: "#2c635f",
              700: "#265652",
              800: "#1f4744",
              900: "#193936"
            },
            secondary:{
              DEFAULT: "#72a98f", //greyish-blue-green 500
              50: "#b3d0c3",
              100: "#a6c9b9",
              200: "#9ac1af",
              300: "#8db9a5",
              400: "#81b19b",
              500: "#72a98f",
              600: "#67a287",
              700: "#5d987c",
              800: "#558b72",
              900: "#4e7e68"
            },
            success: { 
              DEFAULT: "#92cf97", //light green
              50: "#92cf97",
              100: "#f7de78",
              200: "#7fc785",
              300: "#71c178",
              400: "#63bb6a",
              500: "#55b45d",
              600: "#4baa53",
              700: "#449c4c",
              800: "#3e8e45",
              900: "#38803e"
            },
            warning: { 
              DEFAULT: "#f6d965",//lemon yellow
              50: "#f8e28b",
              100: "#f7de78",
              200: "#f6d965",
              300: "#f5d451",
              400: "#f4cf3e",
              500: "#f3cb2b",
              600: "#f2c618",
              700: "#e7bc0d",
              800: "#d4ac0c",
              900: "#c19c0b"
            },
            danger: {
              DEFAULT: "#bd1e1e", //firetruck red
              50: "#ec8383",
              100: "#e97272",
              200: "#e66060",
              300: "#e34f4f",
              400: "#e13d3d",
              500: "#de2b2b",
              600: "#d42121",
              700: "#bd1e1e",
              800: "#b01c1c",
              900: "#9f1919"
            },
            focus: "#F182F6",
          },
        },
      },
    }),
  ],
};

export default config;