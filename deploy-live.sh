#!/bin/bash

# Navigate to project directory
cd "$(dirname "$0")"

# Run auto deploy script
npm run prompt:deploy
