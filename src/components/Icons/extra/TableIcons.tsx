// icon:dots-vertical | Material Design Icons https://materialdesignicons.com/ | Austin Andrews
import React from "react";

export function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      width="13"
      height="14"
      role="presentation"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M6 12h12" />
        <path d="M12 18V6" />
      </g>
    </svg>
  );
}

export function VerticalDotsIcon({ height = 17, width = 17 }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={height}
      width={width}
      role="presentation"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        fill="#677788"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      width="14"
      focusable="false"
      role="presentation"
      viewBox="0 0 24 24"
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.21875 1.71875C1.21875 1.49438 1.40063 1.3125 1.625 1.3125H11.375C11.5994 1.3125 11.7812 1.49438 11.7812 1.71875V3.34375C11.7812 3.44411 11.7441 3.54092 11.677 3.61552L8.125 7.56214V11.4688C8.125 11.6436 8.01311 11.7989 7.84722 11.8542L5.40972 12.6667C5.28583 12.7079 5.14965 12.6872 5.04371 12.6108C4.93777 12.5345 4.875 12.4118 4.875 12.2812V7.56214L1.32304 3.61552C1.2559 3.54092 1.21875 3.44411 1.21875 3.34375V1.71875ZM2.03125 2.125V3.18786L5.58321 7.13448C5.65035 7.20908 5.6875 7.30589 5.6875 7.40625V11.7176L7.3125 11.1759V7.40625C7.3125 7.30589 7.34965 7.20908 7.41679 7.13448L10.9688 3.18786V2.125H2.03125Z"
        fill="#677788"
      />
    </svg>
  );
}

export function ColumnIcon() {
  return (
    <svg
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 2.125C0 1.22754 0.727537 0.5 1.625 0.5H11.375C12.2725 0.5 13 1.22754 13 2.125V11.875C13 12.7725 12.2725 13.5 11.375 13.5H1.625C0.727537 13.5 0 12.7725 0 11.875V2.125ZM12.1875 3.75H8.9375V6.1875H12.1875V3.75ZM12.1875 7H8.9375V9.4375H12.1875V7ZM12.1875 10.25H8.9375V12.6875H11.375C11.8237 12.6875 12.1875 12.3237 12.1875 11.875V10.25ZM8.125 12.6875V10.25H4.875V12.6875H8.125ZM4.0625 12.6875V10.25H0.8125V11.875C0.8125 12.3237 1.17627 12.6875 1.625 12.6875H4.0625ZM0.8125 9.4375H4.0625V7H0.8125V9.4375ZM0.8125 6.1875H4.0625V3.75H0.8125V6.1875ZM4.875 3.75V6.1875H8.125V3.75H4.875ZM8.125 7H4.875V9.4375H8.125V7Z"
        fill="#677788"
      />
    </svg>
  );
}
