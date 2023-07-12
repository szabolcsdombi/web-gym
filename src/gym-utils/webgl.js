export const setupWebGL = (pyodide, ctx, options) => {
  const wasm = pyodide._module;
  const textEncoder = new TextEncoder('utf-8');
  const textDecoder = new TextDecoder('utf-8');

  const getString = (ptr) => {
    const length = wasm.HEAPU8.subarray(ptr).findIndex((c) => c === 0);
    return textDecoder.decode(wasm.HEAPU8.subarray(ptr, ptr + length));
  };

  const setString = (ptr, text) => {
    const raw = textEncoder.encode(text);
    wasm.HEAPU8.set(raw, ptr);
    wasm.HEAPU8[raw.byteLength] = 0;
  };

  const typedArray = (type, ptr, size) => {
    switch (type) {
      case 0x1400: return wasm.HEAP8.subarray(ptr, ptr + size);
      case 0x1401: return wasm.HEAPU8.subarray(ptr, ptr + size);
      case 0x1402: return wasm.HEAP16.subarray(ptr / 2, ptr / 2 + size * 2);
      case 0x1403: return wasm.HEAPU16.subarray(ptr / 2, ptr / 2 + size * 2);
      case 0x1404: return wasm.HEAP32.subarray(ptr / 4, ptr / 4 + size * 4);
      case 0x1405: return wasm.HEAPU32.subarray(ptr / 4, ptr / 4 + size * 4);
      case 0x1406: return wasm.HEAPF32.subarray(ptr / 4, ptr / 4 + size * 4);
      case 0x84FA: return wasm.HEAPU32.subarray(ptr / 4, ptr / 4 + size * 4);
    };
  };

  const componentCount = (format) => {
    switch (format) {
      case 0x1903: return 1;
      case 0x8227: return 2;
      case 0x1908: return 4;
      case 0x8D94: return 1;
      case 0x8228: return 2;
      case 0x1902: return 1;
      case 0x84F9: return 1;
    }
  };

  const glo = new Map();
  let glid = 1;
  glo[0] = null;

  wasm.mergeLibSymbols({
    zengl_selectCanvas(id) {
      ctx.gl = options[id];
    },
    zengl_glCullFace(mode) {
      ctx.gl.cullFace(mode);
    },
    zengl_glClear(mask) {
      ctx.gl.clear(mask);
    },
    zengl_glTexParameteri(target, pname, param) {
      ctx.gl.texParameteri(target, pname, param);
    },
    zengl_glTexImage2D(target, level, internalformat, width, height, border, format, type, pixels) {
      ctx.gl.texImage2D(target, level, internalformat, width, height, border, format, type, null);
    },
    zengl_glDepthMask(flag) {
      ctx.gl.depthMask(flag);
    },
    zengl_glDisable(cap) {
      if (cap !== 0x8D69 && cap !== 0x8642 && cap !== 0x884F && cap !== 0x8DB9) {
        ctx.gl.disable(cap);
      }
    },
    zengl_glEnable(cap) {
      if (cap !== 0x8D69 && cap !== 0x8642 && cap !== 0x884F && cap !== 0x8DB9) {
        ctx.gl.enable(cap);
      }
    },
    zengl_glFlush() {
      ctx.gl.flush();
    },
    zengl_glDepthFunc(func) {
      ctx.gl.depthFunc(func);
    },
    zengl_glReadBuffer(src) {
      ctx.gl.readBuffer(src);
    },
    zengl_glReadPixels(x, y, width, height, format, type, pixels) {
      const data = typedArray(type, pixels, width * height * componentCount(format));
      ctx.gl.readPixels(x, y, width, height, format, type, data);
    },
    zengl_glGetError() {
      return ctx.gl.getError();
    },
    zengl_glGetIntegerv(pname, data) {
      wasm.HEAP32[data / 4] = ctx.gl.getParameter(pname);
    },
    zengl_glViewport(x, y, width, height) {
      ctx.gl.viewport(x, y, width, height);
    },
    zengl_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      const data = typedArray(type, pixels, width * height * componentCount(format));
      ctx.gl.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, data);
    },
    zengl_glBindTexture(target, texture) {
      ctx.gl.bindTexture(target, glo[texture]);
    },
    zengl_glDeleteTextures(n, textures) {
      const texture = wasm.HEAP32[textures / 4];
      ctx.gl.deleteTexture(glo[texture]);
      glo.delete(texture);
    },
    zengl_glGenTextures(n, textures) {
      const texture = glid++;
      glo[texture] = ctx.gl.createTexture();
      wasm.HEAP32[textures / 4] = texture;
    },
    zengl_glTexImage3D(target, level, internalformat, width, height, depth, border, format, type, pixels) {
      ctx.gl.texImage3D(target, level, internalformat, width, height, depth, border, format, type, null);
    },
    zengl_glTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) {
      const data = typedArray(type, pixels, width * height * depth * componentCount(format));
      ctx.gl.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, data);
    },
    zengl_glActiveTexture(texture) {
      ctx.gl.activeTexture(texture);
    },
    zengl_glBlendFuncSeparate(sfactorRGB, dfactorRGB, sfactorAlpha, dfactorAlpha) {
      ctx.gl.blendFuncSeparate(sfactorRGB, dfactorRGB, sfactorAlpha, dfactorAlpha);
    },
    zengl_glGenQueries(n, ids) {
      ctx.gl.getExtension('EXT_disjoint_timer_query_webgl2');
      const query = glid++;
      glo[query] = ctx.gl.createQuery();
      wasm.HEAP32[ids / 4] = query;
    },
    zengl_glBeginQuery(target, id) {
      ctx.gl.beginQuery(target, glo[id]);
    },
    zengl_glEndQuery(target) {
      ctx.gl.endQuery(target);
    },
    zengl_glGetQueryObjectuiv(id, pname, params) {
      wasm.HEAP32[params / 4] = ctx.gl.getQueryParameter(glo[id], pname);
    },
    zengl_glBindBuffer(target, buffer) {
      ctx.gl.bindBuffer(target, glo[buffer]);
    },
    zengl_glDeleteBuffers(n, buffers) {
      const buffer = wasm.HEAP32[buffers / 4];
      ctx.gl.deleteBuffer(glo[buffer]);
      glo.delete(buffer);
    },
    zengl_glGenBuffers(n, buffers) {
      const buffer = glid++;
      glo[buffer] = ctx.gl.createBuffer();
      wasm.HEAP32[buffers / 4] = buffer;
    },
    zengl_glBufferData(target, size, data, usage) {
      ctx.gl.bufferData(target, size, usage);
    },
    zengl_glBufferSubData(target, offset, size, data) {
      ctx.gl.bufferSubData(target, offset, wasm.HEAPU8.subarray(data, data + size));
    },
    zengl_glUnmapBuffer(target) {
      return 0;
    },
    zengl_glBlendEquationSeparate(modeRGB, modeAlpha) {
      ctx.gl.blendEquationSeparate(modeRGB, modeAlpha);
    },
    zengl_glDrawBuffers(n, bufs) {
      ctx.gl.drawBuffers(wasm.HEAP32.subarray(bufs / 4, bufs / 4 + n));
    },
    zengl_glStencilOpSeparate(face, sfail, dpfail, dppass) {
      ctx.gl.stencilOpSeparate(face, sfail, dpfail, dppass);
    },
    zengl_glStencilFuncSeparate(face, func, ref, mask) {
      ctx.gl.stencilFuncSeparate(face, func, ref, mask);
    },
    zengl_glStencilMaskSeparate(face, mask) {
      ctx.gl.stencilMaskSeparate(face, mask);
    },
    zengl_glAttachShader(program, shader) {
      ctx.gl.attachShader(glo[program], glo[shader]);
    },
    zengl_glCompileShader(shader) {
      ctx.gl.compileShader(glo[shader]);
    },
    zengl_glCreateProgram() {
      const program = glid++;
      glo[program] = ctx.gl.createProgram();
      return program;
    },
    zengl_glCreateShader(type) {
      const shader = glid++;
      glo[shader] = ctx.gl.createShader(type);
      return shader;
    },
    zengl_glDeleteProgram(program) {
      ctx.gl.deleteProgram(glo[program]);
      glo.delete(program);
    },
    zengl_glDeleteShader(shader) {
      ctx.gl.deleteShader(glo[shader]);
      glo.delete(shader);
    },
    zengl_glEnableVertexAttribArray(index) {
      ctx.gl.enableVertexAttribArray(index);
    },
    zengl_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
      const info = ctx.gl.getActiveAttrib(glo[program], index);
      setString(name, info.name);
      wasm.HEAP32[size / 4] = info.size;
      wasm.HEAP32[type / 4] = info.type;
    },
    zengl_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
      const info = ctx.gl.getActiveUniform(glo[program], index);
      setString(name, info.name);
      wasm.HEAP32[size / 4] = info.size;
      wasm.HEAP32[type / 4] = info.type;
    },
    zengl_glGetAttribLocation(program, name) {
      return ctx.gl.getAttribLocation(glo[program], getString(name));
    },
    zengl_glGetProgramiv(program, pname, params) {
      if (pname === 0x8B84) {
        wasm.HEAP32[params / 4] = ctx.gl.getProgramInfoLog(glo[program]).length + 1;
      } else {
        wasm.HEAP32[params / 4] = ctx.gl.getProgramParameter(glo[program], pname);
      }
    },
    zengl_glGetProgramInfoLog(program, bufSize, length, infoLog) {
      setString(infoLog, ctx.gl.getProgramInfoLog(glo[program]));
    },
    zengl_glGetShaderiv(shader, pname, params) {
      if (pname === 0x8B84) {
        wasm.HEAP32[params / 4] = ctx.gl.getShaderInfoLog(glo[shader]).length + 1;
      } else {
        wasm.HEAP32[params / 4] = ctx.gl.getShaderParameter(glo[shader], pname);
      }
    },
    zengl_glGetShaderInfoLog(shader, bufSize, length, infoLog) {
      setString(infoLog, ctx.gl.getShaderInfoLog(glo[shader]));
    },
    zengl_glGetUniformLocation(program, name) {
      const uniform = ctx.gl.getUniformLocation(glo[program], getString(name));
      if (uniform !== null) {
        const location = glid++;
        glo[location] = uniform;
        return location;
      }
      return -1;
    },
    zengl_glLinkProgram(program) {
      ctx.gl.linkProgram(glo[program]);
    },
    zengl_glShaderSource(shader, count, string, length) {
      ctx.gl.shaderSource(glo[shader], getString(wasm.HEAP32[string / 4]));
    },
    zengl_glUseProgram(program) {
      ctx.gl.useProgram(glo[program]);
    },
    zengl_glUniform1i(location, v0) {
      ctx.gl.uniform1i(glo[location], v0);
    },
    zengl_glUniform1fv(location, count, value) {
      ctx.gl.uniform1fv(glo[location], wasm.HEAPF32.subarray(value / 4, value / 4 + count));
    },
    zengl_glUniform2fv(location, count, value) {
      ctx.gl.uniform2fv(glo[location], wasm.HEAPF32.subarray(value / 4, value / 4 + count * 2));
    },
    zengl_glUniform3fv(location, count, value) {
      ctx.gl.uniform3fv(glo[location], wasm.HEAPF32.subarray(value / 4, value / 4 + count * 3));
    },
    zengl_glUniform4fv(location, count, value) {
      ctx.gl.uniform4fv(glo[location], wasm.HEAPF32.subarray(value / 4, value / 4 + count * 4));
    },
    zengl_glUniform1iv(location, count, value) {
      ctx.gl.uniform1iv(glo[location], wasm.HEAP32.subarray(value / 4, value / 4 + count));
    },
    zengl_glUniform2iv(location, count, value) {
      ctx.gl.uniform2iv(glo[location], wasm.HEAP32.subarray(value / 4, value / 4 + count * 2));
    },
    zengl_glUniform3iv(location, count, value) {
      ctx.gl.uniform3iv(glo[location], wasm.HEAP32.subarray(value / 4, value / 4 + count * 3));
    },
    zengl_glUniform4iv(location, count, value) {
      ctx.gl.uniform4iv(glo[location], wasm.HEAP32.subarray(value / 4, value / 4 + count * 4));
    },
    zengl_glUniformMatrix2fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix2fv(glo[location], transpose, transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 4));
    },
    zengl_glUniformMatrix3fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix3fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 9));
    },
    zengl_glUniformMatrix4fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix4fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 16));
    },
    zengl_glVertexAttribPointer(index, size, type, normalized, stride, pointer) {
      ctx.gl.vertexAttribPointer(index, size, type, normalized, stride, pointer);
    },
    zengl_glUniformMatrix2x3fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix2x3fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 6));
    },
    zengl_glUniformMatrix3x2fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix3x2fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 6));
    },
    zengl_glUniformMatrix2x4fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix2x4fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 8));
    },
    zengl_glUniformMatrix4x2fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix4x2fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 8));
    },
    zengl_glUniformMatrix3x4fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix3x4fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 12));
    },
    zengl_glUniformMatrix4x3fv(location, count, transpose, value) {
      ctx.gl.uniformMatrix4x3fv(glo[location], transpose, wasm.HEAPF32.subarray(value / 4, value / 4 + count * 12));
    },
    zengl_glBindBufferRange(target, index, buffer, offset, size) {
      ctx.gl.bindBufferRange(target, index, glo[buffer], offset, size);
    },
    zengl_glVertexAttribIPointer(index, size, type, stride, pointer) {
      ctx.gl.vertexAttribIPointer(index, size, type, stride, pointer);
    },
    zengl_glUniform1uiv(location, count, value) {
      ctx.gl.uniform1uiv(glo[location], wasm.HEAPU32.subarray(value / 4, value / 4 + count));
    },
    zengl_glUniform2uiv(location, count, value) {
      ctx.gl.uniform2uiv(glo[location], wasm.HEAPU32.subarray(value / 4, value / 4 + count * 2));
    },
    zengl_glUniform3uiv(location, count, value) {
      ctx.gl.uniform3uiv(glo[location], wasm.HEAPU32.subarray(value / 4, value / 4 + count * 3));
    },
    zengl_glUniform4uiv(location, count, value) {
      ctx.gl.uniform4uiv(glo[location], wasm.HEAPU32.subarray(value / 4, value / 4 + count * 4));
    },
    zengl_glClearBufferiv(buffer, drawbuffer, value) {
      ctx.gl.clearBufferiv(buffer, drawbuffer, wasm.HEAP32.subarray(value / 4, value / 4 + 4));
    },
    zengl_glClearBufferuiv(buffer, drawbuffer, value) {
      ctx.gl.clearBufferuiv(buffer, drawbuffer, wasm.HEAPU32.subarray(value / 4, value / 4 + 4));
    },
    zengl_glClearBufferfv(buffer, drawbuffer, value) {
      ctx.gl.clearBufferfv(buffer, drawbuffer, wasm.HEAPF32.subarray(value / 4, value / 4 + 4));
    },
    zengl_glClearBufferfi(buffer, drawbuffer, depth, stencil) {
      ctx.gl.clearBufferfi(buffer, drawbuffer, depth, stencil);
    },
    zengl_glBindRenderbuffer(target, renderbuffer) {
      ctx.gl.bindRenderbuffer(target, glo[renderbuffer]);
    },
    zengl_glDeleteRenderbuffers(n, renderbuffers) {
      const renderbuffer = wasm.HEAP32[renderbuffers / 4];
      ctx.gl.deleteRenderbuffer(glo[renderbuffer]);
      glo.delete(renderbuffer);
    },
    zengl_glGenRenderbuffers(n, renderbuffers) {
      const renderbuffer = glid++;
      glo[renderbuffer] = ctx.gl.createRenderbuffer();
      wasm.HEAP32[renderbuffers / 4] = renderbuffer;
    },
    zengl_glBindFramebuffer(target, framebuffer) {
      ctx.gl.bindFramebuffer(target, glo[framebuffer]);
    },
    zengl_glDeleteFramebuffers(n, framebuffers) {
      const framebuffer = wasm.HEAP32[framebuffers / 4];
      ctx.gl.deleteFramebuffer(glo[framebuffer]);
      glo.delete(framebuffer);
    },
    zengl_glGenFramebuffers(n, framebuffers) {
      const framebuffer = glid++;
      glo[framebuffer] = ctx.gl.createFramebuffer();
      wasm.HEAP32[framebuffers / 4] = framebuffer;
    },
    zengl_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      ctx.gl.framebufferTexture2D(target, attachment, textarget, glo[texture], level);
    },
    zengl_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      ctx.gl.framebufferRenderbuffer(target, attachment, renderbuffertarget, glo[renderbuffer]);
    },
    zengl_glGenerateMipmap(target) {
      ctx.gl.generateMipmap(target);
    },
    zengl_glBlitFramebuffer(srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter) {
      ctx.gl.blitFramebuffer(srcX0, srcY0, srcX1, srcY1, dstX0, dstY0, dstX1, dstY1, mask, filter);
    },
    zengl_glRenderbufferStorageMultisample(target, samples, internalformat, width, height) {
      ctx.gl.renderbufferStorageMultisample(target, samples, internalformat, width, height);
    },
    zengl_glFramebufferTextureLayer(target, attachment, texture, level, layer) {
      ctx.gl.framebufferTextureLayer(target, attachment, glo[texture], level, layer);
    },
    zengl_glMapBufferRange(target, offset, length, access) {
      return 0;
    },
    zengl_glBindVertexArray(array) {
      ctx.gl.bindVertexArray(glo[array]);
    },
    zengl_glDeleteVertexArrays(n, arrays) {
      const array = wasm.HEAP32[arrays / 4];
      ctx.gl.deleteVertexArray(glo[array]);
      glo.delete(array);
    },
    zengl_glGenVertexArrays(n, arrays) {
      const array = glid++;
      glo[array] = ctx.gl.createVertexArray();
      wasm.HEAP32[arrays / 4] = array;
    },
    zengl_glDrawArraysInstanced(mode, first, count, instancecount) {
      ctx.gl.drawArraysInstanced(mode, first, count, instancecount);
    },
    zengl_glDrawElementsInstanced(mode, count, type, indices, instancecount) {
      ctx.gl.drawElementsInstanced(mode, count, type, indices, instancecount);
    },
    zengl_glGetUniformBlockIndex(program, uniformBlockName) {
      return ctx.gl.getUniformBlockIndex(glo[program], getString(uniformBlockName));
    },
    zengl_glGetActiveUniformBlockiv(program, uniformBlockIndex, pname, params) {
      wasm.HEAP32[params / 4] = ctx.gl.getActiveUniformBlockParameter(glo[program], uniformBlockIndex, pname);
    },
    zengl_glGetActiveUniformBlockName(program, uniformBlockIndex, bufSize, length, uniformBlockName) {
      setString(uniformBlockName, ctx.gl.getActiveUniformBlockName(glo[program], uniformBlockIndex));
    },
    zengl_glUniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding) {
      ctx.gl.uniformBlockBinding(glo[program], uniformBlockIndex, uniformBlockBinding);
    },
    zengl_glFenceSync(condition, flags) {
      const sync = glid++;
      glo[sync] = ctx.gl.fenceSync(condition, flags);
      return sync;
    },
    zengl_glDeleteSync(sync) {
      ctx.gl.deleteSync(glo[sync]);
      glo.delete(sync);
    },
    zengl_glClientWaitSync(sync, flags, timeout) {
      ctx.gl.clientWaitSync(glo[sync], flags, ctx.gl.MAX_CLIENT_WAIT_TIMEOUT_WEBGL);
    },
    zengl_glGenSamplers(count, samplers) {
      const sampler = glid++;
      glo[sampler] = ctx.gl.createSampler();
      wasm.HEAP32[samplers / 4] = sampler;
    },
    zengl_glDeleteSamplers(count, samplers) {
      const sampler = wasm.HEAP32[samplers / 4];
      ctx.gl.deleteSampler(glo[sampler]);
      glo.delete(sampler);
    },
    zengl_glBindSampler(unit, sampler) {
      ctx.gl.bindSampler(unit, glo[sampler]);
    },
    zengl_glSamplerParameteri(sampler, pname, param) {
      ctx.gl.samplerParameteri(glo[sampler], pname, param);
    },
    zengl_glSamplerParameterf(sampler, pname, param) {
      ctx.gl.samplerParameterf(glo[sampler], pname, param);
    },
    zengl_glVertexAttribDivisor(index, divisor) {
      ctx.gl.vertexAttribDivisor(index, divisor);
    },
  });
};
