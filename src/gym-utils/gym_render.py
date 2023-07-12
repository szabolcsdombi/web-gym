import numpy as np
import shapes
import zengl
import webgl


def make_pipeline(ctx, vertex_buffer):
    return ctx.pipeline(
        vertex_shader='''
            #version 300 es
            precision highp float;

            const vec2 screen_size = vec2(600.0, 400.0) / 2.0;

            layout (location = 0) in vec2 in_vertex;
            layout (location = 1) in vec4 in_color;

            out vec4 v_color;

            void main() {
                gl_Position = vec4(in_vertex / screen_size, 0.0, 1.0);
                v_color = in_color;
            }
        ''',
        fragment_shader='''
            #version 300 es
            precision highp float;

            in vec4 v_color;

            layout (location = 0) out vec4 out_color;

            void main() {
                out_color = v_color;
            }
        ''',
        framebuffer=None,
        viewport=(0, 0, 600, 400),
        topology='triangles',
        vertex_buffers=zengl.bind(vertex_buffer, '2f 4nu1', 0, 1),
    )


class AcrobotRenderer:
    def __init__(self, env, canvas_id=0):
        self.canvas_id = canvas_id
        self.env = env
        webgl.select_canvas(self.canvas_id)
        self.ctx = zengl.context(webgl.Loader())

        self.vertex_buffer = self.ctx.buffer(size=65536)
        self.pipeline = make_pipeline(self.ctx, self.vertex_buffer)

    def render(self):
        webgl.select_canvas(self.canvas_id)
        shapes.clear()
        a = self.env.state[0] - np.pi / 2.0
        b = a + self.env.state[1]
        shapes.capsule((-300.0, 100.0), (300.0, 100.0), 1.0, (10, 10, 10, 255))
        shapes.capsule((0.0, 0.0), (np.cos(a) * 110.0, np.sin(a) * 110.0), 12.5, (0, 204, 204, 255))
        shapes.circle((0.0, 0.0), 12.5, (204, 204, 0, 255))
        shapes.capsule((np.cos(a) * 110.0, np.sin(a) * 110.0), (np.cos(a) * 110.0 + np.cos(b) * 110.0, np.sin(a) * 110.0 + np.sin(b) * 110.0), 12.5, (0, 204, 204, 255))
        shapes.circle((np.cos(a) * 110.0, np.sin(a) * 110.0), 12.5, (204, 204, 0, 255))
        vertex_count, vertex_data = shapes.data()
        self.ctx.new_frame()
        self.pipeline.vertex_count = vertex_count
        self.vertex_buffer.write(vertex_data)
        self.pipeline.render()
        self.ctx.end_frame()


class CartPoleRenderer:
    def __init__(self, env, canvas_id=0):
        self.canvas_id = canvas_id
        self.env = env
        webgl.select_canvas(self.canvas_id)
        self.ctx = zengl.context(webgl.Loader())

        self.vertex_buffer = self.ctx.buffer(size=65536)
        self.pipeline = make_pipeline(self.ctx, self.vertex_buffer)

    def render(self):
        webgl.select_canvas(self.canvas_id)
        shapes.clear()
        x = self.env.state[0] * 125.0
        a = -self.env.state[2] + np.pi / 2.0
        shapes.capsule((-300.0, -100.0), (300.0, -100.0), 1.0, (10, 10, 10, 255))
        shapes.rectangle((x, -100.0), (50.0, 30.0), 0.0, (10, 10, 10, 255))
        shapes.rectangle((x + np.cos(a) * 62.5, -95.0 + np.sin(a) * 62.5), (135.0, 12.5), a, (202, 152, 101, 255))
        shapes.circle((x, -95.0), 5.0, (129, 132, 203, 255))
        vertex_count, vertex_data = shapes.data()
        self.ctx.new_frame()
        self.pipeline.vertex_count = vertex_count
        self.vertex_buffer.write(vertex_data)
        self.pipeline.render()
        self.ctx.end_frame()


class PendulumRenderer:
    def __init__(self, env, canvas_id=0):
        self.canvas_id = canvas_id
        self.env = env
        webgl.select_canvas(self.canvas_id)
        self.ctx = zengl.context(webgl.Loader())

        self.vertex_buffer = self.ctx.buffer(size=65536)
        self.pipeline = make_pipeline(self.ctx, self.vertex_buffer)

    def render(self):
        webgl.select_canvas(self.canvas_id)
        shapes.clear()
        a = self.env.state[0] + np.pi / 2.0
        shapes.capsule((0.0, 0.0), (np.cos(a) * 110.0, np.sin(a) * 110.0), 12.0, (204, 77, 77, 255))
        shapes.circle((0.0, 0.0), 6.0, (10, 10, 10, 255))
        if self.env.last_u:
            r = np.abs(self.env.last_u) * 25.0
            t = np.abs(self.env.last_u)
            if self.env.last_u > 0.0:
                s, e = np.pi / 2.0, np.pi * 2.0
                ax = r
            else:
                s, e = -np.pi, np.pi / 2.0
                ax = -r
            shapes.arc((0.0, 0.0), s, e, r, t, (10, 10, 10, 255))
            shapes.triangle((ax - 0.2 * r, -0.2 * r), (ax, 0.25 * r), (ax, -0.1 * r), (10, 10, 10, 255))
            shapes.triangle((ax + 0.2 * r, -0.2 * r), (ax, 0.25 * r), (ax, -0.1 * r), (10, 10, 10, 255))
        vertex_count, vertex_data = shapes.data()
        self.ctx.new_frame()
        self.pipeline.vertex_count = vertex_count
        self.vertex_buffer.write(vertex_data)
        self.pipeline.render()
        self.ctx.end_frame()


class MountainCarRenderer:
    def __init__(self, env, canvas_id=0):
        self.canvas_id = canvas_id
        self.env = env
        webgl.select_canvas(self.canvas_id)
        self.ctx = zengl.context(webgl.Loader())

        self.vertex_buffer = self.ctx.buffer(size=65536)
        self.pipeline = make_pipeline(self.ctx, self.vertex_buffer)

    def render(self):
        webgl.select_canvas(self.canvas_id)
        shapes.clear()
        h = lambda x: np.sin(x * 3.0) * 0.45 + 0.55
        hd = lambda x: np.cos(x * 3.0) * 0.45 * 3.0
        fx = lambda x: (x + 1.2) / 1.8 * 600.0 - 300.0
        fy = lambda y: y / 1.8 * 600.0 - 200.0

        d = fx(np.pi / 3.0) - fx(0.0)
        shapes.bezier((fx(-np.pi * 2.0 / 3.0), fy(0.55)), (d * 0.4, d * 0.45 / 0.78), (fx(-np.pi / 3.0), fy(0.55)), (d * 0.4, -d * 0.45 / 0.78), 1.0, (10, 10, 10, 255))
        shapes.bezier((fx(-np.pi / 3.0), fy(0.55)), (d * 0.4, -d * 0.45 / 0.78), (fx(0.0), fy(0.55)), (d * 0.4, d * 0.45 / 0.78), 1.0, (10, 10, 10, 255))
        shapes.bezier((fx(0), fy(0.55)), (d * 0.4, d * 0.45 / 0.78), (fx(np.pi / 3.0), fy(0.55)), (d * 0.4, -d * 0.45 / 0.78), 1.0, (10, 10, 10, 255))

        x = self.env.state[0]
        y = h(x)
        nx, ny = 1.0, hd(x)
        nx, ny = nx / np.sqrt(nx * nx + ny * ny), ny / np.sqrt(nx * nx + ny * ny)
        a = np.arctan2(ny, nx)
        cx, cy = fx(x) - ny * 18.0, fy(y) + nx * 18.0
        shapes.rectangle((cx, cy), (40.0, 20.0), a, (10, 10, 10, 255))
        shapes.circle((cx - np.cos(a) * 10.0 + np.sin(a) * 10.0, cy - np.sin(a) * 10.0 - np.cos(a) * 10.0), 8.5, (128, 128, 128, 255))
        shapes.circle((cx + np.cos(a) * 10.0 + np.sin(a) * 10.0, cy + np.sin(a) * 10.0 - np.cos(a) * 10.0), 8.5, (128, 128, 128, 255))
        shapes.rectangle((fx(0.5) + 10.0, fy(h(0.5)) + 30.0), (20.0, 12.0), 0.0, (204, 204, 10, 255))
        shapes.rectangle((fx(0.5), fy(h(0.5)) + 20.0), (1.5, 40.0), 0.0, (10, 10, 10, 255))
        vertex_count, vertex_data = shapes.data()
        self.ctx.new_frame()
        self.pipeline.vertex_count = vertex_count
        self.vertex_buffer.write(vertex_data)
        self.pipeline.render()
        self.ctx.end_frame()
