import gymnasium as gym
import gym_render

envs = [
  gym.make('MountainCar-v0'),
  gym.make('CartPole-v1'),
  gym.make('Pendulum-v1'),
  gym.make('Acrobot-v1'),
]

renderers = [
    gym_render.MountainCarRenderer(envs[0], 0),
    gym_render.CartPoleRenderer(envs[1], 1),
    gym_render.PendulumRenderer(envs[2], 2),
    gym_render.AcrobotRenderer(envs[3], 3),
]

for env in envs:
    env.reset()


def update():
    for env in envs:
        action = env.action_space.sample()
        _, _, termianted, _, _ = env.step(action)
        if termianted:
            env.reset()

    for renderer in renderers:
        renderer.render()
