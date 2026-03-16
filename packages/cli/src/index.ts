#!/usr/bin/env node

import { Command } from 'commander';

import { runScenarioFile } from './runScenario.js';

const program = new Command();

program
  .name('simulate')
  .description('Run a Revenue Model Revamp simulation from a YAML scenario file.')
  .argument('<scenario-file>', 'Path to the YAML scenario file')
  .action((scenarioFile: string) => {
    const summary = runScenarioFile(scenarioFile);
    console.log(summary);
  });

program.parse();
