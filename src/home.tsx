import React, { useEffect, useRef, useState } from 'react';
import { loadPyodide } from 'pyodide';
import { setupWebGL } from './gym-utils/webgl';
import { Spinner } from './spinner';
import pythonCode from './samples/classic_control.py';

export const Home = () => {
  const acrobotCanvas = useRef(null);
  const cartPoleCanvas = useRef(null);
  const mountainCarCanvas = useRef(null);
  const pendulumCanvas = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const getGL = (canvas) => {
      const gl = canvas.getContext('webgl2', {
        alpha: false, depth: false, stencil: false, antialias: true,
        premultipliedAlpha: false, preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      }) as WebGL2RenderingContext;
      gl.clearColor(1.0, 1.0, 1.0, 1.0);
      return gl;
    };

    const load = async () => {
      const pyodide = await loadPyodide();

      if (controller.signal.aborted) {
        return;
      }

      await pyodide.loadPackage([
        '/zengl-1.13.0-cp311-cp311-emscripten_3_1_32_wasm32.whl',
        '/numpy-1.24.2-cp311-cp311-emscripten_3_1_32_wasm32.whl',
        '/gym_utils-0.1.0-cp311-cp311-emscripten_3_1_32_wasm32.whl',
        '/gymnasium-0.28.1-py3-none-any.whl',
      ]);

      if (controller.signal.aborted) {
        return;
      }

      const options = [
        getGL(mountainCarCanvas.current),
        getGL(cartPoleCanvas.current),
        getGL(pendulumCanvas.current),
        getGL(acrobotCanvas.current),
      ];

      const ctx = {
        gl: options[0],
      };

      setupWebGL(pyodide, ctx, options);

      pyodide.runPython(pythonCode);

      const updateCallback = pyodide.globals.get('update');

      const render = () => {
        if (controller.signal.aborted) {
          return;
        }

        updateCallback();

        requestAnimationFrame(render);
      };

      requestAnimationFrame(render);

      if (!controller.signal.aborted) {
        setLoading(false);
      }
    };

    load();

    return () => {
      controller.abort();
    }
  }, []);

  return (
    <>
      <div
        style={{
          width: 'min(800px, 100%)',
          margin: 'auto',
        }}
      >
        <h4 style={{ fontSize: '36px', }}>
          Gym in the Browser
        </h4>
        <h6 style={{ fontSize: '24px', fontWeight: 500 }}>
          Mountain Car
        </h6>
        <div style={{ display: loading ? 'none' : 'block' }} >
          <canvas ref={mountainCarCanvas} width={600} height={400} style={{ width: 'min(600px, 100%)' }} />
        </div>
        {loading && <Spinner style={{ width: 'min(600px, 100%)', aspectRatio: '6 / 4' }} />}
        <h6 style={{ fontSize: '24px', fontWeight: 500 }}>
          Cart Pole
        </h6>
        <div style={{ display: loading ? 'none' : 'block' }} >
          <canvas ref={cartPoleCanvas} width={600} height={400} style={{ width: 'min(600px, 100%)' }} />
        </div>
        {loading && <Spinner style={{ width: 'min(600px, 100%)', aspectRatio: '6 / 4' }} />}
        <h6 style={{ fontSize: '24px', fontWeight: 500 }}>
          Pendulum
        </h6>
        <div style={{ display: loading ? 'none' : 'block' }} >
          <canvas ref={pendulumCanvas} width={600} height={400} style={{ width: 'min(600px, 100%)' }} />
        </div>
        {loading && <Spinner style={{ width: 'min(600px, 100%)', aspectRatio: '6 / 4' }} />}
        <h6 style={{ fontSize: '24px', fontWeight: 500 }}>
          Acrobot
        </h6>
        <div style={{ display: loading ? 'none' : 'block' }} >
          <canvas ref={acrobotCanvas} width={600} height={400} style={{ width: 'min(600px, 100%)' }} />
        </div>
        {loading && <Spinner style={{ width: 'min(600px, 100%)', aspectRatio: '6 / 4' }} />}
      </div>
      <div style={{ height: '60px' }} />
    </>
  );
};
