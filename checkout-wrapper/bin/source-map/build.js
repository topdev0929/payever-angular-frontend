require('esbuild').build({
  entryPoints: ['./bin/source-map/source-map-cli.ts'],
  bundle: true,
  platform: 'node',
  outdir: './dist/bin',
  sourcemap: false,
  target: 'node12',
  external: ['fs', 'path']
}).then(() => {
  console.log('Done');
})
