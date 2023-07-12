from setuptools import Extension, setup

webgl = Extension(
    name='webgl',
    sources=['./webgl.c'],
    define_macros=[('PY_SSIZE_T_CLEAN', None)],
)

shapes = Extension(
    name='shapes',
    sources=['./shapes.cpp'],
    define_macros=[('PY_SSIZE_T_CLEAN', None)],
)

setup(
    name='gym-utils',
    version='0.1.0',
    ext_modules=[webgl, shapes],
    py_modules=['pygame', 'gym_render'],
)
