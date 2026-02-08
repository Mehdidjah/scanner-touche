// Copyright (c) 2023 8th Wall, Inc.
//
// app.js is the main entry point for your 8th Wall app. Code here will execute after head.html
// is loaded, and before body.html is loaded.
import './index.css'

import {alphaMapComponent} from './components/alpha-map'
AFRAME.registerComponent('alpha-map', alphaMapComponent)

import {colorPickerComponent} from './components/color-picker'
AFRAME.registerComponent('color-picker', colorPickerComponent)

import {uiManagerComponent} from './components/ui-manager'
AFRAME.registerComponent('ui-manager', uiManagerComponent)

import {hideContactsComponent} from './components/hide-contacts'
AFRAME.registerComponent('hide-contacts', hideContactsComponent)