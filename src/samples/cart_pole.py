import gymnasium as gym
from gym_render import CartPoleRenderer

env = gym.make('CartPole-v1')
renderer = CartPoleRenderer(env)

env.reset()


def update():
    action = env.action_space.sample()
    _, _, terminated, truncated, _ = env.step(action)
    if terminated or truncated:
        env.reset()
    renderer.render()
