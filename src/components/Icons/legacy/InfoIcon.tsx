const InfoIcon = ({
  width = 16,
  height = 17,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 16 17"
    fill="none"
  >
    <g clipPath="url(#clip0_268_41619)">
      <path
        d="M8.00004 11.1667V8.50004M8.00004 5.83337H8.00671M14.6667 8.50004C14.6667 12.1819 11.6819 15.1667 8.00004 15.1667C4.31814 15.1667 1.33337 12.1819 1.33337 8.50004C1.33337 4.81814 4.31814 1.83337 8.00004 1.83337C11.6819 1.83337 14.6667 4.81814 14.6667 8.50004Z"
        stroke="#B3B5B8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_268_41619">
        <rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0 0.5)"
        />
      </clipPath>
    </defs>
  </svg>
);

export default InfoIcon;
