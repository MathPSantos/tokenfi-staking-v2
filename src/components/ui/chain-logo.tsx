import { SVGAttributes } from "react";

type ChainLogoProps = SVGAttributes<SVGSVGElement> & {
  chainId: number;
};

export function ChainLogo({ chainId, ...props }: ChainLogoProps) {
  if (chainId === 56) {
    return <BSCLogo {...props} />;
  }

  if (chainId === 1) {
    return <ETHLogo {...props} />;
  }

  return null;
}

function BSCLogo(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    {...props}
  >
    <defs>
      <filter
        id="bnb-a"
        width="111.7%"
        height="111.7%"
        x="-5.8%"
        y="-4.2%"
        filterUnits="objectBoundingBox"
      >
        <feOffset
          dy="0.5"
          in="SourceAlpha"
          result="shadowOffsetOuter1"
        ></feOffset>
        <feGaussianBlur
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
          stdDeviation="0.5"
        ></feGaussianBlur>
        <feComposite
          in="shadowBlurOuter1"
          in2="SourceAlpha"
          operator="out"
          result="shadowBlurOuter1"
        ></feComposite>
        <feColorMatrix
          in="shadowBlurOuter1"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.199473505 0"
        ></feColorMatrix>
      </filter>
      <filter
        id="bnb-d"
        width="117.5%"
        height="117.5%"
        x="-8.8%"
        y="-6.2%"
        filterUnits="objectBoundingBox"
      >
        <feOffset
          dy="0.5"
          in="SourceAlpha"
          result="shadowOffsetOuter1"
        ></feOffset>
        <feGaussianBlur
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
          stdDeviation="0.5"
        ></feGaussianBlur>
        <feColorMatrix
          in="shadowBlurOuter1"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.204257246 0"
        ></feColorMatrix>
      </filter>
      <linearGradient id="bnb-c" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF" stopOpacity="0.5"></stop>
        <stop offset="100%" stopOpacity="0.5"></stop>
      </linearGradient>
      <circle id="bnb-b" cx="16" cy="15" r="15"></circle>
      <path
        id="bnb-e"
        d="M12.116 13.404 16 9.52l3.886 3.886 2.26-2.26L16 5l-6.144 6.144zM6 15l2.26-2.26L10.52 15l-2.26 2.26zm6.116 1.596L16 20.48l3.886-3.886 2.26 2.259L16 25l-6.144-6.144-.003-.003zM21.48 15l2.26-2.26L26 15l-2.26 2.26zm-3.188-.002h.002v.002L16 17.295l-2.291-2.292-.004-.003.004-.003.401-.402.195-.195L16 12.706l2.293 2.293"
      ></path>
    </defs>
    <g fill="none" fillRule="nonzero">
      <use xlinkHref="#bnb-b" fill="#000" filter="url(#bnb-a)"></use>
      <use xlinkHref="#bnb-b" fill="#F3BA2F" fillRule="evenodd"></use>
      <use
        xlinkHref="#bnb-b"
        fill="url(#bnb-c)"
        fillRule="evenodd"
        style={{ mixBlendMode: "soft-light" }}
      ></use>
      <circle
        cx="16"
        cy="15"
        r="14.5"
        stroke="#000"
        strokeOpacity="0.097"
      ></circle>
      <use xlinkHref="#bnb-e" fill="#000" filter="url(#bnb-d)"></use>
      <use xlinkHref="#bnb-e" fill="#FFF" fillRule="evenodd"></use>
    </g>
  </svg>
  );
}

function ETHLogo(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    {...props}
  >
    <defs>
      <filter
        id="eth-a"
        width="111.7%"
        height="111.7%"
        x="-5.8%"
        y="-4.2%"
        filterUnits="objectBoundingBox"
      >
        <feOffset
          dy="0.5"
          in="SourceAlpha"
          result="shadowOffsetOuter1"
        ></feOffset>
        <feGaussianBlur
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
          stdDeviation="0.5"
        ></feGaussianBlur>
        <feComposite
          in="shadowBlurOuter1"
          in2="SourceAlpha"
          operator="out"
          result="shadowBlurOuter1"
        ></feComposite>
        <feColorMatrix
          in="shadowBlurOuter1"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.199473505 0"
        ></feColorMatrix>
      </filter>
      <filter
        id="eth-d"
        width="123.3%"
        height="114.6%"
        x="-11.7%"
        y="-5.2%"
        filterUnits="objectBoundingBox"
      >
        <feOffset
          dy="0.5"
          in="SourceAlpha"
          result="shadowOffsetOuter1"
        ></feOffset>
        <feGaussianBlur
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
          stdDeviation="0.5"
        ></feGaussianBlur>
        <feComposite
          in="shadowBlurOuter1"
          in2="SourceAlpha"
          operator="out"
          result="shadowBlurOuter1"
        ></feComposite>
        <feColorMatrix
          in="shadowBlurOuter1"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.204257246 0"
        ></feColorMatrix>
      </filter>
      <linearGradient id="eth-c" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF" stopOpacity="0.5"></stop>
        <stop offset="100%" stopOpacity="0.5"></stop>
      </linearGradient>
      <circle id="eth-b" cx="16" cy="15" r="15"></circle>
      <path
        id="eth-e"
        d="M16.498 20.968 24 16.616l-7.502 10.379L9 16.615zm0-17.968 7.497 12.22-7.497 4.353L9 15.22z"
      ></path>
    </defs>
    <g fill="none" fillRule="evenodd">
      <use xlinkHref="#eth-b" fill="#000" filter="url(#eth-a)"></use>
      <use xlinkHref="#eth-b" fill="#627EEA"></use>
      <use
        xlinkHref="#eth-b"
        fill="url(#eth-c)"
        style={{ mixBlendMode: "soft-light" }}
      ></use>
      <circle
        cx="16"
        cy="15"
        r="14.5"
        stroke="#000"
        strokeOpacity="0.097"
      ></circle>
      <g fillRule="nonzero">
        <use xlinkHref="#eth-e" fill="#000" filter="url(#eth-d)"></use>
        <use
          xlinkHref="#eth-e"
          fill="#FFF"
          fillOpacity="0"
          fillRule="evenodd"
        ></use>
      </g>
      <g fill="#FFF" fillRule="nonzero">
        <path fillOpacity="0.602" d="M16.498 3v8.87l7.497 3.35z"></path>
        <path d="M16.498 3 9 15.22l7.498-3.35z"></path>
        <path fillOpacity="0.602" d="M16.498 20.968v6.027L24 16.616z"></path>
        <path d="M16.498 26.995v-6.028L9 16.616z"></path>
        <path
          fillOpacity="0.2"
          d="m16.498 19.573 7.497-4.353-7.497-3.348z"
        ></path>
        <path fillOpacity="0.602" d="m9 15.22 7.498 4.353v-7.701z"></path>
      </g>
    </g>
  </svg>
  );
}
