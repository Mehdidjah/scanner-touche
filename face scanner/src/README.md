# A-Frame: Face Effects Makeup 

Get started with 8th Wall Face Effects! This A-frame example project showcases how to use A-frame Materials with alpha masks for makeup try-on.

![](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzI5ZDZkZTlkZTM5YjExNDMyNzBiYzlmOGY1ZTJmMDNkY2ZjYmM2ZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/tkGKcPFFI3yYdYSUbr/giphy-downsized-large.gif)

For detailed documentation, visit the [Face Effects Docs](https://www.8thwall.com/docs/api/aframe/#face-effects) 🔗

### Face Effects Makeup Overview

* components/
  * **alpha-map.js** Adds an alpha map to the entity's material.
  * **color-picker.js** adds dynamic color options for different makeup elements
  * **hide-contacts.js** turns visibility on/off on contact lenses on the eyeclosed events so they don't clip through eyelids
  * **ui-manager.js** leverages Luna for tabs and utilizes color-picker to change colors when changing tabs

* assets/alpha-masks/
  * 7 black and white alpha masks used to mask out different makeup elements
* assets/UI/
  * **dropper.svg** used by the `color-picker` componenent to set the icon for the color input button
  * **noneIcon.svg** used by the `color-picker` componenent to set the icon for the no color button
* assets/
  * **flatUV.png** flat version of face mesh UVs 
  * **head-occluder.glb** head model to occlude user's head
  * **unwrappedUV.png** unwrapped version of face mesh UVs

```xrface``` is required in your ```<a-scene>``` for face effects.

- cameraDirection: Desired camera to use. Choose from: 'back' or 'front'. Use 
'cameraDirection: front;' with 'mirroredDisplay: true;' for selfie mode. (default: back)
- allowedDevices: Supported device classes. Choose from: 'mobile' or 'any'. Use 'any' to enable 
laptop- or desktop-type devices with built-in or attached webcams. (default: mobile)
- mirroredDisplay: If true, flip left and right in the output geometry and reversie the direction 
of the camera feed. Use 'mirroredDisplay: true' with 'cameraDirection: front;' with selfie mode. 
(default: false)
- meshGeometry: Configure which portions of the face mesh will have returned triangle indices. Can 
be any combination of 'face', 'eyes', 'iris', and 'mouth'. (default: `face`)
- uvType: Configure which set of UVs the project uses to apply face mesh textures. Can be `projected` or `standard`. (default: `standard`)
- maxDetections: The maximum number of faces that can be simultaneously processed. Can be `1`, `2`, or `3`. (default: `1`)

```<xrextras-faceanchor>``` inherits the detected face transforms. Entities inside will move with 
the face.

```xrextras-hider-material``` is applied to any mesh or primitive that you would like to be 
transparent while blocking the rendering of models behind it. In the scene, this is applied to the
head-occluder.glb.

```<xrextras-face-mesh>``` generates a face mesh in your scene.

```<xrextras-face-attachment>``` inherits the detected attachment point transforms. Entities inside
will move with the assigned attachment point.  

- point: name of attachment point (default: forehead)

Attachment points include: 
forehead,
rightEyebrowInner,
rightEyebrowMiddle,
rightEyebrowOuter,
leftEyebrowInner,
leftEyebrowMiddle,
leftEyebrowOuter,
leftEar,
rightEar,
leftCheek,
rightCheek,
noseBridge,
noseTip,
leftEye,
rightEye,
leftEyeOuterCorner,
rightEyeOuterCorner,
leftIris,
rightIris,
leftUpperEyelid,
rightUpperEyelid,
leftLowerEyelid,
rightLowerEyelid,
upperLip,
lowerLip,
mouth,
mouthRightCorner,
mouthLeftCorner,
chin.


### Developing Face Effects Makeup Experiences
Each makeup element (not including contacts, which are made using `<xrextras-face-attachment>`) is made up of its own `<xrextras-face-mesh>` and corresponding alpha mask.
the alpha mask masks out the underlying material in order to make the makeup element appear on the face.

1. In your `<a-scene>` add the `xrface` component.
2. Edit the material property on each element to configure different makeup properties.
3. Feel free to add an image texture or shader material on each entity for more advanced makeup effects.

#### Adding more makeup elements
There are a few ways to add more makeup elements to your project.
* Create textures in softwares like Procreate or Photoshop with [makeup brushes](https://brushwarriors.com/makeup-brushes-procreate/)/your own drawings with `flatUV.png` or `unwrappedUV.png` as a guide.
  * See these textures by creating a new `<xrextras-face-mesh>` and setting the `src` property of the `material` attribute to your texture id.
  * All of the makeup textures in this project were created using unwrapped UVs (`unwrappedUV.png`) `uvType: Standard`, but it can be hard to create makeup around the eye using unwrapped UVs as a result
  of the indices stretching when applied to the face. For makeup such as eyeliner or upper lashes, we reccomend using flat UVs (`flatUv.png`) as your texture guide and setting the `uvType:projected` property of `xrface` to use it. 
  * NOTE: it can be hard to use both UVs at the same time, so we reccomend choosing one set and creating all of your makeup elements using that UV projection.
* To create more procedural materials, you can convert the above textures into alpha masks by coloring the texture white and putting it on a black background
  * See these materials by using the `alpha-mask` on a new `<xrextras-face-mesh>` and setting the `material` attribute to your desired material.
* You can also paint textures directly on the face-mesh using a software like Blender or Substance Painter by applying one of the UV maps onto a 3D model and then exporting the texture that way.