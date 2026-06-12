#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

function discoverPlugins() {
  const pluginsDir = resolve(projectRoot, 'plugins');
  const plugins = [];

  try {
    const entries = readdirSync(pluginsDir);

    for (const entry of entries) {
      const pluginPath = join(pluginsDir, entry);
      const pluginJsonPath = join(pluginPath, '.claude-plugin/plugin.json');

      if (!statSync(pluginPath).isDirectory()) continue;

      try {
        const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

        const plugin: any = {
          name: pluginJson.name,
          source: `./plugins/${entry}`,
          description: pluginJson.description,
          version: pluginJson.version,
          author: pluginJson.author,
        };

        if (pluginJson.homepage) plugin.homepage = pluginJson.homepage;
        if (pluginJson.repository) plugin.repository = pluginJson.repository;
        if (pluginJson.license) plugin.license = pluginJson.license;
        if (pluginJson.keywords) plugin.keywords = pluginJson.keywords;
        if (pluginJson.category) plugin.category = pluginJson.category;

        plugins.push(plugin);
        console.log(`Discovered plugin: ${pluginJson.name}`);
      } catch (err) {
        console.warn(`Skipping ${entry}: no valid plugin.json`);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to read plugins directory:`, message);
  }

  return plugins;
}

function syncMarketplace() {
  const marketplacePath = resolve(
    projectRoot,
    '.claude-plugin/marketplace.json',
  );
  const marketplace = JSON.parse(readFileSync(marketplacePath, 'utf-8'));

  // Preserve externally-hosted plugins (object sources, e.g. github repos);
  // only entries with relative-path sources are regenerated from plugins/
  const external = (marketplace.plugins ?? []).filter(
    (plugin: any) => typeof plugin.source === 'object',
  );
  for (const plugin of external) {
    console.log(`Preserved external plugin: ${plugin.name}`);
  }

  // Discover all plugins in plugins/ directory
  marketplace.plugins = [...discoverPlugins(), ...external].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2) + '\n');
  console.log(
    `Marketplace synced successfully with ${marketplace.plugins.length} plugins`,
  );
}

syncMarketplace();
