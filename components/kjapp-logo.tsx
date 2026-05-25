import React from "react";
import Svg, { G, Path } from "react-native-svg";

interface KjappLogoProps {
  color?: string;
  width?: number;
  height?: number;
  glowColor?: string;
}

export function KjappLogo({
  color = "#FFFFFF",
  width = 118,
  height = 32,
  glowColor,
}: KjappLogoProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 2400 620"
      fill="none"
      accessibilityLabel="KJAPP"
      accessibilityRole="image"
    >
      <G
        fill="none"
        stroke={color}
        strokeWidth="68"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <Path d="M170 500 L170 120" />
        <Path d="M220 315 L485 120" />
        <Path d="M220 315 L505 500" />
        <Path d="M655 120 L910 120" />
        <Path d="M910 120 L910 385" />
        <Path d="M910 385 C910 470 850 510 755 510" />
        <Path d="M755 510 L650 510" />
        <Path d="M1080 500 L1240 120" />
        <Path d="M1240 120 L1410 500" />
        <Path d="M1150 375 L1335 375" />
        <Path d="M1580 500 L1580 120" />
        <Path d="M1580 120 L1815 120" />
        <Path d="M1815 120 L1815 300" />
        <Path d="M1815 300 L1580 300" />
        <Path d="M1975 500 L1975 120" />
        <Path d="M1975 120 L2210 120" />
        <Path d="M2210 120 L2210 300" />
        <Path d="M2210 300 L1975 300" />
      </G>
    </Svg>
  );
}
