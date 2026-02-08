/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'a-scene': any;
            'a-camera': any;
            'a-light': any;
            'a-entity': any;
            'a-assets': any;
            'a-asset-item': any;
            'a-cylinder': any;
            'a-box': any;
            'a-sphere': any;
            'a-plane': any;
            'xrextras-resource': any;
            'xrextras-faceanchor': any;
            'xrextras-face-mesh': any;
            'xrextras-face-attachment': any;
        }
    }
    
    interface Window {
        XR8: any;
        AFRAME: any;
        THREE: any;
    }
}

export { };
