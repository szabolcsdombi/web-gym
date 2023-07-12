import gymnasium as gym
from gym_render import PendulumRenderer

env = gym.make('Pendulum-v1')
renderer = PendulumRenderer(env)

env.reset()


def update():
    action = env.action_space.sample()
    env.step(action)
    renderer.render()
