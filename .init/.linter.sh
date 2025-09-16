#!/bin/bash
cd /home/kavia/workspace/code-generation/modelmapperv1-1604-2665/DesignStudioFrontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

