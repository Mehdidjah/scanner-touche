const colorPickerComponent = {
  schema: {
    makeup: {type: 'string'},
  },
  init() {
    const container = document.getElementById('palette')
    const colorInput = document.getElementById('color-input')
    const colorParent = document.getElementById('colorParent')
    const rightEye = document.getElementById('rightIris')
    const leftEye = document.getElementById('leftIris')
    this.currentMakeup = document.getElementById(this.data.makeup)
    // custom texture variables
    const noneIcon = require('../assets/UI/noneIcon.png')
    const dropperIcon = require('../assets/UI/dropper.svg')

    this.offset = 0
    this.textureSelected = false
    this.once = false

    // Single gradient with smooth blue transitions
    const holographicGradient = {
      name: 'blue-gradient',
      colors: ['#0047ab', '#00ffff', '#87ceeb', '#00bfff', '#0047ab'],
    }

    // Hide the UI container
    if (container) {
      container.style.display = 'none'
    }
    if (colorParent) {
      colorParent.style.display = 'none'
    }

    // Create face detection UI
    this.createFaceDetectionUI = () => {
      // Create container
      const faceDetectionContainer = document.createElement('div')
      faceDetectionContainer.id = 'face-detection-ui'
      faceDetectionContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 1000;
      `

      // Create scanning text
      const scanningText = document.createElement('div')
      scanningText.style.cssText = `
        position: absolute;
        top: 15%;
        left: 50%;
        transform: translateX(-50%);
        color: #ffffff;
        font-family: 'Bai Jamjuree', 'Arial', sans-serif;
        font-size: clamp(14px, 4vw, 18px);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: clamp(1px, 0.5vw, 3px);
        text-shadow: 0 4px 6px rgba(0, 0, 0, 0.5),
                     0 2px 4px rgba(0, 0, 0, 0.3);
        animation: pulse-text 1.5s ease-in-out infinite;
        white-space: nowrap;
        padding: 0 20px;
        text-align: center;
      `
      scanningText.textContent = 'Scanning Your Face...'

      // Create oval frame wrapper for centering
      const ovalWrapper = document.createElement('div')
      ovalWrapper.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
      `

      // Create oval frame for face
      const ovalFrame = document.createElement('div')
      ovalFrame.style.cssText = `
        position: relative;
        width: min(280px, 70vw);
        height: min(360px, 90vw);
        max-width: 280px;
        max-height: 360px;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3),
                    0 2px 4px rgba(0, 0, 0, 0.2),
                    inset 0 0 20px rgba(255, 255, 255, 0.1);
        animation: pulse-oval 2s ease-in-out infinite;
      `

      // Create scanning line that moves vertically
      const scanLine = document.createElement('div')
      scanLine.style.cssText = `
        position: absolute;
        top: 0;
        left: -10%;
        width: 120%;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 255, 255, 0.6), 
          rgba(255, 255, 255, 1), 
          rgba(255, 255, 255, 0.6), 
          transparent);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
                    0 1px 2px rgba(0, 0, 0, 0.2);
        animation: scan-vertical 2s linear infinite;
      `

      // Create corner markers for a tech feel
      const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
      corners.forEach((corner) => {
        const marker = document.createElement('div')
        const isTop = corner.includes('top')
        const isLeft = corner.includes('left')

        marker.style.cssText = `
          position: absolute;
          ${isTop ? 'top: -2px' : 'bottom: -2px'};
          ${isLeft ? 'left: -2px' : 'right: -2px'};
          width: clamp(20px, 5vw, 30px);
          height: clamp(20px, 5vw, 30px);
          border-${isTop ? 'top' : 'bottom'}: clamp(2px, 0.5vw, 4px) solid #ffffff;
          border-${isLeft ? 'left' : 'right'}: clamp(2px, 0.5vw, 4px) solid #ffffff;
          border-radius: ${isTop && isLeft ? '50% 0 0 0'
    : isTop && !isLeft ? '0 50% 0 0'
      : !isTop && isLeft ? '0 0 0 50%' : '0 0 50% 0'};
          animation: corner-glow 1.5s ease-in-out infinite;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
        `
        ovalFrame.appendChild(marker)
      })

      ovalFrame.appendChild(scanLine)
      ovalWrapper.appendChild(ovalFrame)

      // Create progress bar container
      const progressContainer = document.createElement('div')
      progressContainer.style.cssText = `
        position: absolute;
        bottom: 12%;
        left: 50%;
        transform: translateX(-50%);
        width: min(300px, 80vw);
        max-width: 300px;
        height: clamp(6px, 1.5vw, 8px);
        background: rgba(0, 71, 171, 0.3);
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(0, 255, 255, 0.4);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      `

      // Create progress bar fill
      const progressBar = document.createElement('div')
      progressBar.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, 
          #0047ab, 
          #00ffff, 
          #87ceeb, 
          #00bfff);
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
        animation: progress-fill 7s ease-out forwards;
        position: relative;
        overflow: hidden;
      `

      // Create animated shimmer effect on progress bar
      const shimmer = document.createElement('div')
      shimmer.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(255, 255, 255, 0.6), 
          transparent);
        animation: shimmer 1.5s infinite;
      `
      progressBar.appendChild(shimmer)
      progressContainer.appendChild(progressBar)

      // Assemble the UI
      faceDetectionContainer.appendChild(scanningText)
      faceDetectionContainer.appendChild(ovalWrapper)
      faceDetectionContainer.appendChild(progressContainer)

      // Add CSS animations
      const style = document.createElement('style')
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;600;700&display=swap');

        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes pulse-oval {
          0%, 100% { 
            transform: scale(1);
            border-color: #ffffff;
          }
          50% { 
            transform: scale(1.02);
            border-color: #f0f0f0;
          }
        }

        @keyframes scan-vertical {
          0% { 
            top: 0; 
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            top: 100%; 
            opacity: 0;
          }
        }

        @keyframes corner-glow {
          0%, 100% { 
            opacity: 1;
            filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
          }
          50% { 
            opacity: 0.7;
            filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.4));
          }
        }

        @keyframes progress-fill {
          0% { width: 0%; }
          42.86% { width: 0%; }
          100% { width: 100%; }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          #face-detection-ui {
            padding: 10px;
          }
        }

        @media (max-height: 600px) {
          #face-detection-ui div:first-child {
            top: 10% !important;
            font-size: 14px !important;
          }
        }
      `
      document.head.appendChild(style)

      // Add to document body
      document.body.appendChild(faceDetectionContainer)
    }

    const setColorList = () => {
      // Only use the holographic gradient
      this.colorList = [holographicGradient]
    }

    // Smooth color interpolation function
    this.lerpColor = (color1, color2, factor) => {
      const r1 = parseInt(color1.slice(1, 3), 16)
      const g1 = parseInt(color1.slice(3, 5), 16)
      const b1 = parseInt(color1.slice(5, 7), 16)

      const r2 = parseInt(color2.slice(1, 3), 16)
      const g2 = parseInt(color2.slice(3, 5), 16)
      const b2 = parseInt(color2.slice(5, 7), 16)

      const r = Math.round(r1 + (r2 - r1) * factor)
      const g = Math.round(g1 + (g2 - g1) * factor)
      const b = Math.round(b1 + (b2 - b1) * factor)

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }

    // Animation frame for scanning line effect
    this.animationFrameId = null
    this.scanTime = 0
    this.scanDirection = 1  // 1 for down, -1 for up

    // Convert hex to HSL for saturation manipulation
    this.hexToHSL = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h; let s; const
        l = (max + min) / 2

      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
      }

      return [h * 360, s * 100, l * 100]
    }

    this.HSLToHex = (h, s, l) => {
      s /= 100
      l /= 100

      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs((h / 60) % 2 - 1))
      const m = l - c / 2
      let r = 0; let g = 0; let
        b = 0

      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c
      } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x
      }

      const toHex = (n) => {
        const val = Math.round((n + m) * 255)
        return val.toString(16).padStart(2, '0')
      }

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    this.animateScanner = (colors) => {
      const animate = () => {
        this.scanTime += 0.015  // Speed of the scan line

        // Create a scanning effect that goes up and down
        const scanPosition = Math.sin(this.scanTime)  // -1 to 1
        const normalizedPosition = (scanPosition + 1) / 2  // 0 to 1

        // Pulsating opacity effect
        const pulseSpeed = 0.02
        const opacity = 0.3 + Math.sin(this.scanTime * 2) * 0.3  // 0.3 to 0.9

        // Determine which colors to blend based on scan position
        const colorCount = colors.length - 1
        const position = normalizedPosition * colorCount
        const colorIndex = Math.floor(position)
        const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1)
        const blend = position - colorIndex

        // Get base color
        const baseColor = this.lerpColor(
          colors[colorIndex],
          colors[nextColorIndex],
          blend
        )

        // Convert to HSL to manipulate saturation
        const [h, s, l] = this.hexToHSL(baseColor)

        // Pulsating saturation (scanning effect)
        const saturationPulse = Math.sin(this.scanTime * 3) * 30  // ±30%
        const newSaturation = Math.max(0, Math.min(100, s + saturationPulse))

        // Add brightness pulse for scan line effect
        const brightnessPulse = Math.abs(scanPosition) * 15  // 0 to 15
        const newLightness = Math.max(0, Math.min(100, l + brightnessPulse))

        const scanColor = this.HSLToHex(h, newSaturation, newLightness)

        // Apply to makeup elements with opacity
        if (this.currentMakeup === 'contacts') {
          rightEye.setAttribute('material', {
            visible: true,
            color: scanColor,
            opacity,
            transparent: true,
          })
          leftEye.setAttribute('material', {
            visible: true,
            color: scanColor,
            opacity,
            transparent: true,
          })
        } else if (this.currentMakeup) {
          this.currentMakeup.setAttribute('material', {
            visible: true,
            color: scanColor,
            opacity,
            transparent: true,
          })
        }

        this.animationFrameId = requestAnimationFrame(animate)
      }
      animate()
    }

    this.stopAnimation = () => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    }

    this.colorInput = colorInput
    this.setColorInput = () => {
      this.stopAnimation()
      const selectedColor = this.colorInput.value
      if (this.currentMakeup === 'contacts') {
        rightEye.setAttribute('material', {color: selectedColor})
        leftEye.setAttribute('material', {color: selectedColor})
      } else {
        this.currentMakeup.setAttribute('material', {color: selectedColor})
      }
    }

    this.createButtons = () => {
      setColorList()
      // No buttons are created since UI is hidden
      // Just start the animation automatically
    }

    this.createButtons()

    this.removeButtons = () => {
      this.stopAnimation()
      // Clean up if needed
    }

    this.el.sceneEl.addEventListener('realityready', () => {
      // Wait a bit for camera to initialize before showing UI
      setTimeout(() => {
        try {
          // Show face detection UI
          this.createFaceDetectionUI()

          // Start the scanning gradient animation after progress bar is filled (3s delay + 4s fill = 7s)
          setTimeout(() => {
            this.animateScanner(holographicGradient.colors)
          }, 7500)
        } catch (error) {
          console.error('Error showing face detection UI:', error)
        }
      }, 500)
    })
  },
  update() {
    if (this.data.makeup === 'contacts') {
      this.currentMakeup = 'contacts'
    } else {
      this.currentMakeup = document.getElementById(this.data.makeup)
    }
    // Execute code after the first update() is run after init()
    if (this.once) {
      this.removeButtons()
      this.createButtons()
      // Restart animation with new makeup element
      if (this.animationFrameId) {
        this.stopAnimation()
        const holographicGradient = {
          colors: ['#0047ab', '#00ffff', '#87ceeb', '#00bfff', '#0047ab'],
        }
        this.animateScanner(holographicGradient.colors)
      }
    } else {
      this.once = true
    }
  },
  remove() {
    // Clean up animation when component is removed
    this.stopAnimation()
  },
}

export {colorPickerComponent}
