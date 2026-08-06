export function SVGFilters() {
  return (
    <>
      <svg className="filterHide" aria-hidden="true">
        <filter
          id="teal-white"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 1 0"
            in="SourceGraphic"
            result="colormatrix"
          />
          <feComponentTransfer in="colormatrix" result="componentTransfer">
            <feFuncR type="table" tableValues="0.16 1" />
            <feFuncG type="table" tableValues="0.73 1" />
            <feFuncB type="table" tableValues="0.19 1" />
            <feFuncA type="table" tableValues="0 1" />
          </feComponentTransfer>
          <feBlend
            mode="overlay"
            in="componentTransfer"
            in2="SourceGraphic"
            result="blend"
          />
        </filter>
      </svg>
      <svg className="filterHide" aria-hidden="true">
        <filter
          id="black-white"
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 1 0"
            in="SourceGraphic"
            result="colormatrix"
          />
          <feComponentTransfer in="colormatrix" result="componentTransfer">
            <feFuncR type="table" tableValues="0 1" />
            <feFuncG type="table" tableValues="0 1" />
            <feFuncB type="table" tableValues="0 1" />
            <feFuncA type="table" tableValues="0 1" />
          </feComponentTransfer>
          <feBlend
            mode="normal"
            in="componentTransfer"
            in2="SourceGraphic"
            result="blend"
          />
        </filter>
      </svg>
    </>
  );
}

export default SVGFilters;
