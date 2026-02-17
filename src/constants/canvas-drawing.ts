import { Color, LineCurve3, Shape, Vector3 } from "three";

export const PRIMARY_COLOR_LIGHT = new Color("#ed1870");
export const PRIMARY_COLOR_DARK = new Color("#ed1870");

export const LABEL_COLOR_LIGHT = new Color("#010101");
export const LABEL_COLOR_DARK = new Color("#fefefe");

export const GRID_COLOR_LIGHT = new Color("#f0f0f0");
export const GRID_COLOR_DARK = new Color("#181818");

export const NODE_COLOR_LIGHT = new Color("#363636");
export const NODE_COLOR_DARK = new Color("#efefef");
export const DIM_NODE_COLOR_LIGHT = new Color("#999999");
export const DIM_NODE_COLOR_DARK = new Color("#606060");

export const SEMITRANSPARENT_LINK_COLOR_LIGHT = new Color("#a8a8a8");
export const SEMITRANSPARENT_LINK_COLOR_DARK = new Color("#a8a8a8");
export const OPAQUE_LINK_COLOR_LIGHT = new Color("#e3e3e3");
export const OPAQUE_LINK_COLOR_DARK = new Color("#363636");

export const SEMITRANSPARENT_DIM_LINK_COLOR_LIGHT = new Color("#e0e0e0");
export const SEMITRANSPARENT_DIM_LINK_COLOR_DARK = new Color("#393939");
export const OPAQUE_DIM_LINK_COLOR_LIGHT = new Color("#efefef");
export const OPAQUE_DIM_LINK_COLOR_DARK = new Color("#181818");

export const SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_LIGHT = new Color("#505050");
export const SEMITRANSPARENT_HIGHLIGHTED_LINK_COLOR_DARK = new Color("#ffffff");
export const OPAQUE_HIGHLIGHTED_LINK_COLOR_LIGHT = new Color("#afafaf");
export const OPAQUE_HIGHLIGHTED_LINK_COLOR_DARK = new Color("#808080");

export const SEMITRANSPARENT_COLORED_LINK_COLOR_LIGHT = new Color("#dd226f");
export const SEMITRANSPARENT_COLORED_LINK_COLOR_DARK = new Color("#dd226f");
export const OPAQUE_COLORED_LINK_COLOR_LIGHT = new Color("#ffbdd8");
export const OPAQUE_COLORED_LINK_COLOR_DARK = new Color("#4f0926");

export const LINE_THICKNESS = 0.03;

export const MAX_SEED_LENGTH_REDRAW = 9;

// https://codesandbox.io/p/sandbox/react-three-fiber-poc-segments-with-instancedmesh-and-hightlight-drag-2vcl9i
// Base geometry for flat 2D lines (a thin rectangle)
export const LINE_BASE_SEGMENT = new Shape();
LINE_BASE_SEGMENT.moveTo(0, 0.5);
LINE_BASE_SEGMENT.lineTo(1, 0.5);
LINE_BASE_SEGMENT.lineTo(1, -0.5);
LINE_BASE_SEGMENT.lineTo(0, -0.5);
LINE_BASE_SEGMENT.lineTo(0, 0.5);

// Base curve for 3D tube lines
export const TUBE_LINE_CURVE = new LineCurve3(new Vector3(0, 0, 0), new Vector3(1, 0, 0));