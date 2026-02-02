#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';
const instance = render(<App />);
instance.unmount();
