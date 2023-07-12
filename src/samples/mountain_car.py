import gymnasium as gym
from gym_render import MountainCarRenderer

env = gym.make('MountainCar-v0')
renderer = MountainCarRenderer(env)

env.reset()


def update():
    action = env.action_space.sample()
    env.step(action)
    renderer.render()
