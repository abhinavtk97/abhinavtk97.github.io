// Phase 1 QA helper: place the camera via the shared cameraAt() path (scroll
// shots) or an explicit pos/look, render each pose through the composer, and
// read the canvas back synchronously (safe: toDataURL right after render).
export async function captureShots(ctx, plan, out) {
  const { renderer, composer, camera, cameraAt } = ctx;
  for (const shot of plan) {
    if (typeof shot.scroll === 'number') {
      cameraAt(shot.scroll); // same path function the loop uses, no parallax
    } else {
      camera.position.set(...shot.pos);
      camera.lookAt(...shot.look);
    }
    camera.updateMatrixWorld(true);
    renderer.info.reset();
    composer.render();
    const url = renderer.domElement.toDataURL('image/png');
    out.push({ name: shot.name, url });
    await new Promise(r => setTimeout(r, 60)); // yield to keep the tab responsive
  }
}
