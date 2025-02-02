#!/bin/bash

# Preconditions
# 1. pyenv is installed
# 2. `pyenv install 3.11` was run
# 3. git creds are setup on command line (ssh setup)

# JUST THE COMMANDS FOR REFERENCE - (RUN IN SERVER FOLDER)
uv venv env --python=python3.11
source env/bin/activate
export KERAS_BACKEND=torch
uv pip install https://github.com/usefulsensors/moonshine.git

git clone git@github.com:usefulsensors/moonshine.git
uv pip install numba
uv pip install -r moonshine/demo/moonshine-onnx/requirements.txt

uv pip install Flask flask_cors

# demo
# python3 moonshine/demo/moonshine-onnx/live_captions.py
 