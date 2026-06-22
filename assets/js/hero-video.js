(function () {
  var REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAX_DPR = 2;
  var MAX_CANVAS_PX = 2048;

  var VERTEX_SHADER = [
    "attribute vec2 a_position;",
    "attribute vec2 a_texCoord;",
    "varying vec2 v_texCoord;",
    "void main(void) {",
    "  v_texCoord = a_texCoord;",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAGMENT_SHADER = [
    "precision mediump float;",
    "uniform sampler2D u_texture;",
    "uniform float u_mode;",
    "uniform vec2 u_key;",
    "uniform float u_maxSatHard;",
    "uniform float u_maxSatSoft;",
    "varying vec2 v_texCoord;",
    "void main(void) {",
    "  vec4 c = texture2D(u_texture, v_texCoord);",
    "  float minC = min(c.r, min(c.g, c.b));",
    "  float maxC = max(c.r, max(c.g, c.b));",
    "  float sat = (maxC - minC) / (maxC + 0.0001);",
    "  if (u_mode > 0.5) {",
    "    if (c.a < 0.98 && minC > 0.80 && sat < 0.13) {",
    "      float crush = smoothstep(0.80, 0.96, minC);",
    "      crush *= 1.0 - smoothstep(0.04, 0.13, sat);",
    "      crush *= 1.0 - smoothstep(0.92, 0.98, c.a);",
    "      c.a *= (1.0 - crush * 0.92);",
    "      c.rgb = mix(c.rgb, vec3(minC), crush * 0.25);",
    "    }",
    "  } else {",
    "    float key = 0.0;",
    "    if (minC >= u_key.x && maxC >= 0.94 && sat <= u_maxSatHard) {",
    "      key = 1.0;",
    "    } else if (minC >= u_key.y && maxC >= 0.86 && sat <= u_maxSatSoft) {",
    "      float t = smoothstep(u_key.y, u_key.x, minC);",
    "      float s = 1.0 - smoothstep(u_maxSatHard, u_maxSatSoft, sat);",
    "      key = t * s;",
    "    }",
    "    if (key > 0.0 && key < 1.0) {",
    "      c.rgb = mix(c.rgb, vec3(minC), key * 0.3);",
    "    }",
    "    c.a *= (1.0 - key);",
    "  }",
    "  gl_FragColor = c;",
    "}"
  ].join("\n");

  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  function isWebmSource(video) {
    return /\.webm(\?|#|$)/i.test(video.currentSrc || "");
  }

  function setupCompositor(media, video, canvas, fringeMode, boomerang) {
    media.classList.toggle("hero-media--alpha", fringeMode);
    canvas.hidden = false;

    var gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true
    });

    if (!gl) return;

    var program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) return;

    var positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]);
    var texCoords = new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0
    ]);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var positionLoc = gl.getAttribLocation(program, "a_position");
    var texCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    var textureLoc = gl.getUniformLocation(program, "u_texture");
    var modeLoc = gl.getUniformLocation(program, "u_mode");
    var keyLoc = gl.getUniformLocation(program, "u_key");
    var satHardLoc = gl.getUniformLocation(program, "u_maxSatHard");
    var satSoftLoc = gl.getUniformLocation(program, "u_maxSatSoft");

    gl.useProgram(program);
    gl.uniform1i(textureLoc, 0);
    gl.uniform1f(modeLoc, fringeMode ? 1.0 : 0.0);
    gl.uniform2f(keyLoc, 245.0 / 255.0, 232.0 / 255.0);
    gl.uniform1f(satHardLoc, 0.045);
    gl.uniform1f(satSoftLoc, 0.085);

    video.muted = true;
    video.setAttribute("playsinline", "");
    video.playsInline = true;
    video.loop = !!boomerang;
    video.preload = "auto";

    var frameCallbackId = null;
    var resizeRaf = null;
    var lastCanvasWidth = 0;
    var lastCanvasHeight = 0;

    var clip = media.querySelector(".hero-media__clip");

    function sizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var rect = (clip || media).getBoundingClientRect();
      if (!rect.width || !rect.height) return false;

      var width = Math.min(MAX_CANVAS_PX, Math.max(1, Math.round(rect.width * dpr)));
      var height = Math.min(MAX_CANVAS_PX, Math.max(1, Math.round(rect.height * dpr)));

      if (width === lastCanvasWidth && height === lastCanvasHeight) {
        return false;
      }

      lastCanvasWidth = width;
      lastCanvasHeight = height;
      canvas.width = width;
      canvas.height = height;
      return true;
    }

    function render() {
      if (video.readyState < 2) return;

      sizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLoc);
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function stopRenderLoop() {
      if (!frameCallbackId) return;

      if (video.cancelVideoFrameCallback) {
        try {
          video.cancelVideoFrameCallback(frameCallbackId);
        } catch (e) {
          window.cancelAnimationFrame(frameCallbackId);
        }
      } else {
        window.cancelAnimationFrame(frameCallbackId);
      }

      frameCallbackId = null;
    }

    function pump() {
      frameCallbackId = null;
      render();

      if (!video.paused && !video.ended) {
        schedulePump();
      }
    }

    function schedulePump() {
      if (video.requestVideoFrameCallback) {
        frameCallbackId = video.requestVideoFrameCallback(pump);
      } else {
        frameCallbackId = window.requestAnimationFrame(pump);
      }
    }

    function startRenderLoop() {
      stopRenderLoop();
      schedulePump();
    }

    function play() {
      if (REDUCED_MOTION) {
        video.pause();
        render();
        return;
      }

      var playPromise = video.play();
      if (playPromise && playPromise.then) {
        playPromise.then(startRenderLoop).catch(function () {
          render();
        });
      } else {
        startRenderLoop();
      }
    }

    video.addEventListener("play", startRenderLoop);

    function onResize() {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(function () {
        resizeRaf = null;
        render();
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopRenderLoop();
        video.pause();
        return;
      }
      if (video.paused && !REDUCED_MOTION) {
        play();
      }
    });

    window.addEventListener("resize", onResize);

    if (typeof ResizeObserver !== "undefined") {
      var resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(clip || media);
    }

    render();
    play();
  }

  function initHeroVideo() {
    var media = document.querySelector(".hero-media");
    var video = media && media.querySelector(".hero-media__video");
    var canvas = media && media.querySelector(".hero-media__canvas");
    if (!media || !video || !canvas) return;

    var boomerang = media.getAttribute("data-hero-boomerang") === "true";

    function onSourceReady() {
      if (!video.duration || !isFinite(video.duration)) return;
      setupCompositor(media, video, canvas, isWebmSource(video), boomerang);
    }

    if (video.readyState >= 2) {
      onSourceReady();
    } else {
      video.addEventListener("loadeddata", onSourceReady, { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeroVideo);
  } else {
    initHeroVideo();
  }
})();
