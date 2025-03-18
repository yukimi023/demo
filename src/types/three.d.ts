import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

declare module 'three' {
  export const BufferGeometryUtils: typeof import('three/examples/jsm/utils/BufferGeometryUtils');
  export const SRGBColorSpace: 'srgb';
} 