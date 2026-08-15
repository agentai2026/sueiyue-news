import { defineConfig, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from "unocss"
import { hex2rgba } from "@unocss/rule-utils"
import { sources } from "../shared/sources"

export default defineConfig({
  mergeSelectors: false,
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  rules: [
    [/^sprinkle-(.+)$/, ([_, d], { theme }) => {
      // @ts-expect-error >_<
      const hex: any = theme.colors?.[d]?.[400]
      if (hex) {
        return {
          "background-image": `radial-gradient(ellipse 80% 80% at 50% -30%,
         rgba(${hex2rgba(hex)?.join(", ")}, 0.16), rgba(255, 255, 255, 0));`,
        }
      }
    }],
    [
      "font-brand",
      {
        "font-family": `"Syne", "Noto Sans SC", sans-serif`,
      },
    ],
  ],
  shortcuts: {
    "color-base": "text-[var(--ink)]",
    "bg-base": "bg-[var(--panel)]",
    "btn": "op55 hover:op100 cursor-pointer transition-all duration-200",
  },
  safelist: [
    ...["orange", ...new Set(Object.values(sources).map(k => k.color))].map(k =>
      `bg-${k} color-${k} border-${k} sprinkle-${k} shadow-${k}
       bg-${k}-500 color-${k}-500
       dark:bg-${k} dark:color-${k}`.trim().split(/\s+/)).flat(),
  ],
  extendTheme: (theme) => {
    // @ts-expect-error >_<
    theme.colors.primary = {
      DEFAULT: "#FF4D2E",
      50: "#FFF1EE",
      100: "#FFE0DA",
      200: "#FFC2B6",
      300: "#FF9A86",
      400: "#FF6F54",
      500: "#FF4D2E",
      600: "#ED2F12",
      700: "#C7240D",
      800: "#A42210",
      900: "#872214",
    }
    return theme
  },
})
