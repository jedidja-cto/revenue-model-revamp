#!/usr/bin/env node

import { Command } from 'commander';

import { runScenarioFiles } from './runScenario.js';

const program = new Command();

program
  .name('simulate')
  .description(
    'Run Revenue Model Revamp simulations from one or more YAML scenario files.',
  )
  .option('--csv <output-path>', 'Write a consolidated CSV report')
  .argument('<scenario-files...>', 'Path(s) to YAML scenario files')
  .action((scenarioFiles: string[], options: { csv?: string }) => {
    const summary = runScenarioFiles(scenarioFiles, options.csv);
    console.log(summary);
  });

program.parse();
