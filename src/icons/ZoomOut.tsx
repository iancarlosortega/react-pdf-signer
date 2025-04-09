import { SVGProps } from "react";

export const ZoomOut = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx={11} cy={11} r={8} />
    <line x1={21} x2={16.65} y1={21} y2={16.65} />
    <line x1={8} x2={14} y1={11} y2={11} />
  </svg>
);
