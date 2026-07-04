// Override Next.js's StaticImageData declarations so local image imports
// return plain URL strings — matching the webpack asset/resource config.
declare module '*.png' { const src: string; export default src; }
declare module '*.jpg' { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.gif' { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }
declare module '*.bmp' { const src: string; export default src; }
declare module '*.ico' { const src: string; export default src; }
declare module '*.svg' { const src: string; export default src; }
