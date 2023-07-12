#include <Python.h>
#include <cmath>

struct vec {
    float x, y;
};

struct color {
    unsigned char r, g, b, a;
};

struct vertex {
    vec pos;
    color col;
};

static vec operator + (const vec & a, const vec & b) {
    return {a.x + b.x, a.y + b.y};
}

static vec operator - (const vec & a, const vec & b) {
    return {a.x - b.x, a.y - b.y};
}

static vec operator * (const vec & a, const vec & b) {
    return {a.x * b.x, a.y * b.y};
}

static vec operator * (const vec & a, float b) {
    return {a.x * b, a.y * b};
}

static vec operator / (const vec & a, float b) {
    return {a.x / b, a.y / b};
}

static vec rotate(const vec & v, float a) {
    return {cosf(a) * v.x - sinf(a) * v.y, sinf(a) * v.x + cosf(a) * v.y};
}

static vec normalize(const vec & v) {
    float l = sqrtf(v.x * v.x + v.y * v.y);
    return {v.x / l, v.y / l};
}

static vertex output[65536];
static vertex vertex_array[65536];
static int index_array[65536];

static int vertex_count;
static int index_count;

static const int N = 32;
static const float pi = 3.14159265f;

struct Draw {
    int offset;
    int idx;
    Draw() {
        offset = vertex_count;
        idx = index_count;
    }
    ~Draw() {
        vertex_count = offset;
        index_count = idx;
    }
    void vertex(vec pos, color col) {
        vertex_array[offset++] = {pos, col};
    }
    void triangle(int a, int b, int c) {
        index_array[idx++] = a;
        index_array[idx++] = b;
        index_array[idx++] = c;
    }
};

static PyObject * meth_clear(PyObject * self, PyObject * args) {
    vertex_count = 0;
    index_count = 0;
    Py_RETURN_NONE;
}

static PyObject * meth_circle(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"center", "radius", "color", NULL};

    vec center;
    float radius;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)f(bbbb)", keywords, &center.x, &center.y, &radius, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    Draw draw;

    int s = draw.offset;
    for (int i = 0; i < N * 2; ++i) {
        float a = (float)i / (float)(N * 2 - 1) * pi * 2.0f;
        draw.vertex(center + vec{-sinf(a), cosf(a)} * radius, col);
    }

    int t = draw.offset;
    draw.vertex(center, col);

    for (int i = 0; i < N * 2 - 1; ++i) {
        draw.triangle(t, s + i, s + i + 1);
    }

    Py_RETURN_NONE;
}

static PyObject * meth_rectangle(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"center", "size", "angle", "color", NULL};

    vec center;
    vec size;
    float angle;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)(ff)f(bbbb)", keywords, &center.x, &center.y, &size.x, &size.y, &angle, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    Draw draw;

    int s = draw.offset;
    draw.vertex(center + rotate({size.x, size.y}, angle) * 0.5f, col);
    draw.vertex(center + rotate({size.x, -size.y}, angle) * 0.5f, col);
    draw.vertex(center + rotate({-size.x, size.y}, angle) * 0.5f, col);
    draw.vertex(center + rotate({-size.x, -size.y}, angle) * 0.5f, col);

    draw.triangle(s, s + 1, s + 2);
    draw.triangle(s + 1, s + 2, s + 3);
    Py_RETURN_NONE;
}

static PyObject * meth_triangle(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"a", "b", "c", "color", NULL};

    vec a;
    vec b;
    vec c;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)(ff)(ff)(bbbb)", keywords, &a.x, &a.y, &b.x, &b.y, &c.x, &c.y, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    Draw draw;

    int s = draw.offset;
    draw.vertex(a, col);
    draw.vertex(b, col);
    draw.vertex(c, col);
    draw.triangle(s, s + 1, s + 2);
    Py_RETURN_NONE;
}

static PyObject * meth_triangle_strip(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"a", "b", "c", "color", NULL};

    vec a;
    vec b;
    vec c;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)(ff)(ff)(bbbb)", keywords, &a.x, &a.y, &b.x, &b.y, &c.x, &c.y, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    Draw draw;

    int s = draw.offset;
    draw.vertex(a, col);
    draw.vertex(b, col);
    draw.vertex(c, col);
    draw.triangle(s, s + 1, s + 2);
    Py_RETURN_NONE;
}

static PyObject * meth_capsule(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"start", "end", "radius", "color", NULL};

    vec start;
    vec end;
    float radius;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)(ff)f(bbbb)", keywords, &start.x, &start.y, &end.x, &end.y, &radius, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    Draw draw;

    float angle = atan2f(end.y - start.y, end.x - start.x);

    int s = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = angle + (float)i / (float)(N - 1) * pi;
        draw.vertex(start + vec{-sinf(a), cosf(a)} * radius, col);
    }

    int e = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = angle + (float)i / (float)(N - 1) * pi;
        draw.vertex(end + vec{sinf(a), -cosf(a)} * radius, col);
    }

    int t = draw.offset;
    draw.vertex(start, col);
    draw.vertex(end, col);

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(t, s + i, s + i + 1);
    }

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(t + 1, e + i, e + i + 1);
    }

    draw.triangle(s, s + N - 1, e);
    draw.triangle(s, e, e + N - 1);

    Py_RETURN_NONE;
}

static PyObject * meth_arc(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"center", "start", "end", "radius", "thickness", "color", NULL};

    vec center;
    float start;
    float end;
    float radius;
    float thickness;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)ffff(bbbb)", keywords, &center.x, &center.y, &start, &end, &radius, &thickness, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    Draw draw;

    int s = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = start + (float)i / (float)(N - 1) * pi;
        draw.vertex(center + vec{cosf(start), sinf(start)} * radius + vec{-cosf(a), -sinf(a)} * thickness, col);
    }

    int e = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = end + (float)i / (float)(N - 1) * pi;
        draw.vertex(center + vec{cosf(end), sinf(end)} * radius + vec{cosf(a), sinf(a)} * thickness, col);
    }

    int b = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = start + (float)i / (float)(N - 1) * (end - start);
        draw.vertex(center + vec{cosf(a), sinf(a)} * (radius - thickness), col);
        draw.vertex(center + vec{cosf(a), sinf(a)} * (radius + thickness), col);
    }

    int t = draw.offset;
    draw.vertex(center + vec{cosf(start), sinf(start)} * radius, col);
    draw.vertex(center + vec{cosf(end), sinf(end)} * radius, col);

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(t, s + i, s + i + 1);
    }

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(t + 1, e + i, e + i + 1);
    }

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(b + i * 2, b + i * 2 + 1, b + i * 2 + 2);
        draw.triangle(b + i * 2 + 1, b + i * 2 + 2, b + i * 2 + 3);
    }

    Py_RETURN_NONE;
}

static vec bez(const vec & a, const vec & b, const vec & c, const vec & d, float t) {
    vec e = a + (b - a) * t;
    vec f = b + (c - b) * t;
    vec g = c + (d - c) * t;
    vec h = e + (f - e) * t;
    vec i = f + (g - f) * t;
    vec j = h + (i - h) * t;
    return j;
}

static vec bezd(const vec & a, const vec & b, const vec & c, const vec & d, float t) {
    vec e = b - a;
    vec f = c - b;
    vec g = d - c;
    vec h = e + (f - e) * t;
    vec i = f + (g - f) * t;
    vec j = h + (i - h) * t;
    return j;
}

static PyObject * meth_bezier(PyObject * self, PyObject * args, PyObject * kwargs) {
    static char * keywords[] = {"start", "start_direction", "end", "end_direction", "thickness", "color", NULL};

    vec start, start_direction, end, end_direction;
    float thickness;
    color col;

    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "(ff)(ff)(ff)(ff)f(bbbb)", keywords, &start.x, &start.y, &start_direction.x, &start_direction.y, &end.x, &end.y, &end_direction.x, &end_direction.y, &thickness, &col.r, &col.g, &col.b, &col.a)) {
        return NULL;
    }

    vec p1 = start;
    vec p2 = start + start_direction;
    vec p3 = end - end_direction;
    vec p4 = end;

    Draw draw;

    int s = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = atan2f(start_direction.y, start_direction.x) + (float)i / (float)(N - 1) * pi;
        draw.vertex(p1 + vec{-sinf(a), -cosf(a)} * thickness, col);
    }

    int e = draw.offset;
    for (int i = 0; i < N; ++i) {
        float a = atan2f(end_direction.y, end_direction.x) +(float)i / (float)(N - 1) * pi;
        draw.vertex(p4 + vec{sinf(a), cosf(a)} * thickness, col);
    }

    int b = draw.offset;
    for (int i = 0; i < N; ++i) {
        float f = (float)i / (float)(N - 1);
        vec p = bez(p1, p2, p3, p4, f);
        vec d = normalize(bezd(p1, p2, p3, p4, f));
        draw.vertex(p + vec{d.y, -d.x} * thickness, col);
        draw.vertex(p + vec{-d.y, d.x} * thickness, col);
    }

    int t = draw.offset;
    draw.vertex(p1, col);
    draw.vertex(p4, col);

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(t, s + i, s + i + 1);
    }

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(t + 1, e + i, e + i + 1);
    }

    for (int i = 0; i < N - 1; ++i) {
        draw.triangle(b + i * 2, b + i * 2 + 1, b + i * 2 + 2);
        draw.triangle(b + i * 2 + 1, b + i * 2 + 2, b + i * 2 + 3);
    }

    Py_RETURN_NONE;
}

static PyObject * meth_data(PyObject * self, PyObject * args) {
    for (int i = 0; i < index_count; ++i) {
        output[i] = vertex_array[index_array[i]];
    }
    PyObject * vertex_data = PyMemoryView_FromMemory((char *)output, index_count * sizeof(vertex), PyBUF_READ);
    return Py_BuildValue("(iN)", index_count, vertex_data);
}

static PyMethodDef module_methods[] = {
    {"clear", (PyCFunction)meth_clear, METH_NOARGS, NULL},
    {"circle", (PyCFunction)meth_circle, METH_VARARGS | METH_KEYWORDS, NULL},
    {"rectangle", (PyCFunction)meth_rectangle, METH_VARARGS | METH_KEYWORDS, NULL},
    {"triangle", (PyCFunction)meth_triangle, METH_VARARGS | METH_KEYWORDS, NULL},
    {"capsule", (PyCFunction)meth_capsule, METH_VARARGS | METH_KEYWORDS, NULL},
    {"arc", (PyCFunction)meth_arc, METH_VARARGS | METH_KEYWORDS, NULL},
    {"bezier", (PyCFunction)meth_bezier, METH_VARARGS | METH_KEYWORDS, NULL},
    {"data", (PyCFunction)meth_data, METH_VARARGS | METH_KEYWORDS, NULL},
    {},
};

static PyModuleDef module_def = {PyModuleDef_HEAD_INIT, "shapes", NULL, -1, module_methods};

extern "C" PyObject * PyInit_shapes() {
    PyObject * module = PyModule_Create(&module_def);
    return module;
}
