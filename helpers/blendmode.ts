/**
 * The function `convertBlendMode` takes a blend mode as input and returns its corresponding CSS blend
 * mode if available, otherwise returns the input blend mode.
 * @param {string} blendMode - The `blendMode` parameter is a string representing a blend mode used in
 * graphics programming. The `convertBlendMode` function takes this blend mode string as input and
 * returns the corresponding blend mode string from the `blendModeMap` object. If there is no matching
 * blend mode in the map, it
 * @returns The `convertBlendMode` function takes a `blendMode` string as input and returns the
 * corresponding blend mode string from the `blendModeMap` object. If a matching blend mode is found in
 * the map, it returns the mapped value (e.g., 'source-over' for 'kCGBlendModeNormal'). If no matching
 * blend mode is found in the map, it returns the original `
 */
const blendModeMap: { [key: string]: string } = {
    kCGBlendModeNormal: 'source-over',
    kCGBlendModeMultiply: 'multiply',
    kCGBlendModeScreen: 'screen',
    kCGBlendModeOverlay: 'overlay',
    kCGBlendModeDarken: 'darken',
    kCGBlendModeLighten: 'lighten',
    kCGBlendModeColorDodge: 'color-dodge',
    kCGBlendModeColorBurn: 'color-burn',
    kCGBlendModeSoftLight: 'soft-light',
    kCGBlendModeHardLight: 'hard-light',
    kCGBlendModeDifference: 'difference',
    kCGBlendModeExclusion: 'exclusion',
    kCGBlendModeHue: 'hue',
    kCGBlendModeSaturation: 'saturation',
    kCGBlendModeColor: 'color',
    kCGBlendModeLuminosity: 'luminosity',
    // Add more mappings as needed
  };

export function convertBlendMode(blendMode: string): string {
  return blendModeMap[blendMode] || blendMode;
}

// const MyComponent: React.FC = () => {
//   const blendMode = 'kCGBlendModeMultiply'; // Or any other blend mode
//   const canvasBlendMode = convertBlendMode(blendMode);

//   return (
//     <div>
//       <p>Blend Mode: {canvasBlendMode}</p>
//     </div>
//   );
// };

// export default MyComponent;
