import './style.css'
import { startScene } from './scene.js';
import { WEBGL } from 'three/examples/jsm/WebGL.js';

// Fix pdf reference
import cvPdf from './documents/cv.pdf';
document.getElementById('cv-pdf').href = cvPdf;

// Check for webgl
if (WEBGL.isWebGLAvailable()) {
  startScene('bg');
} else {
  document.getElementById('webgl-warning').classList.add('show-warning');
}
