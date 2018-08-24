# -*- coding: utf-8 -*-

from setuptools import setup, find_packages
from pip.req import parse_requirements
from pip.download import PipSession

requirements_file = 'requirements.in'

requirements = [str(r.req) for r in parse_requirements(requirements_file, session=PipSession())]

setup(
    name='workspace',
    version='0.0.1',
    description='WorkSpace back end web applications',
    long_description='',
    author='Azrealy',
    author_email='',
    platforms=['linux_x86_64'],
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
    install_requires=requirements,
    tests_require=['pytest', 'pytest-tornado'],
    entry_points={
        'console_scripts': [
            'webapi_server = workspace.api_server.api_server:main',
            'orchestrator_server = workspace.api_server.container_orchestrator:main'
        ]
    }
)
