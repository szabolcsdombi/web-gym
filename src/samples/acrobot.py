import gymnasium as gym
from gym_render import AcrobotRenderer

env = gym.make('Acrobot-v1')
renderer = AcrobotRenderer(env)

env.reset()


def update():
    action = env.action_space.sample()
    env.step(action)
    renderer.render()
