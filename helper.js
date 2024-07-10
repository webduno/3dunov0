export const lerp = (x, y, a) => x * (1 - a) + y * a;

export function updateCameraPosition(theCamera, theColors, selectedObj, totalTimeElapsed, THEINDEX) {
    if (!theCamera || !selectedObj || !theColors || !theColors[THEINDEX]?.camera) { return }
    theCamera.position.z = lerp(theCamera.position.z, selectedObj.position.z + 26 + (theColors[THEINDEX]?.camera.pos[2] || 0), 0.25);
    theCamera.position.x = lerp(theCamera.position.x, theColors[THEINDEX]?.camera.pos[0] || 0, 0.05);
    theCamera.position.y = lerp(theCamera.position.y, theColors[THEINDEX]?.camera.pos[1] || 0, 0.05);
    theCamera.lookAt(selectedObj.position.x, selectedObj.position.y + theColors[THEINDEX]?.camera.lookAt[1] || 0, selectedObj.position.z);
    theCamera.position.y += Math.sin(totalTimeElapsed / 20) / 80;
  }
  